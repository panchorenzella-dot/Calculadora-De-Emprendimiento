import type { Metadata } from "next";
import InteresClient from "./InteresClient";

export const metadata: Metadata = {
  title: "Calculadora de Interés Compuesto",
  description:
    "Proyectá el crecimiento de tu plata con aportes mensuales e interés compuesto.",
};

export default function Page() {
  return <InteresClient />;
}