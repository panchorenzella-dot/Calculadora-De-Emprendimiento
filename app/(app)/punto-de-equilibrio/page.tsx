import CalculatorGuideLinks from "@/components/CalculatorGuideLinks";
import CalculatorStructuredData, { calculatorMetadata } from "@/components/CalculatorStructuredData";
import PuntoequilibrioClient from "./PuntoequilibrioClient";

export const metadata = calculatorMetadata({
  path: "/punto-de-equilibrio",
  title: "Punto de equilibrio: calculá cuánto necesitás vender",
  description:
    "Ingresá precio, costo variable y costos fijos. Calculá tu punto de equilibrio en unidades y ventas para entender cuánto necesitás vender.",
});

export default function Page() {
  return <><CalculatorStructuredData path="/punto-de-equilibrio" /><PuntoequilibrioClient /><CalculatorGuideLinks path="/punto-de-equilibrio" /></>;
}
