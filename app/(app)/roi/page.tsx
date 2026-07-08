import type { Metadata } from "next";
import RoiClient from "./RoiClient";

export const metadata: Metadata = {
  title: "Calculadora de ROI",
  description:
    "Calculá el retorno de la inversión (ROI) de un proyecto.",
};

export default function Page() {
  return <RoiClient />;
}