import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/NavBar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://calculadoraemprendedora.com"),
  title: {
    default: "Calculadora Emprendedora",
    template: "%s | Calculadora Emprendedora",
  },
  description:
    "Calculadoras simples para emprendedores: margen, rentabilidad e interés compuesto. Gratis y fáciles de usar.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "https://calculadoraemprendedora.com",
    title: "Calculadora Emprendedora",
    description:
      "Calculadoras simples para emprendedores: margen, rentabilidad e interés compuesto. Gratis y fáciles de usar.",
    siteName: "Calculadora Emprendedora",
    locale: "es_AR",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Calculadora Emprendedora",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Calculadora Emprendedora",
    description:
      "Calculadoras simples para emprendedores: margen, rentabilidad e interés compuesto. Gratis y fáciles de usar.",
    images: ["/twitter-image.png"], // o "/opengraph-image.png" si usás una sola
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-zinc-950 text-white">
        <Navbar />
        <div className="w-full">{children}</div>
        <Footer />
      </body>
    </html>
  );
}