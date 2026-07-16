import { NextResponse } from "next/server";
import { z } from "zod";

import { getPayPalSubscription, PayPalApiError } from "@/lib/paypal/server";
import { syncPayPalSubscription } from "@/lib/paypal/sync";
import { authenticateRequest } from "@/lib/supabase/server";

export const runtime = "nodejs";

const RequestSchema = z.object({ subscriptionId: z.string().regex(/^I-[A-Z0-9]+$/i).max(80) });

export async function POST(request: Request) {
  try {
    const authenticated = await authenticateRequest(request);
    if (!authenticated) return NextResponse.json({ error: "Tu sesión venció. Volvé a ingresar." }, { status: 401 });

    const { subscriptionId } = RequestSchema.parse(await request.json());
    const subscription = await getPayPalSubscription(subscriptionId);
    if (subscription.custom_id !== authenticated.user.id) {
      return NextResponse.json({ error: "Esta suscripción no pertenece a tu cuenta." }, { status: 403 });
    }

    const result = await syncPayPalSubscription(subscription);
    if (!result.active) {
      return NextResponse.json({ pending: true, message: "PayPal todavía está confirmando la suscripción." }, { status: 202 });
    }
    return NextResponse.json({ active: true, message: "Pago confirmado. Tu plan Pro ya está activo." });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "El identificador de PayPal no es válido." }, { status: 400 });
    if (error instanceof PayPalApiError) {
      console.error("PayPal sync error", error.status, error.debugId ?? "no-debug-id");
      return NextResponse.json({ error: "PayPal todavía no pudo confirmar la suscripción." }, { status: 502 });
    }
    console.error("PayPal sync error", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "No pudimos actualizar el plan en este momento." }, { status: 500 });
  }
}
