import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/NavBar";
import Footer from "@/components/Footer";
import AnalyticsPageView from "@/components/AnalyticsPageView";
import { siteConfig } from "@/lib/site";

const baseUrl = "https://www.calculadoraemprendedora.com";
const siteDescription =
  "Calculadoras online para emprendedores: margen de ganancia, precio de venta, punto de equilibrio, costos, rentabilidad, inversión y ahorro.";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "optional",
});

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),

  applicationName: "Calculadora Emprendedora",

  title: {
    default: "Calculadora Emprendedora",
    template: "%s | Calculadora Emprendedora",
  },

  description: siteDescription,
  authors: [{ name: "Calculadora Emprendedora", url: baseUrl }],
  creator: "Calculadora Emprendedora",
  publisher: "Calculadora Emprendedora",
  category: "business",
  keywords: [
    "calculadoras para emprendedores",
    "precio de venta",
    "margen de ganancia",
    "punto de equilibrio",
    "rentabilidad",
    "calculadoras financieras",
  ],
  robots: { index: true, follow: true },

  openGraph: {
    title: "Calculadora Emprendedora",
    description:
      "Herramientas simples para calcular costos, márgenes, precios, rentabilidad, inversión y ahorro.",
    url: baseUrl,
    siteName: "Calculadora Emprendedora",
    locale: "es_AR",
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
    title: "Calculadora Emprendedora",
    description:
      "Calculadoras online para emprendedores, negocios, inversión y ahorro.",
    images: ["/opengraph-image"],
  },
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#09090b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${baseUrl}/#organization`,
        name: "Calculadora Emprendedora",
        url: baseUrl,
        logo: {
          "@type": "ImageObject",
          url: `${baseUrl}/icon.png`,
        },
        contactPoint: {
          "@type": "ContactPoint",
          email: siteConfig.contactEmail,
          contactType: "customer support",
          availableLanguage: "Spanish",
        },
      },
      {
        "@type": "WebSite",
        "@id": `${baseUrl}/#website`,
        url: baseUrl,
        name: "Calculadora Emprendedora",
        description: siteDescription,
        inLanguage: "es-AR",
        publisher: { "@id": `${baseUrl}/#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${baseUrl}/calculadoras?buscar={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <html lang="es-AR">
      <body
        className={`${geistSans.variable} antialiased bg-zinc-950 text-white`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <div className="flex-1">{children}</div>
          <Footer />
        </div>
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-M4WE874ZS2', { send_page_view: false });
          `}
        </Script>
        <AnalyticsPageView />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-M4WE874ZS2"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
