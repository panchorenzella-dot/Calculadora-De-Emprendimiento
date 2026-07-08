import type { Metadata } from "next";
import ReventaClient from "./ReventaClient";

export const metadata: Metadata = {
  title: "Calculadora de Reventa",
  description:
    "Calculá el rendimiento de una inversión en reventa.",
};

export default function Page() {
  return <ReventaClient />;
}