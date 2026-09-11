import type { Metadata } from "next";
import CalculatorGuideLinks from "@/components/CalculatorGuideLinks";
import CalculatorStructuredData from "@/components/CalculatorStructuredData";
import HamburgueseriaClient from "./HamburgueseriaClient";

export const metadata: Metadata = {
  title: "Calculadora de costos para hamburguesería: precio y margen",
  description:
    "Calculá el costo por hamburguesa, precio recomendado, margen, ganancia mensual y punto de equilibrio. Gratis y con ejemplo editable.",
  alternates: { canonical: "/hamburgueseria" },
};

export default function Page() {
  return <><CalculatorStructuredData path="/hamburgueseria" /><HamburgueseriaClient /><CalculatorGuideLinks path="/hamburgueseria" /></>;
}
