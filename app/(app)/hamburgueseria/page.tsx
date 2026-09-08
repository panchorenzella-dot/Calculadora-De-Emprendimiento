import type { Metadata } from "next";
import CalculatorStructuredData from "@/components/CalculatorStructuredData";
import HamburgueseriaClient from "./HamburgueseriaClient";

export const metadata: Metadata = {
  title: "Calculadora para hamburguesería",
  description:
    "Calculá costos, precio de venta, margen, ganancia mensual y punto de equilibrio de una hamburguesería.",
  alternates: { canonical: "/hamburgueseria" },
};

export default function Page() {
  return <><CalculatorStructuredData path="/hamburgueseria" /><HamburgueseriaClient /></>;
}
