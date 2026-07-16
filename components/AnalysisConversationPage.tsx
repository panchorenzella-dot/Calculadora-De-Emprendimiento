"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import AiAssistant from "@/components/AiAssistant";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { ScenarioDraft } from "@/types/scenario";

type Conversation = {
  id: string;
  scenario_id: string | null;
  context: ScenarioDraft;
  title: string;
};

export default function AnalysisConversationPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const configured = Boolean(getSupabaseClient());
  const [error, setError] = useState(configured ? "" : "Falta configurar Supabase.");

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    void supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) { router.replace("/perfil"); return; }
      const { data: item, error: loadError } = await supabase.from("ai_conversations").select("id,scenario_id,context,title").eq("id", params.id).single();
      if (loadError || !item) setError("No encontramos este análisis o no tenés permiso para verlo.");
      else setConversation(item as Conversation);
    });
  }, [params.id, router]);

  if (error) return <main className="mx-auto max-w-xl px-4 py-24 text-center"><h1 className="text-2xl font-semibold">No se pudo abrir el análisis</h1><p className="mt-3 text-sm text-white/50">{error}</p><button onClick={() => router.push("/perfil")} className="mt-6 rounded-full border border-white/15 bg-black px-4 py-2 text-sm text-white">Volver al perfil</button></main>;
  if (!conversation) return <main className="grid min-h-[65vh] place-items-center text-sm text-white/40">Abriendo tu análisis...</main>;
  const conversationId = conversation.id;

  async function renameConversation(title: string) {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const { error: renameError } = await supabase.from("ai_conversations").update({ title }).eq("id", conversationId);
    if (renameError) throw renameError;
    setConversation((current) => current ? { ...current, title } : current);
  }

  return <AiAssistant
    draft={conversation.context}
    hasResults
    initialConversationId={conversation.id}
    initialScenarioId={conversation.scenario_id}
    conversationTitle={conversation.title}
    scenarioHref={conversation.scenario_id ? `/perfil/escenarios/${conversation.scenario_id}` : undefined}
    standalone
    onRename={renameConversation}
    onClose={() => router.push("/perfil")}
  />;
}
