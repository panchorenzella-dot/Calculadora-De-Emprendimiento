import type { Metadata } from "next";
import ProduccionClient from "./ProduccionClient";

export const metadata: Metadata = {
  title: "Calculadora de Producción",
  description:
    "Calculá el costo por unidad, la ganancia, el margen y el punto de equilibrio de un negocio de producción.",
};

export default function Page() {
  return <ProduccionClient />;
}