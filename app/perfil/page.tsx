import type { Metadata } from "next";

import ProfilePage from "@/components/ProfilePage";

export const metadata: Metadata = {
  title: "Mi perfil",
  description: "Consultá tus escenarios guardados en Calculadora Emprendedora.",
};

export default function Page() {
  return <ProfilePage />;
}
