import type { Metadata } from "next";
import CalculadorasClient from "./CalculadorasClient";

export const metadata: Metadata = {
  title: { absolute: "Calculadoras online | Calculadora Emprendedora" },
  description:
    "Todas las herramientas para calcular precios, márgenes, rentabilidad, inversiones, punto de equilibrio y costos por tipo de negocio.",
};

export default function Page() {
  return <CalculadorasClient />;
}
