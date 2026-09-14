import { NextResponse } from "next/server";
import { z } from "zod";

import { createPayPalSubscription, getPayPalEnvironment, PayPalApiError } from "@/lib/paypal/server";
import { isPaidPlanName } from "@/lib/plans";
import { authenticateRequest } from "@/lib/supabase/server";

export const runtime = "nodejs";

const RequestSchema = z.object({
  plan: z.enum(["basic", "pro", "premium"]).optional(),
  interval: z.enum(["monthly", "quarterly", "annual"]).optional(),
  requestId: z.uuid(),
  checkout: z.enum(["calculator", "growtella"]).optional().default("calculator"),
});

export async function POST(request: Request) {
  try {
    const authenticated = await authenticateRequest(request);
    if (!authenticated) return NextResponse.json({ error: "Necesitás iniciar sesión para contratar un plan." }, { status: 401 });

    const body = RequestSchema.parse(await request.json());
    // Compatibilidad temporal para Growtella: sus checkouts anteriores enviaban
    // solamente `interval`. Todos esos accesos se migran al plan Pro mensual.
    const selectedPlan = body.plan ?? "pro";
    const { data: currentPlan } = await authenticated.supabase
      .from("user_plans")
      .select("plan,status,provider,provider_subscription_id,current_period_end")
      .maybeSingle();

    const periodEnd = currentPlan?.current_period_end ? new Date(currentPlan.current_period_end).getTime() : null;
    const activeUntil = periodEnd === null || periodEnd + 2 * 86_400_000 > Date.now();
    const activeStatus = currentPlan?.status === "active" || currentPlan?.status === "trialing";
    if (isPaidPlanName(currentPlan?.plan) && activeStatus && activeUntil) {
      return NextResponse.json({ error: `Tu cuenta ya tiene un plan ${currentPlan.plan} activo.` }, { status: 409 });
    }
    if (currentPlan?.provider === "paypal" && currentPlan.provider_subscription_id && currentPlan.status !== "canceled") {
      return NextResponse.json({ error: "Ya existe una suscripción de PayPal vinculada a esta cuenta." }, { status: 409 });
    }

    const configuredSite = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
    const calculatorUrl = configuredSite || new URL(request.url).origin;
    const growtellaUrl = (process.env.NEXT_PUBLIC_GROWTELLA_URL || "https://www.growtella.com").replace(/\/$/, "");
    const checkoutSite = body.checkout === "growtella" ? growtellaUrl : calculatorUrl;
    const subscription = await createPayPalSubscription({
      plan: selectedPlan,
      userId: authenticated.user.id,
      requestId: body.requestId,
      returnUrl: body.checkout === "growtella" ? `${checkoutSite}/cuenta?paypal=success` : `${checkoutSite}/perfil?paypal=success`,
      cancelUrl: body.checkout === "growtella" ? `${checkoutSite}/pro?paypal=cancelled` : `${checkoutSite}/precios?paypal=cancelled`,
      brandName: body.checkout === "growtella" ? "Growtella" : "Calculadora Emprendedora",
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
