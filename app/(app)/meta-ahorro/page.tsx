import type { Metadata } from "next";
import MetaAhorroClient from "./MetaAhorroClient";

export const metadata: Metadata = {
  title: "Calculadora de Meta de Ahorro",
  description:
    "Calculá cuánto necesitás ahorrar por mes.",
};

export default function Page() {
  return <MetaAhorroClient />;
}