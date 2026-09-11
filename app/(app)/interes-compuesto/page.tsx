import type { Metadata } from "next";
import CalculatorGuideLinks from "@/components/CalculatorGuideLinks";
import CalculatorStructuredData from "@/components/CalculatorStructuredData";
import InteresClient from "./InteresClient";

export const metadata: Metadata = {
  title: "Calculadora de interés compuesto con aportes mensuales",
  description:
    "Calculá cuánto puede crecer tu capital con interés compuesto, monto inicial, aportes mensuales, tasa y plazo. Gratis y con detalle anual.",
  alternates: { canonical: "/interes-compuesto" },
};

export default function Page() {
  return <><CalculatorStructuredData path="/interes-compuesto" /><InteresClient /><CalculatorGuideLinks path="/interes-compuesto" /></>;
}
