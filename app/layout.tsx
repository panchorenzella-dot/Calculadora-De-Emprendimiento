import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/NavBar";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.calculadoraemprendedora.com"),

  title: {
    default: "Calculadora Emprendedora",
    template: "%s | Calculadora Emprendedora",
  },

  description:
    "Calculadoras online para emprendedores: margen de ganancia, precio de venta, punto de equilibrio, costos, rentabilidad, inversión y ahorro.",

  openGraph: {
    title: "Calculadora Emprendedora",
    description:
      "Herramientas simples para calcular costos, márgenes, precios, rentabilidad, inversión y ahorro.",
    url: "https://www.calculadoraemprendedora.com",
    siteName: "Calculadora Emprendedora",
    locale: "es_AR",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Calculadora Emprendedora",
    description:
      "Calculadoras online para emprendedores, negocios, inversión y ahorro.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-950 text-white`}
      >
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}