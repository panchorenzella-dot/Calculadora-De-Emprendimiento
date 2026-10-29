import CalculatorGuideLinks from "@/components/CalculatorGuideLinks";
import CalculatorStructuredData, { calculatorMetadata } from "@/components/CalculatorStructuredData";
import MargenClient from "./MargenClient";

export const metadata = calculatorMetadata({
  path: "/margen",
  title: "Calculadora de margen: ganancia sobre tus ventas",
  description:
    "Compará ventas y costos para estimar la ganancia y el margen de tu negocio. Entendé cuánto queda y qué gastos incluye el cálculo.",
});

export default function Page() {
  return <><CalculatorStructuredData path="/margen" /><MargenClient /><CalculatorGuideLinks path="/margen" /></>;
}
