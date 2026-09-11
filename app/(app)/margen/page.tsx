import type { Metadata } from "next";
import CalculatorGuideLinks from "@/components/CalculatorGuideLinks";
import CalculatorStructuredData from "@/components/CalculatorStructuredData";
import MargenClient from "./MargenClient";

export const metadata: Metadata = {
  title: "Calculadora de margen de ganancia y rentabilidad",
  description:
    "Calculá margen, ganancia neta, precio de venta, punto de equilibrio y ROI de tu negocio con costos fijos y variables.",
  alternates: { canonical: "/margen" },
};

export default function Page() {
  return <><CalculatorStructuredData path="/margen" /><MargenClient /><CalculatorGuideLinks path="/margen" /></>;
}
