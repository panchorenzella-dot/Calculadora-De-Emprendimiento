import type { Metadata } from "next";
import Link from "next/link";

import PricingSelector from "@/components/PricingSelector";
import { PLAN_LIMITS } from "@/lib/plans";

export const metadata: Metadata = {
  title: "Planes",
  description:
    "Compará el plan Gratis y Calculadora Emprendedora Pro: más análisis con IA, más mensajes y una experiencia pensada para decidir mejor.",
};

const freeFeatures = [
  "Todas las calculadoras del sitio",
  `${PLAN_LIMITS.free.scenarios} escenarios guardados por día`,
  `${PLAN_LIMITS.free.analysis} análisis con IA por semana`,
  `${PLAN_LIMITS.free.chat} mensajes de seguimiento por día`,
  "Historial de análisis y conversaciones",
];

const proFeatures = [
  `${PLAN_LIMITS.pro.analysis} análisis con IA por mes`,
  `${PLAN_LIMITS.pro.chat} mensajes de seguimiento por mes`,
  "Escenarios guardados ilimitados",
  "Modelo de IA con mayor capacidad",
  "Todas las calculadoras y escenarios guardados",
  "Historial completo en todos tus dispositivos",
];

const comparisons = [
  ["Calculadoras", "Todas", "Todas"],
  ["Escenarios guardados", "3 por día", "Ilimitados"],
  ["Análisis con IA", "1 por semana", "30 por mes"],
  ["Mensajes con IA", "5 por día", "300 por mes"],
  ["Modelo de IA", "Esencial", "Mayor capacidad"],
];

function CheckIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="none">
      <path d="m4 10.5 3.4 3.4L16 5.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function PricingPage() {
  const paypalMode = process.env.PAYPAL_ENV?.toLowerCase() === "live" ? "live" : "sandbox";
  const paypalReady = Boolean(
    process.env.PAYPAL_CLIENT_ID
      && process.env.PAYPAL_CLIENT_SECRET
      && process.env.PAYPAL_PLAN_MONTHLY_ID
      && process.env.PAYPAL_PLAN_QUARTERLY_ID
      && process.env.PAYPAL_PLAN_ANNUAL_ID
      && (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)
  );

  return (
    <div className="relative isolate overflow-hidden bg-[#080a09] text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[720px] bg-[radial-gradient(circle_at_50%_-10%,rgba(52,211,153,0.18),transparent_48%)]" />
      <div className="pointer-events-none absolute left-[-12rem] top-[28rem] -z-10 h-96 w-96 rounded-full bg-emerald-500/[0.06] blur-3xl" />

      <section className="mx-auto max-w-6xl px-4 pb-12 pt-20 text-center sm:px-6 sm:pb-16 sm:pt-28">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-300/[0.055] px-3 py-1.5 text-xs font-medium text-emerald-100/75">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.9)]" />
          Más capacidad para decisiones importantes
        </div>
        <h1 className="mx-auto mt-7 max-w-4xl text-4xl font-semibold leading-[1.02] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
          Elegí cuánto querés apoyarte en la IA
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-white/50 sm:text-lg sm:leading-8">
          Empezá gratis y pasá a Pro cuando necesites analizar más escenarios,
          profundizar conversaciones y trabajar con un modelo de mayor capacidad.
        </p>
        <div className="mx-auto mt-9 grid max-w-2xl grid-cols-2 divide-x divide-white/10 rounded-2xl border border-white/[0.08] bg-black/25 p-4 backdrop-blur sm:p-5">
          <div className="px-2">
            <p className="text-2xl font-semibold tracking-tight text-emerald-200 sm:text-3xl">Más de 25</p>
            <p className="mt-1 text-xs text-white/35 sm:text-sm">análisis por mes en Pro</p>
          </div>
          <div className="px-2">
            <p className="text-2xl font-semibold tracking-tight text-emerald-200 sm:text-3xl">Más de 200</p>
            <p className="mt-1 text-xs text-white/35 sm:text-sm">mensajes por mes en Pro</p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-5 px-4 pb-20 sm:px-6 lg:grid-cols-2 lg:gap-6">
        <article className="flex flex-col rounded-[28px] border border-white/[0.09] bg-white/[0.025] p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-white/45">Gratis</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight">$0</h2>
              <p className="mt-1 text-sm text-white/35">Para siempre</p>
            </div>
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/40">Para empezar</span>
          </div>
          <p className="mt-7 max-w-md text-sm leading-6 text-white/45">
            Calculá, guardá y probá el análisis inteligente sin pagar.
          </p>
          <Link href="/calculadoras" className="mt-7 rounded-full border border-white/12 bg-white/[0.04] px-4 py-3 text-center text-sm font-semibold text-white/80 transition hover:border-white/25 hover:bg-white/[0.08] hover:text-white">
            Empezar gratis
          </Link>
          <div className="my-7 h-px bg-white/[0.08]" />
          <ul className="space-y-4">
            {freeFeatures.map((feature) => (
              <li key={feature} className="flex gap-3 text-sm text-white/55">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border border-white/10 text-white/50"><CheckIcon /></span>
                {feature}
              </li>
            ))}
          </ul>
        </article>

        <article className="relative flex flex-col overflow-hidden rounded-[28px] border border-emerald-300/30 bg-[linear-gradient(145deg,rgba(16,185,129,0.13),rgba(255,255,255,0.025)_48%,rgba(0,0,0,0.18))] p-6 shadow-[0_28px_100px_rgba(16,185,129,0.08)] sm:p-8">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-emerald-300/10 blur-3xl" />
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-emerald-200">Pro</p>
                <span className="rounded-full bg-emerald-300 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-950">Recomendado</span>
              </div>
            </div>
            <span className="rounded-full border border-emerald-200/20 bg-emerald-200/[0.06] px-3 py-1 text-xs text-emerald-100/70">30 + 300</span>
          </div>
          <p className="relative mt-7 max-w-md text-sm leading-6 text-white/55">
            Más margen para comparar escenarios y conversar en profundidad antes de decidir.
          </p>
          <PricingSelector paypalReady={paypalReady} paypalMode={paypalMode} />
          <div className="relative my-7 h-px bg-emerald-100/10" />
          <ul className="relative space-y-4">
            {proFeatures.map((feature) => (
              <li key={feature} className="flex gap-3 text-sm text-white/70">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-300 text-emerald-950"><CheckIcon /></span>
                {feature}
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="border-y border-white/[0.07] bg-white/[0.018]">
        <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200/60">Comparación clara</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Todo lo que cambia con Pro</h2>
            <p className="mt-4 text-sm leading-7 text-white/45">Sin funciones escondidas ni límites ambiguos. Estos son los cupos exactos.</p>
          </div>
          <div className="mt-10 overflow-hidden rounded-3xl border border-white/[0.08] bg-black/20">
            <div className="grid grid-cols-[1.25fr_.75fr_.8fr] border-b border-white/[0.08] px-4 py-4 text-xs font-semibold text-white/35 sm:px-6">
              <span>Característica</span><span>Gratis</span><span className="text-emerald-200/70">Pro</span>
            </div>
            {comparisons.map(([feature, free, pro]) => (
              <div key={feature} className="grid grid-cols-[1.25fr_.75fr_.8fr] items-center border-b border-white/[0.06] px-4 py-4 text-xs last:border-0 sm:px-6 sm:text-sm">
                <span className="pr-3 font-medium text-white/70">{feature}</span>
                <span className="pr-3 text-white/38">{free}</span>
                <span className="font-medium text-emerald-100/75">{pro}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-24">
        <div className="grid gap-10 lg:grid-cols-[.75fr_1.25fr] lg:gap-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200/60">Preguntas frecuentes</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight">Antes de elegir</h2>
          </div>
          <div className="divide-y divide-white/[0.08] border-y border-white/[0.08]">
            <div className="py-6"><h3 className="font-medium text-white/85">¿Cuándo se renuevan los límites?</h3><p className="mt-2 text-sm leading-6 text-white/42">En Gratis, el análisis se renueva cada semana y los mensajes y escenarios cada día. En Pro, análisis y mensajes se renuevan cada mes; los escenarios son ilimitados.</p></div>
            <div className="py-6"><h3 className="font-medium text-white/85">¿Puedo pagar varios meses por adelantado?</h3><p className="mt-2 text-sm leading-6 text-white/42">Sí. La propuesta incluye pago mensual anticipado, trimestral con 10% de ahorro y anual con 20% de ahorro.</p></div>
            <div className="py-6"><h3 className="font-medium text-white/85">¿Qué pasa si llego al límite?</h3><p className="mt-2 text-sm leading-6 text-white/42">Tus cálculos y escenarios siguen disponibles. Solo tenés que esperar la renovación del cupo de IA.</p></div>
            <div className="py-6"><h3 className="font-medium text-white/85">¿Ya puedo pagar Pro?</h3><p className="mt-2 text-sm leading-6 text-white/42">{paypalReady ? paypalMode === "sandbox" ? "El flujo está habilitado en modo de prueba. No se mueve dinero real hasta completar la verificación y pasar PayPal a Live." : "Sí. Elegí un período, iniciá sesión y confirmá la suscripción segura desde PayPal." : "Estamos terminando la configuración segura de PayPal antes de habilitar el botón."}</p></div>
          </div>
        </div>
      </section>
    </div>
  );
}
