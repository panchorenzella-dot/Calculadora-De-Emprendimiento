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

    const { error } = await supabase.from("saved_scenarios").insert({
      user_id: userData.user.id,
      calculator_type: scenario.calculatorType,
      title: customTitle?.trim() || defaultTitle(scenario),
      inputs: {
        ...scenario.inputs,
        calculator_path: scenario.calculatorPath,
      },
      results: scenario.results,
    });

    setSaving(false);
    if (error) {
      setStatus(`Error al guardar: ${error.message}`);
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
            Guardalo gratis y encontralo después en tu perfil.
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
