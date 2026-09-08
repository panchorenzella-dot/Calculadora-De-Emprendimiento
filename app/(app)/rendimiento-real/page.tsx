import type { Metadata } from "next";
import CalculatorStructuredData from "@/components/CalculatorStructuredData";
import RendimientoRealClient from "./RendimientoRealClient";

export const metadata: Metadata = {
  title: "Calculadora de Rendimiento Real",
  description:
    "Calculá el rendimiento real de una inversión considerando la inflación.",
  alternates: { canonical: "/rendimiento-real" },
};

export default function Page() {
  return <><CalculatorStructuredData path="/rendimiento-real" /><RendimientoRealClient /></>;
}
