import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://calculadoraemprendedora.com"),
  title: {
    default: "Calculadora de Margen de Ganancia | Calculadora Emprendedora",
    template: "%s | Calculadora Emprendedora",
  },
  description:
    "Calculadora de margen de ganancia para emprendedores. Calculá precio, ganancia mensual, punto de equilibrio y recupero de inversión de forma simple.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Calculadora de Margen de Ganancia | Calculadora Emprendedora",
    description:
      "Calculá margen, ganancia mensual, punto de equilibrio y recupero de inversión para tu negocio.",
    url: "https://calculadoraemprendedora.com",
    siteName: "Calculadora Emprendedora",
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Calculadora de Margen de Ganancia | Calculadora Emprendedora",
    description:
      "Calculá margen, ganancia mensual, punto de equilibrio y recupero de inversión para tu negocio.",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}