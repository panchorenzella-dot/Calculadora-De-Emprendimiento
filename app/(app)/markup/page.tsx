import type { Metadata } from "next";
import MarkupClient from "./MarkupClient";

export const metadata: Metadata = {
  title: "Calculadora de Markup",
  description:
    "Calculá tu markup de ganancia, precio de venta y punto de equilibrio.",
};

export default function Page() {
  return <MarkupClient />;
}