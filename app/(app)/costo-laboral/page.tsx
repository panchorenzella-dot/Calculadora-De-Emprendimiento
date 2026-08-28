import type { Metadata } from "next";
import CostoLaboralClient from "./CostoLaboralClient";

export const metadata: Metadata = {
  title: "Calculadora de costo laboral en Argentina",
  description: "Estimá el costo de un empleado con sueldo bruto, contribuciones patronales, obra social, ART, aguinaldo y vacaciones.",
};

export default function Page() { return <CostoLaboralClient />; }
