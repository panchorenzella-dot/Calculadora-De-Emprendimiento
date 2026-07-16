import { NextResponse } from "next/server";
import { z } from "zod";

import { getPayPalSubscription, PayPalApiError, verifyPayPalWebhook } from "@/lib/paypal/server";
import { revokePayPalSubscription, syncPayPalSubscription } from "@/lib/paypal/sync";

export const runtime = "nodejs";

const WebhookSchema = z.object({
  id: z.string().min(1),
  event_type: z.string().min(1),
  resource: z.record(z.string(), z.unknown()),
});

const subscriptionEvents = new Set([
  "BILLING.SUBSCRIPTION.ACTIVATED",
  "BILLING.SUBSCRIPTION.UPDATED",
  "BILLING.SUBSCRIPTION.CANCELLED",
  "BILLING.SUBSCRIPTION.EXPIRED",
  "BILLING.SUBSCRIPTION.SUSPENDED",
  "BILLING.SUBSCRIPTION.PAYMENT.FAILED",
  "PAYMENT.SALE.COMPLETED",
]);

const revocationEvents = new Set(["PAYMENT.SALE.REFUNDED", "PAYMENT.SALE.REVERSED"]);

function subscriptionIdFrom(resource: Record<string, unknown>) {
  const billingAgreementId = typeof resource.billing_agreement_id === "string" ? resource.billing_agreement_id : null;
  const subscriptionId = typeof resource.subscription_id === "string" ? resource.subscription_id : null;
  const resourceId = typeof resource.id === "string" && resource.id.startsWith("I-") ? resource.id : null;
  return billingAgreementId || subscriptionId || resourceId;
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const untrustedEvent = JSON.parse(rawBody) as unknown;
    if (!await verifyPayPalWebhook(request.headers, untrustedEvent)) {
      return NextResponse.json({ error: "Firma de PayPal inválida." }, { status: 401 });
    }

    const event = WebhookSchema.parse(untrustedEvent);
    const subscriptionId = subscriptionIdFrom(event.resource);
    if (!subscriptionId) return NextResponse.json({ received: true });

    if (revocationEvents.has(event.event_type)) {
      await revokePayPalSubscription(subscriptionId);
      return NextResponse.json({ received: true });
    }

    if (subscriptionEvents.has(event.event_type)) {
      const subscription = await getPayPalSubscription(subscriptionId);
      await syncPayPalSubscription(subscription, {
        forcePastDue: event.event_type === "BILLING.SUBSCRIPTION.PAYMENT.FAILED",
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    if (error instanceof SyntaxError || error instanceof z.ZodError) {
      return NextResponse.json({ error: "Evento inválido." }, { status: 400 });
    }
    if (error instanceof PayPalApiError) {
      console.error("PayPal webhook API error", error.status, error.debugId ?? "no-debug-id");
    } else {
      console.error("PayPal webhook error", error instanceof Error ? error.message : "unknown");
    }
    return NextResponse.json({ error: "No pudimos procesar el evento." }, { status: 500 });
  }
}
