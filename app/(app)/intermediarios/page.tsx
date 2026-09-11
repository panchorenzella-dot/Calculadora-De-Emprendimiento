import type { Metadata } from "next";
import CalculatorGuideLinks from "@/components/CalculatorGuideLinks";
import IntermediariosClient from "./IntermediariosClient";

const baseUrl = "https://www.calculadoraemprendedora.com";
const pageTitle = "Calculadora de comisiones para intermediarios";
const pageDescription =
  "Calculá comisiones por operación, ganancia mensual, punto de equilibrio, recupero de capital y ROI para intermediarios y vendedores.";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: { canonical: "/intermediarios" },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: "/intermediarios",
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
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": `${baseUrl}/intermediarios#calculator`,
        name: pageTitle,
        description: pageDescription,
        url: `${baseUrl}/intermediarios`,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Any",
        inLanguage: "es-AR",
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "ARS" },
        featureList: [
          "Comisión neta por operación",
          "Ganancia mensual estimada",
          "Punto de equilibrio",
          "Recupero de capital y ROI",
        ],
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
            name: "Intermediarios y comisiones",
            item: `${baseUrl}/intermediarios`,
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
      <IntermediariosClient />
      <CalculatorGuideLinks path="/intermediarios" />
    </>
  );
}
