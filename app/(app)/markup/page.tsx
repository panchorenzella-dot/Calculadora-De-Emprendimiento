import type { Metadata } from "next";
import CalculatorGuideLinks from "@/components/CalculatorGuideLinks";
import MarkupClient from "./MarkupClient";

const baseUrl = "https://www.calculadoraemprendedora.com";
const pageTitle = "Calculadora de precio de venta: cuánto cobrar";
const pageDescription =
  "Calculá cuánto cobrar por un producto o servicio según costo, margen, comisiones, impuestos y gastos fijos. Gratis y sin registro.";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: { canonical: "/markup" },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: "/markup",
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
        "@id": `${baseUrl}/markup#calculator`,
        name: pageTitle,
        description: pageDescription,
        url: `${baseUrl}/markup`,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Any",
        browserRequirements: "Requiere JavaScript",
        inLanguage: "es-AR",
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "ARS" },
        featureList: [
          "Calcular precio de venta desde el costo",
          "Comparar margen y markup",
          "Incluir costos fijos y costos unitarios",
          "Incluir comisiones e impuestos porcentuales",
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
            name: "Precio de venta",
            item: `${baseUrl}/markup`,
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
      <MarkupClient />
      <CalculatorGuideLinks path="/markup" />
    </>
  );
}
