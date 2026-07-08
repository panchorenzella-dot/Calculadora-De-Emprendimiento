import type { Metadata } from "next";
import RoiInversionClient from "./RoiInversionClient";

export const metadata: Metadata = {
  title: "Calculadora de ROI de Inversión",
  description:
    "Calculá el retorno de la inversión (ROI) de un proyecto.",
};

export default function Page() {
  return <RoiInversionClient />;
}