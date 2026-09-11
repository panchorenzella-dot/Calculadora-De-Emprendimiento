import type { Metadata } from "next";
import CalculatorGuideLinks from "@/components/CalculatorGuideLinks";
import CalculatorStructuredData from "@/components/CalculatorStructuredData";
import ReventaClient from "./ReventaClient";

export const metadata: Metadata = {
  title: "Calculadora de reventa: precio, margen y ganancia",
  description:
    "Calculá costo de compra, gastos por venta, margen, ganancia mensual, punto de equilibrio y recupero de capital en reventa.",
  alternates: { canonical: "/reventa" },
};

export default function Page() {
  return <><CalculatorStructuredData path="/reventa" /><ReventaClient /><CalculatorGuideLinks path="/reventa" /></>;
}
