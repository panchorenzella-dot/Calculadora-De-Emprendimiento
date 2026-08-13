"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { trackEvent } from "@/lib/analytics";

type Goal = "price" | "profit" | "sales" | "investment" | "savings" | "industry";
type Industry = "gastronomy" | "production" | "resale" | "distribution";

const goals: Array<{ id: Goal; label: string; short: string }> = [
  { id: "price", label: "Definir cuánto cobrar", short: "Precio" },
  { id: "profit", label: "Entender mi ganancia", short: "Ganancia" },
  { id: "sales", label: "Saber cuánto vender", short: "Ventas" },
  { id: "investment", label: "Evaluar una inversión", short: "Inversión" },
  { id: "savings", label: "Alcanzar una meta", short: "Ahorro" },
  { id: "industry", label: "Calcular costos de mi rubro", short: "Mi rubro" },
];

const industries: Array<{ id: Industry; label: string }> = [
  { id: "gastronomy", label: "Gastronomía" },
  { id: "production", label: "Producción" },
  { id: "resale", label: "Compra y venta" },
  { id: "distribution", label: "Distribución" },
];

const recommendations = {
  price: { title: "Precio de venta", description: "Calculá un precio coherente a partir de tu costo y el margen que buscás.", href: "/markup", eyebrow: "Para cobrar con criterio" },
  profit: { title: "Margen y ganancia", description: "Separá facturación, costos y ganancia para entender qué deja realmente cada venta.", href: "/margen", eyebrow: "Para ver lo que te queda" },
  sales: { title: "Punto de equilibrio", description: "Conocé la cantidad mínima que necesitás vender para cubrir todos tus costos.", href: "/punto-de-equilibrio", eyebrow: "Para definir tu piso de ventas" },
  investment: { title: "ROI de inversión", description: "Compará lo invertido con el beneficio esperado antes de comprometer capital.", href: "/roi-inversion", eyebrow: "Para decidir antes de invertir" },
  savings: { title: "Meta de ahorro", description: "Calculá cuánto aportar y durante cuánto tiempo para llegar a un objetivo concreto.", href: "/meta-ahorro", eyebrow: "Para convertir una meta en un plan" },
  gastronomy: { title: "Calculadoras gastronómicas", description: "Elegí entre cafetería y hamburguesería para incluir ingredientes, operación y ventas.", href: "/calculadoras?buscar=gastronomía", eyebrow: "Para negocios gastronómicos" },
  production: { title: "Producción", description: "Calculá costo unitario, margen y resultado mensual de lo que fabricás.", href: "/produccion", eyebrow: "Para fabricar con números claros" },
  resale: { title: "Compra y venta", description: "Incluí compra, comisiones, envíos y otros costos antes de fijar el precio.", href: "/reventa", eyebrow: "Para reventa y comercio" },
  distribution: { title: "Distribuidora", description: "Estimá margen por caja, reparto, volumen necesario y ganancia mensual.", href: "/distribuidora", eyebrow: "Para venta mayorista" },
} as const;

export default function CalculatorFinder({ compact = false }: { compact?: boolean }) {
  const [goal, setGoal] = useState<Goal | null>(null);
  const [industry, setIndustry] = useState<Industry | null>(null);
  const recommendation = useMemo(() => {
    if (!goal) return null;
    if (goal === "industry") return industry ? recommendations[industry] : null;
    return recommendations[goal];
  }, [goal, industry]);

  function selectGoal(nextGoal: Goal) {
    setGoal(nextGoal);
    if (nextGoal !== "industry") setIndustry(null);
    trackEvent("calculator_recommendation_answer", { question: "goal", answer: nextGoal });
  }

  return (
    <section aria-labelledby="calculator-finder-title" className={`relative overflow-hidden rounded-[28px] border border-emerald-300/15 bg-[#080c09] ${compact ? "p-5 sm:p-6" : "p-6 sm:p-9"}`}>
      <div className="pointer-events-none absolute -right-24 -top-28 size-64 rounded-full bg-emerald-400/[0.06] blur-3xl" />
      <div className={`relative grid gap-8 ${compact ? "" : "lg:grid-cols-[.92fr_1.08fr] lg:items-start"}`}>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-200/60">Recomendación personalizada</p>
          <h2 id="calculator-finder-title" className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">¿Qué querés resolver hoy?</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/55">Elegí tu objetivo y te mostramos por dónde empezar. No necesitás registrarte para calcular.</p>
          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            {goals.map((item) => (
              <button key={item.id} type="button" aria-pressed={goal === item.id} onClick={() => selectGoal(item.id)} className={`rounded-2xl border px-4 py-3 text-left text-sm font-bold transition ${goal === item.id ? "border-emerald-300/35 bg-emerald-300/[0.08] text-white" : "border-white/[0.08] bg-black/25 text-white/65 hover:border-white/15 hover:text-white"}`}>
                <span className="text-emerald-200/65">{item.short}</span><span className="mx-2 text-white/20">·</span>{item.label}
              </button>
            ))}
          </div>
          {goal === "industry" && (
            <div className="mt-4">
              <p className="text-xs font-semibold text-white/45">Elegí el tipo de negocio</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {industries.map((item) => <button key={item.id} type="button" aria-pressed={industry === item.id} onClick={() => { setIndustry(item.id); trackEvent("calculator_recommendation_answer", { question: "industry", answer: item.id }); }} className={`rounded-full border px-3.5 py-2 text-xs font-bold transition ${industry === item.id ? "border-emerald-300/35 bg-emerald-300/[0.08] text-white" : "border-white/10 text-white/55 hover:text-white"}`}>{item.label}</button>)}
              </div>
            </div>
          )}
        </div>

        <div aria-live="polite" className="min-h-[230px] rounded-3xl border border-white/[0.08] bg-black/30 p-6 sm:p-7">
          {recommendation ? <>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-200/55">{recommendation.eyebrow}</p>
            <h3 className="mt-3 text-2xl font-bold tracking-tight text-white">Te recomendamos: {recommendation.title}</h3>
            <p className="mt-3 text-sm leading-7 text-white/55">{recommendation.description}</p>
            <Link href={recommendation.href} onClick={() => trackEvent("select_recommended_calculator", { calculator_name: recommendation.title, destination: recommendation.href })} className="app-dark-action mt-6 inline-flex rounded-full px-5 py-3 text-sm transition">Abrir herramienta recomendada →</Link>
          </> : <div className="flex min-h-[180px] flex-col justify-center">
            <span className="grid size-11 place-items-center rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.055] text-lg text-emerald-200">↗</span>
            <h3 className="mt-4 text-xl font-bold text-white">Una pregunta, una herramienta concreta</h3>
            <p className="mt-2 text-sm leading-6 text-white/45">Seleccioná un objetivo para recibir una recomendación inmediata.</p>
          </div>}
        </div>
      </div>
    </section>
  );
}

