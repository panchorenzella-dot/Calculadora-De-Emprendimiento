import type { Metadata } from "next";
import CalculatorStructuredData from "@/components/CalculatorStructuredData";
import IvaProductoClient from "./IvaProductoClient";

export const metadata: Metadata = {
  title: "Calculadora de IVA por producto en Argentina",
  description: "Agregá IVA a un precio neto o separá el IVA incluido con alícuotas de Argentina.",
  alternates: { canonical: "/iva-producto" },
};

export default function Page() {
  return <><CalculatorStructuredData path="/iva-producto" /><IvaProductoClient /></>;
}
