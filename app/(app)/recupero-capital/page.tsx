import type { Metadata } from "next";
import CalculatorGuideLinks from "@/components/CalculatorGuideLinks";
import CalculatorStructuredData from "@/components/CalculatorStructuredData";
import RecuperoCapitalClient from "./RecuperoCapitalClient";

export const metadata: Metadata = {
  title: "Calculadora de recupero de inversión en meses",
  description:
    "Calculá cuántos meses tarda una inversión o proyecto en recuperar el capital inicial según su flujo neto.",
  alternates: { canonical: "/recupero-capital" },
};

export default function Page() {
  return <><CalculatorStructuredData path="/recupero-capital" /><RecuperoCapitalClient /><CalculatorGuideLinks path="/recupero-capital" /></>;
}
