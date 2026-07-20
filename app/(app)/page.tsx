import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: {
    absolute: "Calculadora Emprendedora | Calculadoras para negocios e inversiones",
  },
  description:
    "Calculadoras online gratuitas para emprendedores: margen de ganancia, precio de venta, punto de equilibrio, ROI, interés compuesto y más.",
};

const benefits = [
  {
    number: "01",
    title: "Calculá precios reales",
    text: "Incluí costos y el margen que necesitás antes de definir cuánto cobrar.",
  },
  {
    number: "02",
    title: "Entendé tu rentabilidad",
    text: "Pasá de una estimación a números claros sobre ventas y ganancias.",
  },
  {
    number: "03",
    title: "Compará inversiones",
    text: "Proyectá rendimientos y evaluá distintas opciones con los mismos criterios.",
  },
  {
    number: "04",
    title: "Tomá mejores decisiones",
    text: "Usá resultados simples para decidir con más información y menos dudas.",
  },
];

const categories = [
  {
    title: "Por tipo de negocio",
    text: "Herramientas para gastronomía, producción, distribución, reventa y negocios a comisión.",
  },
  {
    title: "Inversión y ahorro",
    text: "Proyectá capital, aportes mensuales, metas de ahorro y rendimiento real.",
  },
  {
    title: "Costos y rentabilidad",
    text: "Calculá precios, márgenes, retorno y las ventas necesarias para cubrir costos.",
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
    <div className="pb-8 pt-4 sm:pt-10">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] px-5 py-12 shadow-2xl shadow-black/25 sm:px-10 sm:py-16 lg:px-14 lg:py-20">
        <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-20 h-64 w-64 rounded-full bg-sky-400/10 blur-3xl" />

        <div className="relative max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300/80">
            Herramientas gratuitas y simples
          </p>
          <h1 className="mt-5 text-4xl font-bold leading-[1.08] tracking-[-0.035em] text-white sm:text-5xl lg:text-6xl">
            Calculadoras para emprendedores, negocios e inversiones
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-white/65 sm:text-lg sm:leading-8">
            Calculá precios, márgenes, rentabilidad, punto de equilibrio e
            inversiones con herramientas simples y gratuitas.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/calculadoras"
              className="rounded-full bg-white px-4 py-2.5 text-center text-sm font-semibold !text-black transition hover:bg-zinc-200"
            >
              Ver calculadoras
            </Link>
            <Link
              href="/margen"
              className="rounded-full border border-white/15 bg-white/[0.04] px-4 py-2.5 text-center text-sm font-medium text-white transition hover:border-white/30 hover:bg-white/[0.08]"
            >
              Calcular margen
            </Link>
          </div>
          <div className="mt-8 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30">
            <span className="h-px w-8 bg-emerald-300/35" />
            Originado por Zella AI
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mb-7 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
            Números más claros
          </p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
            Herramientas para decidir con confianza
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => (
            <article
              key={benefit.title}
              className="rounded-2xl border border-white/10 bg-zinc-900/50 p-5"
            >
              <span className="text-xs font-semibold text-emerald-300/70">
                {benefit.number}
              </span>
              <h3 className="mt-5 font-semibold text-white">{benefit.title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/55">{benefit.text}</p>
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
              href="/calculadoras"
              className="group flex min-h-60 flex-col rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.055] to-white/[0.02] p-6 transition hover:-translate-y-0.5 hover:border-white/25"
            >
              <span className="text-sm text-white/35">0{index + 1}</span>
              <h3 className="mt-8 text-xl font-semibold tracking-tight">
                {category.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-white/58">{category.text}</p>
              <span className="mt-auto pt-7 text-sm font-semibold text-white">
                Ver categoría <span className="transition group-hover:ml-1">→</span>
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

      <section className="overflow-hidden rounded-3xl border border-emerald-300/15 bg-emerald-300/[0.055] p-6 sm:p-9">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300/75">
          Cuenta gratuita
        </p>
        <h2 className="mt-3 text-2xl font-bold tracking-tight">
          Guardá escenarios y analizalos con inteligencia artificial
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/62 sm:text-base">
          Iniciá sesión para conservar tus cálculos, consultarlos desde cualquier
          dispositivo y recibir un análisis contextual con recomendaciones para
          tomar decisiones más claras. El plan gratuito incluye un análisis por
          semana y hasta cinco mensajes de seguimiento por día.
        </p>
        <Link href="/precios" className="mt-6 inline-flex rounded-full border border-emerald-200/20 bg-emerald-200/[0.07] px-4 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-200/[0.12]">
          Comparar Gratis y Pro →
        </Link>
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
    </div>
  );
}
