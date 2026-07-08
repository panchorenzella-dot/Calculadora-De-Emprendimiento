import type { Metadata } from "next";
import RecuperoCapitalClient from "./RecuperoCapitalClient";

export const metadata: Metadata = {
  title: "Calculadora de Recupero de Capital",
  description:
    "Calculá el tiempo que tarda un proyecto en recuperar su inversión inicial.",
};

export default function Page() {
  return <RecuperoCapitalClient />;
}