import type { Metadata } from "next";
import Link from "next/link";

import CalculatorFinder from "@/components/CalculatorFinder";
import HomeAiDecisionDemo from "@/components/HomeAiDecisionDemo";
import HomeProfitPreview from "@/components/HomeProfitPreview";
import TrustSection from "@/components/TrustSection";
import { guides } from "@/lib/guides";

export const metadata: Metadata = {
  title: {
    absolute: "Calculadora de precio de venta y rentabilidad | Calculadora Emprendedora",
  },
  description:
    "Calculá cuánto cobrar, qué margen te queda y cuántas ventas necesitás para cubrir tus costos. Gratis y sin registrarte.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Definí precios rentables antes de vender",
    description:
      "Calculá precio de venta, margen y punto de equilibrio con números claros y sin armar una planilla.",
    url: "/",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Calculadora Emprendedora — decisiones de negocio con números claros",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Definí precios rentables antes de vender",
    description:
      "Calculá precio de venta, margen y punto de equilibrio con números claros.",
    images: ["/opengraph-image"],
  },
};

export default function Home() {
  return (
    <div className="pb-10 pt-4 sm:pt-8">
      <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.035] px-5 py-8 shadow-2xl shadow-black/25 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
        <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-20 h-64 w-64 rounded-full bg-sky-400/10 blur-3xl" />

        <div className="relative grid items-center gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-12">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-300/[0.06] px-3 py-1.5 text-[11px] font-semibold text-emerald-100/80">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
              Precios y rentabilidad para emprendedores
            </div>
            <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-[1.05] tracking-[-0.04em] text-white sm:text-5xl lg:text-[56px]">
              Definí precios rentables antes de vender
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/62 sm:text-lg sm:leading-8">
              Calculá cuánto cobrar, qué margen te queda y cuántas ventas necesitás
              para cubrir tus costos. Con números claros y sin armar una planilla.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/markup"
                className="rounded-full bg-white px-5 py-3 text-center text-sm font-bold !text-black transition hover:bg-emerald-100"
              >
                Calcular mi precio
              </Link>
              <Link
                href="/calculadoras"
                className="rounded-full border border-white/15 bg-white/[0.04] px-5 py-3 text-center text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/[0.08]"
              >
                Explorar calculadoras
              </Link>
            </div>
            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/65">
              <span>✓ Calculá sin registrarte</span>
              <span>✓ Revisá cada resultado</span>
              <span>✓ Guardá y compará escenarios</span>
            </div>
            <div className="mt-7 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/65">
              <span className="h-px w-8 bg-emerald-300/35" />
              Una herramienta de Growtella
            </div>
          </div>
          <HomeProfitPreview />
        </div>
      </section>

      <div className="pt-10 sm:pt-14">
        <HomeAiDecisionDemo />
      </div>

      <div className="pt-10 sm:pt-14">
        <CalculatorFinder />
      </div>

      <div className="pt-10 sm:pt-14">
        <TrustSection />
      </div>

      <section className="py-12 sm:py-16">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-200/75">
              El criterio detrás del resultado
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
              Guías con fórmulas y casos paso a paso
            </h2>
          </div>
          <Link href="/guias" className="text-sm font-bold text-white/55 hover:text-white">
            Ver todas las guías →
          </Link>
        </div>
        <div className="mt-7 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {guides.slice(0, 3).map((guide) => (
            <Link
              key={guide.slug}
              href={`/guias/${guide.slug}`}
              className="group flex min-h-52 flex-col rounded-3xl border border-white/[0.08] bg-[#090c0a] p-5 transition hover:-translate-y-0.5 hover:border-emerald-300/20"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-200/75">
                {guide.eyebrow}
              </p>
              <h3 className="mt-4 text-lg font-bold text-white/90">{guide.title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/65">{guide.description}</p>
              <span className="mt-auto pt-5 text-sm font-bold text-white/65 group-hover:text-white">
                Ver fórmula y ejemplo →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-gradient-to-r from-white/[0.055] to-white/[0.02] px-6 py-9 text-center sm:px-10 sm:py-12">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200/65">
          Empezá por tu negocio
        </p>
        <h2 className="mx-auto mt-3 max-w-2xl text-2xl font-bold tracking-tight sm:text-3xl">
          Poné a prueba un precio antes de llevarlo a tus clientes
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/65">
          Podés calcular gratis y sin cuenta. Registrate solamente si querés guardar
          el escenario, compararlo o profundizarlo con IA.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/markup"
            className="inline-flex justify-center rounded-full bg-white px-5 py-3 text-sm font-bold !text-zinc-950 transition hover:bg-emerald-100"
          >
            Calcular precio de venta →
          </Link>
          <Link
            href="/calculadoras"
            className="inline-flex justify-center rounded-full border border-white/12 px-5 py-3 text-sm font-bold text-white/65 transition hover:border-white/25 hover:text-white"
          >
            Ver todas las herramientas
          </Link>
        </div>
      </section>
    </div>
  );
}
