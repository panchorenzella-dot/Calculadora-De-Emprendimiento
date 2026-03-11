"use client";

import { useMemo, useState } from "react";
import MoneyInput, { Currency } from "@/components/MoneyInput";
import Card from "@/components/Card";
import { fmtMoney, fmtNum } from "@/lib/format";
import { onlyDigits, parseDigitsToNumber } from "@/lib/numberInput";

type FrecuenciaCapitalizacion =
  | "anual"
  | "semestral"
  | "trimestral"
  | "mensual"
  | "semanal"
  | "diaria";

const PERIODOS_POR_ANIO: Record<FrecuenciaCapitalizacion, number> = {
  anual: 1,
  semestral: 2,
  trimestral: 4,
  mensual: 12,
  semanal: 52,
  diaria: 365,
};

const LABEL_FRECUENCIA: Record<FrecuenciaCapitalizacion, string> = {
  anual: "Anualmente",
  semestral: "Semestralmente",
  trimestral: "Trimestralmente",
  mensual: "Mensualmente",
  semanal: "Semanalmente",
  diaria: "Diariamente",
};

export default function InteresCompuestoPage() {
  const [currency, setCurrency] = useState<Currency>("ARS");

  const [principal, setPrincipal] = useState("0");
  const [aporteMensual, setAporteMensual] = useState("0");
  const [anios, setAnios] = useState("1");
  const [tasaAnualPct, setTasaAnualPct] = useState("0");
  const [rangoVarianzaPct, setRangoVarianzaPct] = useState("0");
  const [frecuenciaCapitalizacion, setFrecuenciaCapitalizacion] =
    useState<FrecuenciaCapitalizacion>("anual");

  const calc = useMemo(() => {
    const P = parseDigitsToNumber(principal);
    const PMT = parseDigitsToNumber(aporteMensual);
    const years = Math.max(0, parseDigitsToNumber(anios));

    const tasaCentral = parseDigitsToNumber(tasaAnualPct) / 100;
    const rango = parseDigitsToNumber(rangoVarianzaPct) / 100;

    const tasaBaja = Math.max(0, tasaCentral - rango);
    const tasaAlta = Math.max(0, tasaCentral + rango);

    const m = PERIODOS_POR_ANIO[frecuenciaCapitalizacion];
    const mesesTotales = Math.round(years * 12);

    const calcularEscenario = (tasaAnual: number) => {
      const tasaPorCapitalizacion = tasaAnual / m;

      const tasaMensualEquivalente =
        tasaAnual === 0
          ? 0
          : Math.pow(1 + tasaPorCapitalizacion, m / 12) - 1;

      let saldo = P;

      for (let i = 0; i < mesesTotales; i++) {
        saldo = saldo * (1 + tasaMensualEquivalente);
        saldo += PMT;
      }

      const totalAportado = P + PMT * mesesTotales;
      const interesGanado = saldo - totalAportado;

      return {
        fvTotal: saldo,
        totalAportado,
        interesGanado,
        tasaPorCapitalizacion,
        tasaMensualEquivalente,
      };
    };

    const escenarioBajo = calcularEscenario(tasaBaja);
    const escenarioCentral = calcularEscenario(tasaCentral);
    const escenarioAlto = calcularEscenario(tasaAlta);

    return {
      mesesTotales,
      capitalizacionesTotales: years * m,
      tasaCentral,
      tasaBaja,
      tasaAlta,
      escenarioBajo,
      escenarioCentral,
      escenarioAlto,
    };
  }, [
    principal,
    aporteMensual,
    anios,
    tasaAnualPct,
    rangoVarianzaPct,
    frecuenciaCapitalizacion,
  ]);

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-5xl px-4 py-0">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Calculadora de Interés Compuesto
        </h1>

        <p className="mt-2 text-white/70">
          Calculá cómo puede crecer una inversión en el tiempo con aportes
          mensuales, una tasa estimada y distintas frecuencias de
          capitalización.
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
                label="Contribución mensual"
                valueDigits={aporteMensual}
                onChangeDigits={setAporteMensual}
                currency={currency}
              />

              <label className="grid gap-2">
                <span className="text-sm text-white/70">
                  Cantidad de tiempo en años
                </span>
                <input
                  className="rounded-xl bg-zinc-900 px-4 py-3 outline-none ring-1 ring-white/10 focus:ring-white/30"
                  inputMode="numeric"
                  value={anios}
                  onChange={(e) => setAnios(onlyDigits(e.target.value))}
                  placeholder="1"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm text-white/70">
                  Tasa de interés estimada anual (%)
                </span>
                <input
                  className="rounded-xl bg-zinc-900 px-4 py-3 outline-none ring-1 ring-white/10 focus:ring-white/30"
                  inputMode="numeric"
                  value={tasaAnualPct}
                  onChange={(e) => setTasaAnualPct(onlyDigits(e.target.value))}
                  placeholder="0"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm text-white/70">
                  Rango de varianza de tasas (%)
                </span>
                <input
                  className="rounded-xl bg-zinc-900 px-4 py-3 outline-none ring-1 ring-white/10 focus:ring-white/30"
                  inputMode="numeric"
                  value={rangoVarianzaPct}
                  onChange={(e) =>
                    setRangoVarianzaPct(onlyDigits(e.target.value))
                  }
                  placeholder="0"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm text-white/70">
                  Frecuencia de capitalización
                </span>
                <select
                  className="rounded-xl bg-zinc-900 px-4 py-3 outline-none ring-1 ring-white/10 focus:ring-white/30"
                  value={frecuenciaCapitalizacion}
                  onChange={(e) =>
                    setFrecuenciaCapitalizacion(
                      e.target.value as FrecuenciaCapitalizacion
                    )
                  }
                >
                  <option value="anual">Anualmente</option>
                  <option value="semestral">Semestralmente</option>
                  <option value="trimestral">Trimestralmente</option>
                  <option value="mensual">Mensualmente</option>
                  <option value="semanal">Semanalmente</option>
                  <option value="diaria">Diariamente</option>
                </select>
              </label>

              <div className="text-xs text-white/50">
                Meses: <b>{fmtNum(calc.mesesTotales, 0)}</b> ·
                Capitalizaciones: <b>{fmtNum(calc.capitalizacionesTotales, 0)}</b>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">Resultados</h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Card
                title="Valor futuro estimado"
                value={fmtMoney(calc.escenarioCentral.fvTotal, currency)}
              />
              <Card
                title="Total aportado"
                value={fmtMoney(calc.escenarioCentral.totalAportado, currency)}
              />
              <Card
                title="Interés ganado"
                value={fmtMoney(calc.escenarioCentral.interesGanado, currency)}
              />
              <Card
                title="Rendimiento sobre aportes"
                value={
                  calc.escenarioCentral.totalAportado <= 0
                    ? "—"
                    : `${fmtNum(
                        (calc.escenarioCentral.interesGanado /
                          calc.escenarioCentral.totalAportado) *
                          100,
                        1
                      )}%`
                }
              />
            </div>

            <div className="mt-6 grid gap-3 rounded-2xl border border-white/10 bg-zinc-900/40 p-4 text-sm">
              <div>
                <span className="text-white/60">Escenario bajo</span>
                <div className="font-semibold">
                  {fmtMoney(calc.escenarioBajo.fvTotal, currency)}
                </div>
                <div className="text-white/50">
                  Tasa: {fmtNum(calc.tasaBaja * 100, 2)}%
                </div>
              </div>

              <div>
                <span className="text-white/60">Escenario estimado</span>
                <div className="font-semibold">
                  {fmtMoney(calc.escenarioCentral.fvTotal, currency)}
                </div>
                <div className="text-white/50">
                  Tasa: {fmtNum(calc.tasaCentral * 100, 2)}%
                </div>
              </div>

              <div>
                <span className="text-white/60">Escenario alto</span>
                <div className="font-semibold">
                  {fmtMoney(calc.escenarioAlto.fvTotal, currency)}
                </div>
                <div className="text-white/50">
                  Tasa: {fmtNum(calc.tasaAlta * 100, 2)}%
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-lg font-semibold">Cómo lo calculamos</h3>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-white/70">
              <li>
                Se toma una <b>tasa anual estimada</b>.
              </li>
              <li>
                Se aplica un <b>rango de varianza</b> para generar tres
                escenarios: bajo, estimado y alto.
              </li>
              <li>
                La tasa anual se divide según la frecuencia de capitalización
                elegida: <b>{LABEL_FRECUENCIA[frecuenciaCapitalizacion]}</b>.
              </li>
              <li>
                Luego se obtiene una <b>tasa mensual equivalente</b> para poder
                combinarla con aportes mensuales.
              </li>
              <li>
                Se simula el crecimiento mes a mes durante{" "}
                <b>{fmtNum(calc.mesesTotales, 0)}</b> meses.
              </li>
              <li>
                En cada mes el saldo gana interés y después se suma la
                contribución mensual.
              </li>
              <li>
                Valor futuro = <b>saldo final acumulado</b>.
              </li>
              <li>
                Interés ganado = <b>valor futuro − total aportado</b>.
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-lg font-semibold">Limitaciones</h3>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-white/70">
              <li>No contempla inflación, impuestos, comisiones ni devaluación.</li>
              <li>Asume que la tasa se mantiene constante en cada escenario.</li>
              <li>Los aportes mensuales se consideran al final de cada mes.</li>
              <li>La variación de tasas es una simulación simple, no una proyección real de mercado.</li>
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
              inversión con el paso del tiempo según distintos escenarios de
              tasa y capitalización.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-2xl font-semibold">
              Por qué el tiempo hace tanta diferencia
            </h2>
            <p className="mt-3 text-white/75">
              En interés compuesto, el tiempo es una de las variables más
              importantes. Cuanto más años dejes trabajar la inversión, mayor es
              el efecto acumulado.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-2xl font-semibold">Ejemplo práctico</h2>
            <p className="mt-3 text-white/75">
              Si invertís un monto inicial, hacés contribuciones mensuales y
              mantenés una tasa durante varios años, el valor acumulado final
              puede superar ampliamente la suma de tus aportes por efecto de la
              capitalización.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}