"use client";

import { useState } from "react";

import { BILLING_OPTIONS, type BillingInterval } from "@/lib/plans";

function usd(value: number) {
  return `US$ ${value.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function PricingSelector() {
  const [selected, setSelected] = useState<BillingInterval>("monthly");
  const option = BILLING_OPTIONS.find((item) => item.id === selected) ?? BILLING_OPTIONS[0];

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
        <div className="flex items-center gap-2 text-sm font-semibold text-emerald-100"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />Cobro local en pesos argentinos</div>
        <p className="mt-2 text-xs leading-5 text-white/42">El precio se muestra en USD como referencia, pero el cobro se procesará en ARS al valor informado antes de confirmar. No se procesa como una compra en dólares.</p>
      </div>

      <div aria-disabled="true" className="mt-5 cursor-not-allowed rounded-full bg-emerald-300/80 px-4 py-3 text-center text-sm font-bold text-emerald-950/75">
        Activar Pro · pagos próximamente
      </div>
      <p className="mt-2 text-center text-[11px] leading-5 text-white/28">El importe final y cualquier cargo o impuesto aplicable se mostrará antes del pago.</p>
    </div>
  );
}
