"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

import AuthModal from "@/components/AuthModal";
import { trackEvent } from "@/lib/analytics";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { ScenarioDraft } from "@/types/scenario";

type Message = { role: "user" | "assistant"; content: string };
type Conversation = { id: string; title: string; updated_at: string };
type ScenarioQuotaResult = { allowed: boolean; scenario_id: string | null; resets_at: string | null };
type Props = {
  draft: ScenarioDraft | null;
  hasResults: boolean;
  initialConversationId?: string;
  initialScenarioId?: string | null;
  standalone?: boolean;
  onClose?: () => void;
  conversationTitle?: string;
  scenarioHref?: string;
  onRename?: (title: string) => void | Promise<void>;
};

function AssistantMark({ compact = false }: { compact?: boolean }) {
  return <span aria-hidden="true" className={`grid shrink-0 place-items-center rounded-lg border border-emerald-300/20 bg-emerald-300/[0.07] font-semibold tracking-[0.08em] text-emerald-100 ${compact ? "h-8 w-8 text-[9px]" : "h-10 w-10 text-[10px]"}`}>AI</span>;
}

function SendIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m4 12 16-8-5.4 16-3.2-6.6L4 12Z"/><path d="m11.4 13.4 4-4"/></svg>;
}

function CopyIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="8" y="8" width="11" height="11" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>;
}

function DataIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16"/><circle cx="8" cy="7" r="1.5" fill="currentColor" stroke="none"/><circle cx="15" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="10" cy="17" r="1.5" fill="currentColor" stroke="none"/></svg>;
}

function MoreIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><circle cx="5" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="19" cy="12" r="1.7"/></svg>;
}

function formatInline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((part, index) =>
    part.startsWith("**") && part.endsWith("**")
      ? <strong key={index} className="font-semibold text-white">{part.slice(2, -2)}</strong>
      : part
  );
}

function AssistantContent({ content }: { content: string }) {
  return <div className="space-y-3 text-base leading-7 text-white/75">{content.split("\n").map((raw, index) => {
    const line = raw.trim();
    if (!line) return <div key={index} className="h-1"/>;
    const heading = line.match(/^#{1,3}\s+(.+)/);
    if (heading) return <h3 key={index} className="pt-3 text-base font-semibold tracking-tight text-white first:pt-0">{formatInline(heading[1])}</h3>;
    const bullet = line.match(/^[-•]\s+(.+)/);
    if (bullet) return <div key={index} className="grid grid-cols-[8px_1fr] gap-3"><span className="mt-[11px] h-1.5 w-1.5 rounded-full bg-emerald-300/70"/><p>{formatInline(bullet[1])}</p></div>;
    const numbered = line.match(/^(\d+)[.)]\s+(.+)/);
    if (numbered) return <div key={index} className="grid grid-cols-[26px_1fr] gap-2"><span className="mt-1 grid h-6 w-6 place-items-center rounded-md border border-white/10 bg-white/[0.04] text-[11px] font-semibold text-white/55">{numbered[1]}</span><p>{formatInline(numbered[2])}</p></div>;
    return <p key={index}>{formatInline(line)}</p>;
  })}</div>;
}

export default function AiAssistant({ draft, hasResults, initialConversationId, initialScenarioId = null, standalone = false, onClose, conversationTitle, scenarioHref, onRename }: Props) {
  const [authOpen, setAuthOpen] = useState(false);
  const [open, setOpen] = useState(standalone);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(initialConversationId ?? null);
  const [scenarioId, setScenarioId] = useState<string | null>(initialScenarioId);
  const [history, setHistory] = useState<Conversation[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [copied, setCopied] = useState(false);
  const [contextOpen, setContextOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [historyMenuId, setHistoryMenuId] = useState<string | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [open]);

  const loadHistory = useCallback(async () => {
    const supabase = getSupabaseClient();
    if (!supabase || !draft) return;
    const { data } = await supabase.from("ai_conversations").select("id,title,updated_at").eq("calculator_type", draft.calculatorType).order("updated_at", { ascending: false }).limit(8);
    setHistory((data as Conversation[]) ?? []);
  }, [draft]);

  useEffect(() => { if (open) void loadHistory(); }, [open, loadHistory]);

  useEffect(() => {
    if (!initialConversationId) return;
    const supabase = getSupabaseClient();
    if (!supabase) return;
    void supabase.from("ai_messages").select("role,content").eq("conversation_id", initialConversationId).order("created_at").then(({ data, error: loadError }) => {
      if (loadError) setError("No se pudo recuperar esta conversación.");
      else setMessages((data as Message[]) ?? []);
    });
  }, [initialConversationId]);

  async function requireSession() {
    const supabase = getSupabaseClient();
    if (!supabase) { setError("Falta configurar Supabase."); return null; }
    const { data } = await supabase.auth.getSession();
    if (!data.session) { setAuthOpen(true); return null; }
    return data.session;
  }

  async function saveAnalysisScenario() {
    if (scenarioId) return scenarioId;
    const supabase = getSupabaseClient();
    if (!supabase || !draft) return null;
    const title = `Análisis IA · ${draft.calculatorName} · ${new Intl.DateTimeFormat("es-AR").format(new Date())}`;
    const { data, error: quotaError } = await supabase.rpc("save_scenario_with_quota", {
      p_calculator_type: draft.calculatorType,
      p_title: title,
      p_inputs: { ...draft.inputs, calculator_path: draft.calculatorPath },
      p_results: draft.results,
    });
    let quota = (data as ScenarioQuotaResult[] | null)?.[0];
    let scenarioError = quotaError;
    if (quotaError?.code === "PGRST202") {
      const legacy = await supabase.from("saved_scenarios").insert({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        calculator_type: draft.calculatorType,
        title,
        inputs: { ...draft.inputs, calculator_path: draft.calculatorPath },
        results: draft.results,
      }).select("id").single();
      scenarioError = legacy.error;
      if (legacy.data?.id) quota = { allowed: true, scenario_id: legacy.data.id, resets_at: null };
    }
    if (scenarioError) {
      setNotice("El análisis continuará, pero no pudimos guardar el escenario automáticamente. Podés intentarlo otra vez desde la calculadora.");
      return null;
    }
    if (!quota?.allowed || !quota.scenario_id) {
      setNotice("El análisis continuará y quedará en tu historial, pero hoy ya usaste los 3 escenarios del plan Gratis. En Pro son ilimitados.");
      return null;
    }
    setScenarioId(quota.scenario_id);
    return quota.scenario_id;
  }

  async function ensureConversation(userId: string, linkedScenarioId?: string | null) {
    if (conversationId) return conversationId;
    const supabase = getSupabaseClient();
    if (!supabase || !draft) return null;
    const { data, error: dbError } = await supabase.from("ai_conversations").insert({ user_id: userId, calculator_type: draft.calculatorType, calculator_name: draft.calculatorName, calculator_path: draft.calculatorPath, title: `Análisis · ${draft.calculatorName}`, context: draft, scenario_id: linkedScenarioId ?? null }).select("id").single();
    if (dbError) { setError("No pudimos guardar esta conversación. Volvé a intentar en unos segundos."); return null; }
    setConversationId(data.id);
    return data.id as string;
  }

  async function persistMessage(id: string, userId: string, item: Message) {
    await getSupabaseClient()?.from("ai_messages").insert({ conversation_id: id, user_id: userId, ...item });
  }

  async function ask(mode: "analysis" | "chat", question?: string) {
    if (!draft || !hasResults) { setError("Primero completá la calculadora para generar un análisis."); return; }
    const session = await requireSession();
    if (!session) return;
    setOpen(true);
    setLoading(true);
    setError("");
    setNotice("");
    const userMessage: Message | null = mode === "chat" && question ? { role: "user", content: question } : null;
    const previous = messages;
    if (userMessage) {
      setMessages([...previous, userMessage]);
      setMessage("");
    }
    try {
      const response = await fetch("/api/ai", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` }, body: JSON.stringify({ mode, context: draft, messages: previous.slice(-20), message: question }) });
      const data = await response.json() as { text?: string; error?: string };
      if (!response.ok || !data.text) throw new Error(data.error || "No pudimos obtener una respuesta.");
      const linkedScenarioId = mode === "analysis" && !conversationId
        ? await saveAnalysisScenario()
        : scenarioId;
      const id = await ensureConversation(session.user.id, linkedScenarioId);
      if (!id) return;
      const assistantMessage: Message = { role: "assistant", content: data.text };
      setMessages((current) => [...current, assistantMessage]);
      if (userMessage) await persistMessage(id, session.user.id, userMessage);
      await persistMessage(id, session.user.id, assistantMessage);
      trackEvent(mode === "analysis" ? "ai_analysis" : "ai_followup", { calculator_name: draft.calculatorName, calculator_type: draft.calculatorType });
      await loadHistory();
    } catch (requestError) {
      if (userMessage) {
        setMessages(previous);
        setMessage(question ?? "");
      }
      setError(requestError instanceof Error ? requestError.message : "Ocurrió un error.");
    } finally {
      setLoading(false);
    }
  }

  function newConversation() {
    setMobileNavOpen(false);
    setConversationId(null);
    setScenarioId(null);
    setMessages([]);
    setError("");
    setNotice("");
    if (standalone) window.location.assign("/calculadoras");
    else if (onClose) onClose();
    else setOpen(false);
  }

  async function copyConversation() {
    await navigator.clipboard.writeText(messages.map((item) => `${item.role === "user" ? "Vos" : "Asistente IA"}:\n${item.content}`).join("\n\n"));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  const submitMessage = () => {
    if (message.trim() && !loading) void ask("chat", message.trim());
  };

  const closeChat = () => {
    if (onClose) onClose();
    else setOpen(false);
  };

  async function renameCurrentAnalysis() {
    if (!onRename || !conversationTitle) return;
    const nextTitle = window.prompt("Nuevo nombre para este análisis", conversationTitle);
    if (!nextTitle?.trim() || nextTitle.trim() === conversationTitle) return;
    setRenaming(true);
    try { await onRename(nextTitle.trim()); }
    catch { setError("No se pudo cambiar el nombre del análisis."); }
    finally { setRenaming(false); }
  }

  async function renameHistoryAnalysis(item: Conversation) {
    const title = window.prompt("Nuevo nombre para este análisis", item.title);
    if (!title?.trim() || title.trim() === item.title) return;
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const { error: renameError } = await supabase.from("ai_conversations").update({ title: title.trim() }).eq("id", item.id);
    if (renameError) setError("No se pudo cambiar el nombre del análisis.");
    else setHistory((current) => current.map((conversation) => conversation.id === item.id ? { ...conversation, title: title.trim() } : conversation));
    setHistoryMenuId(null);
  }

  async function deleteHistoryAnalysis(item: Conversation) {
    if (!window.confirm(`¿Eliminar “${item.title}” y toda su conversación?`)) return;
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const { error: deleteError } = await supabase.from("ai_conversations").delete().eq("id", item.id);
    if (deleteError) setError("No se pudo eliminar el análisis.");
    else {
      setHistory((current) => current.filter((conversation) => conversation.id !== item.id));
      if (item.id === conversationId) closeChat();
    }
    setHistoryMenuId(null);
  }

  const contextFields = draft ? Object.entries(draft.inputs.campos && typeof draft.inputs.campos === "object" && !Array.isArray(draft.inputs.campos) ? draft.inputs.campos : draft.inputs) : [];

  return <>
    {!standalone && <section className="ai-surface flex h-full flex-col border-t border-white/[0.08] p-6 sm:p-8 md:border-t-0">
      <div className="flex items-start gap-4">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-emerald-300/20 bg-emerald-300/[0.06] text-xs font-semibold text-emerald-100/80">02</span>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-200/45">Lectura estratégica</p>
          <h2 className="mt-1.5 text-lg font-semibold tracking-[-0.02em] text-white">Iniciar análisis</h2>
          <p className="mt-2 text-sm leading-6 text-white/48">Recibí un diagnóstico del resultado y continuá en un chat que ya conoce este escenario.</p>
        </div>
      </div>
      <div className="mt-auto pt-6">
        <button onClick={() => void ask("analysis")} disabled={loading} className="group flex min-h-11 w-full items-center justify-between rounded-xl bg-emerald-300 px-4 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-55"><span>{loading ? "Preparando análisis..." : "Iniciar análisis"}</span><span aria-hidden="true" className="text-base font-normal transition-transform group-hover:translate-x-0.5">→</span></button>
        <p className="mt-3 text-xs leading-5 text-white/28">Gratis: 1 análisis semanal · 5 mensajes diarios. <Link href="/precios" className="text-emerald-200/60 hover:text-emerald-100">Ver Pro</Link></p>
      </div>
      {!open && error && <p className="mt-4 border-l-2 border-red-300/55 bg-red-500/[0.07] px-3 py-2.5 text-sm leading-5 text-red-100/80">{error}</p>}
      {!open && notice && <p className="mt-4 border-l-2 border-emerald-300/45 bg-emerald-300/[0.05] px-3 py-2.5 text-sm leading-5 text-emerald-100/70">{notice}</p>}
    </section>}

    {open && <div role="dialog" aria-modal="true" aria-label="Chat de análisis con IA" className="ai-surface fixed inset-0 z-[120] flex bg-[#070a08] text-white">
      <aside className="hidden w-[304px] shrink-0 flex-col border-r border-white/[0.08] bg-[#0c100e] p-5 lg:flex">
        <div className="flex items-center gap-3 px-1 py-1"><AssistantMark/><div><p className="text-base font-semibold tracking-[-0.01em]">Asistente de análisis</p><p className="text-xs text-white/38">Calculadora Emprendedora</p></div></div>
        <button onClick={newConversation} className="mt-6 flex min-h-11 items-center justify-between rounded-xl border border-white/10 bg-white/[0.035] px-4 py-2.5 text-sm font-semibold text-white/72 transition hover:border-white/20 hover:bg-white/[0.065] hover:text-white"><span>Nuevo análisis</span><span className="text-base font-light text-white/40">＋</span></button>
        <div className="mt-7 px-2"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/25">Contexto actual</p><div className="mt-3 border-l border-emerald-300/25 py-1 pl-3"><p className="truncate text-sm font-medium text-white/75">{draft?.calculatorName}</p><div className="mt-2 flex items-center gap-2 text-xs text-white/30"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300"/>Datos y resultados conectados</div></div></div>
        <div className="mt-7 min-h-0 flex-1 overflow-y-auto px-2"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/25">Conversaciones</p><div className="mt-2 space-y-1">{history.length === 0 ? <p className="py-3 text-sm leading-5 text-white/25">Tus análisis recientes aparecerán acá.</p> : history.map((item) => <div key={item.id} className={`group/history relative flex items-center rounded-lg transition ${conversationId === item.id ? "bg-white/[0.07]" : "hover:bg-white/[0.04]"}`}><Link href={`/perfil/analisis/${item.id}`} className={`min-w-0 flex-1 truncate px-3 py-2 text-sm ${conversationId === item.id ? "text-white" : "text-white/40 group-hover/history:text-white/70"}`}>{item.title}</Link><button onClick={() => setHistoryMenuId((current) => current === item.id ? null : item.id)} aria-label={`Opciones de ${item.title}`} className="mr-1 grid h-7 w-7 shrink-0 place-items-center rounded-full text-white/35 opacity-60 transition hover:bg-white/[0.08] hover:text-white group-hover/history:opacity-100"><MoreIcon/></button>{historyMenuId === item.id && <div className="absolute right-0 top-9 z-30 w-40 overflow-hidden rounded-xl border border-white/10 bg-[#191a1c] p-1.5 text-sm shadow-2xl"><Link href={`/perfil/analisis/${item.id}`} className="block rounded-lg px-3 py-2 text-white/70 hover:bg-white/[0.06] hover:text-white">Abrir</Link><button onClick={() => void renameHistoryAnalysis(item)} className="block w-full rounded-lg px-3 py-2 text-left text-white/70 hover:bg-white/[0.06] hover:text-white">Renombrar</button><div className="my-1 h-px bg-white/[0.07]"/><button onClick={() => void deleteHistoryAnalysis(item)} className="block w-full rounded-lg px-3 py-2 text-left text-red-300/75 hover:bg-red-500/10 hover:text-red-200">Eliminar</button></div>}</div>)}</div></div>
        <p className="border-t border-white/[0.07] px-2 pb-1 pt-4 text-xs leading-5 text-white/25">Las respuestas son orientativas. Validá decisiones sensibles con un profesional.</p>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-[76px] shrink-0 items-center justify-between border-b border-white/[0.08] bg-[#0a0d0b]/95 px-4 backdrop-blur-xl sm:px-7">
          <div className="flex min-w-0 items-center gap-3"><button onClick={() => setMobileNavOpen(true)} aria-label="Abrir historial" className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/[0.08] text-white/48 transition hover:bg-white/[0.06] hover:text-white lg:hidden"><span className="space-y-1"><i className="block h-px w-4 bg-current"/><i className="block h-px w-4 bg-current"/><i className="block h-px w-4 bg-current"/></span></button><div className="min-w-0"><div className="flex items-center gap-2.5"><h2 className="truncate text-base font-semibold tracking-[-0.015em] sm:text-lg">{conversationTitle || draft?.calculatorName}</h2><span className="hidden rounded-md border border-emerald-300/15 bg-emerald-300/[0.05] px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-emerald-200/65 sm:inline">Datos conectados</span></div><p className="mt-0.5 truncate text-xs text-white/35">{draft?.calculatorName} · {messages.length} mensajes</p></div></div>
          <div className="relative flex items-center gap-1.5">
            <button onClick={() => setContextOpen(true)} aria-label="Ver datos utilizados" title="Ver datos" className="grid h-9 w-9 place-items-center rounded-lg border border-transparent text-white/40 transition hover:border-white/[0.08] hover:bg-white/[0.05] hover:text-white/80"><DataIcon/></button>
            <button onClick={() => setActionsOpen((current) => !current)} aria-label="Más opciones" className="grid h-9 w-9 place-items-center rounded-lg border border-transparent text-white/40 transition hover:border-white/[0.08] hover:bg-white/[0.05] hover:text-white/80"><MoreIcon/></button>
            {actionsOpen && <div className="absolute right-0 top-11 z-30 w-48 overflow-hidden rounded-xl border border-white/10 bg-[#191a1c] p-1.5 text-sm shadow-2xl">{onRename && <button onClick={() => { setActionsOpen(false); void renameCurrentAnalysis(); }} disabled={renaming} className="block w-full rounded-lg px-3 py-2 text-left text-white/70 hover:bg-white/[0.06] hover:text-white">{renaming ? "Guardando..." : "Renombrar análisis"}</button>}{scenarioHref && <Link href={scenarioHref} className="block rounded-lg px-3 py-2 text-white/70 hover:bg-white/[0.06] hover:text-white">Abrir escenario</Link>}{messages.length > 0 && <button onClick={() => { setActionsOpen(false); void copyConversation(); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-white/70 hover:bg-white/[0.06] hover:text-white"><CopyIcon/>{copied ? "Copiado" : "Copiar conversación"}</button>}<div className="my-1 h-px bg-white/[0.07]"/><button onClick={closeChat} className="block w-full rounded-lg px-3 py-2 text-left text-white/70 hover:bg-white/[0.06] hover:text-white">{standalone ? "Volver al perfil" : "Cerrar chat"}</button></div>}
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto bg-[#070a08]">
          <div className="mx-auto max-w-4xl px-4 pb-36 pt-8 sm:px-8 sm:pt-12">
            {messages.length === 0 && !loading && <div className="mx-auto max-w-2xl py-10 sm:py-16"><div className="rounded-2xl border border-white/[0.09] bg-[#0c100e] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.25)] sm:p-8"><div className="flex items-start gap-4"><AssistantMark/><div><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-200/50">Escenario listo</p><h3 className="mt-1.5 text-2xl font-semibold tracking-[-0.03em]">Análisis de {draft?.calculatorName}</h3><p className="mt-3 max-w-xl text-sm leading-6 text-white/45">Voy a interpretar los resultados, revisar los supuestos y señalar riesgos, oportunidades y próximos pasos concretos.</p></div></div><div className="mt-7 grid gap-px overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.08] sm:grid-cols-3"><div className="bg-[#0b0f0d] p-4"><span className="text-[10px] font-semibold tracking-[0.14em] text-white/28">01</span><p className="mt-2 text-sm font-medium text-white/72">Resultado recibido</p></div><div className="bg-[#0b0f0d] p-4"><span className="text-[10px] font-semibold tracking-[0.14em] text-white/28">02</span><p className="mt-2 text-sm font-medium text-white/72">Supuestos revisados</p></div><div className="bg-[#0b0f0d] p-4"><span className="text-[10px] font-semibold tracking-[0.14em] text-white/28">03</span><p className="mt-2 text-sm font-medium text-white/72">Chat contextual</p></div></div></div></div>}
            <div className="space-y-9">{messages.map((item, index) => item.role === "user" ? <div key={index} className="ml-auto max-w-[88%] rounded-xl rounded-br-sm border border-white/[0.06] bg-white/[0.07] px-4 py-3 text-[15px] leading-6 text-white/85 sm:max-w-[72%]">{item.content}</div> : <article key={index} className="grid gap-3 sm:grid-cols-[36px_1fr]"><AssistantMark compact/><div className="min-w-0 px-1 py-1 sm:px-2"><div className="mb-4 flex items-center justify-between gap-4"><p className="text-sm font-semibold text-white/58">Análisis del escenario</p><span className="text-xs text-emerald-200/50">Basado en tus datos</span></div><AssistantContent content={item.content}/></div></article>)}
              {loading && <div className="grid gap-3 rounded-xl border border-white/[0.07] bg-white/[0.025] p-4 sm:grid-cols-[34px_1fr]"><AssistantMark compact/><div className="px-1 py-1"><div className="flex items-center gap-3 text-sm text-white/48"><span className="flex gap-1"><i className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-200/55"/><i className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-200/55 [animation-delay:150ms]"/><i className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-200/55 [animation-delay:300ms]"/></span>Analizando resultados, supuestos y oportunidades</div></div></div>}
              {error && <p className="border-l-2 border-red-300/55 bg-red-500/[0.07] px-4 py-3 text-sm leading-6 text-red-100/85">{error}</p>}
              {notice && <p className="border-l-2 border-emerald-300/45 bg-emerald-300/[0.05] px-4 py-3 text-sm leading-6 text-emerald-100/72">{notice}</p>}
              <div ref={bottomRef}/>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#070a08] via-[#070a08] to-transparent px-4 pb-4 pt-12 lg:left-[304px] sm:px-6 sm:pb-6">
          <div className="pointer-events-auto mx-auto max-w-4xl"><form onSubmit={(event) => { event.preventDefault(); submitMessage(); }} className="relative rounded-2xl border border-white/[0.11] bg-[#111612] p-1.5 shadow-[0_24px_80px_rgba(0,0,0,0.42)] transition focus-within:border-emerald-300/25"><textarea value={message} onChange={(event) => setMessage(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); submitMessage(); } }} placeholder="Preguntá, profundizá o pedí una simulación..." rows={2} className="block max-h-36 min-h-12 w-full resize-none bg-transparent px-3 py-2 pr-12 text-[15px] leading-6 text-white outline-none placeholder:text-white/28"/><button disabled={loading || !message.trim()} aria-label="Enviar mensaje" className="absolute bottom-2.5 right-2.5 grid h-8 w-8 place-items-center rounded-lg bg-emerald-300 text-emerald-950 transition hover:bg-emerald-200 disabled:bg-white/[0.08] disabled:text-white/20"><SendIcon/></button></form><p className="mt-2 text-center text-[11px] text-white/25">Gratis: 5 mensajes diarios · Pro: 300 por mes · Enter para enviar</p></div>
        </div>
      </main>

      {mobileNavOpen && <div className="fixed inset-0 z-[135] flex bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setMobileNavOpen(false)}><aside className="flex h-full w-[min(88vw,320px)] flex-col border-r border-white/[0.08] bg-[#0c100e] p-4 shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="flex items-center justify-between px-2 py-2"><div className="flex items-center gap-3"><AssistantMark/><div><p className="text-base font-semibold">Asistente de análisis</p><p className="text-xs text-white/35">Tus conversaciones</p></div></div><button onClick={() => setMobileNavOpen(false)} aria-label="Cerrar historial" className="grid h-8 w-8 place-items-center rounded-lg border border-white/[0.08] text-xl text-white/40 hover:bg-white/[0.06] hover:text-white">×</button></div><button onClick={newConversation} className="mt-5 flex min-h-11 items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-white/70 transition hover:bg-white/[0.07] hover:text-white"><span>Nuevo análisis</span><span className="text-base font-light text-white/40">＋</span></button><div className="mt-7 min-h-0 flex-1 overflow-y-auto px-1"><p className="px-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/25">Conversaciones</p><div className="mt-2 space-y-1">{history.length === 0 ? <p className="px-2 py-3 text-sm leading-5 text-white/25">Tus análisis recientes aparecerán acá.</p> : history.map((item) => <div key={item.id} className={`relative flex items-center rounded-lg transition ${conversationId === item.id ? "bg-white/[0.07]" : "hover:bg-white/[0.04]"}`}><Link href={`/perfil/analisis/${item.id}`} onClick={() => setMobileNavOpen(false)} className={`min-w-0 flex-1 truncate px-3 py-2.5 text-sm ${conversationId === item.id ? "text-white" : "text-white/50"}`}>{item.title}</Link><button onClick={() => setHistoryMenuId((current) => current === item.id ? null : item.id)} aria-label={`Opciones de ${item.title}`} className="mr-1 grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white/40 hover:bg-white/[0.08] hover:text-white"><MoreIcon/></button>{historyMenuId === item.id && <div className="absolute right-1 top-10 z-30 w-40 overflow-hidden rounded-xl border border-white/10 bg-[#191a1c] p-1.5 text-sm shadow-2xl"><Link href={`/perfil/analisis/${item.id}`} onClick={() => setMobileNavOpen(false)} className="block rounded-lg px-3 py-2 text-white/70 hover:bg-white/[0.06] hover:text-white">Abrir</Link><button onClick={() => void renameHistoryAnalysis(item)} className="block w-full rounded-lg px-3 py-2 text-left text-white/70 hover:bg-white/[0.06] hover:text-white">Renombrar</button><div className="my-1 h-px bg-white/[0.07]"/><button onClick={() => void deleteHistoryAnalysis(item)} className="block w-full rounded-lg px-3 py-2 text-left text-red-300/75 hover:bg-red-500/10 hover:text-red-200">Eliminar</button></div>}</div>)}</div></div><p className="border-t border-white/[0.07] px-2 pb-2 pt-4 text-xs leading-5 text-white/25">La IA usa los datos del cálculo para mantener el contexto.</p></aside></div>}

      {contextOpen && <div className="fixed inset-0 z-[140] flex justify-end bg-black/55 backdrop-blur-sm" onClick={() => setContextOpen(false)}><aside className="h-full w-full max-w-md overflow-y-auto border-l border-white/[0.08] bg-[#0c100e] p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-200/60">Contexto del análisis</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.025em]">Datos utilizados</h2><p className="mt-2 text-sm leading-6 text-white/40">Estos son los valores que la IA recibe para interpretar y simular tu escenario.</p></div><button onClick={() => setContextOpen(false)} aria-label="Cerrar datos" className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-white/45 hover:bg-white/5 hover:text-white">×</button></div><div className="mt-7 space-y-1">{contextFields.map(([label, value]) => <div key={label} className="flex items-start justify-between gap-4 border-b border-white/[0.06] py-3"><span className="text-sm text-white/40">{label}</span><span className="max-w-[55%] break-words text-right text-sm font-medium text-white/80">{String(value ?? "—")}</span></div>)}</div><div className="mt-7 rounded-xl border border-white/[0.07] bg-white/[0.025] p-4"><p className="text-sm font-semibold text-white/70">Resultado capturado</p><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-white/40">{String(draft?.results.resumen || "No hay un resumen disponible.")}</p></div>{scenarioHref && <Link href={scenarioHref} className="mt-5 block rounded-xl border border-white/12 bg-black px-4 py-2.5 text-center text-sm font-semibold text-white/80 hover:bg-zinc-900">Abrir escenario vinculado</Link>}</aside></div>}
    </div>}

    <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} returnTo={draft?.calculatorPath ?? "/perfil"} onAuthenticated={() => { setAuthOpen(false); void ask("analysis"); }}/>
  </>;
}
