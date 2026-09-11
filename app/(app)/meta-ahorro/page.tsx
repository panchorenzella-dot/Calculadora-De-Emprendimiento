import type { Metadata } from "next";
import CalculatorGuideLinks from "@/components/CalculatorGuideLinks";
import CalculatorStructuredData from "@/components/CalculatorStructuredData";
import MetaAhorroClient from "./MetaAhorroClient";

export const metadata: Metadata = {
  title: "Cuánto ahorrar por mes: calculadora de meta de ahorro",
  description:
    "Calculá cuánto necesitás ahorrar por mes según tu objetivo, capital actual, rendimiento esperado y plazo.",
  alternates: { canonical: "/meta-ahorro" },
};

export default function Page() {
  return <><CalculatorStructuredData path="/meta-ahorro" /><MetaAhorroClient /><CalculatorGuideLinks path="/meta-ahorro" /></>;
}
