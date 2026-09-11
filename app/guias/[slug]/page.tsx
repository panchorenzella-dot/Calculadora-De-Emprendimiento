import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getGuide, getRelatedGuides, guides } from "@/lib/guides";

const baseUrl = "https://www.calculadoraemprendedora.com";

// Every guide slug is generated at build time from the local guide catalog.
export const revalidate = false;

export function generateStaticParams() {
  return guides.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return {};

  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: `/guias/${guide.slug}` },
    openGraph: {
      title: guide.title,
      description: guide.description,
      url: `${baseUrl}/guias/${guide.slug}`,
      type: "article",
    },
  };
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  const guideUrl = `${baseUrl}/guias/${guide.slug}`;
  const relatedGuides = getRelatedGuides(guide);
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: guide.title,
        description: guide.description,
        inLanguage: "es-AR",
        isAccessibleForFree: true,
        author: { "@type": "Organization", name: "Calculadora Emprendedora" },
        publisher: {
          "@type": "Organization",
          name: "Calculadora Emprendedora",
          url: baseUrl,
        },
        mainEntityOfPage: guideUrl,
      },
      {
        "@type": "HowTo",
        name: guide.title,
        description: guide.description,
        inLanguage: "es-AR",
        step: guide.steps.map((step, index) => ({
          "@type": "HowToStep",
          position: index + 1,
          name: step.title,
          text: step.copy,
          url: `${guideUrl}#paso-${index + 1}`,
        })),
      },
      {
        "@type": "FAQPage",
        mainEntity: guide.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: baseUrl },
          {
            "@type": "ListItem",
            position: 2,
            name: "Guías",
            item: `${baseUrl}/guias`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: guide.title,
            item: guideUrl,
          },
        ],
      },
    ],
  };

  return (
    <main className="min-h-screen bg-[#070907] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-20">
        <nav aria-label="Migas de pan" className="text-xs font-semibold text-white/65">
          <Link href="/" className="hover:text-white">
            Inicio
          </Link>
          <span aria-hidden="true" className="px-2">/</span>
          <Link href="/guias" className="hover:text-white">
            Guías
          </Link>
        </nav>

        <header className="mt-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-200/75">
            {guide.eyebrow}
          </p>
          <h1 className="mt-4 text-4xl font-bold leading-tight tracking-[-.035em] sm:text-5xl">
            {guide.title}
          </h1>
          <p className="mt-6 text-lg leading-8 text-white/70">{guide.intro}</p>
        </header>

        <section aria-label="Pasos del cálculo" className="mt-12 grid gap-3 sm:grid-cols-2">
          {guide.steps.map((step, index) => (
            <article
              id={`paso-${index + 1}`}
              key={step.title}
              className="rounded-3xl border border-white/[0.08] bg-[#0a0d0b] p-5"
            >
              <span className="text-xs font-black text-emerald-200/75">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h2 className="mt-4 text-base font-bold text-white/95">{step.title}</h2>
              <p className="mt-2 text-sm leading-6 text-white/65">{step.copy}</p>
            </article>
          ))}
        </section>

        {guide.formula ? (
          <section className="mt-8 rounded-3xl border border-white/[0.09] bg-white/[0.035] p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-200/75">
              Fórmula principal
            </p>
            <h2 className="mt-4 text-xl font-bold leading-8 text-white sm:text-2xl">
              {guide.formula.expression}
            </h2>
            <p className="mt-3 text-sm leading-7 text-white/65">
              {guide.formula.explanation}
            </p>
          </section>
        ) : null}

        <section className="mt-8 rounded-3xl border border-emerald-300/15 bg-emerald-300/[0.045] p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-200/75">
            {guide.example.title}
          </p>
          <p className="mt-4 text-sm leading-7 text-white/70">{guide.example.copy}</p>
          <p className="mt-4 text-xl font-bold tracking-tight text-white">
            {guide.example.result}
          </p>
        </section>

        {guide.pitfalls?.length ? (
          <section className="mt-10" aria-labelledby="guide-mistakes-title">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-200/75">
              Antes de decidir
            </p>
            <h2 id="guide-mistakes-title" className="mt-3 text-2xl font-bold">
              Errores comunes que cambian el resultado
            </h2>
            <ul className="mt-5 grid gap-3">
              {guide.pitfalls.map((pitfall) => (
                <li
                  key={pitfall}
                  className="flex gap-3 rounded-2xl border border-white/[0.08] bg-[#0a0d0b] p-4 text-sm leading-6 text-white/70"
                >
                  <span aria-hidden="true" className="font-black text-emerald-200">✓</span>
                  <span>{pitfall}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="mt-10 rounded-3xl border border-white/[0.08] bg-black/30 p-6 sm:flex sm:items-center sm:justify-between sm:gap-8 sm:p-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-200/75">
              Pasá del ejemplo a tus números
            </p>
            <h2 className="mt-3 text-2xl font-bold">{guide.calculator.name}</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-white/65">
              {guide.calculator.copy}
            </p>
          </div>
          <Link
            href={guide.calculator.href}
            className="app-dark-action mt-6 inline-flex shrink-0 rounded-full px-5 py-3 text-sm transition sm:mt-0"
          >
            Abrir calculadora →
          </Link>
        </section>

        <section className="mt-12" aria-labelledby="guide-faq-title">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-200/75">
            Preguntas frecuentes
          </p>
          <h2 id="guide-faq-title" className="sr-only">Preguntas frecuentes</h2>
          <div className="mt-4 divide-y divide-white/[0.08] border-y border-white/[0.08]">
            {guide.faqs.map((faq) => (
              <div key={faq.question} className="py-6">
                <h3 className="font-bold text-white/95">{faq.question}</h3>
                <p className="mt-2 text-sm leading-7 text-white/65">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {guide.sources?.length ? (
          <section className="mt-10" aria-labelledby="guide-sources-title">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-200/75">
              Fuentes oficiales para verificar
            </p>
            <h2 id="guide-sources-title" className="sr-only">Fuentes oficiales</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {guide.sources.map((source) => (
                <a
                  key={source.href}
                  href={source.href}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-2xl border border-white/[0.08] bg-[#0a0d0b] p-4 transition hover:border-emerald-300/25"
                >
                  <span className="text-sm font-bold text-emerald-100">
                    {source.name} ↗
                  </span>
                  <span className="mt-2 block text-xs leading-5 text-white/65">
                    {source.copy}
                  </span>
                </a>
              ))}
            </div>
          </section>
        ) : null}

        {relatedGuides.length ? (
          <section className="mt-12" aria-labelledby="related-guides-title">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-200/75">
              Seguí aprendiendo
            </p>
            <h2 id="related-guides-title" className="mt-3 text-2xl font-bold">
              Guías relacionadas
            </h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {relatedGuides.map((relatedGuide) => (
                <Link
                  key={relatedGuide.slug}
                  href={`/guias/${relatedGuide.slug}`}
                  className="rounded-2xl border border-white/[0.08] bg-[#0a0d0b] p-4 transition hover:border-emerald-300/25"
                >
                  <span className="text-sm font-bold leading-6 text-white/90">
                    {relatedGuide.title}
                  </span>
                  <span className="mt-3 block text-xs font-bold text-emerald-100">
                    Leer guía →
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <p className="mt-10 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 text-xs leading-6 text-white/65">
          Los resultados son estimaciones basadas en los datos ingresados y no reemplazan
          asesoramiento contable, impositivo, laboral o financiero profesional.
        </p>
      </article>
    </main>
  );
}
