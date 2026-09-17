import type { Metadata } from "next";
import Link from "next/link";

import HomeAiDecisionDemo from "@/components/HomeAiDecisionDemo";
import HomeProfitPreview from "@/components/HomeProfitPreview";
import TrustSection from "@/components/TrustSection";
import { availableCalculators } from "@/app/calculadoras/catalog";

const featuredCalculators = [
  "/markup",
  "/margen",
  "/punto-de-equilibrio",
].map((href) => availableCalculators.find((calculator) => calculator.href === href))
  .filter((calculator) => calculator !== undefined);

const homeTitle = "Calculadoras gratis para emprendedores | Precio y costos";
const homeDescription = `${availableCalculators.length} calculadoras gratis para emprendedores y pymes de Argentina. Calculá precios, ganancias, costos, impuestos, inversión y ahorro sin registrarte.`;

export const metadata: Metadata = {
  title: {
    absolute: homeTitle,
  },
  description: homeDescription,
  alternates: { canonical: "/" },
  openGraph: {
    title: homeTitle,
    description: homeDescription,
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
    title: homeTitle,
    description: homeDescription,
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
                className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-5 py-3 text-center text-sm font-bold text-emerald-100 transition hover:border-emerald-300/50 hover:bg-emerald-300/20"
              >
                Explorar las {availableCalculators.length} calculadoras →
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

      <section aria-labelledby="featured-calculators-title" className="pt-8 sm:pt-10">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="featured-calculators-title" className="text-2xl font-bold tracking-tight">
              Calculadoras destacadas
            </h2>
            <p className="mt-2 text-sm text-white/65">
              Empezá por el precio, la ganancia o las ventas necesarias para cubrir costos.
            </p>
          </div>
          <Link href="/calculadoras" className="inline-flex shrink-0 justify-center rounded-full bg-white px-5 py-3 text-sm font-bold !text-zinc-950 transition hover:bg-emerald-100">
            Ver las {availableCalculators.length} calculadoras →
          </Link>
        </div>
        <nav aria-label="Calculadoras destacadas" className="grid gap-3 md:grid-cols-3">
          {featuredCalculators.map((calculator) => (
            <Link key={calculator.href} href={calculator.href} className="group flex flex-col rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 transition hover:border-emerald-300/25 hover:bg-white/[0.05]">
              <h3 className="text-base font-bold text-emerald-200/90">{calculator.title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/65">{calculator.description}</p>
              <span className="mt-auto pt-4 text-sm font-bold text-white/90 group-hover:text-emerald-200">Abrir calculadora →</span>
            </Link>
          ))}
        </nav>
      </section>

      <div className="pt-10 sm:pt-14">
        <HomeAiDecisionDemo />
      </div>

      <div className="pt-10 sm:pt-14">
        <TrustSection />
      </div>

      <section className="mt-10 rounded-3xl border border-white/10 bg-gradient-to-r from-white/[0.055] to-white/[0.02] px-6 py-9 text-center sm:px-10 sm:py-12">
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
