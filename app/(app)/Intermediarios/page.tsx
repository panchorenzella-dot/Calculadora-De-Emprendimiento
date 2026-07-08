import type { Metadata } from "next";
import IntermediariosClient from "./IntermediariosClient";

export const metadata: Metadata = {
  title: "Calculadora de Intermediarios",
  description:
    "Calculá cuánto ganás por comisión, tu ganancia mensual estimada, punto de equilibrio, recupero del capital y ROI.",
};

export default function Page() {
  return <IntermediariosClient />;
}