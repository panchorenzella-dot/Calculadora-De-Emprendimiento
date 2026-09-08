import type { Metadata } from "next";
import CalculatorStructuredData from "@/components/CalculatorStructuredData";
import RoiClient from "./RoiClient";

export const metadata: Metadata = {
  title: "Calculadora de ROI",
  description:
    "Calculá el retorno de la inversión (ROI) de un proyecto.",
  alternates: { canonical: "/roi" },
};

export default function Page() {
  return <><CalculatorStructuredData path="/roi" /><RoiClient /></>;
}
