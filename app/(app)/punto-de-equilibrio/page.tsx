import type { Metadata } from "next";
import PuntoequilibrioClient from "./PuntoequilibrioClient";

export const metadata: Metadata = {
  title: "Calculadora de Punto de Equilibrio",
  description:
    "Calculá el punto de equilibrio de un negocio.",
};

export default function Page() {
  return <PuntoequilibrioClient />;
}