import type { Metadata } from "next";
import CalculatorGuideLinks from "@/components/CalculatorGuideLinks";
import CalculatorStructuredData from "@/components/CalculatorStructuredData";
import RendimientoRealClient from "./RendimientoRealClient";

export const metadata: Metadata = {
  title: "Calculadora de rendimiento real descontando inflación",
  description:
    "Calculá si una inversión ganó o perdió poder de compra comparando rendimiento nominal e inflación del mismo período.",
  alternates: { canonical: "/rendimiento-real" },
};

export default function Page() {
  return <><CalculatorStructuredData path="/rendimiento-real" /><RendimientoRealClient /><CalculatorGuideLinks path="/rendimiento-real" /></>;
}
