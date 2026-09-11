import type { Metadata } from "next";
import CalculatorGuideLinks from "@/components/CalculatorGuideLinks";
import CalculatorStructuredData from "@/components/CalculatorStructuredData";
import IvaProductoClient from "./IvaProductoClient";

export const metadata: Metadata = {
  title: "Calculadora de IVA: agregar o sacar IVA de un precio",
  description: "Agregá IVA a un valor neto o separá neto e impuesto desde un precio final. Calculadora gratis con alícuotas de Argentina.",
  alternates: { canonical: "/iva-producto" },
};

export default function Page() {
  return <><CalculatorStructuredData path="/iva-producto" /><IvaProductoClient /><CalculatorGuideLinks path="/iva-producto" /></>;
}
