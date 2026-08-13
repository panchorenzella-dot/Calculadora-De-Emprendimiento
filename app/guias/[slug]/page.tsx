import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getGuide, guides } from "@/lib/guides";

const baseUrl = "https://www.calculadoraemprendedora.com";

export function generateStaticParams() {
  return guides.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return {};
  return { title: guide.title, description: guide.description, alternates: { canonical: `/guias/${guide.slug}` }, openGraph: { title: guide.title, description: guide.description, url: `${baseUrl}/guias/${guide.slug}`, type: "article" } };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Article", headline: guide.title, description: guide.description, inLanguage: "es-AR", author: { "@type": "Organization", name: "Calculadora Emprendedora" }, publisher: { "@type": "Organization", name: "Calculadora Emprendedora", url: baseUrl }, mainEntityOfPage: `${baseUrl}/guias/${guide.slug}` },
      { "@type": "FAQPage", mainEntity: guide.faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })) },
      { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Inicio", item: baseUrl }, { "@type": "ListItem", position: 2, name: "Guías", item: `${baseUrl}/guias` }, { "@type": "ListItem", position: 3, name: guide.title, item: `${baseUrl}/guias/${guide.slug}` }] },
    ],
  };

  return <main className="min-h-screen bg-[#070907] text-white"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} /><article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-20"><nav aria-label="Migas de pan" className="text-xs font-semibold text-white/40"><Link href="/" className="hover:text-white">Inicio</Link><span className="px-2">/</span><Link href="/guias" className="hover:text-white">Guías</Link></nav><header className="mt-8"><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-200/60">{guide.eyebrow}</p><h1 className="mt-4 text-4xl font-bold leading-tight tracking-[-.035em] sm:text-5xl">{guide.title}</h1><p className="mt-6 text-lg leading-8 text-white/58">{guide.intro}</p></header><section className="mt-12 grid gap-3 sm:grid-cols-3">{guide.steps.map((step, index) => <article key={step.title} className="rounded-3xl border border-white/[0.08] bg-[#0a0d0b] p-5"><span className="text-xs font-black text-emerald-200/50">0{index + 1}</span><h2 className="mt-4 text-base font-bold text-white/90">{step.title}</h2><p className="mt-2 text-sm leading-6 text-white/45">{step.copy}</p></article>)}</section><section className="mt-8 rounded-3xl border border-emerald-300/15 bg-emerald-300/[0.045] p-6 sm:p-8"><p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-200/55">{guide.example.title}</p><p className="mt-4 text-sm leading-7 text-white/60">{guide.example.copy}</p><p className="mt-4 text-xl font-bold tracking-tight text-white">{guide.example.result}</p></section><section className="mt-8 rounded-3xl border border-white/[0.08] bg-black/30 p-6 sm:flex sm:items-center sm:justify-between sm:gap-8 sm:p-8"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-200/55">Pasá del ejemplo a tus números</p><h2 className="mt-3 text-2xl font-bold">{guide.calculator.name}</h2><p className="mt-2 max-w-xl text-sm leading-6 text-white/50">{guide.calculator.copy}</p></div><Link href={guide.calculator.href} className="app-dark-action mt-6 inline-flex shrink-0 rounded-full px-5 py-3 text-sm transition sm:mt-0">Abrir calculadora →</Link></section><section className="mt-12"><p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-200/55">Preguntas frecuentes</p><div className="mt-4 divide-y divide-white/[0.08] border-y border-white/[0.08]">{guide.faqs.map((faq) => <div key={faq.question} className="py-6"><h2 className="font-bold text-white/90">{faq.question}</h2><p className="mt-2 text-sm leading-7 text-white/50">{faq.answer}</p></div>)}</div></section><p className="mt-10 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 text-xs leading-6 text-white/40">Los resultados son estimaciones basadas en los datos ingresados y no reemplazan asesoramiento contable, impositivo o financiero profesional.</p></article></main>;
}

