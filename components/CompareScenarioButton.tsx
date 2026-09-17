"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import AuthModal from "@/components/AuthModal";
import { trackEvent } from "@/lib/analytics";
import { canCompareScenarios, effectivePlan, PLAN_LABELS, PLAN_LIMITS, type PlanName } from "@/lib/plans";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { ScenarioDraft } from "@/types/scenario";

type ScenarioQuotaResult = {
  allowed: boolean;
  scenario_id: string | null;
};

function defaultTitle(draft: ScenarioDraft) {
  return `${draft.calculatorName} · comparación · ${new Intl.DateTimeFormat("es-AR").format(new Date())}`;
}

export default function CompareScenarioButton({ draft, hasResults }: { draft: ScenarioDraft; hasResults: boolean }) {
  const router = useRouter();
  const [authOpen, setAuthOpen] = useState(false);
  const [gatePlan, setGatePlan] = useState<PlanName | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!gatePlan) return;
    const trigger = triggerRef.current;
    closeRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setGatePlan(null);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      trigger?.focus();
    };
  }, [gatePlan]);

  async function beginComparison() {
    setStatus("");
    if (!hasResults) {
      setStatus("Primero completá la calculadora para crear la comparación.");
      return;
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      setStatus("La cuenta no está disponible en este momento.");
      return;
    }

    setLoading(true);
    try {
      const { data: auth } = await supabase.auth.getSession();
      if (!auth.session) {
        setAuthOpen(true);
        trackEvent("compare_login_required", { calculator_type: draft.calculatorType });
        return;
      }

      const { data: planRow } = await supabase
        .from("user_plans")
        .select("plan,status,current_period_end")
        .eq("user_id", auth.session.user.id)
        .maybeSingle();
      const plan = effectivePlan(planRow);
      if (!canCompareScenarios(plan)) {
        setGatePlan(plan);
        trackEvent("compare_plan_required", { calculator_type: draft.calculatorType, plan });
        return;
      }

      const { data, error } = await supabase.rpc("save_scenario_with_quota", {
        p_calculator_type: draft.calculatorType,
        p_title: defaultTitle(draft),
        p_inputs: { ...draft.inputs, calculator_path: draft.calculatorPath },
        p_results: draft.results,
      });
      if (error) throw error;
      const saved = (data as ScenarioQuotaResult[] | null)?.[0];
      if (!saved?.allowed || !saved.scenario_id) throw new Error("scenario-not-saved");

      trackEvent("start_scenario_comparison", { calculator_type: draft.calculatorType, plan });
      router.push(`/perfil?view=escenarios&compare=${saved.scenario_id}`);
    } catch {
      setStatus("No pudimos preparar la comparación. Volvé a intentar en unos segundos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="flex h-full flex-col p-6 sm:p-8">
      <div className="flex items-start gap-4">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-emerald-200/[0.16] bg-emerald-200/[0.06] text-xs font-semibold text-emerald-100/70">02</span>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-200/42">Tomá una decisión</p>
          <h2 className="mt-1.5 text-lg font-semibold tracking-[-0.02em] text-white">Comparar escenarios</h2>
          <p className="mt-2 text-sm leading-6 text-white/48">Guardá este resultado y comparalo con otra alternativa de la misma calculadora.</p>
        </div>
      </div>

      <div className="mt-auto pt-6">
        <button
          ref={triggerRef}
          type="button"
          onClick={beginComparison}
          disabled={loading}
          className="flex min-h-11 w-full items-center justify-between rounded-xl border border-emerald-200/[0.18] bg-emerald-300/[0.07] px-4 py-3 text-sm font-semibold text-emerald-50/88 transition hover:border-emerald-200/30 hover:bg-emerald-300/[0.11] hover:text-white disabled:cursor-wait disabled:opacity-55"
        >
          <span>{loading ? "Preparando..." : "Comparar con otro escenario"}</span>
          <span aria-hidden="true" className="text-base font-normal text-emerald-100/45">⇄</span>
        </button>
        {status ? <p role="status" className="mt-3 text-xs leading-5 text-amber-100/75">{status}</p> : null}
      </div>

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        returnTo={draft.calculatorPath}
        initialMode="signup"
        contextTitle="Registrate gratis para guardar y comparar tus escenarios"
        contextDescription="Creá tu cuenta gratis y conservá tus resultados para seguir trabajando con tus escenarios."
        onAuthenticated={() => {
          setAuthOpen(false);
          void beginComparison();
        }}
      />

      {gatePlan ? (
        <div className="fixed inset-0 z-[120] grid place-items-center bg-black/75 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) setGatePlan(null); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="compare-plan-title" className="w-full max-w-lg rounded-[28px] border border-emerald-300/20 bg-[#090c0a] p-6 shadow-[0_30px_100px_rgba(0,0,0,.6)] sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-200/55">Comparación lado a lado</p>
                <h2 id="compare-plan-title" className="mt-3 text-2xl font-semibold tracking-tight">Esta función está incluida en Pro</h2>
              </div>
              <button ref={closeRef} type="button" onClick={() => setGatePlan(null)} aria-label="Cerrar" className="grid size-9 shrink-0 place-items-center rounded-full border border-white/10 text-white/45 hover:bg-white/5 hover:text-white">×</button>
            </div>
            <p className="mt-4 text-sm leading-7 text-white/52">Tu plan actual es <strong className="text-white/85">{PLAN_LABELS[gatePlan]}</strong>. Podés conservar hasta {PLAN_LIMITS[gatePlan].scenarios ?? "todos tus"} escenarios, pero la comparación interactiva se habilita desde Pro.</p>
            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              <button type="button" onClick={() => setGatePlan(null)} className="rounded-full border border-white/12 px-4 py-3 text-sm font-semibold text-white/65 hover:bg-white/5 hover:text-white">Seguir calculando</button>
              <Link href="/precios#plan-pro" onClick={() => trackEvent("compare_upgrade_click", { plan: gatePlan })} className="rounded-full bg-emerald-300 px-4 py-3 text-center text-sm font-black text-emerald-950 hover:bg-emerald-200">Ver Pro · US$ 19.99</Link>
            </div>
          </section>
        </div>
      ) : null}
    </section>
  );
}
