import type { Metadata } from "next";
import CalculatorGuideLinks from "@/components/CalculatorGuideLinks";
import CalculatorStructuredData from "@/components/CalculatorStructuredData";
import IvaMensualClient from "./IvaMensualClient";

export const metadata: Metadata = {
  title: "Calculadora de IVA mensual a pagar en Argentina",
  description: "Calculá el IVA mensual estimado a pagar con débito fiscal, crédito fiscal, retenciones, percepciones y saldos a favor.",
  alternates: { canonical: "/iva-mensual" },
};

export default function Page() {
  return <><CalculatorStructuredData path="/iva-mensual" /><IvaMensualClient /><CalculatorGuideLinks path="/iva-mensual" /></>;
}
