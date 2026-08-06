"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import AuthModal from "@/components/AuthModal";
import {
  getCalculatorInfo,
  getScenarioFields,
  getScenarioMetrics,
  getScenarioResultNarrative,
} from "@/lib/scenarios";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { SavedScenario } from "@/types/scenario";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function ScenarioDetail({ id }: { id: string }) {
  const router = useRouter();
  const [scenario, setScenario] = useState<SavedScenario | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = getSupabaseClient();
      if (!supabase) {
        setError("Falta configurar la conexión de la cuenta.");
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
      if (queryError || !data) {
        setError("No encontramos este escenario o no pertenece a tu cuenta.");
      } else {
        const loaded = data as SavedScenario;
        setScenario(loaded);
        setTitle(loaded.title || "Escenario guardado");
        setNotes(loaded.notes || "");
      }
      setLoading(false);
    }
    void load();
  }, [id]);

  const metrics = useMemo(() => scenario ? getScenarioMetrics(scenario) : [], [scenario]);
  const fields = useMemo(() => scenario ? getScenarioFields(scenario) : [], [scenario]);

  async function saveDetails(event: React.FormEvent) {
    event.preventDefault();
    if (!scenario || !title.trim()) return;
    const supabase = getSupabaseClient();
    if (!supabase) return;

    setSaving(true);
    setMessage("");
    const { error: updateError } = await supabase
      .from("saved_scenarios")
      .update({ title: title.trim(), notes: notes.trim() || null })
      .eq("id", scenario.id);
    setSaving(false);
    if (updateError) {
      setMessage("No pudimos guardar los cambios.");
      return;
    }
    setScenario({ ...scenario, title: title.trim(), notes: notes.trim() || null });
    setEditing(false);
    setMessage("Escenario actualizado.");
  }

  async function removeScenario() {
    if (!scenario || !window.confirm("¿Eliminar definitivamente este escenario?")) return;
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const { error: removeError } = await supabase.from("saved_scenarios").delete().eq("id", scenario.id);
    if (removeError) {
      setMessage("No pudimos eliminar el escenario.");
      return;
    }
    router.push("/perfil?view=escenarios");
  }

  if (loading) {
    return <main className="mx-auto grid min-h-[60vh] max-w-6xl place-items-center px-4 text-sm text-white/45">Preparando tu escenario...</main>;
  }
  if (needsAuth) return <AuthModal open returnTo={`/perfil/escenarios/${id}`} />;
  if (error || !scenario) {
    return <main className="mx-auto min-h-[60vh] max-w-4xl px-4 py-16"><p className="text-white/70">{error}</p><Link href="/perfil?view=escenarios" className="mt-5 inline-flex text-sm font-semibold text-emerald-200">← Volver a escenarios</Link></main>;
  }

  const calculatorPath = String(scenario.inputs.calculator_path || "/calculadoras");
  const calculator = getCalculatorInfo(scenario.calculator_type);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:py-12 print:max-w-none print:px-0">
      <div className="print:hidden">
        <Link href="/perfil?view=escenarios" className="inline-flex items-center gap-2 text-sm font-semibold text-white/55 transition hover:text-white">← Volver a escenarios</Link>
      </div>

      <section className="mt-6 overflow-hidden rounded-[2rem] border border-white/[0.09] bg-[#0b0c0e] shadow-[0_35px_120px_rgba(0,0,0,.28)] print:mt-0 print:border-zinc-200 print:bg-white print:text-zinc-950 print:shadow-none">
        <header className="relative overflow-hidden border-b border-white/[0.08] bg-[radial-gradient(circle_at_top_right,rgba(110,231,183,.16),transparent_42%),linear-gradient(145deg,#111715,#0b0c0e)] p-6 sm:p-9 print:border-zinc-200 print:bg-white">
          <div className="relative flex flex-col gap-7 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 gap-4">
              <span className="grid size-14 shrink-0 place-items-center rounded-2xl border border-emerald-200/15 bg-emerald-200/[0.08] text-xl font-black text-emerald-100 print:border-emerald-200 print:bg-emerald-50 print:text-emerald-800">{calculator.icon}</span>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[.15em] text-emerald-200/60 print:text-emerald-700">{calculator.name}</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-[-.035em] text-white sm:text-4xl print:text-zinc-950">{scenario.title || "Escenario guardado"}</h1>
                <p className="mt-3 text-sm text-white/42 print:text-zinc-500">Guardado el {formatDate(scenario.created_at)} · {calculator.description}</p>
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2 print:hidden">
              <button type="button" onClick={() => setEditing((current) => !current)} className="rounded-full border border-white/12 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-white/70 transition hover:bg-white/[0.08] hover:text-white">Editar</button>
              <button type="button" onClick={() => window.print()} className="rounded-full border border-white/12 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-white/70 transition hover:bg-white/[0.08] hover:text-white">Guardar PDF</button>
              <Link href={calculatorPath} className="rounded-full bg-emerald-300 px-5 py-2.5 text-sm font-black text-[#062d20] shadow-[0_10px_30px_rgba(110,231,183,.2)] transition hover:bg-emerald-200">Abrir calculadora</Link>
            </div>
          </div>
        </header>

        <div className="p-6 sm:p-9 print:p-8">
          {message && <p role="status" className="mb-6 rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.06] px-4 py-3 text-sm font-semibold text-emerald-100 print:hidden">{message}</p>}

          {editing && (
            <form onSubmit={saveDetails} className="mb-8 grid gap-4 rounded-3xl border border-white/[0.08] bg-white/[0.025] p-5 print:hidden">
              <label className="grid gap-2 text-xs font-semibold text-white/45">Nombre del escenario<input required maxLength={90} value={title} onChange={(event) => setTitle(event.target.value)} className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-emerald-300/45" /></label>
              <label className="grid gap-2 text-xs font-semibold text-white/45">Notas para recordar<textarea rows={3} maxLength={600} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Ejemplo: volver a calcular si aumenta el costo de los insumos" className="resize-none rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm leading-6 text-white outline-none focus:border-emerald-300/45" /></label>
              <div className="flex flex-wrap items-center gap-2"><button disabled={saving} className="rounded-full bg-white px-4 py-2.5 text-sm font-bold text-zinc-950 disabled:opacity-55">{saving ? "Guardando..." : "Guardar cambios"}</button><button type="button" onClick={() => setEditing(false)} className="rounded-full border border-white/10 px-4 py-2.5 text-sm text-white/55">Cancelar</button><button type="button" onClick={() => void removeScenario()} className="ml-auto rounded-full border border-red-400/20 px-4 py-2.5 text-sm font-semibold text-red-300/75 hover:bg-red-500/10">Eliminar escenario</button></div>
            </form>
          )}

          <div className="grid gap-8 lg:grid-cols-[1.22fr_.78fr]">
            <section>
              <div className="flex items-end justify-between gap-4"><div><p className="text-[11px] font-bold uppercase tracking-[.15em] text-emerald-200/55 print:text-emerald-700">Resultado principal</p><h2 className="mt-2 text-2xl font-semibold tracking-tight">Tus números, ordenados.</h2></div><span className="text-xs text-white/30 print:text-zinc-500">{metrics.length} métricas</span></div>
              {metrics.length ? (
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {metrics.map((metric, index) => <article key={`${metric.label}-${index}`} className={`rounded-2xl border p-5 ${index === 0 ? "border-emerald-300/20 bg-emerald-300/[0.07]" : "border-white/[0.07] bg-white/[0.025]"} print:border-zinc-200 print:bg-white`}><p className="text-xs font-semibold leading-5 text-white/40 print:text-zinc-500">{metric.label}</p><p className={`mt-3 break-words text-xl font-semibold tracking-tight ${index === 0 ? "text-emerald-100" : "text-white/90"} print:text-zinc-950`}>{metric.value}</p></article>)}
                </div>
              ) : <div className="mt-5 rounded-2xl border border-dashed border-white/10 p-6 text-sm leading-6 text-white/45 print:border-zinc-300 print:text-zinc-600">{getScenarioResultNarrative(scenario)}</div>}
            </section>

            <aside>
              <p className="text-[11px] font-bold uppercase tracking-[.15em] text-emerald-200/55 print:text-emerald-700">Datos utilizados</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">Cómo llegamos al resultado</h2>
              <dl className="mt-5 overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02] print:border-zinc-200 print:bg-white">
                {fields.length ? fields.map((field, index) => <div key={`${field.label}-${index}`} className="flex items-start justify-between gap-5 border-b border-white/[0.06] px-4 py-3.5 last:border-0 print:border-zinc-200"><dt className="text-xs leading-5 text-white/38 print:text-zinc-500">{field.label}</dt><dd className="max-w-[58%] break-words text-right text-sm font-semibold text-white/80 print:text-zinc-950">{field.value}</dd></div>) : <div className="p-5 text-sm text-white/40 print:text-zinc-500">El escenario anterior no conservó nombres suficientes para reconstruir sus campos, pero los resultados siguen disponibles.</div>}
              </dl>
              {scenario.notes && <div className="mt-4 rounded-2xl border border-amber-200/15 bg-amber-100/[0.045] p-4"><p className="text-[10px] font-bold uppercase tracking-[.13em] text-amber-100/50">Tus notas</p><p className="mt-2 text-sm leading-6 text-white/65 print:text-zinc-700">{scenario.notes}</p></div>}
            </aside>
          </div>

          <section className="mt-9 border-t border-white/[0.07] pt-8 print:border-zinc-200">
            <div className="grid gap-4 sm:grid-cols-3">
              <article className="rounded-2xl border border-white/[0.07] p-5 print:border-zinc-200"><span className="font-mono text-xs font-black text-emerald-200/65 print:text-emerald-700">01</span><h3 className="mt-4 font-semibold">Revisá el resultado</h3><p className="mt-2 text-xs leading-5 text-white/38 print:text-zinc-500">Identificá la métrica que más cambia tu decisión.</p></article>
              <article className="rounded-2xl border border-white/[0.07] p-5 print:border-zinc-200"><span className="font-mono text-xs font-black text-emerald-200/65 print:text-emerald-700">02</span><h3 className="mt-4 font-semibold">Probá una alternativa</h3><p className="mt-2 text-xs leading-5 text-white/38 print:text-zinc-500">Abrí la calculadora y modificá una variable por vez.</p></article>
              <article className="rounded-2xl border border-white/[0.07] p-5 print:border-zinc-200"><span className="font-mono text-xs font-black text-emerald-200/65 print:text-emerald-700">03</span><h3 className="mt-4 font-semibold">Guardá la conclusión</h3><p className="mt-2 text-xs leading-5 text-white/38 print:text-zinc-500">Usá las notas para recordar por qué elegiste este escenario.</p></article>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
