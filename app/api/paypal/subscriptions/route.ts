import { NextResponse } from "next/server";
import { z } from "zod";

import { createPayPalSubscription, getPayPalEnvironment, PayPalApiError } from "@/lib/paypal/server";
import { authenticateRequest } from "@/lib/supabase/server";

export const runtime = "nodejs";

const RequestSchema = z.object({
  interval: z.enum(["monthly", "quarterly", "annual"]),
  requestId: z.uuid(),
});

export async function POST(request: Request) {
  try {
    const authenticated = await authenticateRequest(request);
    if (!authenticated) return NextResponse.json({ error: "Necesitás iniciar sesión para contratar Pro." }, { status: 401 });

    const body = RequestSchema.parse(await request.json());
    const { data: currentPlan } = await authenticated.supabase
      .from("user_plans")
      .select("plan,status,provider,provider_subscription_id,current_period_end")
      .maybeSingle();

    const periodEnd = currentPlan?.current_period_end ? new Date(currentPlan.current_period_end).getTime() : null;
    const activeUntil = periodEnd === null || periodEnd + 2 * 86_400_000 > Date.now();
    const activeStatus = currentPlan?.status === "active" || currentPlan?.status === "trialing";
    if (currentPlan?.plan === "pro" && activeStatus && activeUntil) {
      return NextResponse.json({ error: "Tu cuenta ya tiene Pro activo." }, { status: 409 });
    }
    if (currentPlan?.provider === "paypal" && currentPlan.provider_subscription_id && currentPlan.status !== "canceled") {
      return NextResponse.json({ error: "Ya existe una suscripción de PayPal vinculada a esta cuenta." }, { status: 409 });
    }

    const configuredSite = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
    const siteUrl = configuredSite || new URL(request.url).origin;
    const subscription = await createPayPalSubscription({
      interval: body.interval,
      userId: authenticated.user.id,
      requestId: body.requestId,
      returnUrl: `${siteUrl}/perfil?paypal=success`,
      cancelUrl: `${siteUrl}/precios?paypal=cancelled`,
    });
    const approvalUrl = subscription.links?.find((link) => link.rel === "approve")?.href;
    if (!approvalUrl) throw new Error("PayPal no devolvió el enlace de aprobación.");

    return NextResponse.json({ approvalUrl, subscriptionId: subscription.id, environment: getPayPalEnvironment() });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "La opción de pago no es válida." }, { status: 400 });
    if (error instanceof PayPalApiError) {
      console.error("PayPal subscription error", error.status, error.debugId ?? "no-debug-id");
      return NextResponse.json({ error: error.message }, { status: error.status >= 400 && error.status < 600 ? error.status : 502 });
    }
    console.error("PayPal subscription error", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "No pudimos iniciar el pago con PayPal." }, { status: 500 });
  }
}
