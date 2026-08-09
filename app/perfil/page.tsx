import type { Metadata } from "next";

import ProfilePage from "@/components/ProfilePage";

export const metadata: Metadata = {
  title: "Mi perfil",
  description: "Consultá tus escenarios guardados en Calculadora Emprendedora.",
};

export default async function Page({ searchParams }: { searchParams: Promise<{ modo?: string }> }) {
  const { modo } = await searchParams;
  return <ProfilePage initialAuthMode={modo === "registro" ? "signup" : "login"} />;
}
