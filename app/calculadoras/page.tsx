import type { Metadata } from "next";
import { Suspense } from "react";
import CalculadorasClient from "./CalculadorasClient";
import { availableCalculators } from "./catalog";

const baseUrl = "https://www.calculadoraemprendedora.com";
const pageTitle = "Calculadoras para emprendedores";
const pageDescription =
  "Calculá precios, margen, punto de equilibrio, inversiones e impuestos con herramientas gratuitas para emprendedores y negocios de Argentina.";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: { canonical: "/calculadoras" },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: "/calculadoras",
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
    title: pageTitle,
    description: pageDescription,
    images: ["/opengraph-image"],
  },
};

export default function Page() {
  const itemListId = `${baseUrl}/calculadoras#calculator-list`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${baseUrl}/calculadoras#webpage`,
        url: `${baseUrl}/calculadoras`,
        name: pageTitle,
        description: pageDescription,
        inLanguage: "es-AR",
        mainEntity: { "@id": itemListId },
        isPartOf: { "@id": `${baseUrl}/#website` },
      },
      {
        "@type": "ItemList",
        "@id": itemListId,
        name: "Calculadoras disponibles",
        numberOfItems: availableCalculators.length,
        itemListOrder: "https://schema.org/ItemListOrderAscending",
        itemListElement: availableCalculators.map((calculator, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "WebApplication",
            name: calculator.title,
            description: calculator.description,
            url: `${baseUrl}${calculator.href}`,
            applicationCategory: "BusinessApplication",
            operatingSystem: "Any",
            offers: { "@type": "Offer", price: "0", priceCurrency: "ARS" },
          },
        })),
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
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Suspense fallback={<div className="min-h-[70vh] bg-zinc-950" />}>
        <CalculadorasClient />
      </Suspense>
    </>
  );
}
