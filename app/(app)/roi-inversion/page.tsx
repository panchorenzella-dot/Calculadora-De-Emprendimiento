import type { Metadata } from "next";
import CalculatorStructuredData from "@/components/CalculatorStructuredData";
import RoiInversionClient from "./RoiInversionClient";

export const metadata: Metadata = {
  title: "Calculadora de ROI de Inversión",
  description:
    "Calculá el retorno de la inversión (ROI) de un proyecto.",
  alternates: { canonical: "/roi-inversion" },
};

export default function Page() {
  return <><CalculatorStructuredData path="/roi-inversion" /><RoiInversionClient /></>;
}
