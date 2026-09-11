import type { ReactNode } from "react";

import CalculatorGuideLinks from "@/components/CalculatorGuideLinks";
import CalculatorStructuredData, {
  calculatorMetadata,
} from "@/components/CalculatorStructuredData";

export const metadata = calculatorMetadata({
  path: "/cafeteria",
  title: "Calculadora de costos y rentabilidad para cafeterías",
  description:
    "Calculá costo por pedido, ticket promedio, margen, ganancia mensual y punto de equilibrio de una cafetería o bar.",
});

export default function CafeteriaLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <CalculatorStructuredData path="/cafeteria" />
      {children}
      <CalculatorGuideLinks path="/cafeteria" />
    </>
  );
}
