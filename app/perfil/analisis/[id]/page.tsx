import type { Metadata } from "next";

import AnalysisConversationPage from "@/components/AnalysisConversationPage";

export const metadata: Metadata = {
  title: "Análisis guardado",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AnalysisConversationPage />;
}
