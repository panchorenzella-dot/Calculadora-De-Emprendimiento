"use client";

import { useEffect, useState } from "react";

import { BILLING_OPTIONS, type BillingInterval } from "@/lib/plans";
import { getSupabaseClient } from "@/lib/supabase/client";

function usd(value: number) {
  return `US$ ${value.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

type Props = {
  paypalReady: boolean;
  paypalMode: "sandbox" | "live";
};

export default function PricingSelector({ paypalReady, paypalMode }: Props) {
  const [selected, setSelected] = useState<BillingInterval>("monthly");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const option = BILLING_OPTIONS.find((item) => item.id === selected) ?? BILLING_OPTIONS[0];

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("paypal") === "cancelled") {
      setMessage("Cancelaste el proceso antes de confirmar. No se realizó ningún cobro.");
      window.history.replaceState({}, "", "/precios");
    }
  }, []);

  async function startPayPalCheckout() {
    setMessage("");
    const supabase = getSupabaseClient();
    if (!supabase) {
      setMessage("Falta configurar el acceso a tu cuenta.");
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setMessage("Primero iniciá sesión desde Perfil y después volvé a elegir el plan.");
        return;
      }

      const response = await fetch("/api/paypal/subscriptions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ interval: selected, requestId: crypto.randomUUID() }),
      });
      const data = await response.json() as { approvalUrl?: string; error?: string };
      if (!response.ok || !data.approvalUrl) {
        setMessage(data.error || "No pudimos abrir PayPal.");
        return;
      }
      window.location.assign(data.approvalUrl);
    } catch {
      setMessage("No pudimos conectar con PayPal. Intentá nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative mt-6">
      <div role="tablist" aria-label="Período de facturación" className="grid grid-cols-3 rounded-2xl border border-white/10 bg-black/25 p-1">
        {BILLING_OPTIONS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={selected === item.id}
            onClick={() => setSelected(item.id)}
            className={`rounded-xl px-2 py-2.5 text-xs font-semibold transition sm:text-sm ${selected === item.id ? "bg-emerald-300 text-emerald-950 shadow-[0_8px_30px_rgba(110,231,183,0.12)]" : "text-white/38 hover:text-white/70"}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">{usd(option.totalUsd)}</p>
          <p className="mt-1 text-sm text-emerald-100/45">por {option.months === 1 ? "mes" : `${option.months} meses`}</p>
        </div>
        {option.discount > 0 && <span className="rounded-full border border-emerald-200/20 bg-emerald-200/[0.08] px-3 py-1 text-xs font-semibold text-emerald-100">Ahorrás {option.discount}%</span>}
      </div>

      <p className="mt-4 text-sm leading-6 text-white/45">
        {option.months === 1
          ? "Un mes pagado por adelantado."
          : `${usd(option.monthlyUsd)} por mes, con los ${option.months} meses pagados por adelantado.`}
      </p>

      <div className="mt-5 rounded-2xl border border-emerald-200/15 bg-emerald-200/[0.055] p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-emerald-100"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />Pago seguro con PayPal</div>
        <p className="mt-2 text-xs leading-5 text-white/42">El cobro se procesa en USD. Antes de confirmar, PayPal muestra el importe y cualquier conversión, comisión o impuesto que pudiera aplicar según la cuenta o el medio de pago.</p>
      </div>

      <button
        type="button"
        disabled={!paypalReady || loading}
        onClick={startPayPalCheckout}
        className="mt-5 w-full rounded-full bg-emerald-300 px-4 py-3 text-center text-sm font-bold text-emerald-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:bg-emerald-300/45 disabled:text-emerald-950/60"
      >
        {loading ? "Abriendo PayPal..." : !paypalReady ? "Configurando PayPal..." : paypalMode === "sandbox" ? "Probar con PayPal Sandbox" : "Continuar con PayPal"}
      </button>
      {paypalMode === "sandbox" && paypalReady && <p className="mt-2 text-center text-[11px] font-medium leading-5 text-amber-200/65">Modo de prueba: no se mueve dinero real.</p>}
      {message && <p role="alert" className="mt-3 rounded-2xl border border-amber-300/20 bg-amber-300/[0.07] px-4 py-3 text-center text-xs leading-5 text-amber-100/85">{message}</p>}
      <p className="mt-2 text-center text-[11px] leading-5 text-white/28">El importe final y cualquier cargo o impuesto aplicable se mostrará antes del pago.</p>
    </div>
  );
}
