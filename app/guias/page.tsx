import type { Metadata } from "next";
import Link from "next/link";

import { guideTopics, guides, getGuidesByTopic } from "@/lib/guides";

const baseUrl = "https://www.calculadoraemprendedora.com";
const pageTitle = `${guides.length} guías de precios, costos, impuestos e inversión`;
const pageDescription =
  "Guías prácticas para emprendedores con fórmulas, ejemplos y calculadoras sobre precios, margen, IVA, costos, rentabilidad, inversión y ahorro.";

// Guides come from local source data and are immutable between deployments.
export const revalidate = false;

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: { canonical: "/guias" },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: "/guias",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Guías de Calculadora Emprendedora",
      },
    ],
  },
};

export default function GuidesPage() {
  const itemListId = `${baseUrl}/guias#guide-list`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${baseUrl}/guias#webpage`,
        url: `${baseUrl}/guias`,
        name: pageTitle,
        description: pageDescription,
        inLanguage: "es-AR",
        mainEntity: { "@id": itemListId },
        isPartOf: { "@id": `${baseUrl}/#website` },
      },
      {
        "@type": "ItemList",
        "@id": itemListId,
        name: "Guías para emprendedores",
        numberOfItems: guides.length,
        itemListElement: guides.map((guide, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "Article",
            headline: guide.title,
            description: guide.description,
            url: `${baseUrl}/guias/${guide.slug}`,
          },
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
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <header className="max-w-4xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-200/75">
            Centro de aprendizaje · {guides.length} guías gratuitas
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Guías para manejar los números de tu negocio
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-white/70">
            Aprendé a calcular precios, rentabilidad, impuestos, costos por rubro,
            inversión y ahorro. Cada guía incluye fórmula, ejemplo, errores comunes y
            acceso directo a una calculadora gratuita.
          </p>
        </header>

        <nav aria-label="Temas de las guías" className="mt-8 flex flex-wrap gap-2">
          {guideTopics.map((topic) => (
            <a
              key={topic.id}
              href={`#${topic.id}`}
              className="rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-sm font-bold text-white/75 transition hover:border-emerald-300/25 hover:text-white"
            >
              {topic.title}
            </a>
          ))}
        </nav>

        <div className="mt-14 space-y-16">
          {guideTopics.map((topic) => {
            const topicGuides = getGuidesByTopic(topic.id);

            return (
              <section key={topic.id} id={topic.id} aria-labelledby={`${topic.id}-title`} className="scroll-mt-8">
                <div className="max-w-3xl">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-200/75">
                    {topicGuides.length} guías
                  </p>
                  <h2 id={`${topic.id}-title`} className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                    {topic.title}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-white/65">{topic.description}</p>
                </div>

                <div className="mt-7 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {topicGuides.map((guide) => (
                    <Link
                      key={guide.slug}
                      href={`/guias/${guide.slug}`}
                      className="group flex min-h-64 flex-col rounded-3xl border border-white/[0.08] bg-[#0a0d0b] p-6 transition hover:-translate-y-0.5 hover:border-emerald-300/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                    >
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-200/75">
                        {guide.eyebrow}
                      </p>
                      <h3 className="mt-4 text-xl font-bold tracking-tight text-white/95">
                        {guide.title}
                      </h3>
                      <p className="mt-3 text-sm leading-6 text-white/65">
                        {guide.description}
                      </p>
                      <span className="mt-auto pt-6 text-sm font-bold text-white/75 group-hover:text-white">
                        Ver fórmula y ejemplo →
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </main>
  );
}
