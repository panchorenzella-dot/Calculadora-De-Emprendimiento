import type { Metadata } from "next";
import CalculatorStructuredData from "@/components/CalculatorStructuredData";
import MetaAhorroClient from "./MetaAhorroClient";

export const metadata: Metadata = {
  title: "Calculadora de Meta de Ahorro",
  description:
    "Calculá cuánto necesitás ahorrar por mes.",
  alternates: { canonical: "/meta-ahorro" },
};

export default function Page() {
  return <><CalculatorStructuredData path="/meta-ahorro" /><MetaAhorroClient /></>;
}
