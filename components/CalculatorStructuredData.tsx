import type { Metadata } from "next";

import { calculatorSections } from "@/app/calculadoras/catalog";

const baseUrl = "https://www.calculadoraemprendedora.com";

const categoryBySection: Record<string, string> = {
  business: "BusinessApplication",
  investment: "FinanceApplication",
  taxes: "BusinessApplication",
  industries: "BusinessApplication",
};

export function calculatorMetadata({
  path,
  title,
  description,
}: {
  path: string;
  title: string;
  description: string;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
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
      title,
      description,
      images: ["/opengraph-image"],
    },
  };
}

export default function CalculatorStructuredData({ path }: { path: string }) {
  const section = calculatorSections.find((item) =>
    item.calculators.some(
      (calculator) => !calculator.comingSoon && calculator.href === path,
    ),
  );
  const calculator = section?.calculators.find(
    (item) => !item.comingSoon && item.href === path,
  );

  if (!section || !calculator) return null;

  const pageUrl = `${baseUrl}${path}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "@id": `${pageUrl}#calculator`,
        name: calculator.title,
        description: calculator.description,
        url: pageUrl,
        applicationCategory: categoryBySection[section.id],
        applicationSubCategory: section.title,
        operatingSystem: "Any",
        browserRequirements: "Requiere un navegador web con JavaScript",
        inLanguage: "es-AR",
        isAccessibleForFree: true,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "ARS",
        },
        publisher: { "@id": `${baseUrl}/#organization` },
        isPartOf: { "@id": `${baseUrl}/#website` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Inicio",
            item: baseUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Calculadoras",
            item: `${baseUrl}/calculadoras`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: calculator.title,
            item: pageUrl,
          },
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
      }}
    />
  );
}

