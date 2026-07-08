import type { Metadata } from "next";
import CalculadorasClient from "./CalculadorasClient";

export const metadata: Metadata = {
  title: "Calculadoras online",
  description:
    "Calculadoras online para emprendedores: negocios, costos, rentabilidad, inversión, ahorro, margen de ganancia, precio de venta y punto de equilibrio.",
};

export default function Page() {
  return <CalculadorasClient />;
}