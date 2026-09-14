import type { Metadata } from "next";
import Link from "next/link";

import PricingFaq, { pricingFaqSchemaEntries } from "@/components/PricingFaq";
import PricingSelector from "@/components/PricingSelector";
import { PAID_PLANS, type PaidPlanName } from "@/lib/plans";

export const metadata: Metadata = {
  title: "Planes Básico, Pro y Premium",
  description: "Compará los planes mensuales de Calculadora Emprendedora. Guardá escenarios, compará alternativas y analizá tus números con IA.",
  alternates: { canonical: "/precios" },
  openGraph: {
    title: "Planes Básico, Pro y Premium | Calculadora Emprendedora",
    description: "Elegí cuánto acompañamiento necesitás para calcular, comparar y decidir.",
    url: "/precios",
    images: [{
      url: "/opengraph-image",
      width: 1200,
      height: 630,
      alt: "Calculadora Emprendedora — planes para decidir con números claros",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Planes Básico, Pro y Premium | Calculadora Emprendedora",
    description: "Elegí cuánto acompañamiento necesitás para calcular, comparar y decidir.",
    images: ["/opengraph-image"],
  },
};

const comparisonRows = [
  { feature: "Calculadoras", basic: "Precio, margen y punto de equilibrio", pro: "Todas, incluidas las de rubro", premium: "Todas + acceso anticipado" },
  { feature: "Escenarios guardados", basic: "Hasta 2", pro: "Ilimitados", premium: "Ilimitados" },
  { feature: "Comparar escenarios", basic: "No incluido", pro: "Hasta 3 lado a lado", premium: "Sin límite simultáneo" },
  { feature: "Análisis con IA", basic: "5 por mes", pro: "50 por mes", premium: "Ilimitados" },
  { feature: "Soporte", basic: "Email estándar", pro: "Prioritario", premium: "Prioritario + consulta 1 a 1" },
];

function CheckIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="none">
      <path d="m4 10.5 3.4 3.4L16 5.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function paypalPlanReady(plan: PaidPlanName) {
  if (plan === "basic") return Boolean(process.env.PAYPAL_PLAN_BASIC_MONTHLY_ID);
  if (plan === "premium") return Boolean(process.env.PAYPAL_PLAN_PREMIUM_MONTHLY_ID);
  return Boolean(process.env.PAYPAL_PLAN_PRO_MONTHLY_ID || process.env.PAYPAL_PLAN_MONTHLY_ID);
}

export default function PricingPage() {
  const paypalMode = process.env.PAYPAL_ENV?.toLowerCase() === "live" ? "live" : "sandbox";
  const paypalBaseReady = Boolean(
    process.env.PAYPAL_CLIENT_ID
      && process.env.PAYPAL_CLIENT_SECRET
      && (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY),
  );

  return (
    <div className="pricing-surface relative isolate overflow-hidden bg-[#050805] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: pricingFaqSchemaEntries,
          }).replace(/</g, "\\u003c"),
        }}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[760px] bg-[radial-gradient(circle_at_50%_-10%,rgba(52,211,153,0.2),transparent_50%)]" />
      <div className="pointer-events-none absolute left-[-12rem] top-[34rem] -z-10 h-96 w-96 rounded-full bg-emerald-500/[0.06] blur-3xl" />

      <section className="mx-auto max-w-6xl px-4 pb-14 pt-20 text-center sm:px-6 sm:pb-20 sm:pt-28">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-300/[0.055] px-3 py-1.5 text-xs font-medium text-emerald-100/75">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.9)]" />
          Planes simples · facturación mensual
        </div>
        <h1 className="mx-auto mt-7 max-w-4xl text-4xl font-semibold leading-[1.02] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
          Elegí la capacidad que necesita tu negocio hoy
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-white/52 sm:text-lg sm:leading-8">
          Calculá gratis. Sumá guardado, comparación e IA cuando necesites convertir más alternativas en una decisión concreta.
        </p>
        <div className="mx-auto mt-8 flex max-w-2xl flex-col items-center justify-between gap-4 rounded-2xl border border-white/[0.08] bg-black/20 px-5 py-4 text-left sm:flex-row">
          <div>
            <p className="text-sm font-semibold text-white/82">Podés empezar sin pagar</p>
            <p className="mt-1 text-xs leading-5 text-white/40">Usá las calculadoras gratuitas sin límite. La cuenta gratis permite guardar hasta 2 escenarios y probar la IA.</p>
          </div>
          <Link href="/perfil?modo=registro" className="w-full shrink-0 rounded-full border border-white/12 px-4 py-2.5 text-center text-sm font-semibold text-white/75 transition hover:bg-white/[0.06] hover:text-white sm:w-auto">Crear cuenta gratis</Link>
        </div>
      </section>

      <section aria-labelledby="paid-plans-title" className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="sr-only"><h2 id="paid-plans-title">Planes pagos mensuales</h2></div>
        <div className="grid items-stretch gap-5 lg:grid-cols-3 lg:gap-6">
          {PAID_PLANS.map((plan) => {
            const recommended = "recommended" in plan && plan.recommended;
            const ready = paypalBaseReady && paypalPlanReady(plan.id);
            return (
              <article
                key={plan.id}
                id={`plan-${plan.id}`}
                className={`relative flex flex-col overflow-hidden rounded-[30px] p-6 sm:p-8 ${recommended
                  ? "border border-emerald-300/40 bg-[linear-gradient(150deg,rgba(16,185,129,0.16),rgba(255,255,255,0.035)_50%,rgba(0,0,0,0.2))] shadow-[0_32px_110px_rgba(16,185,129,0.14)] lg:-my-3 lg:py-11"
                  : "border border-white/[0.09] bg-white/[0.025]"}`}
              >
                {recommended ? <div className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-emerald-300/10 blur-3xl" /> : null}
                <div className="relative flex items-start justify-between gap-3">
                  <div>
                    <p className={`text-sm font-semibold ${recommended ? "text-emerald-200" : "text-white/55"}`}>{plan.name}</p>
                    <p className="mt-2 text-xs leading-5 text-white/38">{plan.tagline}</p>
                  </div>
                  {recommended ? <span className="rounded-full bg-emerald-300 px-3 py-1 text-[10px] font-black uppercase tracking-[0.13em] text-emerald-950">Recomendado</span> : null}
                </div>

                <div className="relative mt-7 flex items-end gap-2">
                  <p className="text-4xl font-semibold tracking-[-0.04em] text-white">US$ {plan.priceUsd.toFixed(2)}</p>
                  <p className="pb-1 text-sm text-white/35">/ mes</p>
                </div>
                <p className="relative mt-5 min-h-18 text-sm leading-6 text-white/48">{plan.description}</p>

                <PricingSelector plan={plan.id} paypalReady={ready} paypalMode={paypalMode} emphasized={recommended} />

                <div className={`relative my-7 h-px ${recommended ? "bg-emerald-100/12" : "bg-white/[0.08]"}`} />
                <ul className="relative space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className={`flex gap-3 text-sm leading-6 ${recommended ? "text-white/72" : "text-white/55"}`}>
                      <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ${recommended ? "bg-emerald-300 text-emerald-950" : "border border-white/12 text-white/55"}`}><CheckIcon /></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
        <p className="mx-auto mt-10 max-w-3xl text-center text-xs leading-6 text-white/32">Los tres planes se renuevan mensualmente. El cobro se procesa en USD mediante PayPal y el importe final se muestra antes de confirmar.</p>
      </section>

      <section className="border-y border-white/[0.07] bg-white/[0.018]">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200/60">Comparación clara</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Qué incluye cada plan</h2>
            <p className="mt-4 text-sm leading-7 text-white/45">Sin costos anuales adelantados ni límites escondidos. Pro concentra lo que necesita la mayoría de los negocios.</p>
          </div>

          <div className="mt-10 overflow-x-auto rounded-3xl border border-white/[0.08] bg-black/20">
            <div className="min-w-[760px]">
              <div className="grid grid-cols-[1.15fr_repeat(3,1fr)] border-b border-white/[0.08] px-6 py-5 text-xs font-semibold text-white/38">
                <span>Característica</span>
                <span>Básico</span>
                <span className="text-emerald-200/85">Pro · Recomendado</span>
                <span>Premium</span>
              </div>
              {comparisonRows.map((row) => (
                <div key={row.feature} className="grid grid-cols-[1.15fr_repeat(3,1fr)] items-center border-b border-white/[0.06] px-6 py-5 text-sm last:border-0">
                  <span className="pr-5 font-medium text-white/72">{row.feature}</span>
                  <span className="pr-5 text-white/42">{row.basic}</span>
                  <span className="pr-5 font-semibold text-emerald-100/82">{row.pro}</span>
                  <span className="text-white/48">{row.premium}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pt-20 sm:px-6 sm:pt-24">
        <div className="overflow-hidden rounded-[30px] border border-emerald-300/15 bg-[linear-gradient(145deg,rgba(16,185,129,0.1),rgba(5,8,5,0.96)_48%)] p-7 sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-200/55">Por qué Pro es el más elegido</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">Compará antes de comprometer plata</h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/50">Guardá todas las alternativas que necesites, enfrentá hasta tres lado a lado y usá la IA para detectar qué supuesto cambia realmente la decisión.</p>
            </div>
            <Link href="#plan-pro" className="rounded-full bg-emerald-300 px-6 py-3 text-center text-sm font-black text-emerald-950 transition hover:bg-emerald-200">Elegir Pro · US$ 19.99</Link>
          </div>
        </div>
      </section>

      <PricingFaq />
    </div>
  );
}
