import type { Metadata } from "next";
import Link from "next/link";

import AnniversaryPromoBanner from "@/components/AnniversaryPromoBanner";
import HomeAiDecisionDemo from "@/components/HomeAiDecisionDemo";
import HomeProfitPreview from "@/components/HomeProfitPreview";
import TrustSection from "@/components/TrustSection";
import { availableCalculators } from "@/app/calculadoras/catalog";
import { isAnniversaryPromotionActive } from "@/lib/promotions";

export const revalidate = 3600;

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
  const promotionActive = isAnniversaryPromotionActive();

  return (
    <div className="pb-10 pt-4 sm:pt-8">
      <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.018] px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
        <div className="grid items-center gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-12">
          <div>
            <div className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.16em] text-emerald-100/60">
              <span className="h-1 w-1 rounded-full bg-emerald-200/70" />
              Precios y rentabilidad para emprendedores
            </div>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-[-0.045em] text-white sm:text-5xl lg:text-[56px]">
              Entendé los números de tu negocio antes de decidir
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/62 sm:text-lg sm:leading-8">
              Calculá precios, costos, ganancias, impuestos e inversiones.
              Herramientas para emprendedores y pequeños negocios, con resultados explicados en palabras simples.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="#elegi-tu-calculo"
                className="rounded-lg bg-white px-5 py-3 text-center text-sm font-semibold !text-black transition hover:bg-emerald-100"
              >
                Elegir qué necesito calcular
              </Link>
              <Link
                href="/calculadoras"
                className="rounded-lg border border-white/10 px-5 py-3 text-center text-sm font-semibold text-white/72 transition hover:border-white/20 hover:text-white"
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

      <section id="elegi-tu-calculo" aria-labelledby="needs-title" className="scroll-mt-24 pt-8 sm:pt-10">
        <h2 id="needs-title" className="text-2xl font-semibold tracking-tight">¿Qué necesitás resolver?</h2>
        <p className="mt-2 text-sm text-white/65">Elegí una necesidad para empezar. Podés calcular gratis y sin registrarte.</p>
        <nav aria-label="Calculadoras por necesidad" className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["Definir un precio", "Costo, margen y cuánto cobrar", "/markup"],
            ["Saber cuánto gano", "Ingresos, costos y resultado mensual", "/margen"],
            ["Cubrir mis costos", "Ventas necesarias para alcanzar el equilibrio", "/punto-de-equilibrio"],
            ["Calcular impuestos", "IVA, Ingresos Brutos y costo laboral", "/calculadoras#taxes"],
            ["Evaluar una inversión", "Retorno, inflación y recupero", "/roi-inversion"],
            ["Planificar mis ahorros", "Aportes, plazos y capital estimado", "/interes-compuesto"],
          ].map(([label, detail, href]) => <Link key={href} href={href} className="rounded-xl border border-white/10 p-5 transition hover:border-white/25 hover:bg-white/[0.025]"><h3 className="font-medium">{label} <span aria-hidden="true">→</span></h3><p className="mt-2 text-sm leading-6 text-white/65">{detail}</p></Link>)}
        </nav>
      </section>

      {promotionActive ? (
        <div className="pt-8 sm:pt-10">
          <AnniversaryPromoBanner />
        </div>
      ) : null}

      <div className="pt-8 sm:pt-10">
        <HomeAiDecisionDemo />
      </div>

      <section aria-labelledby="featured-calculators-title" className="pt-8 sm:pt-10">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="featured-calculators-title" className="text-2xl font-semibold tracking-tight">
              Calculadoras destacadas
            </h2>
            <p className="mt-2 text-sm text-white/65">
              Empezá por el precio, la ganancia o las ventas necesarias para cubrir costos.
            </p>
          </div>
          <Link href="/calculadoras" className="inline-flex shrink-0 justify-center rounded-lg border border-white/10 px-5 py-3 text-sm font-medium text-white/72 transition hover:border-white/20 hover:text-white">
            Ver las {availableCalculators.length} calculadoras →
          </Link>
        </div>
        <nav aria-label="Calculadoras destacadas" className="grid gap-3 md:grid-cols-3">
          {featuredCalculators.map((calculator) => (
            <Link key={calculator.href} href={calculator.href} className="group flex flex-col rounded-xl border border-white/[0.07] bg-white/[0.015] p-5 transition hover:border-white/[0.14] hover:bg-white/[0.025]">
              <h3 className="text-base font-medium text-white/88">{calculator.title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/65">{calculator.description}</p>
              <span className="mt-auto pt-4 text-sm font-medium text-emerald-100/65 group-hover:text-emerald-100">Abrir calculadora →</span>
            </Link>
          ))}
        </nav>
      </section>

      <div className="pt-10 sm:pt-14">
        <TrustSection />
      </div>

      <section className="mt-10 rounded-2xl border border-white/[0.07] bg-white/[0.015] px-6 py-9 text-center sm:px-10 sm:py-12">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200/65">
          Empezá por tu negocio
        </p>
        <h2 className="mx-auto mt-3 max-w-2xl text-2xl font-semibold tracking-tight sm:text-3xl">
          Poné a prueba un precio antes de llevarlo a tus clientes
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/65">
          Podés calcular gratis y sin cuenta. Registrate solamente si querés guardar
          el escenario, compararlo o profundizarlo con IA.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/markup"
            className="inline-flex justify-center rounded-lg bg-white px-5 py-3 text-sm font-semibold !text-zinc-950 transition hover:bg-emerald-100"
          >
            Calcular precio de venta →
          </Link>
          <Link
            href="/calculadoras"
            className="inline-flex justify-center rounded-lg border border-white/[0.1] px-5 py-3 text-sm font-medium text-white/60 transition hover:border-white/20 hover:text-white"
          >
            Ver todas las herramientas
          </Link>
        </div>
      </section>
    </div>
  );
}
