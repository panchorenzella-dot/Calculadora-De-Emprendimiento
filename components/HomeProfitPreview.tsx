"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

function formatMoney(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

function clampAmount(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

export default function HomeProfitPreview() {
  const [cost, setCost] = useState("14000");
  const [price, setPrice] = useState("25000");

  const result = useMemo(() => {
    const numericCost = clampAmount(cost);
    const numericPrice = clampAmount(price);
    const profit = numericPrice - numericCost;
    const margin = numericPrice > 0 ? (profit / numericPrice) * 100 : 0;
    const markup = numericCost > 0 ? (profit / numericCost) * 100 : 0;

    return { profit, margin, markup };
  }, [cost, price]);

  const status = result.profit > 0
    ? { label: "Resultado positivo", className: "bg-emerald-300/10 text-emerald-200" }
    : result.profit < 0
      ? { label: "Precio por debajo del costo", className: "bg-red-300/10 text-red-200" }
      : { label: "Sin ganancia", className: "bg-amber-300/10 text-amber-100" };

  return (
    <div className="relative rounded-[28px] border border-white/10 bg-[#0b0d0c]/95 p-4 shadow-[0_30px_100px_rgba(0,0,0,0.45)] sm:p-5">
      <div className="flex items-center justify-between gap-4 border-b border-white/[0.07] pb-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-200/65">
            Probalo ahora
          </p>
          <h2 className="mt-1 text-base font-semibold text-white">Resultado rápido por unidad</h2>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${status.className}`}>
          {status.label}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-3">
          <span className="text-xs text-white/42">Costo por unidad</span>
          <span className="mt-2 flex items-center gap-2">
            <span className="text-sm text-white/30">$</span>
            <input
              aria-label="Costo por unidad"
              type="number"
              min="0"
              inputMode="decimal"
              value={cost}
              onChange={(event) => setCost(event.target.value)}
              className="min-w-0 flex-1 bg-transparent text-lg font-semibold text-white outline-none"
            />
          </span>
        </label>
        <label className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-3">
          <span className="text-xs text-white/42">Precio de venta</span>
          <span className="mt-2 flex items-center gap-2">
            <span className="text-sm text-white/30">$</span>
            <input
              aria-label="Precio de venta"
              type="number"
              min="0"
              inputMode="decimal"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              className="min-w-0 flex-1 bg-transparent text-lg font-semibold text-white outline-none"
            />
          </span>
        </label>
      </div>

      <div aria-live="polite" className="mt-3 rounded-2xl border border-emerald-300/10 bg-emerald-300/[0.045] p-4">
        <p className="text-xs text-white/42">Ganancia bruta por unidad</p>
        <p className={`mt-1 text-3xl font-semibold tracking-tight ${result.profit >= 0 ? "text-white" : "text-red-200"}`}>
          {formatMoney(result.profit)}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/[0.07] pt-4">
          <div>
            <p className="text-[11px] text-white/35">Margen</p>
            <p className="mt-1 text-base font-semibold text-emerald-200">{result.margin.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-[11px] text-white/35">Markup</p>
            <p className="mt-1 text-base font-semibold text-white/80">{result.markup.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      <p className="mt-3 text-[11px] leading-5 text-white/28">
        Vista rápida sin costos fijos ni impuestos. La calculadora completa incorpora más variables.
      </p>
      <Link
        href="/margen"
        className="mt-4 flex items-center justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-bold !text-zinc-950 transition hover:bg-emerald-100"
      >
        Analizar mi negocio →
      </Link>
    </div>
  );
}
