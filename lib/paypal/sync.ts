import "server-only";

import { BILLING_OPTIONS, PLAN_GRACE_DAYS, type BillingInterval } from "@/lib/plans";
import { billingIntervalFromPlanId, type PayPalSubscription } from "@/lib/paypal/server";
import { createSupabaseAdmin } from "@/lib/supabase/server";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function monthsFor(interval: BillingInterval) {
  return BILLING_OPTIONS.find((item) => item.id === interval)?.months ?? 1;
}

function addMonths(value: string, months: number) {
  const date = new Date(value);
  const originalDay = date.getUTCDate();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + months);
  const lastDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
  date.setUTCDate(Math.min(originalDay, lastDay));
  return date.toISOString();
}

function subscriptionPeriod(subscription: PayPalSubscription, interval: BillingInterval, effectiveStatus: PayPalSubscription["status"]) {
  const start = subscription.billing_info?.last_payment?.time || subscription.start_time;
  if (!start) return null;

  const nextBilling = subscription.billing_info?.next_billing_time;
  const end = effectiveStatus === "ACTIVE" && nextBilling
    ? nextBilling
    : addMonths(start, monthsFor(interval));
  return { start, end };
}

export async function syncPayPalSubscription(subscription: PayPalSubscription, options?: { forcePastDue?: boolean }) {
  const userId = subscription.custom_id;
  if (!userId || !UUID_PATTERN.test(userId)) throw new Error("La suscripción de PayPal no está vinculada a un usuario válido.");

  const interval = billingIntervalFromPlanId(subscription.plan_id);
  if (!interval) throw new Error("La suscripción usa un plan de PayPal desconocido.");

  if (subscription.status === "APPROVAL_PENDING" || subscription.status === "APPROVED") {
    return { active: false, status: "pending" as const };
  }

  const effectiveStatus = options?.forcePastDue ? "SUSPENDED" : subscription.status;
  const period = subscriptionPeriod(subscription, interval, effectiveStatus);
  if (!period) throw new Error("PayPal no informó el período pagado de la suscripción.");

  const now = Date.now();
  const periodEnd = new Date(period.end).getTime();
  const hasGraceAccess = periodEnd + PLAN_GRACE_DAYS * 86_400_000 > now;
  const canceled = effectiveStatus === "CANCELLED";
  const expired = effectiveStatus === "EXPIRED";
  const pastDue = effectiveStatus === "SUSPENDED" || expired;
  const status = canceled
    ? (hasGraceAccess ? "active" : "canceled")
    : pastDue
      ? "past_due"
      : "active";

  const admin = createSupabaseAdmin();
  const { error } = await admin.from("user_plans").upsert({
    user_id: userId,
    plan: status === "canceled" ? "free" : "pro",
    status,
    provider: "paypal",
    provider_customer_id: subscription.subscriber?.payer_id ?? null,
    provider_subscription_id: subscription.id,
    current_period_start: period.start,
    current_period_end: period.end,
    cancel_at_period_end: canceled || expired,
  }, { onConflict: "user_id" });

  if (error) throw new Error(`Supabase no pudo actualizar el plan: ${error.message}`);
  return { active: status === "active" || status === "past_due", status, userId, interval };
}

export async function revokePayPalSubscription(subscriptionId: string) {
  const admin = createSupabaseAdmin();
  const { error } = await admin.from("user_plans").update({
    plan: "free",
    status: "canceled",
    current_period_end: new Date().toISOString(),
    cancel_at_period_end: true,
  }).eq("provider", "paypal").eq("provider_subscription_id", subscriptionId);

  if (error) throw new Error(`Supabase no pudo revocar el plan: ${error.message}`);
}
