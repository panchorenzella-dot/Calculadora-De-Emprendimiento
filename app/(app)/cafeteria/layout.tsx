import type { ReactNode } from "react";

import CalculatorStructuredData, {
  calculatorMetadata,
} from "@/components/CalculatorStructuredData";

export const metadata = calculatorMetadata({
  path: "/cafeteria",
  title: "Calculadora para cafeterías",
  description:
    "Calculá costos, ticket promedio, margen, ganancia mensual y punto de equilibrio de una cafetería.",
});

export default function CafeteriaLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <CalculatorStructuredData path="/cafeteria" />
      {children}
    </>
  );
}

