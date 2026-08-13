"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type OnboardingData = {
  business_type: string;
  main_goal: string;
  preferred_currency: string;
};

const businessTypes = ["Servicios", "Productos / Reventa", "Gastronomía", "Producción", "Digital / Otro"];
const goals = ["Definir precios", "Mejorar rentabilidad", "Saber cuánto vender", "Evaluar una inversión", "Ahorrar o invertir"];

function recommendation(data: OnboardingData) {
  if (data.main_goal === "Definir precios") return { title: "Precio de venta", href: "/markup" };
  if (data.main_goal === "Mejorar rentabilidad") return { title: "Margen de ganancia", href: "/margen" };
  if (data.main_goal === "Saber cuánto vender") return { title: "Punto de equilibrio", href: "/punto-de-equilibrio" };
  if (data.main_goal === "Evaluar una inversión") return { title: "ROI de inversión", href: "/roi-inversion" };
  if (data.main_goal === "Ahorrar o invertir") return { title: "Meta de ahorro", href: "/meta-ahorro" };
  if (data.business_type === "Gastronomía") return { title: "Calculadoras gastronómicas", href: "/calculadoras?buscar=gastronomía" };
  if (data.business_type === "Producción") return { title: "Producción", href: "/produccion" };
  if (data.business_type === "Productos / Reventa") return { title: "Compra y venta", href: "/reventa" };
  return { title: "Directorio de calculadoras", href: "/calculadoras" };
}

export default function ProfileOnboarding({ initialData, saving, onSave }: { initialData: OnboardingData; saving: boolean; onSave: (data: OnboardingData) => Promise<void> }) {
  const [data, setData] = useState(initialData);
  const isComplete = Boolean(initialData.business_type && initialData.main_goal && initialData.preferred_currency);
  const suggested = useMemo(() => recommendation(data), [data]);

  if (isComplete) return null;

  return (
    <section aria-labelledby="onboarding-title" className="mt-7 overflow-hidden rounded-3xl border border-emerald-300/15 bg-[linear-gradient(135deg,rgba(16,185,129,.075),rgba(255,255,255,.02)_55%,rgba(0,0,0,.12))] p-5 sm:p-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-200/60">Configuración inicial · menos de un minuto</p>
          <h2 id="onboarding-title" className="mt-2 text-xl font-bold text-white sm:text-2xl">Personalizá tus recomendaciones</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">Tres respuestas para ordenar tu espacio. Podés modificarlas después desde Mi perfil.</p>
        </div>
        <span className="shrink-0 rounded-full border border-white/10 bg-black/25 px-3 py-1.5 text-xs font-bold text-white/55">3 pasos</span>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-3">
        <fieldset>
          <legend className="text-xs font-bold text-white/55">1. Tipo de negocio</legend>
          <div className="mt-2 grid gap-2">
            {businessTypes.map((value) => <button key={value} type="button" aria-pressed={data.business_type === value} onClick={() => setData((current) => ({ ...current, business_type: value }))} className={`rounded-xl border px-3 py-2.5 text-left text-xs font-bold transition ${data.business_type === value ? "border-emerald-300/35 bg-emerald-300/[0.08] text-white" : "border-white/[0.07] bg-black/20 text-white/50 hover:text-white"}`}>{value}</button>)}
          </div>
        </fieldset>
        <fieldset>
          <legend className="text-xs font-bold text-white/55">2. Objetivo principal</legend>
          <div className="mt-2 grid gap-2">
            {goals.map((value) => <button key={value} type="button" aria-pressed={data.main_goal === value} onClick={() => setData((current) => ({ ...current, main_goal: value }))} className={`rounded-xl border px-3 py-2.5 text-left text-xs font-bold transition ${data.main_goal === value ? "border-emerald-300/35 bg-emerald-300/[0.08] text-white" : "border-white/[0.07] bg-black/20 text-white/50 hover:text-white"}`}>{value}</button>)}
          </div>
        </fieldset>
        <div>
          <p className="text-xs font-bold text-white/55">3. Moneda preferida</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {["ARS", "USD"].map((value) => <button key={value} type="button" aria-pressed={data.preferred_currency === value} onClick={() => setData((current) => ({ ...current, preferred_currency: value }))} className={`rounded-xl border px-3 py-3 text-xs font-black transition ${data.preferred_currency === value ? "border-emerald-300/35 bg-emerald-300/[0.08] text-white" : "border-white/[0.07] bg-black/20 text-white/50 hover:text-white"}`}>{value}</button>)}
          </div>
          <div className="mt-4 rounded-2xl border border-white/[0.07] bg-black/25 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-200/50">Primera recomendación</p>
            <p className="mt-2 text-sm font-bold text-white/85">{suggested.title}</p>
            <Link href={suggested.href} className="mt-2 inline-flex text-xs font-bold text-white/50 hover:text-white">Ver herramienta →</Link>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 border-t border-white/[0.07] pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-white/40">La información se guarda en tu cuenta Growtella.</p>
        <button type="button" disabled={saving || !data.business_type || !data.main_goal || !data.preferred_currency} onClick={() => void onSave(data)} className="app-dark-action rounded-full px-5 py-2.5 text-sm transition">{saving ? "Guardando..." : "Guardar y personalizar"}</button>
      </div>
    </section>
  );
}
