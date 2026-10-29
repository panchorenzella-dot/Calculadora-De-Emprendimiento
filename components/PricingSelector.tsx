"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { paidPlan, type PaidPlanName } from "@/lib/plans";
import { trackEvent } from "@/lib/analytics";

type Props = {
  plan: PaidPlanName;
  paypalReady: boolean;
  paypalMode: "sandbox" | "live";
  emphasized?: boolean;
  displayPriceUsd?: number;
  promotional?: boolean;
};

export default function PricingSelector({ plan, paypalReady, paypalMode, emphasized = false, displayPriceUsd, promotional = false }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const selectedPlan = paidPlan(plan);
  const checkoutPriceUsd = displayPriceUsd ?? selectedPlan.priceUsd;

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("paypal") === "cancelled") {
      setMessage("Cancelaste el proceso antes de confirmar. No se realizó ningún cobro.");
    }
  }, []);

  async function startPayPalCheckout() {
    setMessage("");
    const { getSupabaseClient } = await import("@/lib/supabase/client");
    const supabase = getSupabaseClient();
    if (!supabase) {
      setMessage("Falta configurar el acceso a tu cuenta.");
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        sessionStorage.setItem("calculadora-emprendedora:pending-plan", plan);
        trackEvent("checkout_login_required", { plan, interval: "monthly", value: checkoutPriceUsd, currency: "USD", promotion_name: promotional ? "aniversario_2_meses" : undefined });
        router.push(`/perfil?modo=registro&continuar=${plan}`);
        return;
      }

      trackEvent("begin_checkout", {
        currency: "USD",
        value: checkoutPriceUsd,
        promotion_name: promotional ? "aniversario_2_meses" : undefined,
        items: [{ item_id: `${plan}_monthly`, item_name: `Calculadora Emprendedora ${selectedPlan.name}`, price: checkoutPriceUsd, quantity: 1 }],
      });

      const response = await fetch("/api/paypal/subscriptions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan, requestId: crypto.randomUUID() }),
      });
      const data = await response.json() as { approvalUrl?: string; error?: string };
      if (!response.ok || !data.approvalUrl) {
        setMessage(data.error || "No pudimos abrir PayPal.");
        return;
      }

      trackEvent("checkout_redirect", { provider: "paypal", plan, interval: "monthly", value: checkoutPriceUsd, currency: "USD", promotion_name: promotional ? "aniversario_2_meses" : undefined });
      window.location.assign(data.approvalUrl);
    } catch {
      setMessage("No pudimos conectar con PayPal. Intentá nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6">
      <button
        type="button"
        disabled={!paypalReady || loading}
        onClick={startPayPalCheckout}
        className={`action-positive w-full rounded-full px-4 py-3 text-center text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-50 ${emphasized ? "bg-emerald-300 text-emerald-950 hover:bg-emerald-200" : "border border-white/14 bg-white/[0.055] text-white/85 hover:border-white/25 hover:bg-white/[0.09] hover:text-white"}`}
      >
        {loading
          ? "Abriendo PayPal..."
          : !paypalReady
            ? "Configurando este plan..."
            : paypalMode === "sandbox"
              ? `Probar ${selectedPlan.name} en Sandbox`
              : `Elegir ${selectedPlan.name}`}
      </button>
      {paypalMode === "sandbox" && paypalReady ? (
        <p className="mt-2 text-center text-[11px] font-medium leading-5 text-amber-200/65">Modo de prueba: no se mueve dinero real.</p>
      ) : null}
      {message ? (
        <p role="alert" className="mt-3 rounded-2xl border border-amber-300/20 bg-amber-300/[0.07] px-4 py-3 text-center text-xs leading-5 text-amber-100/85">{message}</p>
      ) : null}
    </div>
  );
}
