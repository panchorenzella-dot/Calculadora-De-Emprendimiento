import type { Metadata } from "next";
import CalculatorGuideLinks from "@/components/CalculatorGuideLinks";
import CalculatorStructuredData from "@/components/CalculatorStructuredData";
import ProduccionClient from "./ProduccionClient";

export const metadata: Metadata = {
  title: "Calculadora de costos de producción y precio de venta",
  description:
    "Calculá costo unitario, precio, margen, ganancia mensual y punto de equilibrio para productos fabricados.",
  alternates: { canonical: "/produccion" },
};

export default function Page() {
  return <><CalculatorStructuredData path="/produccion" /><ProduccionClient /><CalculatorGuideLinks path="/produccion" /></>;
}
