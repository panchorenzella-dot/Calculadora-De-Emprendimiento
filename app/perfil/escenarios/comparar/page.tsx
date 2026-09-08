import type { Metadata } from "next";

import ScenarioComparison from "@/components/ScenarioComparison";

export const metadata: Metadata = {
  title: "Comparar escenarios",
  robots: { index: false, follow: false },
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function parseIds(value?: string) {
  if (!value) return [];
  return Array.from(new Set(value.split(",").map((id) => id.trim()).filter((id) => UUID_PATTERN.test(id)))).slice(0, 3);
}

export default async function Page({ searchParams }: { searchParams: Promise<{ ids?: string }> }) {
  const { ids } = await searchParams;
  return <ScenarioComparison ids={parseIds(ids)} />;
}
