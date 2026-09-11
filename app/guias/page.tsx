import type { Metadata } from "next";
import Link from "next/link";

import { guides } from "@/lib/guides";

// Guides come from local source data and are immutable between deployments.
export const revalidate = false;

export const metadata: Metadata = {
  title: "Guías para calcular precios, impuestos, costos e inversiones",
  description:
    "Guías prácticas con fórmulas y ejemplos sobre IVA, Ingresos Brutos, costo laboral, ROI, interés compuesto, reventa, producción y rentabilidad.",
  alternates: { canonical: "/guias" },
};

export default function GuidesPage() {
  return (
    <main className="min-h-screen bg-[#070907] text-white">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <header className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-200/75">
            Centro de aprendizaje · {guides.length} guías
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Guías para decidir con números más claros
          </h1>
          <p className="mt-5 text-base leading-8 text-white/70">
            Fórmulas explicadas sin vueltas, ejemplos comprobables, errores que conviene
            evitar y acceso directo a la calculadora correspondiente.
          </p>
        </header>

        <section aria-label="Todas las guías" className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {guides.map((guide) => (
            <Link
              key={guide.slug}
              href={`/guias/${guide.slug}`}
              className="group flex min-h-64 flex-col rounded-3xl border border-white/[0.08] bg-[#0a0d0b] p-6 transition hover:-translate-y-0.5 hover:border-emerald-300/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-200/75">
                {guide.eyebrow}
              </p>
              <h2 className="mt-4 text-xl font-bold tracking-tight text-white/95">
                {guide.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-white/65">{guide.description}</p>
              <span className="mt-auto pt-6 text-sm font-bold text-white/75 group-hover:text-white">
                Ver fórmula y ejemplo →
              </span>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
