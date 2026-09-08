import type { ReactNode } from "react";

import CalculatorStructuredData, {
  calculatorMetadata,
} from "@/components/CalculatorStructuredData";

export const metadata = calculatorMetadata({
  path: "/distribuidora",
  title: "Calculadora para distribuidoras",
  description:
    "Calculá margen por caja, reparto, ganancia por cliente, punto de equilibrio y stock de una distribuidora.",
});

export default function DistribuidoraLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <CalculatorStructuredData path="/distribuidora" />
      {children}
    </>
  );
}

