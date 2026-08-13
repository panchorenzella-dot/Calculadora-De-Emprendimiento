import type { Metadata } from "next";
import Link from "next/link";
import HomeProfitPreview from "@/components/HomeProfitPreview";
import CalculatorFinder from "@/components/CalculatorFinder";
import TrustSection from "@/components/TrustSection";
import { guides } from "@/lib/guides";

export const metadata: Metadata = {
  title: {
    absolute: "Calculadora Emprendedora | Calculadoras para negocios e inversiones",
  },
  description:
    "Calculadoras online gratuitas para emprendedores: margen de ganancia, precio de venta, punto de equilibrio, ROI, interés compuesto y más.",
};

const steps = [
  {
    number: "01",
    title: "Elegí qué querés resolver",
    text: "Buscá por objetivo o por tipo de negocio y abrí la herramienta adecuada.",
  },
  {
    number: "02",
    title: "Completá tus datos",
    text: "Ingresá costos, precios o inversión. Cada campo explica qué información necesitás.",
  },
  {
    number: "03",
    title: "Entendé el resultado",
    text: "Recibí métricas claras y, si querés, guardá el escenario para analizarlo con IA.",
  },
];

const categories = [
  {
    title: "Por tipo de negocio",
    text: "Herramientas para gastronomía, producción, distribución, reventa y negocios a comisión.",
    href: "/hamburgueseria",
    action: "Ver negocios",
  },
  {
    title: "Inversión y ahorro",
    text: "Proyectá capital, aportes mensuales, metas de ahorro y rendimiento real.",
    href: "/interes-compuesto",
    action: "Proyectar inversión",
  },
  {
    title: "Costos y rentabilidad",
    text: "Calculá precios, márgenes, retorno y las ventas necesarias para cubrir costos.",
    href: "/markup",
    action: "Calcular precio",
  },
];

const featured = [
  {
    title: "Margen de ganancia",
    text: "Conocé la rentabilidad real de una venta.",
    href: "/margen",
  },
  {
    title: "Precio de venta",
    text: "Definí cuánto cobrar según costo y margen.",
    href: "/markup",
  },
  {
    title: "Punto de equilibrio",
    text: "Calculá cuántas unidades necesitás vender.",
    href: "/punto-de-equilibrio",
  },
  {
    title: "Interés compuesto",
    text: "Proyectá el crecimiento de una inversión.",
    href: "/interes-compuesto",
  },
  {
    title: "ROI",
    text: "Medí el retorno de un negocio o proyecto.",
    href: "/roi",
  },
];

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
              16 calculadoras disponibles gratis
            </div>
            <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-[1.05] tracking-[-0.04em] text-white sm:text-5xl lg:text-[56px]">
              Entendé los números de tu negocio antes de decidir
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/62 sm:text-lg sm:leading-8">
              Calculá precios, costos, margen, punto de equilibrio e inversiones con resultados claros, sin fórmulas ni planillas complicadas.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/calculadoras"
                className="rounded-full bg-white px-5 py-3 text-center text-sm font-bold !text-black transition hover:bg-emerald-100"
              >
                Encontrar mi calculadora
              </Link>
              <Link
                href="/markup"
                className="rounded-full border border-white/15 bg-white/[0.04] px-5 py-3 text-center text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/[0.08]"
              >
                Calcular un precio
              </Link>
            </div>
            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/38">
              <span>✓ Sin registro para calcular</span>
              <span>✓ Pesos y dólares</span>
              <span>✓ Resultados instantáneos</span>
            </div>
            <div className="mt-7 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/28">
              <span className="h-px w-8 bg-emerald-300/35" />
              Una herramienta de Growtella
            </div>
          </div>
          <HomeProfitPreview />
        </div>
      </section>

      <section className="grid grid-cols-2 divide-x divide-white/[0.07] border-b border-white/[0.07] py-7 sm:grid-cols-4">
        {[
          ["16", "calculadoras activas"],
          ["3", "categorías principales"],
          ["ARS · USD", "monedas disponibles"],
          ["24/7", "acceso online"],
        ].map(([value, label]) => (
          <div key={label} className="px-3 text-center sm:px-5">
            <p className="text-lg font-semibold tracking-tight text-white sm:text-xl">{value}</p>
            <p className="mt-1 text-[11px] text-white/35 sm:text-xs">{label}</p>
          </div>
        ))}
      </section>

      <div className="pt-12 sm:pt-16">
        <CalculatorFinder />
      </div>

      <section className="py-16 sm:py-20">
        <div className="mb-7 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
            Simple de principio a fin
          </p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
            De una duda a un resultado en tres pasos
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((step) => (
            <article
              key={step.title}
              className="rounded-2xl border border-white/10 bg-zinc-900/50 p-6"
            >
              <span className="grid h-9 w-9 place-items-center rounded-full border border-emerald-300/15 bg-emerald-300/[0.06] text-xs font-semibold text-emerald-200/80">
                {step.number}
              </span>
              <h3 className="mt-5 font-semibold text-white">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/55">{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-7">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
            Explorá por categoría
          </p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
            Encontrá la herramienta que necesitás
          </h2>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {categories.map((category, index) => (
            <Link
              key={category.title}
              href={category.href}
              className="group flex min-h-60 flex-col rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.055] to-white/[0.02] p-6 transition hover:-translate-y-0.5 hover:border-white/25"
            >
              <span className="text-sm text-white/35">0{index + 1}</span>
              <h3 className="mt-8 text-xl font-semibold tracking-tight">
                {category.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-white/58">{category.text}</p>
              <span className="mt-auto pt-7 text-sm font-semibold text-white">
                {category.action} <span className="transition group-hover:ml-1">→</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
              Para empezar
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
              Calculadoras destacadas
            </h2>
          </div>
          <Link href="/calculadoras" className="text-sm font-semibold text-white/65 hover:text-white">
            Ver todas →
          </Link>
        </div>
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((calculator) => (
            <article
              key={calculator.href}
              className="flex flex-col rounded-2xl border border-white/10 bg-zinc-900/45 p-5"
            >
              <h3 className="text-lg font-semibold">{calculator.title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/55">{calculator.text}</p>
              <Link
                href={calculator.href}
                className="mt-6 w-fit rounded-lg border border-white/12 bg-white/[0.04] px-4 py-2 text-sm font-semibold transition hover:bg-white/[0.09]"
              >
                Abrir calculadora
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden rounded-3xl border border-emerald-300/15 bg-emerald-300/[0.055] p-6 sm:p-9">
        <div className="pointer-events-none absolute -right-12 -top-20 h-56 w-56 rounded-full bg-emerald-300/10 blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[1fr_0.72fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300/75">
              Más que un resultado
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
              Guardá escenarios y entendelos con inteligencia artificial
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/62 sm:text-base">
              Conservá tus cálculos, compará alternativas y pedile al asistente que explique riesgos, oportunidades y próximos pasos usando los datos de tu escenario.
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-xs text-white/52">
              <span className="rounded-full border border-white/10 bg-black/15 px-3 py-1.5">Historial de análisis</span>
              <span className="rounded-full border border-white/10 bg-black/15 px-3 py-1.5">Escenarios guardados</span>
              <span className="rounded-full border border-white/10 bg-black/15 px-3 py-1.5">Simulaciones con contexto</span>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <p className="text-sm font-semibold text-white">Empezá con una cuenta gratuita</p>
            <p className="mt-2 text-sm leading-6 text-white/45">Incluye un análisis semanal, cinco mensajes diarios y hasta tres escenarios por día.</p>
            <Link href="/precios" className="app-dark-action mt-5 flex justify-center rounded-full px-4 py-2.5 text-sm transition">
              Comparar Gratis y Pro
            </Link>
          </div>
        </div>
      </section>

      <div className="pt-12 sm:pt-16">
        <TrustSection />
      </div>

      <section className="py-16 sm:py-20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-200/50">Aprendé antes de decidir</p><h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">Guías prácticas con ejemplos reales</h2></div>
          <Link href="/guias" className="text-sm font-bold text-white/55 hover:text-white">Ver todas las guías →</Link>
        </div>
        <div className="mt-7 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {guides.slice(0, 3).map((guide) => <Link key={guide.slug} href={`/guias/${guide.slug}`} className="group flex min-h-56 flex-col rounded-3xl border border-white/[0.08] bg-[#090c0a] p-5 transition hover:-translate-y-0.5 hover:border-emerald-300/20"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-200/45">{guide.eyebrow}</p><h3 className="mt-4 text-lg font-bold text-white/90">{guide.title}</h3><p className="mt-3 text-sm leading-6 text-white/45">{guide.description}</p><span className="mt-auto pt-5 text-sm font-bold text-white/65 group-hover:text-white">Leer guía →</span></Link>)}
        </div>
      </section>

      <section className="mx-auto max-w-4xl py-16 sm:py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
          Calculadora Emprendedora
        </p>
        <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
          Cálculos útiles para negocios y finanzas personales
        </h2>
        <div className="mt-5 space-y-4 text-sm leading-7 text-white/58 sm:text-base">
          <p>
            Calculadora Emprendedora reúne herramientas online para entender mejor
            los números de un negocio o una inversión. Su objetivo es facilitar
            cálculos habituales sin planillas complejas.
          </p>
          <p>
            Emprendedores, comercios y trabajadores independientes pueden estimar
            precios de venta, márgenes, costos, rentabilidad y punto de equilibrio.
            Quienes ahorran o invierten también pueden proyectar interés compuesto,
            aportes mensuales, rendimiento y retorno de inversión.
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-gradient-to-r from-white/[0.055] to-white/[0.02] px-6 py-9 text-center sm:px-10 sm:py-12">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200/65">Tu próximo cálculo</p>
        <h2 className="mx-auto mt-3 max-w-2xl text-2xl font-bold tracking-tight sm:text-3xl">Elegí una herramienta y convertí una duda en una decisión más clara</h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/48">No necesitás registrarte para usar las calculadoras. Podés crear una cuenta después si querés guardar o analizar el resultado.</p>
        <Link href="/calculadoras" className="mt-6 inline-flex rounded-full bg-white px-5 py-3 text-sm font-bold !text-zinc-950 transition hover:bg-emerald-100">Ver todas las calculadoras →</Link>
      </section>
    </div>
  );
}
