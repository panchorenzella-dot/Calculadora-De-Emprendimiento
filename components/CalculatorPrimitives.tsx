"use client";

import type { ReactNode } from "react";
import Card from "@/components/Card";
import MoneyInput from "@/components/MoneyInput";
import { fmtMoney } from "@/lib/format";
import { formatLocaleNumberInput, parseLocaleNumber } from "@/lib/numberInput";

export function CalculatorHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <header className="calculator-hero mb-8">
    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300/65">{eyebrow}</p>
    <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
    <p className="mt-3 max-w-3xl text-sm leading-7 text-white/65 sm:text-base">{description}</p>
  </header>;
}

export function CalculatorForm({ children, onSubmit, error }: { children: ReactNode; onSubmit: (event: React.FormEvent<HTMLFormElement>) => void; error?: string | null }) {
  return <form data-calculator-form onSubmit={onSubmit} className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6">
    <h2 className="text-xl font-semibold">Datos</h2>
    <div className="mt-5 grid gap-4">{children}</div>
    {error ? <p role="alert" className="mt-5 rounded-xl border border-rose-300/20 bg-rose-300/[0.06] px-4 py-3 text-sm font-semibold text-rose-100">{error}</p> : null}
    <button type="submit" className="mt-6 w-full rounded-full bg-white px-4 py-3 text-sm font-black text-zinc-950 transition hover:bg-emerald-100">Calcular</button>
  </form>;
}

export function MoneyField(props: { label: string; value: string; onChange: (value: string) => void; hint?: string }) {
  return <MoneyInput label={props.label} valueDigits={props.value} onChangeDigits={props.onChange} hint={props.hint} currency="ARS" />;
}

export function parseDecimalInput(value: string) {
  return parseLocaleNumber(value);
}

export function PercentField({ label, value, onChange, hint, disabled = false }: { label: string; value: string; onChange: (value: string) => void; hint?: string; disabled?: boolean }) {
  return <label className="grid gap-2">
    <span className="text-sm font-semibold text-white/80">{label}</span>
    <div className="flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-3 ring-1 ring-white/10 focus-within:ring-white/30">
      <input aria-label={label} disabled={disabled} inputMode="decimal" value={value} onChange={(event) => onChange(formatLocaleNumberInput(event.target.value, { maxDecimals: 3 }))} onFocus={(event) => event.currentTarget.select()} placeholder="0" className="w-full bg-transparent font-semibold text-white outline-none placeholder:text-white/35 disabled:text-white/45" />
      <span className="font-semibold text-white/45">%</span>
    </div>
    {hint ? <span className="text-xs leading-5 text-white/45">{hint}</span> : null}
  </label>;
}

export function IntegerField({ label, value, onChange, hint }: { label: string; value: string; onChange: (value: string) => void; hint?: string }) {
  return <label className="grid gap-2">
    <span className="text-sm font-semibold text-white/80">{label}</span>
    <input aria-label={label} inputMode="numeric" value={formatLocaleNumberInput(value, { maxDecimals: 0 })} onChange={(event) => onChange(formatLocaleNumberInput(event.target.value, { maxDecimals: 0 }))} onFocus={(event) => event.currentTarget.select()} placeholder="0" className="rounded-xl bg-zinc-900 px-4 py-3 font-semibold text-white outline-none ring-1 ring-white/10 placeholder:text-white/35 focus:ring-white/30" />
    {hint ? <span className="text-xs leading-5 text-white/45">{hint}</span> : null}
  </label>;
}

export function TextField({ label, value, onChange, placeholder, hint }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; hint?: string }) {
  return <label className="grid gap-2">
    <span className="text-sm font-semibold text-white/80">{label}</span>
    <input aria-label={label} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="rounded-xl bg-zinc-900 px-4 py-3 font-semibold text-white outline-none ring-1 ring-white/10 placeholder:text-white/30 focus:ring-white/30" />
    {hint ? <span className="text-xs leading-5 text-white/45">{hint}</span> : null}
  </label>;
}

export function SelectField({ label, value, onChange, children, hint }: { label: string; value: string; onChange: (value: string) => void; children: ReactNode; hint?: string }) {
  return <label className="grid gap-2">
    <span className="text-sm font-semibold text-white/80">{label}</span>
    <select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)} className="rounded-xl bg-zinc-900 px-4 py-3 font-semibold text-white outline-none ring-1 ring-white/10 focus:ring-white/30">{children}</select>
    {hint ? <span className="text-xs leading-5 text-white/45">{hint}</span> : null}
  </label>;
}

export function SegmentedControl({ label, value, options, onChange }: { label: string; value: string; options: Array<{ value: string; label: string }>; onChange: (value: string) => void }) {
  return <div className="grid gap-2">
    <span className="text-sm font-semibold text-white/80">{label}</span>
    <div className="grid gap-2 rounded-2xl border border-white/10 bg-black/20 p-1 sm:grid-cols-2">
      {options.map((option) => <button key={option.value} type="button" aria-pressed={value === option.value} onClick={() => onChange(option.value)} className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${value === option.value ? "bg-zinc-800 text-white ring-1 ring-inset ring-white/10" : "text-white/50 hover:bg-white/5 hover:text-white"}`}>{option.label}</button>)}
    </div>
  </div>;
}

export function ResultsPanel({ children, hasResults, status }: { children: ReactNode; hasResults: boolean; status?: ReactNode }) {
  return <section data-calculator-results aria-live="polite" aria-atomic="false" className="self-start rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6">
    <h2 className="text-xl font-semibold">Resultados</h2>
    {!hasResults ? <p className="mt-4 text-sm font-medium text-white/60">Cargá tus datos y tocá <strong>Calcular</strong>.</p> : <>{status}{children}</>}
  </section>;
}

export function ResultCards({ items }: { items: Array<{ title: string; value: number | string; note?: string; money?: boolean }> }) {
  return <div className="mt-5 grid gap-4 sm:grid-cols-2">
    {items.map((item) => <Card key={item.title} title={item.title} value={typeof item.value === "number" && item.money !== false ? fmtMoney(item.value, "ARS") : String(item.value)} note={item.note} />)}
  </div>;
}

export function ExplainGrid({ children }: { children: ReactNode }) {
  return <div data-scenario-actions-before className="mt-10 grid gap-6 lg:grid-cols-2">{children}</div>;
}

export function ExplainCard({ title, children, warning = false }: { title: string; children: ReactNode; warning?: boolean }) {
  return <section className={`rounded-2xl border p-6 ${warning ? "border-amber-300/15 bg-amber-300/[0.035]" : "border-white/10 bg-white/5"}`}>
    <h2 className={`text-lg font-semibold ${warning ? "text-amber-100" : ""}`}>{title}</h2>
    <div className="mt-4 text-sm leading-7 text-white/65">{children}</div>
  </section>;
}

export function SeoSection({ title, children }: { title: string; children: ReactNode }) {
  return <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
    <h2 className="text-2xl font-semibold">{title}</h2>
    <div className="mt-3 space-y-3 text-sm leading-7 text-white/70 sm:text-base">{children}</div>
  </section>;
}
