"use client";

import { useEffect, useState } from "react";

import AuthModal from "@/components/AuthModal";
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
      const legacy = await supabase.from("saved_scenarios").insert({
        user_id: userData.user.id,
        calculator_type: scenario.calculatorType,
        title: customTitle?.trim() || defaultTitle(scenario),
        inputs: { ...scenario.inputs, calculator_path: scenario.calculatorPath },
        results: scenario.results,
      });
      saveError = legacy.error;
      if (!legacy.error) quota = { allowed: true, scenario_id: null, used: 0, quota_limit: 3, resets_at: null, plan: "free" };
    }

    if (saveError) {
      setStatus("No pudimos verificar el cupo. Aplicá la migración 006 de Supabase.");
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
    setStatus("Escenario guardado correctamente.");
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
    <section className="mx-auto max-w-5xl border-b border-white/[0.07] py-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold">¿Querés volver a este cálculo?</h2>
          <p className="mt-1 text-sm text-white/55">
            Gratis: hasta 3 por día · Pro: escenarios ilimitados.
          </p>
        </div>
        <button
          type="button"
          onClick={beginSave}
          disabled={saving}
          className="shrink-0 rounded-full border border-white/15 bg-black px-4 py-2 text-sm font-medium text-white/90 transition hover:border-white/25 hover:bg-zinc-900 hover:text-white disabled:opacity-60"
        >
          {saving ? "Guardando..." : "Guardar escenario"}
        </button>
      </div>

      {nameOpen && draft && (
        <form
          className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]"
          onSubmit={async (event) => {
            event.preventDefault();
            await persist(draft, title);
          }}
        >
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder={`Nombre opcional · ${defaultTitle(draft)}`}
            className="rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm outline-none focus:border-white/20"
          />
          <button className="rounded-full bg-white px-4 py-2.5 text-sm font-medium text-zinc-950 transition hover:bg-zinc-200">
            Confirmar guardado
          </button>
        </form>
      )}

      {status && <p className="mt-4 text-sm text-white/70">{status}</p>}

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
