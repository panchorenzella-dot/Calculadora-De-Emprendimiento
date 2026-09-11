import type { Metadata } from "next";
import CalculatorGuideLinks from "@/components/CalculatorGuideLinks";
import CalculatorStructuredData from "@/components/CalculatorStructuredData";
import PuntoequilibrioClient from "./PuntoequilibrioClient";

export const metadata: Metadata = {
  title: "Calculadora de punto de equilibrio: unidades y ventas",
  description:
    "Calculá cuántas unidades y cuánto necesitás vender para cubrir costos fijos y variables sin perder dinero.",
  alternates: { canonical: "/punto-de-equilibrio" },
};

export default function Page() {
  return <><CalculatorStructuredData path="/punto-de-equilibrio" /><PuntoequilibrioClient /><CalculatorGuideLinks path="/punto-de-equilibrio" /></>;
}
