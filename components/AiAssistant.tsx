"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

import AuthModal from "@/components/AuthModal";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { ScenarioDraft } from "@/types/scenario";

type Message = { role: "user" | "assistant"; content: string };
type Conversation = { id: string; title: string; updated_at: string };
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

function SparkIcon({ className = "h-5 w-5" }: { className?: string }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none"><path d="M12 2.75c.5 4.72 4.02 8.24 8.75 8.75-4.73.5-8.25 4.02-8.75 8.75-.5-4.73-4.02-8.25-8.75-8.75C7.98 11 11.5 7.47 12 2.75Z" fill="currentColor"/><path d="M19 2.5c.14 1.32 1.18 2.36 2.5 2.5-1.32.14-2.36 1.18-2.5 2.5A2.82 2.82 0 0 0 16.5 5 2.82 2.82 0 0 0 19 2.5Z" fill="currentColor" opacity=".45"/></svg>;
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

  async function saveAnalysisScenario(userId: string) {
    if (scenarioId) return scenarioId;
    const supabase = getSupabaseClient();
    if (!supabase || !draft) return null;
    const title = `Análisis IA · ${draft.calculatorName} · ${new Intl.DateTimeFormat("es-AR").format(new Date())}`;
    const { data, error: scenarioError } = await supabase.from("saved_scenarios").insert({
      user_id: userId,
      calculator_type: draft.calculatorType,
      title,
      inputs: { ...draft.inputs, calculator_path: draft.calculatorPath },
      results: draft.results,
    }).select("id").single();
    if (scenarioError) {
      setError(`No pudimos guardar el escenario del análisis: ${scenarioError.message}`);
      return null;
    }
    setScenarioId(data.id);
    return data.id as string;
  }

  async function ensureConversation(userId: string, linkedScenarioId?: string | null) {
    if (conversationId) return conversationId;
    const supabase = getSupabaseClient();
    if (!supabase || !draft) return null;
    const { data, error: dbError } = await supabase.from("ai_conversations").insert({ user_id: userId, calculator_type: draft.calculatorType, calculator_name: draft.calculatorName, calculator_path: draft.calculatorPath, title: `Análisis · ${draft.calculatorName}`, context: draft, scenario_id: linkedScenarioId ?? null }).select("id").single();
    if (dbError) { setError("No pudimos crear la conversación. Verificá que las migraciones de IA estén aplicadas."); return null; }
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
    const linkedScenarioId = mode === "analysis" && !conversationId
      ? await saveAnalysisScenario(session.user.id)
      : scenarioId;
    if (mode === "analysis" && !conversationId && !linkedScenarioId) { setLoading(false); return; }
    const id = await ensureConversation(session.user.id, linkedScenarioId);
    if (!id) { setLoading(false); return; }
    const userMessage: Message | null = mode === "chat" && question ? { role: "user", content: question } : null;
    const previous = messages;
    if (userMessage) {
      setMessages([...previous, userMessage]);
      setMessage("");
      await persistMessage(id, session.user.id, userMessage);
    }
    try {
      const response = await fetch("/api/ai", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` }, body: JSON.stringify({ mode, context: draft, messages: previous.slice(-20), message: question }) });
      const data = await response.json() as { text?: string; error?: string };
      if (!response.ok || !data.text) throw new Error(data.error || "No pudimos obtener una respuesta.");
      const assistantMessage: Message = { role: "assistant", content: data.text };
      setMessages((current) => [...current, assistantMessage]);
      await persistMessage(id, session.user.id, assistantMessage);
      await loadHistory();
    } catch (requestError) {
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
    {!standalone && <section className="mx-auto mt-8 max-w-5xl border-y border-white/[0.07] py-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-full border border-emerald-300/20 bg-emerald-300/[0.06] text-emerald-200"><SparkIcon className="h-4 w-4"/></span><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/45">Asistente inteligente</p><p className="mt-0.5 text-sm text-emerald-200/70">Análisis contextual de tu cálculo</p></div></div>
          <h2 className="mt-4 text-xl font-semibold tracking-tight sm:text-2xl">Convertí el resultado en decisiones concretas</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/50">Recibí un diagnóstico detallado y continuá en un chat libre que ya conoce todos los números de este escenario.</p>
        </div>
        <button onClick={() => void ask("analysis")} disabled={loading} className="group shrink-0 rounded-full border border-white/15 bg-black px-4 py-2 text-sm font-medium text-white/90 transition hover:border-white/25 hover:bg-zinc-900 hover:text-white disabled:opacity-60">{loading ? "Preparando análisis..." : <span className="flex items-center gap-2">Iniciar análisis <span className="transition-transform group-hover:translate-x-0.5">→</span></span>}</button>
      </div>
      {!open && error && <p className="mt-5 rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}
    </section>}

    {open && <div role="dialog" aria-modal="true" aria-label="Chat de análisis con IA" className="fixed inset-0 z-[120] flex bg-[#08090a] text-white">
      <aside className="hidden w-[286px] shrink-0 flex-col border-r border-white/[0.07] bg-[#0b0c0e] p-4 lg:flex">
        <div className="flex items-center gap-3 px-2 py-2"><span className="grid h-9 w-9 place-items-center rounded-full border border-emerald-300/20 bg-emerald-300/[0.07] text-emerald-200"><SparkIcon className="h-4 w-4"/></span><div><p className="text-base font-semibold">Asistente IA</p><p className="text-xs text-white/35">Calculadora Emprendedora</p></div></div>
        <button onClick={newConversation} className="mt-5 flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 text-sm font-medium text-white/70 transition hover:bg-white/[0.07] hover:text-white"><span className="text-base font-light">＋</span> Nuevo análisis</button>
        <div className="mt-7 px-2"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/25">Contexto actual</p><div className="mt-3 border-l border-emerald-300/25 py-1 pl-3"><p className="truncate text-sm font-medium text-white/75">{draft?.calculatorName}</p><div className="mt-2 flex items-center gap-2 text-xs text-white/30"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300"/>Datos y resultados conectados</div></div></div>
        <div className="mt-7 min-h-0 flex-1 overflow-y-auto px-2"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/25">Conversaciones</p><div className="mt-2 space-y-1">{history.length === 0 ? <p className="py-3 text-sm leading-5 text-white/25">Tus análisis recientes aparecerán acá.</p> : history.map((item) => <div key={item.id} className={`group/history relative flex items-center rounded-lg transition ${conversationId === item.id ? "bg-white/[0.07]" : "hover:bg-white/[0.04]"}`}><Link href={`/perfil/analisis/${item.id}`} className={`min-w-0 flex-1 truncate px-3 py-2 text-sm ${conversationId === item.id ? "text-white" : "text-white/40 group-hover/history:text-white/70"}`}>{item.title}</Link><button onClick={() => setHistoryMenuId((current) => current === item.id ? null : item.id)} aria-label={`Opciones de ${item.title}`} className="mr-1 grid h-7 w-7 shrink-0 place-items-center rounded-full text-white/35 opacity-60 transition hover:bg-white/[0.08] hover:text-white group-hover/history:opacity-100"><MoreIcon/></button>{historyMenuId === item.id && <div className="absolute right-0 top-9 z-30 w-40 overflow-hidden rounded-xl border border-white/10 bg-[#191a1c] p-1.5 text-sm shadow-2xl"><Link href={`/perfil/analisis/${item.id}`} className="block rounded-lg px-3 py-2 text-white/70 hover:bg-white/[0.06] hover:text-white">Abrir</Link><button onClick={() => void renameHistoryAnalysis(item)} className="block w-full rounded-lg px-3 py-2 text-left text-white/70 hover:bg-white/[0.06] hover:text-white">Renombrar</button><div className="my-1 h-px bg-white/[0.07]"/><button onClick={() => void deleteHistoryAnalysis(item)} className="block w-full rounded-lg px-3 py-2 text-left text-red-300/75 hover:bg-red-500/10 hover:text-red-200">Eliminar</button></div>}</div>)}</div></div>
        <p className="px-2 pb-2 text-xs leading-5 text-white/20">Las respuestas son orientativas. Validá decisiones sensibles con un profesional.</p>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-white/[0.07] bg-[#090a0b]/90 px-4 backdrop-blur-xl sm:px-6">
          <div className="flex min-w-0 items-center gap-2.5"><button onClick={() => setMobileNavOpen(true)} aria-label="Abrir historial" className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-white/45 transition hover:bg-white/[0.06] hover:text-white lg:hidden"><span className="space-y-1"><i className="block h-px w-4 bg-current"/><i className="block h-px w-4 bg-current"/><i className="block h-px w-4 bg-current"/></span></button><div className="min-w-0"><div className="flex items-center gap-2"><h2 className="truncate text-base font-medium sm:text-lg">{conversationTitle || draft?.calculatorName}</h2><span className="hidden rounded-full border border-emerald-300/15 bg-emerald-300/[0.05] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald-200/70 sm:inline">Contexto activo</span></div><p className="mt-0.5 truncate text-xs text-white/35">{draft?.calculatorName} · {messages.length} mensajes</p></div></div>
          <div className="relative flex items-center gap-1.5">
            <button onClick={() => setContextOpen(true)} aria-label="Ver datos utilizados" title="Ver datos" className="grid h-9 w-9 place-items-center rounded-full text-white/40 transition hover:bg-white/[0.06] hover:text-white/80"><DataIcon/></button>
            <button onClick={() => setActionsOpen((current) => !current)} aria-label="Más opciones" className="grid h-9 w-9 place-items-center rounded-full text-white/40 transition hover:bg-white/[0.06] hover:text-white/80"><MoreIcon/></button>
            {actionsOpen && <div className="absolute right-0 top-11 z-30 w-48 overflow-hidden rounded-xl border border-white/10 bg-[#191a1c] p-1.5 text-sm shadow-2xl">{onRename && <button onClick={() => { setActionsOpen(false); void renameCurrentAnalysis(); }} disabled={renaming} className="block w-full rounded-lg px-3 py-2 text-left text-white/70 hover:bg-white/[0.06] hover:text-white">{renaming ? "Guardando..." : "Renombrar análisis"}</button>}{scenarioHref && <Link href={scenarioHref} className="block rounded-lg px-3 py-2 text-white/70 hover:bg-white/[0.06] hover:text-white">Abrir escenario</Link>}{messages.length > 0 && <button onClick={() => { setActionsOpen(false); void copyConversation(); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-white/70 hover:bg-white/[0.06] hover:text-white"><CopyIcon/>{copied ? "Copiado" : "Copiar conversación"}</button>}<div className="my-1 h-px bg-white/[0.07]"/><button onClick={closeChat} className="block w-full rounded-lg px-3 py-2 text-left text-white/70 hover:bg-white/[0.06] hover:text-white">{standalone ? "Volver al perfil" : "Cerrar chat"}</button></div>}
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto bg-[radial-gradient(circle_at_50%_-10%,rgba(110,231,183,0.045),transparent_30rem)]">
          <div className="mx-auto max-w-4xl px-4 pb-36 pt-8 sm:px-8 sm:pt-12">
            {messages.length === 0 && !loading && <div className="mx-auto max-w-md py-20 text-center"><span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.035] text-emerald-200"><SparkIcon/></span><h3 className="mt-5 text-lg font-medium">Tu análisis comienza acá</h3><p className="mt-2 text-sm leading-6 text-white/35">Voy a estudiar el resultado, los supuestos, riesgos y oportunidades antes de abrir la conversación.</p></div>}
            <div className="space-y-9">{messages.map((item, index) => item.role === "user" ? <div key={index} className="ml-auto max-w-[88%] rounded-[22px] rounded-br-md bg-white/[0.07] px-4 py-2.5 text-[15px] leading-6 text-white/85 sm:max-w-[72%]">{item.content}</div> : <article key={index} className="grid gap-3 sm:grid-cols-[36px_1fr]"><span className="grid h-9 w-9 place-items-center rounded-full border border-emerald-300/15 bg-emerald-300/[0.055] text-emerald-200"><SparkIcon className="h-4 w-4"/></span><div className="min-w-0 px-1 py-1 sm:px-2"><div className="mb-4 flex items-center justify-between"><p className="text-sm font-medium text-white/50">Análisis del asistente</p><span className="text-xs text-emerald-200/55">Basado en tus datos</span></div><AssistantContent content={item.content}/></div></article>)}
              {loading && <div className="grid gap-3 sm:grid-cols-[34px_1fr]"><span className="grid h-8 w-8 place-items-center rounded-full border border-emerald-300/15 bg-emerald-300/[0.055] text-emerald-200"><SparkIcon className="h-3.5 w-3.5"/></span><div className="px-2 py-2"><div className="flex items-center gap-3 text-sm text-white/45"><span className="flex gap-1"><i className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/35"/><i className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/35 [animation-delay:150ms]"/><i className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/35 [animation-delay:300ms]"/></span>Analizando tu escenario en profundidad</div></div></div>}
              {error && <p className="rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}
              <div ref={bottomRef}/>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#08090a] via-[#08090a] to-transparent px-4 pb-4 pt-12 lg:left-[286px] sm:px-6 sm:pb-6">
          <div className="pointer-events-auto mx-auto max-w-4xl"><form onSubmit={(event) => { event.preventDefault(); submitMessage(); }} className="relative rounded-[24px] border border-white/10 bg-[#151719] p-1.5 shadow-[0_24px_90px_rgba(0,0,0,0.5)] focus-within:border-white/20"><textarea value={message} onChange={(event) => setMessage(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); submitMessage(); } }} placeholder="Preguntá, profundizá o pedí una simulación..." rows={2} className="block max-h-36 min-h-12 w-full resize-none bg-transparent px-3 py-2 pr-12 text-[15px] leading-6 text-white outline-none placeholder:text-white/30"/><button disabled={loading || !message.trim()} aria-label="Enviar mensaje" className="absolute bottom-2.5 right-2.5 grid h-8 w-8 place-items-center rounded-full bg-white text-zinc-950 transition hover:bg-zinc-200 disabled:bg-white/10 disabled:text-white/20"><SendIcon/></button></form><p className="mt-2 text-center text-[11px] text-white/25">Enter para enviar · Shift + Enter para una nueva línea</p></div>
        </div>
      </main>

      {mobileNavOpen && <div className="fixed inset-0 z-[135] flex bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setMobileNavOpen(false)}><aside className="flex h-full w-[min(88vw,320px)] flex-col border-r border-white/[0.08] bg-[#0b0c0e] p-4 shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="flex items-center justify-between px-2 py-2"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-full border border-emerald-300/20 bg-emerald-300/[0.07] text-emerald-200"><SparkIcon className="h-4 w-4"/></span><div><p className="text-base font-semibold">Asistente IA</p><p className="text-xs text-white/35">Tus conversaciones</p></div></div><button onClick={() => setMobileNavOpen(false)} aria-label="Cerrar historial" className="grid h-8 w-8 place-items-center rounded-full text-xl text-white/40 hover:bg-white/[0.06] hover:text-white">×</button></div><button onClick={newConversation} className="mt-5 flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 text-sm font-medium text-white/70 transition hover:bg-white/[0.07] hover:text-white"><span className="text-base font-light">＋</span> Nuevo análisis</button><div className="mt-7 min-h-0 flex-1 overflow-y-auto px-1"><p className="px-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/25">Conversaciones</p><div className="mt-2 space-y-1">{history.length === 0 ? <p className="px-2 py-3 text-sm leading-5 text-white/25">Tus análisis recientes aparecerán acá.</p> : history.map((item) => <div key={item.id} className={`relative flex items-center rounded-lg transition ${conversationId === item.id ? "bg-white/[0.07]" : "hover:bg-white/[0.04]"}`}><Link href={`/perfil/analisis/${item.id}`} onClick={() => setMobileNavOpen(false)} className={`min-w-0 flex-1 truncate px-3 py-2.5 text-sm ${conversationId === item.id ? "text-white" : "text-white/50"}`}>{item.title}</Link><button onClick={() => setHistoryMenuId((current) => current === item.id ? null : item.id)} aria-label={`Opciones de ${item.title}`} className="mr-1 grid h-8 w-8 shrink-0 place-items-center rounded-full text-white/40 hover:bg-white/[0.08] hover:text-white"><MoreIcon/></button>{historyMenuId === item.id && <div className="absolute right-1 top-10 z-30 w-40 overflow-hidden rounded-xl border border-white/10 bg-[#191a1c] p-1.5 text-sm shadow-2xl"><Link href={`/perfil/analisis/${item.id}`} onClick={() => setMobileNavOpen(false)} className="block rounded-lg px-3 py-2 text-white/70 hover:bg-white/[0.06] hover:text-white">Abrir</Link><button onClick={() => void renameHistoryAnalysis(item)} className="block w-full rounded-lg px-3 py-2 text-left text-white/70 hover:bg-white/[0.06] hover:text-white">Renombrar</button><div className="my-1 h-px bg-white/[0.07]"/><button onClick={() => void deleteHistoryAnalysis(item)} className="block w-full rounded-lg px-3 py-2 text-left text-red-300/75 hover:bg-red-500/10 hover:text-red-200">Eliminar</button></div>}</div>)}</div></div><p className="px-2 pb-2 text-xs leading-5 text-white/20">La IA usa los datos del cálculo para mantener el contexto.</p></aside></div>}

      {contextOpen && <div className="fixed inset-0 z-[140] flex justify-end bg-black/55 backdrop-blur-sm" onClick={() => setContextOpen(false)}><aside className="h-full w-full max-w-md overflow-y-auto border-l border-white/[0.08] bg-[#0c0d0f] p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-200/60">Contexto del análisis</p><h2 className="mt-2 text-2xl font-medium">Datos utilizados</h2><p className="mt-2 text-sm leading-6 text-white/40">Estos son los valores que la IA recibe para interpretar y simular tu escenario.</p></div><button onClick={() => setContextOpen(false)} className="grid h-8 w-8 place-items-center rounded-full border border-white/10 text-white/45 hover:bg-white/5 hover:text-white">×</button></div><div className="mt-7 space-y-1">{contextFields.map(([label, value]) => <div key={label} className="flex items-start justify-between gap-4 border-b border-white/[0.06] py-3"><span className="text-sm text-white/40">{label}</span><span className="max-w-[55%] break-words text-right text-sm font-medium text-white/80">{String(value ?? "—")}</span></div>)}</div><div className="mt-7 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4"><p className="text-sm font-medium text-white/70">Resultado capturado</p><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-white/40">{String(draft?.results.resumen || "No hay un resumen disponible.")}</p></div>{scenarioHref && <Link href={scenarioHref} className="mt-5 block rounded-full border border-white/12 bg-black px-4 py-2 text-center text-sm font-medium text-white/80 hover:bg-zinc-900">Abrir escenario vinculado</Link>}</aside></div>}
    </div>}

    <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} returnTo={draft?.calculatorPath ?? "/perfil"} onAuthenticated={() => { setAuthOpen(false); void ask("analysis"); }}/>
  </>;
}
