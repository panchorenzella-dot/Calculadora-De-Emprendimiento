"use client";

import { useMemo, useState } from "react";
import MoneyInput, { Currency } from "@/components/MoneyInput";
import Card from "@/components/Card";
import { fmtMoney, fmtNum } from "@/lib/format";
import { onlyDigits, parseDigitsToNumber } from "@/lib/numberInput";

export default function InteresCompuestoPage() {
  const [currency, setCurrency] = useState<Currency>("ARS");

  const [principal, setPrincipal] = useState("0");
  const [aporteMensual, setAporteMensual] = useState("0");
  const [tasaAnualPct, setTasaAnualPct] = useState("0");
  const [anios, setAnios] = useState("1");

  const calc = useMemo(() => {
    const P = parseDigitsToNumber(principal);
    const PMT = parseDigitsToNumber(aporteMensual);
    const rAnual = parseDigitsToNumber(tasaAnualPct) / 100;

    const years = Math.max(0, parseDigitsToNumber(anios));
    const n = 12;
    const periods = n * years;
    const r = rAnual / n;

    const fvPrincipal = P * Math.pow(1 + r, periods);

    const fvAportes =
      r === 0 ? PMT * periods : PMT * ((Math.pow(1 + r, periods) - 1) / r);

    const fvTotal = fvPrincipal + fvAportes;
    const totalAportado = P + PMT * periods;
    const interesGanado = fvTotal - totalAportado;

    return { fvTotal, totalAportado, interesGanado, periods, r };
  }, [principal, aporteMensual, tasaAnualPct, anios]);

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-5xl px-4 py-0">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Calculadora de Interés Compuesto
        </h1>

        <p className="mt-2 text-white/70">
          Calculá el valor futuro de una inversión con aportes mensuales y
          estimá cuánto podrías acumular con el paso del tiempo.
        </p>

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
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">Inputs</h2>

            <div className="mt-5 grid gap-4">
              <MoneyInput
                label="Inversión inicial"
                valueDigits={principal}
                onChangeDigits={setPrincipal}
                currency={currency}
              />

              <MoneyInput
                label="Aporte mensual"
                valueDigits={aporteMensual}
                onChangeDigits={setAporteMensual}
                currency={currency}
              />

              <label className="grid gap-2">
                <span className="text-sm text-white/70">Tasa anual (%)</span>
                <input
                  className="rounded-xl bg-zinc-900 px-4 py-3 outline-none ring-1 ring-white/10 focus:ring-white/30"
                  inputMode="numeric"
                  value={tasaAnualPct}
                  onChange={(e) => setTasaAnualPct(onlyDigits(e.target.value))}
                  placeholder="0"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm text-white/70">Años</span>
                <input
                  className="rounded-xl bg-zinc-900 px-4 py-3 outline-none ring-1 ring-white/10 focus:ring-white/30"
                  inputMode="numeric"
                  value={anios}
                  onChange={(e) => setAnios(onlyDigits(e.target.value))}
                  placeholder="1"
                />
              </label>

              <div className="text-xs text-white/50">
                Períodos: <b>{fmtNum(calc.periods, 0)}</b> · Tasa mensual:{" "}
                <b>{fmtNum(calc.r * 100, 4)}%</b>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">Resultados</h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Card title="Valor futuro" value={fmtMoney(calc.fvTotal, currency)} />
              <Card
                title="Total aportado"
                value={fmtMoney(calc.totalAportado, currency)}
              />
              <Card
                title="Interés ganado"
                value={fmtMoney(calc.interesGanado, currency)}
              />
              <Card
                title="Rendimiento sobre aportes"
                value={
                  calc.totalAportado <= 0
                    ? "—"
                    : `${fmtNum(
                        (calc.interesGanado / calc.totalAportado) * 100,
                        1
                      )}%`
                }
              />
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-lg font-semibold">Cómo lo calculamos</h3>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-white/70">
              <li>
                Períodos = <b>años × 12</b>
              </li>
              <li>
                Tasa mensual = <b>tasa anual / 12</b>
              </li>
              <li>
                Valor futuro de la inversión inicial = <b>P × (1 + r)^n</b>
              </li>
              <li>
                Valor futuro de los aportes mensuales ={" "}
                <b>PMT × [((1+r)^n − 1) / r]</b>
              </li>
              <li>
                Valor futuro total = <b>FV inversión inicial + FV aportes</b>
              </li>
              <li>
                Total aportado = <b>inversión inicial + (aporte mensual × n)</b>
              </li>
              <li>
                Interés ganado = <b>valor futuro total − total aportado</b>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-lg font-semibold">Limitaciones</h3>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-white/70">
              <li>No contempla inflación, impuestos, comisiones ni devaluación.</li>
              <li>Asume que la tasa se mantiene constante durante todo el período.</li>
              <li>Los aportes mensuales se consideran al final de cada mes.</li>
              <li>No incluye variaciones en el rendimiento mes a mes.</li>
              <li>Es una estimación financiera, no una garantía de resultado real.</li>
            </ul>
          </div>
        </div>

        <section className="mt-10 space-y-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-2xl font-semibold">
              ¿Qué es el interés compuesto?
            </h2>
            <p className="mt-3 text-white/75">
              El interés compuesto es el crecimiento que se genera cuando los
              intereses ganados se reinvierten y empiezan también a producir
              nuevos intereses. En otras palabras, no solo ganás sobre tu dinero
              inicial, sino también sobre los rendimientos acumulados.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-2xl font-semibold">
              ¿Para qué sirve esta calculadora?
            </h2>
            <p className="mt-3 text-white/75">
              Esta calculadora sirve para estimar cuánto podría crecer una
              inversión con el paso del tiempo. Te ayuda a proyectar el valor
              futuro, comparar escenarios de aportes mensuales y entender cómo
              influye la tasa anual en el resultado final.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-2xl font-semibold">
              Por qué el tiempo hace tanta diferencia
            </h2>
            <p className="mt-3 text-white/75">
              En interés compuesto, el tiempo es una de las variables más
              importantes. Cuanto más años dejes trabajar la inversión, mayor es
              el efecto acumulado. Por eso empezar antes, aunque sea con aportes
              más chicos, puede generar una diferencia muy grande a largo plazo.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-2xl font-semibold">Ejemplo práctico</h2>
            <p className="mt-3 text-white/75">
              Si invertís $1.000.000 al inicio, aportás $100.000 por mes, obtenés
              una tasa anual del 12% y mantenés esa estrategia durante varios
              años, el valor acumulado final va a ser bastante mayor que la suma
              de tus aportes. Esa diferencia es justamente el efecto del interés
              compuesto.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}