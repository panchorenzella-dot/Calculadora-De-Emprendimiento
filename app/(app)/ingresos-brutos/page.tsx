import type { Metadata } from "next";
import CalculatorGuideLinks from "@/components/CalculatorGuideLinks";
import CalculatorStructuredData from "@/components/CalculatorStructuredData";
import IngresosBrutosClient from "./IngresosBrutosClient";

export const metadata: Metadata = {
  title: "Calculadora de Ingresos Brutos Argentina",
  description: "Estimá Ingresos Brutos a pagar por jurisdicción, facturación, alícuota, retenciones y percepciones.",
  alternates: { canonical: "/ingresos-brutos" },
};

export default function Page() {
  return <><CalculatorStructuredData path="/ingresos-brutos" /><IngresosBrutosClient /><CalculatorGuideLinks path="/ingresos-brutos" /></>;
}
