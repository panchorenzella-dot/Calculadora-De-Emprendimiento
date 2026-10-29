import CalculatorGuideLinks from "@/components/CalculatorGuideLinks";
import CalculatorStructuredData, { calculatorMetadata } from "@/components/CalculatorStructuredData";
import CostoLaboralClient from "./CostoLaboralClient";

export const metadata = calculatorMetadata({
  path: "/costo-laboral",
  title: "Costo laboral: calculá el costo de un empleado",
  description: "Estimá el costo laboral en Argentina con sueldo bruto, contribuciones, ART, aguinaldo y vacaciones. Ajustá las tasas según tu caso.",
});

export default function Page() {
  return <><CalculatorStructuredData path="/costo-laboral" /><CostoLaboralClient /><CalculatorGuideLinks path="/costo-laboral" /></>;
}
