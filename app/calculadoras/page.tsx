import type { Metadata } from "next";
import { Suspense } from "react";
import CalculadorasClient from "./CalculadorasClient";

export const metadata: Metadata = {
  title: { absolute: "Calculadoras online | Calculadora Emprendedora" },
  description:
    "Herramientas para calcular IVA, Ingresos Brutos, costo laboral, precios, márgenes, rentabilidad, inversiones y punto de equilibrio.",
};

export default function Page() {
  return <Suspense fallback={<div className="min-h-[70vh] bg-zinc-950" />}><CalculadorasClient /></Suspense>;
}
