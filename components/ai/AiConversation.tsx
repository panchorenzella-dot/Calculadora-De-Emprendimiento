"use client";

import { useEffect, useMemo, useRef } from "react";

import AiMarkdown from "@/components/ai/AiMarkdown";

export type AiChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type AiQuotaStatus = {
  kind: "analysis" | "chat";
  used: number;
  limit: number;
  plan: "free" | "pro";
};

type AiConversationStreamProps = {
  messages: AiChatMessage[];
  calculatorName?: string;
  loading: boolean;
  loadingHistory: boolean;
  error: string;
  notice: string;
  copiedMessageIndex: number | null;
  onCopyMessage: (index: number, content: string) => void;
  onRetry?: () => void;
};

type AiComposerProps = {
  value: string;
  loading: boolean;
  quota: AiQuotaStatus | null;
  showSuggestions: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
};

const SUGGESTIONS = [
  "¿Cuál es el principal riesgo de este escenario?",
  "Dame 3 próximos pasos concretos",
  "¿Qué dato debería revisar primero?",
  "Simulá una mejora del 10%",
];

export function AiAssistantMark({ compact = false }: { compact?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`relative grid shrink-0 place-items-center overflow-hidden rounded-xl border border-emerald-200/20 bg-[linear-gradient(145deg,rgba(110,231,183,0.16),rgba(16,185,129,0.035))] font-black tracking-[0.08em] text-emerald-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] ${compact ? "h-8 w-8 text-[9px]" : "h-10 w-10 text-[10px]"}`}
    >
      <span className="absolute inset-x-1 top-0 h-px bg-gradient-to-r from-transparent via-emerald-100/50 to-transparent" />
      IA
    </span>
  );
}

function CopyIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="8" y="8" width="11" height="11" rx="2" />
      <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="m4 12 16-8-5.4 16-3.2-6.6L4 12Z" />
      <path d="m11.4 13.4 4-4" />
    </svg>
  );
}

function EmptyConversation({ calculatorName }: { calculatorName?: string }) {
  return (
    <div className="mx-auto flex min-h-full max-w-3xl items-center py-8 sm:py-12">
      <div className="relative w-full overflow-hidden rounded-[1.75rem] border border-emerald-300/[0.14] bg-[linear-gradient(145deg,rgba(16,185,129,0.085),rgba(255,255,255,0.022)_52%,rgba(5,12,8,0.92))] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.24)] sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-24 size-60 rounded-full bg-emerald-300/[0.07] blur-3xl" />
        <div className="relative flex items-start gap-4">
          <AiAssistantMark />
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-200/60">Escenario conectado</p>
            <h3 className="mt-2 text-2xl font-bold tracking-[-0.035em] text-white">Tu análisis de {calculatorName || "este cálculo"}</h3>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/55">Voy a convertir tus resultados en una lectura clara: qué está funcionando, qué conviene vigilar y dónde actuar primero.</p>
          </div>
        </div>
        <div className="relative mt-7 grid gap-2 sm:grid-cols-3">
          {[
            ["01", "Lectura de números"],
            ["02", "Riesgos y oportunidades"],
            ["03", "Plan de acción"],
          ].map(([number, label]) => (
            <div key={number} className="rounded-2xl border border-white/[0.07] bg-black/20 px-4 py-3.5">
              <span className="text-[10px] font-bold tracking-[0.14em] text-emerald-200/55">{number}</span>
              <p className="mt-1.5 text-sm font-semibold text-white/74">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HistoryLoading() {
  return (
    <div role="status" className="mx-auto flex min-h-full max-w-2xl items-center justify-center py-16 text-center">
      <div>
        <AiAssistantMark />
        <div className="mx-auto mt-5 flex w-fit gap-1.5" aria-hidden="true">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-200/65 motion-reduce:animate-none" />
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-200/65 [animation-delay:150ms] motion-reduce:animate-none" />
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-200/65 [animation-delay:300ms] motion-reduce:animate-none" />
        </div>
        <p className="mt-3 text-sm font-semibold text-white/62">Recuperando tu conversación…</p>
      </div>
    </div>
  );
}

export function AiConversationStream({ messages, calculatorName, loading, loadingHistory, error, notice, copiedMessageIndex, onCopyMessage, onRetry }: AiConversationStreamProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const firstAssistantIndex = useMemo(() => messages.findIndex((item) => item.role === "assistant"), [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: messages.length > 1 ? "smooth" : "auto", block: "end" });
  }, [messages, loading, error, notice]);

  return (
    <section
      aria-label="Conversación con el asistente"
      aria-live="polite"
      aria-relevant="additions text"
      className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-[radial-gradient(circle_at_70%_0%,rgba(16,185,129,0.055),transparent_28rem),linear-gradient(180deg,#070b08_0%,#050806_100%)]"
      role="log"
    >
      <div className="mx-auto min-h-full max-w-4xl px-4 py-7 sm:px-8 sm:py-10">
        {loadingHistory ? <HistoryLoading /> : messages.length === 0 && !loading ? <EmptyConversation calculatorName={calculatorName} /> : null}

        {!loadingHistory && (
          <div className="space-y-6 sm:space-y-7">
            {messages.map((item, index) => {
              if (item.role === "user") {
                return (
                  <article key={`${item.role}-${index}`} aria-label="Tu mensaje" className="ml-auto max-w-[92%] sm:max-w-[76%]">
                    <p className="mb-1.5 pr-1 text-right text-[10px] font-bold uppercase tracking-[0.13em] text-white/38">Vos</p>
                    <div className="rounded-2xl rounded-br-md border border-emerald-200/[0.14] bg-[linear-gradient(135deg,rgba(16,185,129,0.16),rgba(255,255,255,0.045))] px-4 py-3 text-[15px] leading-6 text-white/88 shadow-[0_10px_30px_rgba(0,0,0,0.14)] sm:px-5">
                      <p className="whitespace-pre-wrap break-words">{item.content}</p>
                    </div>
                  </article>
                );
              }

              const primary = index === firstAssistantIndex;
              return (
                <article
                  key={`${item.role}-${index}`}
                  aria-label={primary ? "Análisis principal del asistente" : "Respuesta del asistente"}
                  className={`group/message relative overflow-hidden ${primary ? "rounded-[1.65rem] border border-emerald-300/[0.13] bg-[linear-gradient(145deg,rgba(255,255,255,0.04),rgba(16,185,129,0.022)_58%,rgba(0,0,0,0.18))] p-5 shadow-[0_20px_65px_rgba(0,0,0,0.18)] sm:p-7" : "rounded-2xl border border-white/[0.065] bg-white/[0.018] p-4 sm:p-5"}`}
                >
                  {primary && <div className="pointer-events-none absolute -right-20 -top-20 size-48 rounded-full bg-emerald-300/[0.045] blur-3xl" />}
                  <div className="relative grid grid-cols-[32px_minmax(0,1fr)] gap-3.5 sm:grid-cols-[36px_minmax(0,1fr)] sm:gap-4">
                    <AiAssistantMark compact />
                    <div className="min-w-0">
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.065] pb-3">
                        <p className="text-xs font-bold uppercase tracking-[0.1em] text-white/52">Asistente IA</p>
                        {primary && <span className="rounded-full border border-emerald-300/[0.13] bg-emerald-300/[0.045] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.11em] text-emerald-200/65">Análisis del escenario</span>}
                      </div>
                      <AiMarkdown content={item.content} />
                      <div className="mt-4 flex justify-end border-t border-white/[0.055] pt-3">
                        <button
                          type="button"
                          onClick={() => onCopyMessage(index, item.content)}
                          aria-label={copiedMessageIndex === index ? "Respuesta copiada" : "Copiar respuesta"}
                          className="flex min-h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-white/38 transition hover:bg-white/[0.045] hover:text-white/75 focus-visible:text-white"
                        >
                          <CopyIcon />
                          {copiedMessageIndex === index ? "Copiado" : "Copiar"}
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}

            {loading && (
              <div role="status" aria-label="El asistente está preparando una respuesta" className="grid grid-cols-[32px_minmax(0,1fr)] gap-3.5 rounded-2xl border border-emerald-300/[0.1] bg-emerald-300/[0.025] p-4 sm:grid-cols-[36px_minmax(0,1fr)] sm:p-5">
                <AiAssistantMark compact />
                <div className="flex min-h-8 items-center gap-3 text-sm font-semibold text-white/55">
                  <span className="flex gap-1.5" aria-hidden="true">
                    <i className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-200/70 motion-reduce:animate-none" />
                    <i className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-200/70 [animation-delay:150ms] motion-reduce:animate-none" />
                    <i className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-200/70 [animation-delay:300ms] motion-reduce:animate-none" />
                  </span>
                  {messages.length === 0 ? "Preparando tu diagnóstico…" : "Revisando el escenario…"}
                </div>
              </div>
            )}

            {error && (
              <div role="alert" className="rounded-2xl border border-red-300/15 bg-red-500/[0.065] p-4 text-sm leading-6 text-red-50/82 sm:flex sm:items-center sm:justify-between sm:gap-4">
                <div><p className="font-bold text-red-50/90">No pudimos completar la consulta</p><p className="mt-0.5">{error}</p></div>
                {onRetry && <button type="button" onClick={onRetry} className="mt-3 shrink-0 rounded-full border border-red-200/20 bg-black/20 px-3.5 py-2 text-xs font-bold text-red-50/85 transition hover:bg-red-100/10 hover:text-white sm:mt-0">Volver a intentar</button>}
              </div>
            )}

            {notice && <p role="status" className="rounded-2xl border border-emerald-300/[0.12] bg-emerald-300/[0.045] px-4 py-3 text-sm leading-6 text-emerald-50/72">{notice}</p>}
            <div ref={bottomRef} aria-hidden="true" className="h-px" />
          </div>
        )}
      </div>
    </section>
  );
}

export function AiComposer({ value, loading, quota, showSuggestions, onChange, onSubmit }: AiComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatQuota = quota?.kind === "chat" ? quota : null;
  const remaining = chatQuota ? Math.max(0, chatQuota.limit - chatQuota.used) : null;

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 144)}px`;
  }, [value]);

  function selectSuggestion(suggestion: string) {
    onChange(suggestion);
    window.requestAnimationFrame(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(suggestion.length, suggestion.length);
    });
  }

  return (
    <footer className="shrink-0 border-t border-emerald-300/[0.09] bg-[linear-gradient(180deg,rgba(5,8,6,0.94),#050806)] px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2.5 shadow-[0_-18px_55px_rgba(0,0,0,0.2)] sm:px-6 sm:pb-5 sm:pt-3">
      <div className="mx-auto max-w-4xl">
        {showSuggestions && (
          <div className="mb-2.5 flex items-center gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="Preguntas sugeridas">
            <span className="hidden shrink-0 pl-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white/30 sm:inline">Sugerencias</span>
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => selectSuggestion(suggestion)}
                className="min-h-8 shrink-0 rounded-full border border-white/[0.08] bg-white/[0.025] px-3 text-xs font-semibold text-white/55 transition hover:border-emerald-300/20 hover:bg-emerald-300/[0.045] hover:text-white/82"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (value.trim() && !loading) onSubmit();
          }}
          className="rounded-[1.35rem] border border-emerald-300/[0.16] bg-[linear-gradient(135deg,rgba(17,29,21,0.98),rgba(8,14,10,0.99))] p-1.5 shadow-[0_18px_55px_rgba(0,0,0,0.38)] transition focus-within:border-emerald-300/35 focus-within:shadow-[0_18px_55px_rgba(0,0,0,0.38),0_0_0_3px_rgba(110,231,183,0.04)]"
        >
          <div className="flex items-end gap-2">
            <label htmlFor="ai-message" className="sr-only">Escribí una pregunta sobre tu escenario</label>
            <textarea
              ref={textareaRef}
              id="ai-message"
              value={value}
              onChange={(event) => onChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                  event.preventDefault();
                  if (value.trim() && !loading) onSubmit();
                }
              }}
              aria-describedby="ai-message-hint"
              aria-busy={loading}
              maxLength={4000}
              placeholder={loading ? "Esperá la respuesta para seguir…" : "Preguntá, profundizá o pedí una simulación…"}
              rows={1}
              className="block max-h-36 min-h-11 min-w-0 flex-1 resize-none bg-transparent px-3 py-2.5 text-[15px] leading-6 text-white outline-none placeholder:text-white/32 disabled:cursor-wait"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !value.trim()}
              aria-label={loading ? "Esperando respuesta" : "Enviar mensaje"}
              className="mb-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-emerald-200/25 bg-emerald-300 text-emerald-950 shadow-[0_8px_24px_rgba(16,185,129,0.15)] transition hover:bg-emerald-200 disabled:border-white/[0.06] disabled:bg-white/[0.065] disabled:text-white/20"
            >
              <SendIcon />
            </button>
          </div>
        </form>
        <div id="ai-message-hint" className="mt-1.5 flex min-h-4 items-center justify-between gap-3 px-1 text-[10px] font-medium text-white/30">
          <span className="hidden sm:inline">Enter envía · Shift + Enter agrega una línea</span>
          <span className="sm:hidden">Revisá tu pregunta antes de enviar</span>
          {remaining !== null ? <span className={remaining <= 1 ? "text-amber-200/70" : "text-white/34"}>{remaining} {remaining === 1 ? "mensaje disponible" : "mensajes disponibles"} {chatQuota?.plan === "free" ? "hoy" : "este mes"}</span> : <span>La IA puede equivocarse</span>}
        </div>
      </div>
    </footer>
  );
}
