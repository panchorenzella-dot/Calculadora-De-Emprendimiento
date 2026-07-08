import type { Metadata } from "next";
import RendimientoRealClient from "./RendimientoRealClient";

export const metadata: Metadata = {
  title: "Calculadora de Rendimiento Real",
  description:
    "Calculá el rendimiento real de una inversión considerando la inflación.",
};

export default function Page() {
  return <RendimientoRealClient />;
}