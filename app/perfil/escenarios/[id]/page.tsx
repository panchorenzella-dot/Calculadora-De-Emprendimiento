import type { Metadata } from "next";

import ScenarioDetail from "@/components/ScenarioDetail";

export const metadata: Metadata = {
  title: "Escenario guardado",
  robots: { index: false, follow: false },
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ScenarioDetail id={id} />;
}
