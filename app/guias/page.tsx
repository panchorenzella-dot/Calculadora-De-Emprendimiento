import type { Metadata } from "next";
import Link from "next/link";

import { guides } from "@/lib/guides";

export const metadata: Metadata = {
  title: "Guías para calcular precios, costos y rentabilidad",
  description: "Guías prácticas para entender precios, margen, punto de equilibrio, ROI, recupero de inversión y costos de un negocio.",
  alternates: { canonical: "/guias" },
};

export default function GuidesPage() {
  return <main className="min-h-screen bg-[#070907] text-white"><div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20"><header className="max-w-3xl"><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-200/60">Centro de aprendizaje</p><h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">Guías para decidir con números más claros</h1><p className="mt-5 text-base leading-8 text-white/55">Explicaciones prácticas, ejemplos y acceso directo a la calculadora correspondiente.</p></header><section className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{guides.map((guide) => <Link key={guide.slug} href={`/guias/${guide.slug}`} className="group flex min-h-64 flex-col rounded-3xl border border-white/[0.08] bg-[#0a0d0b] p-6 transition hover:-translate-y-0.5 hover:border-emerald-300/25"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-200/50">{guide.eyebrow}</p><h2 className="mt-4 text-xl font-bold tracking-tight text-white/90">{guide.title}</h2><p className="mt-3 text-sm leading-6 text-white/45">{guide.description}</p><span className="mt-auto pt-6 text-sm font-bold text-white/70 group-hover:text-white">Leer guía →</span></Link>)}</section></div></main>;
}

