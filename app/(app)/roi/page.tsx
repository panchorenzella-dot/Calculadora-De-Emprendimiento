import type { Metadata } from "next";
import CalculatorGuideLinks from "@/components/CalculatorGuideLinks";
import CalculatorStructuredData from "@/components/CalculatorStructuredData";
import RoiClient from "./RoiClient";

export const metadata: Metadata = {
  title: "Calculadora de ROI para negocios y proyectos",
  description:
    "Calculá el retorno porcentual, la ganancia y el recupero de una inversión dentro de tu negocio o proyecto.",
  alternates: { canonical: "/roi" },
};

export default function Page() {
  return <><CalculatorStructuredData path="/roi" /><RoiClient /><CalculatorGuideLinks path="/roi" /></>;
}
