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
  },
  twitter: {
    card: "summary_large_image",
    title: "Calculadora Emprendedora",
    description:
      "Calculadoras simples para emprendedores: margen, rentabilidad e interés compuesto. Gratis y fáciles de usar.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-zinc-950 text-white">
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}