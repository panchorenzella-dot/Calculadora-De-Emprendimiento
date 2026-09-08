import type { Metadata } from "next";
import CalculatorStructuredData from "@/components/CalculatorStructuredData";
import ReventaClient from "./ReventaClient";

export const metadata: Metadata = {
  title: "Calculadora de Reventa",
  description:
    "Calculá el rendimiento de una inversión en reventa.",
  alternates: { canonical: "/reventa" },
};

export default function Page() {
  return <><CalculatorStructuredData path="/reventa" /><ReventaClient /></>;
}
