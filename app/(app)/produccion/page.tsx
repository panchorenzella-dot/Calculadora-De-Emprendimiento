import type { Metadata } from "next";
import CalculatorStructuredData from "@/components/CalculatorStructuredData";
import ProduccionClient from "./ProduccionClient";

export const metadata: Metadata = {
  title: "Calculadora de Producción",
  description:
    "Calculá el costo por unidad, la ganancia, el margen y el punto de equilibrio de un negocio de producción.",
  alternates: { canonical: "/produccion" },
};

export default function Page() {
  return <><CalculatorStructuredData path="/produccion" /><ProduccionClient /></>;
}
