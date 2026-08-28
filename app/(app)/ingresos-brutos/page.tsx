import type { Metadata } from "next";
import IngresosBrutosClient from "./IngresosBrutosClient";

export const metadata: Metadata = {
  title: "Calculadora de Ingresos Brutos Argentina",
  description: "Estimá Ingresos Brutos a pagar por jurisdicción, facturación, alícuota, retenciones y percepciones.",
};

export default function Page() { return <IngresosBrutosClient />; }
