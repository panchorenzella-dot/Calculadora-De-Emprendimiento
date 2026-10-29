import CalculatorGuideLinks from "@/components/CalculatorGuideLinks";
import CalculatorStructuredData, { calculatorMetadata } from "@/components/CalculatorStructuredData";
import HamburgueseriaClient from "./HamburgueseriaClient";

export const metadata = calculatorMetadata({
  path: "/hamburgueseria",
  title: "Calculadora de hamburguesas: costo y precio de venta",
  description:
    "Sumá ingredientes, packaging, comisiones y gastos. Estimá el costo por hamburguesa, su precio de venta y el resultado mensual de tu negocio.",
});

export default function Page() {
  return <><CalculatorStructuredData path="/hamburgueseria" /><HamburgueseriaClient /><CalculatorGuideLinks path="/hamburgueseria" /></>;
}
