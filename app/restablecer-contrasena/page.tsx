import type { Metadata } from "next";

import PasswordRecoveryPage from "@/components/PasswordRecoveryPage";

export const metadata: Metadata = {
  title: "Restablecer contraseña",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <PasswordRecoveryPage />;
}
