import type { Metadata } from "next";
import CalculatorGuideLinks from "@/components/CalculatorGuideLinks";
import CalculatorStructuredData from "@/components/CalculatorStructuredData";
import RoiInversionClient from "./RoiInversionClient";

export const metadata: Metadata = {
  title: "Calculadora de ROI de una inversión",
  description:
    "Calculá ROI, ganancia o pérdida y retorno anualizado de una inversión comparando capital inicial, valor final y plazo.",
  alternates: { canonical: "/roi-inversion" },
};

export default function Page() {
  return <><CalculatorStructuredData path="/roi-inversion" /><RoiInversionClient /><CalculatorGuideLinks path="/roi-inversion" /></>;
}
