import type { Metadata } from "next";
import CalculatorStructuredData from "@/components/CalculatorStructuredData";
import MargenClient from "./MargenClient";

export const metadata: Metadata = {
  title: "Calculadora de Margen",
  description:
    "Calculá tu margen de ganancia, precio de venta y punto de equilibrio.",
  alternates: { canonical: "/margen" },
};

export default function Page() {
  return <><CalculatorStructuredData path="/margen" /><MargenClient /></>;
}
