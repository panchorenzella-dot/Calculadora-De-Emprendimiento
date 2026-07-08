import type { Metadata } from "next";
import MargenClient from "./MargenClient";

export const metadata: Metadata = {
  title: "Calculadora de Margen",
  description:
    "Calculá tu margen de ganancia, precio de venta y punto de equilibrio.",
};

export default function Page() {
  return <MargenClient />;
}