import type { ReactNode } from "react";

import CalculatorGuideLinks from "@/components/CalculatorGuideLinks";
import CalculatorStructuredData, {
  calculatorMetadata,
} from "@/components/CalculatorStructuredData";

export const metadata = calculatorMetadata({
  path: "/distribuidora",
  title: "Calculadora de margen y rentabilidad para distribuidoras",
  description:
    "Calculá margen por caja, costo de reparto, ganancia mensual, punto de equilibrio, ROI y capital en stock de una distribuidora.",
});

export default function DistribuidoraLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <CalculatorStructuredData path="/distribuidora" />
      {children}
      <CalculatorGuideLinks path="/distribuidora" />
    </>
  );
}
