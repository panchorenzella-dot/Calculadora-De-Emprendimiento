import type { Metadata } from "next";
import HamburgueseriaClient from "./HamburgueseriaClient";

export const metadata: Metadata = {
  title: "Calculadora para hamburguesería",
  description:
    "Calculá costos, precio de venta, margen, ganancia mensual y punto de equilibrio de una hamburguesería.",
};

export default function Page() {
  return <HamburgueseriaClient />;
}