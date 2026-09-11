import type { ReactNode } from "react";

import CalculatorGuideLinks from "@/components/CalculatorGuideLinks";
import CalculatorStructuredData, {
  calculatorMetadata,
} from "@/components/CalculatorStructuredData";

export const metadata = calculatorMetadata({
  path: "/aporte-mensual",
  title: "Calculadora de inversión con aporte mensual",
  description:
    "Calculá cuánto podés acumular con aportes mensuales, capital inicial, rendimiento y plazo en pesos o dólares.",
});

export default function AporteMensualLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <CalculatorStructuredData path="/aporte-mensual" />
      {children}
      <CalculatorGuideLinks path="/aporte-mensual" />
    </>
  );
}
