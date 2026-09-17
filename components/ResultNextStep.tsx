"use client";

import { useEffect, useSyncExternalStore } from "react";
import { classifyBusinessOutcome, getResultNextStep, type BusinessOutcome } from "@/lib/resultNextStep";
import { ecosystemTools } from "@/lib/ecosystem";
import { trackEvent } from "@/lib/analytics";

const storageKey = "ce:business-next-step:v1";
const updateEvent = "ce:business-next-step-updated";
let memory = { count: 0, lastSignature: "" };

function readSession() {
  if (typeof window === "undefined") return memory;
  try {
    const stored = JSON.parse(window.sessionStorage.getItem(storageKey) || "null");
    if (stored && Number.isInteger(stored.count) && stored.count >= 0 && stored.count <= 5 && typeof stored.lastSignature === "string") return stored as typeof memory;
  } catch { /* The recommendation still works when browser storage is unavailable. */ }
  return memory;
}

function subscribe(callback: () => void) {
  window.addEventListener(updateEvent, callback);
  return () => window.removeEventListener(updateEvent, callback);
}

function getSnapshot() { return readSession().count; }
function getServerSnapshot() { return 0; }

export default function ResultNextStep({ outcome, calculatorPath }: { outcome: BusinessOutcome; calculatorPath: string }) {
  const { marginPct, unitProfit, monthlyProfit, plannedUnits, breakEvenUnits, includesFixedCosts } = outcome;
  const status = classifyBusinessOutcome(outcome);
  const weakAttempts = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  // Keep only a short fingerprint and an attempt count in this browser session.
  // Financial values are neither stored nor included in analytics or destination URLs.
  const signature = [calculatorPath, marginPct, unitProfit, monthlyProfit, plannedUnits, breakEvenUnits, includesFixedCosts].join("|")
    .split("").reduce((hash, character) => Math.imul(hash ^ character.charCodeAt(0), 16777619), 2166136261).toString(16);

  useEffect(() => {
    const previous = readSession();
    if (status !== "weak" || previous.lastSignature === signature) return;
    memory = { count: Math.min(previous.count + 1, 5), lastSignature: signature };
    try { window.sessionStorage.setItem(storageKey, JSON.stringify(memory)); } catch { /* Use memory for this page visit. */ }
    window.dispatchEvent(new Event(updateEvent));
  }, [signature, status]);

  const nextStep = getResultNextStep(outcome, weakAttempts);
  if (!nextStep) return null;
  const isDiagnosis = nextStep === "diagnosis";
  const href = isDiagnosis ? `${ecosystemTools[0].href.replace(/\/$/, "")}/diagnostico` : ecosystemTools[1].href;
  return (
    <aside aria-label="Próximo paso para tu negocio" className="mt-5 rounded-2xl border border-emerald-300/20 bg-emerald-300/[0.055] p-5">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-emerald-200/80">{isDiagnosis ? "Ordená un plan de mejora" : "Explorá tu próximo paso"}</p>
      <h3 className="mt-2 text-lg font-bold text-white">{isDiagnosis ? "Los números piden una revisión más completa" : "Tu escenario tiene margen y cubre sus costos"}</h3>
      <p className="mt-3 text-sm leading-6 text-white/65">{isDiagnosis
        ? "Probaste más de un escenario con pérdidas o ventas insuficientes. El Diagnóstico 360° de Growtella te ayuda a encontrar prioridades y armar un plan de acción."
        : "Si estás evaluando vender tu proyecto o recibir ofertas, podés explorar Compra Negocio. Estos resultados son una estimación con los costos que cargaste; no determinan el valor de tu negocio."}</p>
      <a href={href} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent("result_next_step_click", { calculator_path: calculatorPath, next_step: nextStep })} className="mt-4 inline-flex rounded-full bg-white px-4 py-2.5 text-sm font-bold !text-zinc-950 transition hover:bg-emerald-100">
        {isDiagnosis ? "Hacer el Diagnóstico 360°" : "Explorar Compra Negocio"} ↗
        <span className="sr-only"> (se abre en una nueva pestaña)</span>
      </a>
    </aside>
  );
}
