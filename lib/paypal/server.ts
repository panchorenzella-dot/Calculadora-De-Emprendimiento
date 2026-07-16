import "server-only";

import type { BillingInterval } from "@/lib/plans";

type PayPalLink = { href: string; rel: string; method?: string };

export type PayPalSubscription = {
  id: string;
  plan_id: string;
  custom_id?: string;
  status: "APPROVAL_PENDING" | "APPROVED" | "ACTIVE" | "SUSPENDED" | "CANCELLED" | "EXPIRED";
  start_time?: string;
  subscriber?: {
    payer_id?: string;
    email_address?: string;
  };
  billing_info?: {
    last_payment?: { time?: string };
    next_billing_time?: string;
    failed_payments_count?: number;
  };
  links?: PayPalLink[];
};

type PayPalErrorBody = {
  name?: string;
  message?: string;
  debug_id?: string;
};

export class PayPalApiError extends Error {
  constructor(message: string, public status = 500, public debugId?: string) {
    super(message);
    this.name = "PayPalApiError";
  }
}

let cachedToken: { value: string; expiresAt: number } | null = null;

export function getPayPalEnvironment() {
  return process.env.PAYPAL_ENV?.toLowerCase() === "live" ? "live" : "sandbox";
}

function apiBase() {
  return getPayPalEnvironment() === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

function credentials() {
  const clientId = process.env.PAYPAL_CLIENT_ID?.trim();
  const secret = process.env.PAYPAL_CLIENT_SECRET?.trim();
  if (!clientId || !secret) throw new PayPalApiError("PayPal todavía no está configurado.", 503);
  return { clientId, secret };
}

async function accessToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.value;

  const { clientId, secret } = credentials();
  const response = await fetch(`${apiBase()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });
  const data = await response.json() as { access_token?: string; expires_in?: number } & PayPalErrorBody;

  if (!response.ok || !data.access_token) {
    throw new PayPalApiError(data.message || "PayPal rechazó las credenciales.", response.status, data.debug_id);
  }

  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + Math.max((data.expires_in ?? 300) - 60, 60) * 1000,
  };
  return cachedToken.value;
}

export async function paypalRequest<T>(path: string, init: RequestInit = {}) {
  const token = await accessToken();
  const response = await fetch(`${apiBase()}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...init.headers,
    },
    cache: "no-store",
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) as T & PayPalErrorBody : null;

  if (!response.ok) {
    const error = data as PayPalErrorBody | null;
    throw new PayPalApiError(error?.message || "PayPal no pudo procesar la operación.", response.status, error?.debug_id);
  }

  return data as T;
}

export function getPayPalPlanId(interval: BillingInterval) {
  const variables: Record<BillingInterval, string | undefined> = {
    monthly: process.env.PAYPAL_PLAN_MONTHLY_ID,
    quarterly: process.env.PAYPAL_PLAN_QUARTERLY_ID,
    annual: process.env.PAYPAL_PLAN_ANNUAL_ID,
  };
  const planId = variables[interval];
  if (!planId) throw new PayPalApiError("El plan elegido todavía no está configurado en PayPal.", 503);
  return planId;
}

export function billingIntervalFromPlanId(planId: string): BillingInterval | null {
  if (planId === process.env.PAYPAL_PLAN_MONTHLY_ID) return "monthly";
  if (planId === process.env.PAYPAL_PLAN_QUARTERLY_ID) return "quarterly";
  if (planId === process.env.PAYPAL_PLAN_ANNUAL_ID) return "annual";
  return null;
}

export async function createPayPalSubscription(input: {
  interval: BillingInterval;
  userId: string;
  returnUrl: string;
  cancelUrl: string;
  requestId: string;
}) {
  return paypalRequest<PayPalSubscription>("/v1/billing/subscriptions", {
    method: "POST",
    headers: {
      "PayPal-Request-Id": input.requestId,
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      plan_id: getPayPalPlanId(input.interval),
      custom_id: input.userId,
      application_context: {
        brand_name: "Calculadora Emprendedora",
        shipping_preference: "NO_SHIPPING",
        user_action: "SUBSCRIBE_NOW",
        return_url: input.returnUrl,
        cancel_url: input.cancelUrl,
      },
    }),
  });
}

export function getPayPalSubscription(subscriptionId: string) {
  return paypalRequest<PayPalSubscription>(`/v1/billing/subscriptions/${encodeURIComponent(subscriptionId)}`);
}

export async function verifyPayPalWebhook(headers: Headers, event: unknown) {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) throw new PayPalApiError("Falta configurar la firma del webhook de PayPal.", 503);

  const transmissionId = headers.get("paypal-transmission-id");
  const transmissionTime = headers.get("paypal-transmission-time");
  const certUrl = headers.get("paypal-cert-url");
  const authAlgo = headers.get("paypal-auth-algo");
  const transmissionSig = headers.get("paypal-transmission-sig");
  if (!transmissionId || !transmissionTime || !certUrl || !authAlgo || !transmissionSig) return false;

  const result = await paypalRequest<{ verification_status?: string }>("/v1/notifications/verify-webhook-signature", {
    method: "POST",
    body: JSON.stringify({
      transmission_id: transmissionId,
      transmission_time: transmissionTime,
      cert_url: certUrl,
      auth_algo: authAlgo,
      transmission_sig: transmissionSig,
      webhook_id: webhookId,
      webhook_event: event,
    }),
  });

  return result.verification_status === "SUCCESS";
}
