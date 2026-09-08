import type { Metadata } from "next";
import CalculatorStructuredData from "@/components/CalculatorStructuredData";
import RecuperoCapitalClient from "./RecuperoCapitalClient";

export const metadata: Metadata = {
  title: "Calculadora de Recupero de Capital",
  description:
    "Calculá el tiempo que tarda un proyecto en recuperar su inversión inicial.",
  alternates: { canonical: "/recupero-capital" },
};

export default function Page() {
  return <><CalculatorStructuredData path="/recupero-capital" /><RecuperoCapitalClient /></>;
}
