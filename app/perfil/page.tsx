import type { Metadata } from "next";

import ProfilePage from "@/components/ProfilePage";

export const metadata: Metadata = {
  title: "Mi perfil",
  description: "Consultá tus escenarios guardados en Calculadora Emprendedora.",
};

export default async function Page({ searchParams }: { searchParams: Promise<{ modo?: string; continuar?: string }> }) {
  const { modo, continuar } = await searchParams;
  return <ProfilePage initialAuthMode={modo === "registro" ? "signup" : "login"} continueToPro={continuar === "pro"} />;
}
