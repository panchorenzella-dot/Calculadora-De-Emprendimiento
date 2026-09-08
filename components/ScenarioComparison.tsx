"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import AuthModal from "@/components/AuthModal";
import PrintPdfButton from "@/components/PrintPdfButton";
import { trackEvent } from "@/lib/analytics";
import { getCalculatorInfo, getScenarioFields, getScenarioMetrics, SAVED_SCENARIO_COLUMNS } from "@/lib/scenarios";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { SavedScenario } from "@/types/scenario";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

function valuesByLabel(items: Array<{ label: string; value: string }>) {
  return new Map(items.map((item) => [item.label, item.value]));
}

function orderedLabels(collections: Array<Array<{ label: string }>>) {
  return Array.from(new Set(collections.flatMap((collection) => collection.map((item) => item.label))));
}

export default function ScenarioComparison({ ids }: { ids: string[] }) {
  const [scenarios, setScenarios] = useState<SavedScenario[]>([]);
  const [loading, setLoading] = useState(ids.length >= 2);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (ids.length < 2) return;
    let active = true;

    async function loadScenarios() {
      const supabase = getSupabaseClient();
      if (!supabase) {
        if (active) {
          setError("Falta configurar la conexión de la cuenta.");
          setLoading(false);
        }
        return;
      }

      try {
        const { data: auth, error: authError } = await supabase.auth.getSession();
        if (authError) throw authError;
        if (!auth.session) {
          if (active) {
            setNeedsAuth(true);
            setLoading(false);
          }
          return;
        }

        const { data, error: queryError } = await supabase
          .from("saved_scenarios")
          .select(SAVED_SCENARIO_COLUMNS)
          .in("id", ids)
          .eq("user_id", auth.session.user.id)
          .limit(3);

        if (queryError) throw queryError;
        const found = (data as SavedScenario[] | null) ?? [];
        const byId = new Map(found.map((scenario) => [scenario.id, scenario]));
        const ordered = ids.map((id) => byId.get(id)).filter((scenario): scenario is SavedScenario => Boolean(scenario));

        if (ordered.length !== ids.length) {
          throw new Error("missing-scenario");
        }
        if (new Set(ordered.map((scenario) => scenario.calculator_type)).size !== 1) {
          throw new Error("mixed-calculators");
        }

        if (active) {
          setScenarios(ordered);
          setError("");
          trackEvent("compare_scenarios", {
            calculator_type: ordered[0].calculator_type,
            scenario_count: ordered.length,
          });
        }
      } catch (loadError) {
        if (!active) return;
        const reason = loadError instanceof Error ? loadError.message : "";
        setError(reason === "mixed-calculators"
          ? "Para que la comparación sea útil, elegí escenarios de una misma calculadora."
          : "No pudimos abrir todos los escenarios. Es posible que alguno ya no exista o no pertenezca a tu cuenta.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadScenarios();
    return () => { active = false; };
  }, [ids]);

  const metricCollections = useMemo(() => scenarios.map(getScenarioMetrics), [scenarios]);
  const fieldCollections = useMemo(() => scenarios.map(getScenarioFields), [scenarios]);
  const metricLabels = useMemo(() => orderedLabels(metricCollections), [metricCollections]);
  const fieldLabels = useMemo(() => orderedLabels(fieldCollections), [fieldCollections]);
  const metricMaps = useMemo(() => metricCollections.map(valuesByLabel), [metricCollections]);
  const fieldMaps = useMemo(() => fieldCollections.map(valuesByLabel), [fieldCollections]);

  if (ids.length < 2) {
    return (
      <main className="mx-auto min-h-[65vh] max-w-4xl px-4 py-16">
        <section className="rounded-[2rem] border border-white/[0.09] bg-white/[0.025] p-7 text-center sm:p-10">
          <p className="text-xs font-bold uppercase tracking-[.15em] text-emerald-200/60">Comparador</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">Elegí 2 o 3 escenarios</h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-white/45">Volvé a tu historial y seleccioná alternativas de una misma calculadora para verlas lado a lado.</p>
          <Link href="/perfil?view=escenarios" className="mt-7 inline-flex rounded-full bg-emerald-300 px-5 py-3 text-sm font-black text-[#052e21]">Elegir escenarios</Link>
        </section>
      </main>
    );
  }

  if (loading) return <main className="grid min-h-[65vh] place-items-center px-4 text-sm text-white/45">Preparando la comparación...</main>;
  if (needsAuth) return <AuthModal open returnTo={`/perfil/escenarios/comparar?ids=${ids.join(",")}`} />;
  if (error || !scenarios.length) {
    return <main className="mx-auto min-h-[65vh] max-w-4xl px-4 py-16"><p role="alert" className="rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] p-5 text-sm leading-6 text-amber-50/85">{error}</p><Link href="/perfil?view=escenarios" className="mt-5 inline-flex text-sm font-semibold text-emerald-200">← Volver a elegir</Link></main>;
  }

  const calculator = getCalculatorInfo(scenarios[0].calculator_type);
  const savedCalculatorPath = String(scenarios[0].inputs.calculator_path || "");
  const calculatorPath = savedCalculatorPath.startsWith("/") ? savedCalculatorPath : "/calculadoras";
  const printName = `comparacion-${calculator.name}-${formatDate(new Date().toISOString())}`;
  const columnTemplate = `minmax(11rem, .7fr) repeat(${scenarios.length}, minmax(13rem, 1fr))`;

  function comparisonRows(labels: string[], maps: Array<Map<string, string>>, emptyCopy: string) {
    if (!labels.length) return <p className="p-5 text-sm text-white/42 print:text-zinc-600">{emptyCopy}</p>;
    return labels.map((label, rowIndex) => (
      <div key={label} className="grid border-t border-white/[0.07] print:border-zinc-200" style={{ gridTemplateColumns: columnTemplate }}>
        <div className="sticky left-0 z-10 bg-[#0c100e] px-4 py-4 text-xs font-semibold leading-5 text-white/45 print:static print:bg-white print:text-zinc-600">{label}</div>
        {maps.map((map, scenarioIndex) => (
          <div key={scenarios[scenarioIndex].id} className={`border-l border-white/[0.07] px-4 py-4 text-sm font-semibold text-white/85 print:border-zinc-200 print:text-zinc-950 ${rowIndex === 0 ? "bg-emerald-300/[0.045]" : ""}`}>
            {map.get(label) || <span className="font-normal text-white/25 print:text-zinc-400">Sin dato</span>}
          </div>
        ))}
      </div>
    ));
  }

  return (
    <main className="comparison-print-document mx-auto max-w-[90rem] px-3 py-7 sm:px-5 sm:py-11 print:max-w-none print:bg-white print:px-0 print:py-0 print:text-zinc-950">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <Link href="/perfil?view=escenarios" className="inline-flex items-center gap-2 text-sm font-semibold text-white/55 transition hover:text-white">← Cambiar selección</Link>
        <div className="text-left sm:text-right">
          <div className="flex flex-wrap gap-2 sm:justify-end">
            <PrintPdfButton filename={printName} source="scenario_comparison" className="rounded-full border border-white/12 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-white/75 transition hover:bg-white/[0.08] hover:text-white" />
            <Link href={calculatorPath} className="rounded-full bg-emerald-300 px-5 py-2.5 text-sm font-black text-[#052e21] transition hover:bg-emerald-200">Crear otra alternativa</Link>
          </div>
          <p className="mt-2 text-[11px] text-white/35">Exportar abre el diálogo para elegir “Guardar como PDF”.</p>
        </div>
      </div>

      <section className="mt-6 overflow-hidden rounded-[2rem] border border-white/[0.09] bg-[#080b09] shadow-[0_35px_120px_rgba(0,0,0,.28)] print:mt-0 print:rounded-none print:border-0 print:bg-white print:shadow-none">
        <header className="border-b border-white/[0.08] bg-[radial-gradient(circle_at_top_right,rgba(110,231,183,.15),transparent_43%),linear-gradient(145deg,#111715,#090b0a)] p-6 sm:p-9 print:border-zinc-200 print:bg-white">
          <div className="flex items-start gap-4">
            <span className="grid size-14 shrink-0 place-items-center rounded-2xl border border-emerald-200/15 bg-emerald-200/[0.08] text-xl font-black text-emerald-100 print:border-emerald-200 print:bg-emerald-50 print:text-emerald-800">{calculator.icon}</span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[.15em] text-emerald-200/60 print:text-emerald-700">Comparador · {calculator.name}</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-[-.035em] text-white sm:text-4xl print:text-zinc-950">Escenarios lado a lado</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/45 print:text-zinc-500">Compará cada variable y resultado sin mezclar fórmulas ni supuestos de otras calculadoras.</p>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-7 print:p-0 print:pt-6">
          <p className="mb-4 text-xs leading-5 text-white/35 print:text-zinc-500">Deslizá horizontalmente para ver todas las columnas. El PDF incluye la comparación completa.</p>
          <div className="overflow-x-auto rounded-2xl border border-white/[0.08] print:overflow-visible print:border-zinc-200">
            <div style={{ minWidth: `${176 + scenarios.length * 208}px` }}>
              <div className="grid bg-white/[0.025]" style={{ gridTemplateColumns: columnTemplate }}>
                <div className="sticky left-0 z-10 bg-[#0c100e] px-4 py-5 text-[10px] font-bold uppercase tracking-[.13em] text-white/30 print:static print:bg-white print:text-zinc-500">Variable</div>
                {scenarios.map((scenario, index) => (
                  <article key={scenario.id} className="border-l border-white/[0.07] px-4 py-5 print:border-zinc-200">
                    <span className="text-[10px] font-bold uppercase tracking-[.13em] text-emerald-200/55 print:text-emerald-700">Escenario {index + 1}</span>
                    <h2 className="mt-2 break-words text-base font-semibold text-white/90 print:text-zinc-950">{scenario.title || "Escenario sin nombre"}</h2>
                    <p className="mt-1 text-[11px] text-white/30 print:text-zinc-500">{formatDate(scenario.created_at)}</p>
                  </article>
                ))}
              </div>

              <div className="border-t border-white/[0.08] bg-emerald-300/[0.035] px-4 py-3 text-[10px] font-bold uppercase tracking-[.14em] text-emerald-200/60 print:border-zinc-200 print:bg-emerald-50 print:text-emerald-800">Resultados</div>
              {comparisonRows(metricLabels, metricMaps, "Estos escenarios no tienen métricas estructuradas para comparar.")}

              <div className="border-t border-white/[0.08] bg-white/[0.025] px-4 py-3 text-[10px] font-bold uppercase tracking-[.14em] text-white/35 print:border-zinc-200 print:bg-zinc-50 print:text-zinc-600">Datos utilizados</div>
              {comparisonRows(fieldLabels, fieldMaps, "No hay datos de entrada disponibles en estos escenarios.")}

              {scenarios.some((scenario) => scenario.notes) && (
                <>
                  <div className="border-t border-white/[0.08] bg-amber-100/[0.035] px-4 py-3 text-[10px] font-bold uppercase tracking-[.14em] text-amber-100/45 print:border-zinc-200 print:bg-amber-50 print:text-amber-800">Notas</div>
                  <div className="grid border-t border-white/[0.07] print:border-zinc-200" style={{ gridTemplateColumns: columnTemplate }}>
                    <div className="sticky left-0 z-10 bg-[#0c100e] px-4 py-4 text-xs font-semibold text-white/45 print:static print:bg-white print:text-zinc-600">Tus observaciones</div>
                    {scenarios.map((scenario) => <div key={scenario.id} className="border-l border-white/[0.07] px-4 py-4 text-sm leading-6 text-white/65 print:border-zinc-200 print:text-zinc-700">{scenario.notes || "Sin notas"}</div>)}
                  </div>
                </>
              )}
            </div>
          </div>
          <footer className="mt-6 hidden items-center justify-between border-t border-zinc-200 pt-3 text-[10px] text-zinc-500 print:flex"><span>Calculadora Emprendedora · Growtella</span><span>Generado el {formatDate(new Date().toISOString())}</span></footer>
        </div>
      </section>
    </main>
  );
}
