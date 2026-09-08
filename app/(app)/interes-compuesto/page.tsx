import type { Metadata } from "next";
import CalculatorStructuredData from "@/components/CalculatorStructuredData";
import InteresClient from "./InteresClient";

export const metadata: Metadata = {
  title: "Calculadora de Interés Compuesto",
  description:
    "Proyectá el crecimiento de tu plata con aportes mensuales e interés compuesto.",
  alternates: { canonical: "/interes-compuesto" },
};

export default function Page() {
  return <><CalculatorStructuredData path="/interes-compuesto" /><InteresClient /></>;
}
