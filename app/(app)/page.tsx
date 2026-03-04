"use client";

import { useMemo, useState } from "react";

import Card from "@/components/Card";
import MoneyInput, { Currency } from "@/components/MoneyInput";
import InfoSections from "@/components/InfoSections";

import { fmtMoney, fmtNum } from "@/lib/format";
import {
  formatARIntFromDigits,
  onlyDigits,
  parseDigitsToNumber,
} from "@/lib/numberInput";

import type { CalcResponse, IvaModo, ModoCosto } from "@/types/calc";

export default function Page() {
  const [currency, setCurrency] = useState<Currency>("ARS");

  const [unidadesDia, setUnidadesDia] = useState<string>("0");
  const [diasAbiertosMes, setDiasAbiertosMes] = useState<string>("0");

  const [precioUnit, setPrecioUnit] = useState<string>("0");

  const [modoCosto, setModoCosto] = useState<ModoCosto>("pct");
  const [costoPct, setCostoPct] = useState<string>("0");
  const [costoUnitAbs, setCostoUnitAbs] = useState<string>("0");

  const [costosFijosMes, setCostosFijosMes] = useState<string>("0");
  const [inversionInicial, setInversionInicial] = useState<string>("0");

  const [ivaModo, setIvaModo] = useState<IvaModo>("no_incluido");

  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState<CalcResponse | null>(null);

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

  async function calcular() {
    setLoading(true);
    setResp(null);

    const r = await fetch("/api/calc", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = (await r.json()) as CalcResponse;
    setResp(data);
    setLoading(false);
  }

  const results = resp?.ok ? resp.results : null;
  const derived = resp?.ok ? resp.derived : null;

  const unidadesMesPreview =
    parseDigitsToNumber(unidadesDia) *
    parseDigitsToNumber(diasAbiertosMes);

  const isZeroUnidades = unidadesDia === "0";
  const isZeroDias = diasAbiertosMes === "0";

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-5xl px-4">
        <h1 className="text-3xl font-bold tracking-tight">
          Calculadora de Margen para tu negocio
        </h1>
        <p className="mt-2 text-white/70">
          Cargás datos y te devuelve margen, ganancia, punto de equilibrio y
          período de recupero.
        </p>

        {/* SELECTOR MONEDA */}
        <div className="mt-6 flex items-center gap-3">
          <span className="text-sm text-white/70">Moneda</span>
          <select
            className="rounded-xl bg-zinc-900 px-4 py-2 outline-none ring-1 ring-white/10 focus:ring-white/30"
            value={currency}
            onChange={(e) => setCurrency(e.target.value as Currency)}
          >
            <option value="ARS">ARS ($)</option>
            <option value="USD">USD (US$)</option>
          </select>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* FORM */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">Inputs</h2>

            <div className="mt-5 grid gap-4">
              <label className="grid gap-2">
                <span className="text-sm text-white/70">Unidades por día</span>
                <input
                  className={`rounded-xl bg-zinc-900 px-4 py-3 outline-none ring-1 ring-white/10 focus:ring-white/30 ${
                    isZeroUnidades ? "text-white/40" : "text-white"
                  }`}
                  inputMode="numeric"
                  value={formatARIntFromDigits(unidadesDia)}
                  onChange={(e) => setUnidadesDia(onlyDigits(e.target.value))}
                  onFocus={(e) => e.currentTarget.select()}
                  placeholder="0"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm text-white/70">
                  Días que abrís al mes
                </span>
                <input
                  className={`rounded-xl bg-zinc-900 px-4 py-3 outline-none ring-1 ring-white/10 focus:ring-white/30 ${
                    isZeroDias ? "text-white/40" : "text-white"
                  }`}
                  inputMode="numeric"
                  value={formatARIntFromDigits(diasAbiertosMes)}
                  onChange={(e) =>
                    setDiasAbiertosMes(onlyDigits(e.target.value))
                  }
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
                    className="rounded-xl bg-zinc-900 px-4 py-3 outline-none ring-1 ring-white/10"
                    inputMode="numeric"
                    value={costoPct}
                    onChange={(e) => setCostoPct(onlyDigits(e.target.value))}
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

              <button
                onClick={calcular}
                disabled={loading}
                className="mt-2 rounded-2xl bg-white px-5 py-3 font-semibold text-zinc-950"
              >
                {loading ? "Calculando..." : "Calcular"}
              </button>
            </div>
          </div>

          {/* RESULTS */}
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
      </div>
    </main>
  );
}