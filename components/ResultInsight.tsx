import type { ReactNode } from "react";

export type ChartDatum = { label: string; value: number; tone?: "positive" | "negative" | "neutral"; contribution?: number };

/** The chart and its text table share the exact same numerical data. */
export default function ResultInsight({ title, explanation, scope, data, currency = "ARS", unit = "money", children }: {
  title: string; explanation: string; scope: string; data: ChartDatum[];
  currency?: "ARS" | "USD"; unit?: "money" | "units" | "percent"; children?: ReactNode;
}) {
  const valid = data.filter(item => Number.isFinite(item.value));
  const max = Math.max(...valid.map(item => Math.abs(item.value)), 1);
  const evolution = valid.some(item => item.contribution !== undefined);
  const format = (value: number) => new Intl.NumberFormat("es-AR", unit === "money"
    ? { style: "currency", currency, maximumFractionDigits: 2 }
    : { maximumFractionDigits: 2 }).format(value) + (unit === "percent" ? "%" : unit === "units" ? " unidades" : "");
  return <section data-result-insight className="result-insight mt-6 rounded-xl border border-white/10 p-4 sm:p-5">
    <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
    <p className="mt-3 text-sm leading-7 text-white/75">{explanation}</p>
    <figure className="mt-5">
      <figcaption className="text-xs font-medium text-white/65">{children ?? "Comparación de los valores calculados"} · {unit === "money" ? currency : unit === "percent" ? "Porcentaje" : "Unidades"}</figcaption>
      {evolution ? <div className="mt-4 max-w-full overflow-x-auto pb-3" aria-hidden="true"><div style={{ minWidth: Math.max(300, valid.length * 48) }} className="flex h-56 items-end gap-3 border-b border-white/20 px-2">
        {valid.map((item, index) => <div key={index} className="flex h-full min-w-8 flex-1 flex-col justify-end text-center">
          <span className="mb-2 whitespace-nowrap text-[9px] tabular-nums text-white/75">{new Intl.NumberFormat("es-AR", { notation: "compact", maximumFractionDigits: 1 }).format(item.value)}</span>
          <div className="mx-auto flex w-full max-w-10 flex-col justify-end overflow-hidden rounded-t" style={{ height: `${Math.max(0, item.value) / max * 160}px`, background: "var(--positive)" }}><span style={{ height: `${item.value > 0 ? Math.min(100, Math.max(0, (item.contribution ?? 0) / item.value * 100)) : 0}%`, background: "#94a3b8" }} /></div>
          <span className="mt-2 h-8 text-[10px] text-white/70">{item.label}</span>
        </div>)}
      </div><p className="mt-3 text-[11px] text-white/65">Capital acumulado ({currency}) · gris: aportes · verde: rendimiento. Deslizá para ver todos los períodos.</p></div> : <div className="mt-4 space-y-4" aria-hidden="true">
        {valid.map((item, index) => <div key={`${index}-${item.label}`}>
          <div className="mb-1 flex flex-wrap justify-between gap-2 text-xs"><span>{item.label}</span><span data-tone={item.tone} className="tabular-nums">{format(item.value)}</span></div>
          <div className="h-3 overflow-hidden rounded bg-white/5"><div className="flex h-full overflow-hidden rounded" style={{ width: `${Math.abs(item.value) / max * 100}%`, background: item.value < 0 || item.tone === "negative" ? "var(--negative)" : item.tone === "positive" ? "var(--positive)" : "#94a3b8" }}>
            {item.contribution !== undefined && item.value > 0 ? <span style={{ width: `${Math.min(100, Math.max(0, item.contribution / item.value * 100))}%`, background: "#94a3b8" }} /> : null}
          </div></div>
          {item.contribution !== undefined ? <p className="mt-1 text-[11px] text-white/60">Aportado: {format(item.contribution)} · Rendimiento: {format(item.value - item.contribution)}</p> : null}
        </div>)}
      </div>}
      <details className="mt-4 text-xs text-white/70"><summary className="cursor-pointer py-2">Ver valores en tabla</summary><div className="overflow-x-auto"><table className="w-full text-left"><caption className="sr-only">Datos del gráfico en {unit === "money" ? currency : unit === "percent" ? "porcentaje" : "unidades"}</caption><thead><tr><th scope="col" className="py-2">Concepto / período</th><th scope="col">Valor</th>{evolution ? <th scope="col">Aportes</th> : null}</tr></thead><tbody>{valid.map((item, index) => <tr key={index}><th scope="row" className="py-2 font-normal">{item.label}</th><td data-tone={item.tone}>{format(item.value)}</td>{evolution ? <td>{item.contribution === undefined ? "—" : format(item.contribution)}</td> : null}</tr>)}</tbody></table></div></details>
    </figure>
    <p className="mt-4 border-t border-white/10 pt-4 text-xs leading-6 text-white/65"><strong>Alcance del cálculo. </strong>{scope}</p>
  </section>;
}
