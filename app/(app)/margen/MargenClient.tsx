"use client";

import { type FormEvent, useMemo, useState } from "react";

import Card from "@/components/Card";
import MoneyInput, { Currency } from "@/components/MoneyInput";
import InfoSections from "@/components/InfoSections";
import SeoContent from "@/components/SeoContent";

import { fmtMoney, fmtNum } from "@/lib/format";
import {
  formatLocaleNumberInput,
  parseDigitsToNumber,
  validateNumericFields,
} from "@/lib/numberInput";

import type { CalcResponse, IvaModo, ModoCosto } from "@/types/calc";

export default function Page() {
  const [currency, setCurrency] = useState<Currency>("ARS");

  const [unidadesDia, setUnidadesDia] = useState<string>("");
  const [diasAbiertosMes, setDiasAbiertosMes] = useState<string>("");

  const [precioUnit, setPrecioUnit] = useState<string>("");

  const [modoCosto, setModoCosto] = useState<ModoCosto>("pct");
  const [costoPct, setCostoPct] = useState<string>("");
  const [costoUnitAbs, setCostoUnitAbs] = useState<string>("");

  const [costosFijosMes, setCostosFijosMes] = useState<string>("");
  const [inversionInicial, setInversionInicial] = useState<string>("");

  const [ivaModo, setIvaModo] = useState<IvaModo>("no_incluido");

  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState<CalcResponse | null>(null);
  const [error, setError] = useState("");

  const payload = useMemo(() => {
    const uDia = parseDigitsToNumber(unidadesDia);
    const diasMes = parseDigitsToNumber(diasAbiertosMes);
    const precio = parseDigitsToNumber(precioUnit);

    const fijos = parseDigitsToNumber(costosFijosMes);
    const inv = parseDigitsToNumber(inversionInicial);

    const pct = parseDigitsToNumber(costoPct);
    const abs = parseDigitsToNumber(costoUnitAbs);

    return {
      unidadesDia: uDia,
      diasAbiertosMes: diasMes,
      precioUnit: precio,
      modoCosto,
      costoPct: modoCosto === "pct" ? pct : undefined,
      costoUnitAbs: modoCosto === "abs" ? abs : undefined,
      costosFijosMes: fijos,
      inversionInicial: inv,
      ivaModo,
    };
  }, [
    unidadesDia,
    diasAbiertosMes,
    precioUnit,
    modoCosto,
    costoPct,
    costoUnitAbs,
    costosFijosMes,
    inversionInicial,
    ivaModo,
  ]);

  async function calcular(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = validateNumericFields([
      { name: "units", label: "Unidades por día", value: unidadesDia, required: true, min: 0, integer: true },
      { name: "days", label: "Días que abrís al mes", value: diasAbiertosMes, required: true, min: 1, max: 31, integer: true },
      { name: "price", label: "Precio por unidad", value: precioUnit, required: true, min: 0 },
      { name: "cost", label: modoCosto === "pct" ? "Costo variable porcentual" : "Costo por unidad", value: modoCosto === "pct" ? costoPct : costoUnitAbs, required: true, min: 0, ...(modoCosto === "pct" ? { max: 100 } : {}) },
      { name: "fixed", label: "Costos fijos por mes", value: costosFijosMes, min: 0 },
      { name: "investment", label: "Inversión inicial", value: inversionInicial, min: 0 },
    ]);
    if (!validation.valid || validation.values.units <= 0 || validation.values.price <= 0) {
      setError(validation.firstError || (validation.values.units <= 0 ? "Las unidades por día deben ser mayores que cero." : "El precio por unidad debe ser mayor que cero."));
      setResp(null);
      return;
    }

    setLoading(true);
    setResp(null);
    setError("");

    try {
      const r = await fetch("/api/calc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const raw = await r.text();
      let data: CalcResponse;
      try {
        data = JSON.parse(raw) as CalcResponse;
      } catch {
        throw new Error("Respuesta inválida");
      }
      if (!r.ok || !data.ok) {
        setError(data.error || "Revisá los datos e intentá nuevamente.");
        return;
      }
      setResp(data);
    } catch {
      setError("No pudimos completar el cálculo. Revisá tu conexión y volvé a intentar.");
    } finally {
      setLoading(false);
    }
  }

  const results = resp?.ok ? resp.results : null;
  const derived = resp?.ok ? resp.derived : null;

  const unidadesMesPreview =
    parseDigitsToNumber(unidadesDia) *
    parseDigitsToNumber(diasAbiertosMes);

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-5xl px-4 py-0">
        <header className="calculator-hero mb-8">
          <p>Costos y rentabilidad</p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Calculadora de Margen para tu negocio
          </h1>
          <p className="mt-2 max-w-2xl text-white/70">
            Calculá margen de ganancia, ventas netas, punto de equilibrio, ROI
            anual y período de recupero para tu emprendimiento en segundos.
          </p>
        </header>

        <div className="mt-6 flex items-center gap-3">
          <span className="text-sm text-white/50">Moneda</span>
          <div className="inline-flex rounded-xl border border-white/10 bg-black/40 p-1 shadow-inner shadow-black/40">
            {(["ARS", "USD"] as Currency[]).map((item) => (
              <button key={item} type="button" aria-pressed={currency === item} onClick={() => setCurrency(item)} className={`rounded-lg px-3 py-1.5 text-sm font-medium tracking-wide transition ${currency === item ? "bg-zinc-800 text-white shadow-sm shadow-black ring-1 ring-inset ring-white/10" : "text-white/40 hover:bg-white/5 hover:text-white/75"}`}>{item}</button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <form onSubmit={calcular} className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">Inputs</h2>

            <div className="mt-5 grid gap-4">
              <label className="grid gap-2">
                <span className="text-sm text-white/70">Unidades por día</span>
                <input
                  aria-label="Unidades por día"
                  className="rounded-xl bg-zinc-900 px-4 py-3 font-semibold text-white outline-none ring-1 ring-white/10 placeholder:text-white/35 focus:ring-white/30"
                  inputMode="numeric"
                  value={formatLocaleNumberInput(unidadesDia, { maxDecimals: 0 })}
                  onChange={(e) => setUnidadesDia(formatLocaleNumberInput(e.target.value, { maxDecimals: 0 }))}
                  onFocus={(e) => e.currentTarget.select()}
                  placeholder="0"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm text-white/70">
                  Días que abrís al mes
                </span>
                <input
                  aria-label="Días que abrís al mes"
                  className="rounded-xl bg-zinc-900 px-4 py-3 font-semibold text-white outline-none ring-1 ring-white/10 placeholder:text-white/35 focus:ring-white/30"
                  inputMode="numeric"
                  value={formatLocaleNumberInput(diasAbiertosMes, { maxDecimals: 0 })}
                  onChange={(e) => setDiasAbiertosMes(formatLocaleNumberInput(e.target.value, { maxDecimals: 0 }))}
                  onFocus={(e) => e.currentTarget.select()}
                  placeholder="0"
                />
                <span className="text-xs text-white/50">
                  Unidades estimadas al mes:{" "}
                  <b>{fmtNum(unidadesMesPreview, 0)}</b>
                </span>
              </label>

              <MoneyInput
                label="Precio por unidad"
                valueDigits={precioUnit}
                onChangeDigits={setPrecioUnit}
                currency={currency}
              />

              <div className="grid gap-2">
                <span className="text-sm text-white/70">IVA</span>
                <select
                  aria-label="Tratamiento del IVA"
                  className="rounded-xl bg-zinc-900 px-4 py-3 outline-none ring-1 ring-white/10 focus:ring-white/30"
                  value={ivaModo}
                  onChange={(e) => setIvaModo(e.target.value as IvaModo)}
                >
                  <option value="incluido">Incluido en el precio</option>
                  <option value="no_incluido">No incluido</option>
                </select>
              </div>

              <div className="grid gap-3 rounded-xl border border-white/10 bg-zinc-950/40 p-4">
                <div className="flex justify-between">
                  <span className="text-sm text-white/70">Costo variable</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setModoCosto("pct")}
                      className={`rounded-xl px-3 py-2 ring-1 ${
                        modoCosto === "pct"
                          ? "bg-white/10 ring-white/30"
                          : "ring-white/10"
                      }`}
                    >
                      %
                    </button>
                    <button
                      type="button"
                      onClick={() => setModoCosto("abs")}
                      className={`rounded-xl px-3 py-2 ring-1 ${
                        modoCosto === "abs"
                          ? "bg-white/10 ring-white/30"
                          : "ring-white/10"
                      }`}
                    >
                      $
                    </button>
                  </div>
                </div>

                {modoCosto === "pct" ? (
                  <input
                    aria-label="Costo variable porcentual"
                    className="rounded-xl bg-zinc-900 px-4 py-3 font-semibold text-white outline-none ring-1 ring-white/10 placeholder:text-white/35 focus:ring-white/30"
                    inputMode="decimal"
                    value={formatLocaleNumberInput(costoPct, { maxDecimals: 2 })}
                    onChange={(e) => setCostoPct(formatLocaleNumberInput(e.target.value, { maxDecimals: 2 }))}
                    onFocus={(e) => e.currentTarget.select()}
                    placeholder="0"
                  />
                ) : (
                  <MoneyInput
                    label="Costo por unidad"
                    valueDigits={costoUnitAbs}
                    onChangeDigits={setCostoUnitAbs}
                    currency={currency}
                  />
                )}
              </div>

              <MoneyInput
                label="Costos fijos / mes"
                hint="empleados, alquiler, servicios"
                valueDigits={costosFijosMes}
                onChangeDigits={setCostosFijosMes}
                currency={currency}
              />

              <MoneyInput
                label="Inversión inicial"
                valueDigits={inversionInicial}
                onChangeDigits={setInversionInicial}
                currency={currency}
              />

              {error ? <p role="alert" className="rounded-xl border border-rose-300/20 bg-rose-300/[0.06] px-4 py-3 text-sm font-semibold text-rose-100">{error}</p> : null}

              <button
                type="submit"
                disabled={loading}
                className="mt-2 rounded-full bg-white px-4 py-2.5 font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:opacity-70"
              >
                {loading ? "Calculando..." : "Calcular"}
              </button>
            </div>
          </form>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">Resultados</h2>

            {!results ? (
              <p className="mt-4 text-white/60">
                Cargá tus datos y tocá <b>Calcular</b>.
              </p>
            ) : (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Card
                  title="Unidades / mes"
                  value={fmtNum(derived?.unidadesMes ?? 0, 0)}
                />
                <Card
                  title="Ventas brutas"
                  value={fmtMoney(results.ventasBrutas, currency)}
                />
                <Card
                  title="Ventas netas"
                  value={fmtMoney(results.ventasNetas, currency)}
                />
                <Card
                  title="Costo unitario"
                  value={fmtMoney(results.costoUnit, currency)}
                />
                <Card
                  title="Margen unitario"
                  value={fmtMoney(results.margenUnit, currency)}
                />
                <Card
                  title="Ganancia mensual"
                  value={fmtMoney(results.gananciaMes, currency)}
                />
                <Card
                  title="Break-even"
                  value={
                    results.breakEvenUnidades === null
                      ? "—"
                      : `${fmtNum(results.breakEvenUnidades, 0)} unidades`
                  }
                />
                <Card
                  title="Período de recupero"
                  value={
                    results.paybackMeses === null
                      ? "—"
                      : `${fmtNum(results.paybackMeses, 1)} meses`
                  }
                />
                <Card
                  title="ROI anual"
                  value={
                    results.roiAnualPct === null
                      ? "—"
                      : `${fmtNum(results.roiAnualPct, 1)}%`
                  }
                />
              </div>
            )}
          </div>
        </div>

        <InfoSections />
        <SeoContent />
      </div>
    </main>
  );
}
