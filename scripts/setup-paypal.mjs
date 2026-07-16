import { randomUUID } from "node:crypto";

const environment = process.env.PAYPAL_ENV?.toLowerCase() === "live" ? "live" : "sandbox";
const apiBase = environment === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
const clientId = process.env.PAYPAL_CLIENT_ID;
const secret = process.env.PAYPAL_CLIENT_SECRET;
const siteUrl = (process.env.PAYPAL_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://www.calculadoraemprendedora.com").replace(/\/$/, "");

if (!clientId || !secret) throw new Error("Faltan PAYPAL_CLIENT_ID y PAYPAL_CLIENT_SECRET.");

async function getAccessToken() {
  const response = await fetch(`${apiBase}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const data = await response.json();
  if (!response.ok || !data.access_token) throw new Error(`PayPal no aceptó las credenciales (${data.debug_id || response.status}).`);
  return data.access_token;
}

const accessToken = await getAccessToken();

async function paypal(path, init = {}) {
  const response = await fetch(`${apiBase}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...init.headers,
    },
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) throw new Error(`PayPal rechazó ${path}: ${data?.message || response.status} (${data?.debug_id || "sin debug id"}).`);
  return data;
}

async function createProduct() {
  const product = await paypal("/v1/catalogs/products", {
    method: "POST",
    headers: { "PayPal-Request-Id": randomUUID(), Prefer: "return=representation" },
    body: JSON.stringify({
      name: "Calculadora Emprendedora Pro",
      description: "Suscripción Pro para análisis, mensajes y escenarios ampliados.",
      type: "SERVICE",
      category: "SOFTWARE",
      home_url: siteUrl,
    }),
  });
  return product.id;
}

async function createPlan(productId, config) {
  const plan = await paypal("/v1/billing/plans", {
    method: "POST",
    headers: { "PayPal-Request-Id": randomUUID(), Prefer: "return=representation" },
    body: JSON.stringify({
      product_id: productId,
      name: config.name,
      description: config.description,
      status: "ACTIVE",
      billing_cycles: [{
        frequency: { interval_unit: config.unit, interval_count: config.count },
        tenure_type: "REGULAR",
        sequence: 1,
        total_cycles: 0,
        pricing_scheme: { fixed_price: { value: config.price, currency_code: "USD" } },
      }],
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee_failure_action: "CONTINUE",
        payment_failure_threshold: 2,
      },
    }),
  });
  return plan.id;
}

async function ensureWebhook() {
  if (process.env.PAYPAL_WEBHOOK_ID) return process.env.PAYPAL_WEBHOOK_ID;
  const webhookUrl = `${siteUrl}/api/paypal/webhook`;
  const existing = await paypal("/v1/notifications/webhooks");
  const found = existing.webhooks?.find((item) => item.url === webhookUrl);
  if (found?.id) return found.id;

  const webhook = await paypal("/v1/notifications/webhooks", {
    method: "POST",
    body: JSON.stringify({
      url: webhookUrl,
      event_types: [
        "BILLING.SUBSCRIPTION.ACTIVATED",
        "BILLING.SUBSCRIPTION.UPDATED",
        "BILLING.SUBSCRIPTION.CANCELLED",
        "BILLING.SUBSCRIPTION.EXPIRED",
        "BILLING.SUBSCRIPTION.SUSPENDED",
        "BILLING.SUBSCRIPTION.PAYMENT.FAILED",
        "PAYMENT.SALE.COMPLETED",
        "PAYMENT.SALE.REFUNDED",
        "PAYMENT.SALE.REVERSED",
      ].map((name) => ({ name })),
    }),
  });
  return webhook.id;
}

const productId = process.env.PAYPAL_PRODUCT_ID || await createProduct();
const plans = {
  monthly: process.env.PAYPAL_PLAN_MONTHLY_ID || await createPlan(productId, {
    name: "Pro mensual",
    description: "Calculadora Emprendedora Pro, renovación mensual.",
    unit: "MONTH",
    count: 1,
    price: "19.99",
  }),
  quarterly: process.env.PAYPAL_PLAN_QUARTERLY_ID || await createPlan(productId, {
    name: "Pro trimestral",
    description: "Calculadora Emprendedora Pro, renovación cada tres meses.",
    unit: "MONTH",
    count: 3,
    price: "53.99",
  }),
  annual: process.env.PAYPAL_PLAN_ANNUAL_ID || await createPlan(productId, {
    name: "Pro anual",
    description: "Calculadora Emprendedora Pro, renovación anual.",
    unit: "YEAR",
    count: 1,
    price: "191.99",
  }),
};
const webhookId = await ensureWebhook();

console.log(`PAYPAL_PRODUCT_ID=${productId}`);
console.log(`PAYPAL_PLAN_MONTHLY_ID=${plans.monthly}`);
console.log(`PAYPAL_PLAN_QUARTERLY_ID=${plans.quarterly}`);
console.log(`PAYPAL_PLAN_ANNUAL_ID=${plans.annual}`);
console.log(`PAYPAL_WEBHOOK_ID=${webhookId}`);
