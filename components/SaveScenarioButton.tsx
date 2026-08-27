"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import AuthModal from "@/components/AuthModal";
import { trackEvent } from "@/lib/analytics";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { ScenarioDraft } from "@/types/scenario";

const PENDING_KEY = "calculadora-emprendedora:pending-scenario";

type Props = {
  draft: ScenarioDraft | null;
  hasResults: boolean;
};
type ScenarioQuotaResult = {
  allowed: boolean;
  scenario_id: string | null;
  used: number;
  quota_limit: number | null;
  resets_at: string | null;
  plan: "free" | "pro";
};

function defaultTitle(draft: ScenarioDraft) {
  return `${draft.calculatorName} · ${new Intl.DateTimeFormat("es-AR").format(new Date())}`;
}

export default function SaveScenarioButton({ draft, hasResults }: Props) {
  const [authOpen, setAuthOpen] = useState(false);
  const [nameOpen, setNameOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedScenarioId, setSavedScenarioId] = useState<string | null>(null);

  async function persist(scenario: ScenarioDraft, customTitle?: string) {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setStatus("Falta configurar Supabase para guardar escenarios.");
      return false;
    }

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return false;

    setSaving(true);
    setStatus("Guardando...");

    const { data, error: quotaError } = await supabase.rpc("save_scenario_with_quota", {
      p_calculator_type: scenario.calculatorType,
      p_title: customTitle?.trim() || defaultTitle(scenario),
      p_inputs: {
        ...scenario.inputs,
        calculator_path: scenario.calculatorPath,
      },
      p_results: scenario.results,
    });

    setSaving(false);
    let quota = (data as ScenarioQuotaResult[] | null)?.[0];
    let saveError = quotaError;

    // Mantiene el guardado anterior durante el breve despliegue previo a la
    // migración 006. Una vez creada la función, todo pasa por la cuota segura.
    if (quotaError?.code === "PGRST202") {
      const legacy = await supabase
        .from("saved_scenarios")
        .insert({
          user_id: userData.user.id,
          calculator_type: scenario.calculatorType,
          title: customTitle?.trim() || defaultTitle(scenario),
          inputs: { ...scenario.inputs, calculator_path: scenario.calculatorPath },
          results: scenario.results,
        })
        .select("id")
        .single();
      saveError = legacy.error;
      if (!legacy.error) quota = { allowed: true, scenario_id: legacy.data.id, used: 0, quota_limit: 3, resets_at: null, plan: "free" };
    }

    if (saveError) {
      setStatus("No pudimos guardar el escenario en este momento. Volvé a intentar en unos segundos.");
      return false;
    }
    if (!quota?.allowed) {
      const reset = quota?.resets_at
        ? new Intl.DateTimeFormat("es-AR", { timeZone: "America/Argentina/Buenos_Aires", dateStyle: "medium", timeStyle: "short" }).format(new Date(quota.resets_at))
        : "mañana";
      setStatus(`Ya guardaste los 3 escenarios de hoy. El cupo gratuito vuelve el ${reset}; en Pro son ilimitados.`);
      return false;
    }

    sessionStorage.removeItem(PENDING_KEY);
    setNameOpen(false);
    setTitle("");
    setSavedScenarioId(quota.scenario_id);
    setStatus("Escenario guardado correctamente.");
    trackEvent("save_scenario", { calculator_name: scenario.calculatorName, calculator_type: scenario.calculatorType, plan: quota.plan });
    return true;
  }

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    async function savePending() {
      const pending = sessionStorage.getItem(PENDING_KEY);
      if (!pending) return;
      const { data } = await supabase!.auth.getSession();
      if (!data.session) return;

      try {
        await persist(JSON.parse(pending) as ScenarioDraft);
      } catch {
        sessionStorage.removeItem(PENDING_KEY);
      }
    }

    void savePending();
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") void savePending();
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function beginSave() {
    setStatus("");
    setSavedScenarioId(null);
    if (!hasResults || !draft) {
      setStatus("Primero completá la calculadora para guardar un escenario.");
      return;
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      setStatus("Falta configurar Supabase para guardar escenarios.");
      return;
    }

    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      sessionStorage.setItem(PENDING_KEY, JSON.stringify(draft));
      setAuthOpen(true);
      return;
    }

    setNameOpen(true);
  }

  return (
    <section className="flex h-full flex-col p-6 sm:p-8">
      <div className="flex items-start gap-4">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/[0.1] bg-white/[0.035] text-xs font-semibold text-white/55">01</span>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/32">Historial personal</p>
          <h2 className="mt-1.5 text-lg font-semibold tracking-[-0.02em] text-white">Guardar escenario</h2>
          <p className="mt-2 text-sm leading-6 text-white/48">Conservá los valores y resultados para revisarlos o compararlos más adelante.</p>
        </div>
      </div>

      <div className="mt-auto pt-6">
        <button
          type="button"
          onClick={beginSave}
          disabled={saving}
          className="flex min-h-11 w-full items-center justify-between rounded-xl border border-white/[0.13] bg-white/[0.045] px-4 py-3 text-sm font-semibold text-white/88 transition hover:border-white/25 hover:bg-white/[0.075] hover:text-white disabled:cursor-not-allowed disabled:opacity-55"
        >
          <span>{saving ? "Guardando..." : "Guardar escenario"}</span>
          <span aria-hidden="true" className="text-base font-normal text-white/40">＋</span>
        </button>
        <p className="mt-3 text-xs leading-5 text-white/28">Gratis: hasta 3 por día · Pro: escenarios ilimitados.</p>
      </div>

      {nameOpen && draft && (
        <form
          className="mt-4 grid gap-3"
          onSubmit={async (event) => {
            event.preventDefault();
            await persist(draft, title);
          }}
        >
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder={`Nombre opcional · ${defaultTitle(draft)}`}
            className="rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm outline-none transition focus:border-emerald-300/30"
          />
          <button className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200">
            Confirmar guardado
          </button>
        </form>
      )}

      {status && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <p className="text-sm text-white/70">{status}</p>
          {savedScenarioId ? (
            <Link
              href={`/perfil/escenarios/${savedScenarioId}`}
              className="rounded-lg bg-emerald-300 px-3.5 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-200"
            >
              Ver escenario guardado
            </Link>
          ) : null}
        </div>
      )}

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        returnTo={draft?.calculatorPath ?? "/perfil"}
        onAuthenticated={async () => {
          setAuthOpen(false);
          const pending = sessionStorage.getItem(PENDING_KEY);
          if (pending) await persist(JSON.parse(pending) as ScenarioDraft);
        }}
      />
    </section>
  );
}
