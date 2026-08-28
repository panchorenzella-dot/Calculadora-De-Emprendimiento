import type { Metadata } from "next";
import IvaProductoClient from "./IvaProductoClient";

export const metadata: Metadata = {
  title: "Calculadora de IVA por producto en Argentina",
  description: "Agregá IVA a un precio neto o separá el IVA incluido con alícuotas de Argentina.",
};

export default function Page() { return <IvaProductoClient />; }
