"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import AuthModal from "@/components/AuthModal";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { SavedScenario } from "@/types/scenario";

function JsonBlock({ value }: { value: unknown }) {
  return (
    <pre className="mt-4 overflow-x-auto whitespace-pre-wrap rounded-xl border border-white/10 bg-zinc-950/65 p-4 text-xs leading-6 text-white/65">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

export default function ScenarioDetail({ id }: { id: string }) {
  const [scenario, setScenario] = useState<SavedScenario | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = getSupabaseClient();
      if (!supabase) {
        setError("Falta configurar Supabase.");
        setLoading(false);
        return;
      }
      const { data: auth } = await supabase.auth.getSession();
      if (!auth.session) {
        setNeedsAuth(true);
        setLoading(false);
        return;
      }
      const { data, error: queryError } = await supabase
        .from("saved_scenarios")
        .select("*")
        .eq("id", id)
        .single();
      if (queryError) setError("No se pudo encontrar este escenario.");
      else setScenario(data as SavedScenario);
      setLoading(false);
    }
    void load();
  }, [id]);

  if (loading) return <main className="mx-auto max-w-4xl px-4 py-16 text-white/60">Cargando escenario...</main>;
  if (needsAuth) return <AuthModal open returnTo={`/perfil/escenarios/${id}`} />;
  if (error || !scenario) return <main className="mx-auto max-w-4xl px-4 py-16"><p>{error}</p><Link href="/perfil" className="mt-4 inline-block text-white/60">← Volver al perfil</Link></main>;

  const calculatorPath = String(scenario.inputs.calculator_path || "/calculadoras");

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
      <Link href="/perfil" className="text-sm text-white/55 hover:text-white">← Volver al perfil</Link>
      <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.035] p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.18em] text-emerald-300/70">{scenario.calculator_type}</p>
        <h1 className="mt-3 text-3xl font-bold">{scenario.title || "Escenario guardado"}</h1>
        <p className="mt-2 text-sm text-white/45">Guardado el {new Intl.DateTimeFormat("es-AR", { dateStyle: "long" }).format(new Date(scenario.created_at))}</p>
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <section><h2 className="text-lg font-semibold">Datos cargados</h2><JsonBlock value={scenario.inputs} /></section>
          <section><h2 className="text-lg font-semibold">Resultados</h2><JsonBlock value={scenario.results} /></section>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={calculatorPath} className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-zinc-950">Abrir calculadora</Link>
          <button disabled className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-white/35">Analizar con IA · Próximamente</button>
          <button disabled className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-white/35">Comparar con IA · Próximamente</button>
        </div>
      </div>
    </main>
  );
}
