"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

import AuthModal from "@/components/AuthModal";
import {
  AiAssistantMark,
  AiComposer,
  AiConversationStream,
  type AiChatMessage,
  type AiQuotaStatus,
} from "@/components/ai/AiConversation";
import { parseAiApiResponse } from "@/lib/ai/apiResponse";
import { trackEvent } from "@/lib/analytics";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { ScenarioDraft } from "@/types/scenario";

type Conversation = { id: string; title: string; updated_at: string };
type ScenarioQuotaResult = { allowed: boolean; scenario_id: string | null; resets_at: string | null };
type RetryRequest = { mode: "analysis" | "chat"; question?: string };
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

const AI_CLIENT_TIMEOUT_MS = 55_000;

class AiRequestError extends Error {
  retryable: boolean;
  requestId?: string;

  constructor(message: string, retryable: boolean, requestId?: string) {
    super(message);
    this.name = "AiRequestError";
    this.retryable = retryable;
    this.requestId = requestId;
  }
}

function createClientRequestId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;
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

function formatHistoryDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "short", timeZone: "America/Argentina/Buenos_Aires" }).format(date);
}

function formatContextLabel(label: string) {
  const readable = label.replace(/[_-]+/g, " ").trim();
  return readable ? readable.charAt(0).toUpperCase() + readable.slice(1) : label;
}

export default function AiAssistant({ draft, hasResults, initialConversationId, initialScenarioId = null, standalone = false, onClose, conversationTitle, scenarioHref, onRename }: Props) {
  const [authOpen, setAuthOpen] = useState(false);
  const [open, setOpen] = useState(standalone);
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(Boolean(initialConversationId));
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(initialConversationId ?? null);
  const [scenarioId, setScenarioId] = useState<string | null>(initialScenarioId);
  const [history, setHistory] = useState<Conversation[]>([]);
  const [error, setError] = useState("");
  const [errorRequestId, setErrorRequestId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [copied, setCopied] = useState(false);
  const [copiedMessageIndex, setCopiedMessageIndex] = useState<number | null>(null);
  const [quota, setQuota] = useState<AiQuotaStatus | null>(null);
  const [retryRequest, setRetryRequest] = useState<RetryRequest | null>(null);
  const [retryAllowed, setRetryAllowed] = useState(false);
  const [contextOpen, setContextOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [historyMenuId, setHistoryMenuId] = useState<string | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const cancelConfirmRef = useRef<HTMLButtonElement>(null);
  const analysisTriggerRef = useRef<HTMLButtonElement>(null);
  const chatTitleRef = useRef<HTMLHeadingElement>(null);
  const requestControllerRef = useRef<AbortController | null>(null);

  const showError = useCallback((nextError: string, requestId?: string | null) => {
    setError(nextError);
    setErrorRequestId(requestId ?? null);
  }, []);

  useEffect(() => () => requestControllerRef.current?.abort(), []);

  useEffect(() => {
    if (!open && !confirmOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [open, confirmOpen]);

  useEffect(() => {
    if (!confirmOpen) return;
    cancelConfirmRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setConfirmOpen(false);
        window.requestAnimationFrame(() => analysisTriggerRef.current?.focus());
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [confirmOpen]);

  useEffect(() => {
    if (!open) return;
    window.requestAnimationFrame(() => chatTitleRef.current?.focus());
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (contextOpen) setContextOpen(false);
      else if (mobileNavOpen) setMobileNavOpen(false);
      else if (actionsOpen) setActionsOpen(false);
      else if (historyMenuId) setHistoryMenuId(null);
      else if (onClose) onClose();
      else if (!standalone) {
        setOpen(false);
        window.requestAnimationFrame(() => analysisTriggerRef.current?.focus());
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [actionsOpen, contextOpen, historyMenuId, mobileNavOpen, onClose, open, standalone]);

  const loadHistory = useCallback(async () => {
    const supabase = getSupabaseClient();
    if (!supabase || !draft) return;
    const { data } = await supabase.from("ai_conversations").select("id,title,updated_at").eq("calculator_type", draft.calculatorType).order("updated_at", { ascending: false }).limit(8);
    setHistory((data as Conversation[]) ?? []);
  }, [draft]);

  useEffect(() => { if (open) void loadHistory(); }, [open, loadHistory]);

  useEffect(() => {
    if (!initialConversationId) {
      setLoadingHistory(false);
      return;
    }
    const supabase = getSupabaseClient();
    if (!supabase) {
      setLoadingHistory(false);
      return;
    }
    let active = true;
    setLoadingHistory(true);
    void supabase.from("ai_messages").select("role,content").eq("conversation_id", initialConversationId).order("created_at").then(({ data, error: loadError }) => {
      if (!active) return;
      if (loadError) showError("No se pudo recuperar esta conversación.");
      else setMessages((data as AiChatMessage[]) ?? []);
      setLoadingHistory(false);
    });
    return () => { active = false; };
  }, [initialConversationId, showError]);

  async function requireSession() {
    const supabase = getSupabaseClient();
    if (!supabase) { showError("Falta configurar Supabase."); return null; }
    try {
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        showError("No pudimos verificar tu sesión. Volvé a intentar.");
        return null;
      }
      if (!data.session) { setAuthOpen(true); return null; }
      return data.session;
    } catch {
      showError("No pudimos verificar tu sesión. Volvé a intentar.");
      return null;
    }
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
    if (dbError) return null;
    setConversationId(data.id);
    return data.id as string;
  }

  async function persistMessage(id: string, userId: string, item: AiChatMessage) {
    const supabase = getSupabaseClient();
    if (!supabase) return false;
    const { error: persistError } = await supabase.from("ai_messages").insert({ conversation_id: id, user_id: userId, ...item });
    return !persistError;
  }

  async function ask(mode: "analysis" | "chat", question?: string) {
    if (!draft || !hasResults) { showError("Primero completá la calculadora para generar un análisis."); return; }
    setRetryRequest({ mode, question });
    const session = await requireSession();
    if (!session) return;
    setOpen(true);
    setLoading(true);
    showError("");
    setNotice("");
    setRetryAllowed(true);
    const userMessage: AiChatMessage | null = mode === "chat" && question ? { role: "user", content: question } : null;
    const previous = messages;
    if (userMessage) {
      setMessages([...previous, userMessage]);
      setMessage("");
    }

    requestControllerRef.current?.abort();
    const requestController = new AbortController();
    requestControllerRef.current = requestController;
    const clientRequestId = createClientRequestId();
    let clientTimedOut = false;
    const clientTimeout = window.setTimeout(() => {
      clientTimedOut = true;
      requestController.abort();
    }, AI_CLIENT_TIMEOUT_MS);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
          "X-Client-Request-Id": clientRequestId,
        },
        body: JSON.stringify({ mode, context: draft, messages: previous.slice(-20), message: question }),
        cache: "no-store",
        signal: requestController.signal,
      });
      const rawResponse = await response.text();
      window.clearTimeout(clientTimeout);
      const data = parseAiApiResponse(rawResponse);
      const responseRequestId = data?.requestId || response.headers.get("x-request-id") || clientRequestId;

      if (!data) {
        throw new AiRequestError(
          "El servidor devolvió una respuesta inesperada. Volvé a intentar en unos minutos.",
          response.ok || response.status >= 500,
          responseRequestId,
        );
      }

      if (data.quota) {
        setQuota({ kind: mode, used: data.quota.used, limit: data.quota.limit, plan: data.quota.plan });
      }

      if (!response.ok || !data.text?.trim()) {
        if (response.status === 401) setAuthOpen(true);
        const retryable = data.retryable ?? (response.status === 408 || response.status >= 500);
        throw new AiRequestError(data.error || "No pudimos obtener una respuesta.", retryable, responseRequestId);
      }

      const assistantMessage: AiChatMessage = { role: "assistant", content: data.text };
      setMessages(userMessage ? [...previous, userMessage, assistantMessage] : [...previous, assistantMessage]);
      setRetryRequest(null);
      setRetryAllowed(false);
      showError("");
      trackEvent(mode === "analysis" ? "ai_analysis" : "ai_followup", { calculator_name: draft.calculatorName, calculator_type: draft.calculatorType });

      try {
        const linkedScenarioId = mode === "analysis" && !conversationId
          ? await saveAnalysisScenario()
          : scenarioId;
        const id = await ensureConversation(session.user.id, linkedScenarioId);
        if (!id) {
          setNotice((current) => current || "Recibiste la respuesta, pero no pudimos guardarla en tu historial. Podés copiarla antes de cerrar.");
        } else {
          const userSaved = userMessage ? await persistMessage(id, session.user.id, userMessage) : true;
          const assistantSaved = await persistMessage(id, session.user.id, assistantMessage);
          if (!userSaved || !assistantSaved) {
            setNotice((current) => current || "Recibiste la respuesta, pero no pudimos guardar todo el intercambio en tu historial. Podés copiarlo antes de cerrar.");
          }
          await loadHistory();
        }
      } catch {
        setNotice((current) => current || "Recibiste la respuesta, pero no pudimos guardarla en tu historial. Podés copiarla antes de cerrar.");
      }
    } catch (requestError) {
      if (userMessage) {
        setMessages(previous);
        setMessage(question ?? "");
      }

      if (requestError instanceof AiRequestError) {
        setRetryAllowed(requestError.retryable);
        showError(requestError.message, requestError.requestId);
      } else if (requestController.signal.aborted) {
        setRetryAllowed(clientTimedOut);
        showError(
          clientTimedOut
            ? "La consulta tardó demasiado y se canceló. Volvé a intentar."
            : "La consulta fue cancelada.",
          clientRequestId,
        );
      } else {
        setRetryAllowed(true);
        showError("No pudimos conectar con la IA. Revisá tu conexión y volvé a intentar.", clientRequestId);
      }
    } finally {
      window.clearTimeout(clientTimeout);
      if (requestControllerRef.current === requestController) {
        requestControllerRef.current = null;
        setLoading(false);
      }
    }
  }

  function requestAnalysis() {
    showError("");
    if (!draft || !hasResults) {
      showError("Primero completá la calculadora para generar un análisis.");
      return;
    }
    setConfirmOpen(true);
  }

  function confirmAnalysis() {
    setConfirmOpen(false);
    void ask("analysis");
  }

  function newConversation() {
    requestControllerRef.current?.abort();
    requestControllerRef.current = null;
    setLoading(false);
    setMobileNavOpen(false);
    setConversationId(null);
    setScenarioId(null);
    setMessages([]);
    showError("");
    setNotice("");
    setQuota(null);
    setRetryRequest(null);
    setRetryAllowed(false);
    if (standalone) window.location.assign("/calculadoras");
    else if (onClose) onClose();
    else {
      setOpen(false);
      window.requestAnimationFrame(() => analysisTriggerRef.current?.focus());
    }
  }

  async function copyConversation() {
    try {
      await navigator.clipboard.writeText(messages.map((item) => `${item.role === "user" ? "Vos" : "Asistente IA"}:\n${item.content}`).join("\n\n"));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      showError("No pudimos copiar la conversación. Revisá los permisos del navegador.");
    }
  }

  async function copyMessage(index: number, content: string) {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageIndex(index);
      window.setTimeout(() => setCopiedMessageIndex((current) => current === index ? null : current), 1600);
    } catch {
      showError("No pudimos copiar la respuesta. Revisá los permisos del navegador.");
    }
  }

  const submitMessage = () => {
    if (message.trim() && !loading) void ask("chat", message.trim());
  };

  const closeChat = () => {
    if (onClose) onClose();
    else {
      setOpen(false);
      window.requestAnimationFrame(() => analysisTriggerRef.current?.focus());
    }
  };

  const retryLastRequest = retryRequest && retryAllowed
    ? () => { void ask(retryRequest.mode, retryRequest.question); }
    : undefined;

  async function renameCurrentAnalysis() {
    if (!onRename || !conversationTitle) return;
    const nextTitle = window.prompt("Nuevo nombre para este análisis", conversationTitle);
    if (!nextTitle?.trim() || nextTitle.trim() === conversationTitle) return;
    setRenaming(true);
    try { await onRename(nextTitle.trim()); }
    catch { showError("No se pudo cambiar el nombre del análisis."); }
    finally { setRenaming(false); }
  }

  async function renameHistoryAnalysis(item: Conversation) {
    const title = window.prompt("Nuevo nombre para este análisis", item.title);
    if (!title?.trim() || title.trim() === item.title) return;
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const { error: renameError } = await supabase.from("ai_conversations").update({ title: title.trim() }).eq("id", item.id);
    if (renameError) showError("No se pudo cambiar el nombre del análisis.");
    else setHistory((current) => current.map((conversation) => conversation.id === item.id ? { ...conversation, title: title.trim() } : conversation));
    setHistoryMenuId(null);
  }

  async function deleteHistoryAnalysis(item: Conversation) {
    if (!window.confirm(`¿Eliminar “${item.title}” y toda su conversación?`)) return;
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const { error: deleteError } = await supabase.from("ai_conversations").delete().eq("id", item.id);
    if (deleteError) showError("No se pudo eliminar el análisis.");
    else {
      setHistory((current) => current.filter((conversation) => conversation.id !== item.id));
      if (item.id === conversationId) closeChat();
    }
    setHistoryMenuId(null);
  }

  function renderHistoryItems(closeOnNavigate = false) {
    if (history.length === 0) {
      return <p className="rounded-xl border border-dashed border-white/[0.07] px-3 py-4 text-sm leading-5 text-white/38">Tus análisis recientes aparecerán acá.</p>;
    }

    return history.map((item) => {
      const active = conversationId === item.id;
      return (
        <div key={item.id} className={`group/history relative flex items-center rounded-xl border transition ${active ? "border-emerald-300/[0.15] bg-[linear-gradient(110deg,rgba(16,185,129,0.12),rgba(255,255,255,0.025))] shadow-[inset_3px_0_0_rgba(110,231,183,0.55)]" : "border-transparent hover:border-white/[0.06] hover:bg-white/[0.035]"}`}>
          <Link
            href={`/perfil/analisis/${item.id}`}
            onClick={closeOnNavigate ? () => setMobileNavOpen(false) : undefined}
            aria-current={active ? "page" : undefined}
            className="min-w-0 flex-1 px-3 py-2.5"
          >
            <span className={`block truncate text-sm font-semibold ${active ? "text-white" : "text-white/52 group-hover/history:text-white/78"}`}>{item.title}</span>
            <span className="mt-0.5 block text-[10px] font-medium text-white/28">Actualizado {formatHistoryDate(item.updated_at)}</span>
          </Link>
          <button
            type="button"
            onClick={() => setHistoryMenuId((current) => current === item.id ? null : item.id)}
            aria-label={`Opciones de ${item.title}`}
            aria-expanded={historyMenuId === item.id}
            className="mr-1 grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white/35 opacity-70 transition hover:bg-white/[0.08] hover:text-white group-hover/history:opacity-100"
          >
            <MoreIcon />
          </button>
          {historyMenuId === item.id && (
            <div role="menu" className="absolute right-1 top-[calc(100%+0.25rem)] z-30 w-40 overflow-hidden rounded-xl border border-emerald-300/[0.13] bg-[#0b120e] p-1.5 text-sm shadow-2xl">
              <Link role="menuitem" href={`/perfil/analisis/${item.id}`} onClick={closeOnNavigate ? () => setMobileNavOpen(false) : undefined} className="block rounded-lg px-3 py-2 text-white/70 hover:bg-white/[0.06] hover:text-white">Abrir</Link>
              <button role="menuitem" type="button" onClick={() => void renameHistoryAnalysis(item)} className="block w-full rounded-lg px-3 py-2 text-left text-white/70 hover:bg-white/[0.06] hover:text-white">Renombrar</button>
              <div className="my-1 h-px bg-white/[0.07]" />
              <button role="menuitem" type="button" onClick={() => void deleteHistoryAnalysis(item)} className="block w-full rounded-lg px-3 py-2 text-left text-red-300/75 hover:bg-red-500/10 hover:text-red-200">Eliminar</button>
            </div>
          )}
        </div>
      );
    });
  }

  const contextFields = draft ? Object.entries(draft.inputs.campos && typeof draft.inputs.campos === "object" && !Array.isArray(draft.inputs.campos) ? draft.inputs.campos : draft.inputs) : [];

  return <>
    {!standalone && <section className="ai-surface relative flex h-full flex-col overflow-hidden border-t border-white/[0.08] p-6 sm:p-8 md:border-t-0">
      <div className="pointer-events-none absolute -right-16 -top-20 size-44 rounded-full bg-emerald-300/[0.055] blur-3xl" />
      <div className="relative flex items-start gap-4">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-emerald-300/20 bg-emerald-300/[0.06] text-xs font-black text-emerald-100/82">02</span>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-emerald-200/55">Lectura estratégica</p>
          <h2 className="mt-2 text-xl font-bold tracking-[-0.025em] text-white">Entendé qué te dicen los números</h2>
          <p className="mt-2.5 text-sm leading-6 text-white/55">Recibí un diagnóstico conectado a este cálculo y seguí preguntando sin volver a explicar el contexto.</p>
        </div>
      </div>
      <div className="relative mt-5 flex flex-wrap gap-2 pl-[3.25rem]">
        {["Riesgos", "Oportunidades", "Próximos pasos"].map((label) => <span key={label} className="rounded-full border border-white/[0.075] bg-black/15 px-2.5 py-1 text-[10px] font-bold text-white/48">{label}</span>)}
      </div>
      <div className="relative mt-auto pt-6">
        <button ref={analysisTriggerRef} type="button" onClick={requestAnalysis} disabled={loading || !hasResults} className="group flex min-h-12 w-full items-center justify-between rounded-xl bg-emerald-300 px-4 py-3 text-sm font-black text-emerald-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-55"><span>{loading ? "Preparando análisis…" : hasResults ? "Analizar este resultado" : "Calculá para analizar"}</span><span aria-hidden="true" className="text-base font-normal transition-transform group-hover:translate-x-0.5">→</span></button>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] font-medium text-white/34"><span>Se descuenta al confirmar</span><Link href="/precios" className="text-emerald-200/65 transition hover:text-emerald-100">Ver planes</Link></div>
      </div>
      {!open && error && <p role="alert" className="relative mt-4 rounded-xl border border-red-300/15 bg-red-500/[0.065] px-3 py-2.5 text-sm leading-5 text-red-100/82">{error}</p>}
      {!open && notice && <p role="status" className="relative mt-4 rounded-xl border border-emerald-300/[0.12] bg-emerald-300/[0.045] px-3 py-2.5 text-sm leading-5 text-emerald-100/72">{notice}</p>}
    </section>}

    {open && <div role="dialog" aria-modal="true" aria-label="Chat de análisis con IA" className="ai-surface fixed inset-x-0 top-0 z-[120] flex h-[100dvh] overflow-hidden bg-[#050806] text-white before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_68%_0%,rgba(52,211,153,0.075),transparent_32rem)]">
      <aside className="relative hidden w-[304px] shrink-0 flex-col border-r border-emerald-300/[0.11] bg-[linear-gradient(180deg,rgba(10,20,14,0.98),rgba(5,10,7,0.99))] p-4 shadow-[20px_0_70px_rgba(0,0,0,0.18)] lg:flex">
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-300/[0.1] bg-emerald-300/[0.035] px-3 py-3"><AiAssistantMark/><div><p className="text-base font-semibold tracking-[-0.01em]">Asistente de análisis</p><p className="text-xs text-emerald-100/38">Calculadora Emprendedora</p></div></div>
        <button onClick={newConversation} className="mt-5 flex min-h-12 items-center justify-between rounded-2xl border border-emerald-300/[0.13] bg-[linear-gradient(135deg,rgba(16,185,129,0.08),rgba(255,255,255,0.025))] px-4 py-3 text-sm font-semibold text-white/76 transition hover:border-emerald-300/25 hover:bg-emerald-300/[0.08] hover:text-white"><span>Nuevo análisis</span><span className="grid size-7 place-items-center rounded-full border border-white/10 bg-black/20 text-base font-light text-white/55">＋</span></button>
        <div className="mt-7 px-2"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/25">Contexto actual</p><div className="mt-3 border-l border-emerald-300/25 py-1 pl-3"><p className="truncate text-sm font-medium text-white/75">{draft?.calculatorName}</p><div className="mt-2 flex items-center gap-2 text-xs text-white/30"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300"/>Datos y resultados conectados</div></div></div>
        <div className="mt-7 min-h-0 flex-1 overflow-y-auto px-1"><p className="px-2 text-[10px] font-bold uppercase tracking-[0.15em] text-white/34">Conversaciones</p><div className="mt-3 space-y-1.5">{renderHistoryItems()}</div></div>
        <p className="border-t border-white/[0.07] px-2 pb-1 pt-4 text-xs leading-5 text-white/34">Las respuestas son orientativas. Validá decisiones sensibles con un profesional.</p>
      </aside>

      <section aria-label="Análisis del escenario" className="relative flex min-w-0 flex-1 flex-col">
        <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-emerald-300/[0.1] bg-[linear-gradient(100deg,rgba(10,19,13,0.97),rgba(6,10,8,0.94))] px-3 shadow-[0_14px_45px_rgba(0,0,0,0.12)] backdrop-blur-xl sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" onClick={() => setMobileNavOpen(true)} aria-label="Abrir historial de análisis" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/[0.08] text-white/52 transition hover:bg-white/[0.06] hover:text-white lg:hidden"><span className="space-y-1"><i className="block h-px w-4 bg-current"/><i className="block h-px w-4 bg-current"/><i className="block h-px w-4 bg-current"/></span></button>
            <div className="min-w-0">
              <div className="flex items-center gap-2.5"><h2 ref={chatTitleRef} tabIndex={-1} className="truncate text-[15px] font-bold tracking-[-0.015em] text-white outline-none sm:text-lg">{conversationTitle || draft?.calculatorName}</h2><span className="hidden items-center gap-1.5 rounded-full border border-emerald-300/15 bg-emerald-300/[0.05] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-emerald-200/70 sm:flex"><i className="h-1.5 w-1.5 rounded-full bg-emerald-300"/>Contexto conectado</span></div>
              <p className="mt-0.5 truncate text-[11px] font-medium text-white/38">{loadingHistory ? "Cargando conversación…" : `${draft?.calculatorName} · ${messages.length} ${messages.length === 1 ? "mensaje" : "mensajes"}`}</p>
            </div>
          </div>
          <div className="relative flex items-center gap-1.5">
            <button type="button" onClick={() => setContextOpen(true)} aria-label="Ver datos utilizados" className="flex h-10 items-center gap-2 rounded-xl border border-transparent px-2.5 text-white/46 transition hover:border-white/[0.08] hover:bg-white/[0.05] hover:text-white/82"><DataIcon/><span className="hidden text-xs font-bold sm:inline">Datos</span></button>
            <button type="button" onClick={() => setActionsOpen((current) => !current)} aria-label="Más opciones" aria-expanded={actionsOpen} aria-controls="ai-actions-menu" className="grid h-10 w-10 place-items-center rounded-xl border border-transparent text-white/46 transition hover:border-white/[0.08] hover:bg-white/[0.05] hover:text-white/82"><MoreIcon/></button>
            <button type="button" onClick={closeChat} aria-label={standalone ? "Volver a mis análisis" : "Cerrar chat"} className="grid h-10 w-10 place-items-center rounded-xl border border-transparent text-xl font-light text-white/46 transition hover:border-white/[0.08] hover:bg-white/[0.05] hover:text-white/82">×</button>
            {actionsOpen && <div id="ai-actions-menu" role="menu" className="absolute right-0 top-11 z-30 w-52 overflow-hidden rounded-xl border border-emerald-300/[0.12] bg-[#0b120e] p-1.5 text-sm shadow-2xl">{onRename && <button role="menuitem" type="button" onClick={() => { setActionsOpen(false); void renameCurrentAnalysis(); }} disabled={renaming} className="block w-full rounded-lg px-3 py-2 text-left text-white/70 hover:bg-white/[0.06] hover:text-white">{renaming ? "Guardando…" : "Renombrar análisis"}</button>}{scenarioHref && <Link role="menuitem" href={scenarioHref} className="block rounded-lg px-3 py-2 text-white/70 hover:bg-white/[0.06] hover:text-white">Abrir escenario</Link>}{messages.length > 0 && <button role="menuitem" type="button" onClick={() => { setActionsOpen(false); void copyConversation(); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-white/70 hover:bg-white/[0.06] hover:text-white"><CopyIcon/>{copied ? "Conversación copiada" : "Copiar conversación"}</button>}<div className="my-1 h-px bg-white/[0.07]"/><button role="menuitem" type="button" onClick={closeChat} className="block w-full rounded-lg px-3 py-2 text-left text-white/70 hover:bg-white/[0.06] hover:text-white">{standalone ? "Volver a mis análisis" : "Cerrar chat"}</button></div>}
          </div>
        </header>

        <AiConversationStream
          messages={messages}
          calculatorName={draft?.calculatorName}
          loading={loading}
          loadingHistory={loadingHistory}
          error={error}
          errorRequestId={errorRequestId}
          notice={notice}
          copiedMessageIndex={copiedMessageIndex}
          onCopyMessage={(index, content) => { void copyMessage(index, content); }}
          onRetry={retryLastRequest}
        />
        <AiComposer
          value={message}
          loading={loading || loadingHistory}
          quota={quota}
          showSuggestions={messages.some((item) => item.role === "assistant") && !loading}
          onChange={setMessage}
          onSubmit={submitMessage}
        />
      </section>

      {mobileNavOpen && <div className="fixed inset-0 z-[135] flex bg-black/70 backdrop-blur-md lg:hidden" onClick={() => setMobileNavOpen(false)}><aside className="flex h-full w-[min(88vw,320px)] flex-col border-r border-emerald-300/[0.12] bg-[linear-gradient(180deg,#0b160f,#060a07)] p-4 shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="flex items-center justify-between rounded-2xl border border-emerald-300/[0.09] bg-emerald-300/[0.03] px-3 py-3"><div className="flex items-center gap-3"><AiAssistantMark/><div><p className="text-base font-semibold">Asistente de análisis</p><p className="text-xs text-white/38">Tus conversaciones</p></div></div><button onClick={() => setMobileNavOpen(false)} aria-label="Cerrar historial" className="grid h-8 w-8 place-items-center rounded-lg border border-white/[0.08] text-xl text-white/40 hover:bg-white/[0.06] hover:text-white">×</button></div><button onClick={newConversation} className="mt-5 flex min-h-11 items-center justify-between rounded-xl border border-emerald-300/[0.13] bg-emerald-300/[0.045] px-4 py-2.5 text-sm font-semibold text-white/72 transition hover:bg-emerald-300/[0.08] hover:text-white"><span>Nuevo análisis</span><span className="text-base font-light text-white/50">＋</span></button><div className="mt-7 min-h-0 flex-1 overflow-y-auto px-1"><p className="px-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/28">Conversaciones</p><div className="mt-2 space-y-1">{renderHistoryItems(true)}</div></div><p className="border-t border-white/[0.07] px-2 pb-2 pt-4 text-xs leading-5 text-white/35">La IA usa los datos del cálculo para mantener el contexto.</p></aside></div>}

      {contextOpen && <div className="fixed inset-0 z-[140] flex justify-end bg-black/65 backdrop-blur-md" onClick={() => setContextOpen(false)}><aside className="h-full w-full max-w-md overflow-y-auto border-l border-emerald-300/[0.13] bg-[linear-gradient(180deg,#0c1710,#060a07)] p-6 shadow-[0_0_100px_rgba(0,0,0,0.55)]" onClick={(event) => event.stopPropagation()}><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-200/60">Contexto del análisis</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.025em]">Datos utilizados</h2><p className="mt-2 text-sm leading-6 text-white/42">Estos son los valores que la IA recibe para interpretar y simular tu escenario.</p></div><button onClick={() => setContextOpen(false)} aria-label="Cerrar datos" className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-white/45 hover:bg-white/5 hover:text-white">×</button></div><div className="mt-7 overflow-hidden rounded-2xl border border-white/[0.07] bg-black/15 px-4">{contextFields.map(([label, value]) => <div key={label} className="flex items-start justify-between gap-4 border-b border-white/[0.06] py-3.5 last:border-b-0"><span className="text-sm text-white/42">{formatContextLabel(label)}</span><span className="max-w-[55%] break-words text-right text-sm font-medium text-white/82">{String(value ?? "—")}</span></div>)}</div><div className="mt-7 rounded-2xl border border-emerald-300/[0.1] bg-emerald-300/[0.035] p-4"><p className="text-sm font-semibold text-white/72">Resultado capturado</p><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-white/42">{String(draft?.results.resumen || "No hay un resumen disponible.")}</p></div>{scenarioHref && <Link href={scenarioHref} className="mt-5 block rounded-xl border border-emerald-300/[0.14] bg-emerald-300/[0.045] px-4 py-2.5 text-center text-sm font-semibold text-white/82 hover:bg-emerald-300/[0.08]">Abrir escenario vinculado</Link>}</aside></div>}
    </div>}

    {confirmOpen && <div className="fixed inset-0 z-[150] grid place-items-center bg-black/75 px-4 backdrop-blur-md" onClick={() => { setConfirmOpen(false); window.requestAnimationFrame(() => analysisTriggerRef.current?.focus()); }}>
      <section role="alertdialog" aria-modal="true" aria-labelledby="confirm-analysis-title" aria-describedby="confirm-analysis-description" className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-emerald-300/[0.18] bg-[linear-gradient(145deg,#101a13_0%,#090e0b_52%,#07100a_100%)] p-6 shadow-[0_35px_120px_rgba(0,0,0,0.62)] sm:p-8" onClick={(event) => event.stopPropagation()}>
        <div className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-emerald-300/[0.09] blur-3xl"/>
        <div className="relative">
          <div className="flex items-start gap-4"><AiAssistantMark/><div><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-200/55">Confirmación necesaria</p><h2 id="confirm-analysis-title" className="mt-2 text-2xl font-bold tracking-[-0.03em]">¿Iniciar el análisis con IA?</h2></div></div>
          <p id="confirm-analysis-description" className="mt-5 text-sm leading-7 text-white/58">Vamos a enviar los datos y resultados de <strong className="text-white/85">{draft?.calculatorName}</strong> al asistente. Al continuar se usará <strong className="text-white/85">1 análisis disponible</strong> de tu plan.</p>
          <div className="mt-5 rounded-2xl border border-emerald-300/[0.11] bg-emerald-300/[0.035] p-4"><p className="text-sm font-semibold text-emerald-100/78">Todavía no se consumió ningún análisis.</p><p className="mt-1 text-xs leading-5 text-white/38">Podés cancelar y revisar los números antes de confirmar.</p></div>
          <div className="mt-7 grid gap-3 sm:grid-cols-2"><button ref={cancelConfirmRef} type="button" onClick={() => { setConfirmOpen(false); window.requestAnimationFrame(() => analysisTriggerRef.current?.focus()); }} className="rounded-full border border-white/12 bg-black/25 px-4 py-3 text-sm font-bold text-white/72 transition hover:border-white/22 hover:bg-white/[0.05] hover:text-white">Cancelar</button><button type="button" onClick={confirmAnalysis} className="rounded-full border border-emerald-200/40 bg-emerald-300 px-4 py-3 text-sm font-black text-emerald-950 shadow-[0_12px_35px_rgba(16,185,129,0.15)] transition hover:bg-emerald-200">Sí, iniciar análisis</button></div>
        </div>
      </section>
    </div>}

    <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} returnTo={draft?.calculatorPath ?? "/perfil"} onAuthenticated={() => {
      setAuthOpen(false);
      void ask(retryRequest?.mode ?? "analysis", retryRequest?.question);
    }}/>
  </>;
}
