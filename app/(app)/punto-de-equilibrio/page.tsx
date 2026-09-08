import type { Metadata } from "next";
import CalculatorStructuredData from "@/components/CalculatorStructuredData";
import PuntoequilibrioClient from "./PuntoequilibrioClient";

export const metadata: Metadata = {
  title: "Calculadora de Punto de Equilibrio",
  description:
    "Calculá el punto de equilibrio de un negocio.",
  alternates: { canonical: "/punto-de-equilibrio" },
};

export default function Page() {
  return <><CalculatorStructuredData path="/punto-de-equilibrio" /><PuntoequilibrioClient /></>;
}
