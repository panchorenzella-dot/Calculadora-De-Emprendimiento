"use client";

import { type FormEvent, type ReactNode, useState } from "react";

type Currency = "ARS" | "USD";

type Simulation = {
  valorFinal: number;
  aportesMensualesTotales: number;
  totalAportado: number;
  rendimientoGenerado: number;
  ultimoAporteMensual: number;
};

type Results = {
  ahorroMensualNecesario: number | null;
  metaAhorro: number;
  ahorroInicial: number;
  montoFaltaJuntar: number;
  valorFinalEstimado: number;
  totalAportado: number;
  aportesMensualesTotales: number;
  rendimientoGenerado: number;
  porcentajeCubiertoInicial: number;
  porcentajeMetaFinal: number;
  ultimoAporteMensual: number;
  meses: number;
  estado: string;
};

function parseInput(value: string) {
  const cleanValue = value.replace(/\./g, "").replace(",", ".");
  const parsed = Number(cleanValue);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatMoney(value: number, currency: Currency) {
  const safeValue = Number.isFinite(value) ? value : 0;

  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(safeValue);
}

function formatPercent(value: number) {
  const safeValue = Number.isFinite(value) ? value : 0;
  return `${safeValue.toFixed(2)} %`;
}

function formatNumber(value: number) {
  const safeValue = Number.isFinite(value) ? value : 0;

  return new Intl.NumberFormat("es-AR", {
    maximumFractionDigits: 0,
  }).format(safeValue);
}

function formatMonthlySaving(value: number | null, currency: Currency) {
  if (value === null) return "No se puede calcular";
  return formatMoney(value, currency);
}

function simulateGoal({
  ahorroInicial,
  ahorroMensualInicial,
  meses,
  rendimientoAnual,
  aumentoAnualAporte,
}: {
  ahorroInicial: number;
  ahorroMensualInicial: number;
  meses: number;
  rendimientoAnual: number;
  aumentoAnualAporte: number;
}): Simulation {
  const safeAhorroInicial = Math.max(0, ahorroInicial);
  const safeAhorroMensualInicial = Math.max(0, ahorroMensualInicial);
  const safeMeses = Math.max(0, Math.round(meses));
  const safeRendimientoAnual = Math.max(0, rendimientoAnual);
  const safeAumentoAnualAporte = Math.max(0, aumentoAnualAporte);

  const tasaMensual = Math.pow(1 + safeRendimientoAnual / 100, 1 / 12) - 1;
  const aumentoAnualDecimal = safeAumentoAnualAporte / 100;

  let saldo = safeAhorroInicial;
  let aporteMensual = safeAhorroMensualInicial;
  let aportesMensualesTotales = 0;
  let ultimoAporteMensual = 0;

  for (let mes = 1; mes <= safeMeses; mes++) {
    saldo = saldo * (1 + tasaMensual);

    saldo = saldo + aporteMensual;
    aportesMensualesTotales = aportesMensualesTotales + aporteMensual;
    ultimoAporteMensual = aporteMensual;

    if (mes % 12 === 0) {
      aporteMensual = aporteMensual * (1 + aumentoAnualDecimal);
    }
  }

  const totalAportado = safeAhorroInicial + aportesMensualesTotales;
  const rendimientoGenerado = Math.max(saldo - totalAportado, 0);

  return {
    valorFinal: saldo,
    aportesMensualesTotales,
    totalAportado,
    rendimientoGenerado,
    ultimoAporteMensual,
  };
}

function findRequiredMonthlySaving({
  metaAhorro,
  ahorroInicial,
  meses,
  rendimientoAnual,
  aumentoAnualAporte,
}: {
  metaAhorro: number;
  ahorroInicial: number;
  meses: number;
  rendimientoAnual: number;
  aumentoAnualAporte: number;
}) {
  const safeMetaAhorro = Math.max(0, metaAhorro);
  const safeAhorroInicial = Math.max(0, ahorroInicial);
  const safeMeses = Math.max(0, Math.round(meses));

  if (safeMetaAhorro <= 0) return 0;
  if (safeAhorroInicial >= safeMetaAhorro) return 0;
  if (safeMeses <= 0) return null;

  const withoutMonthlySaving = simulateGoal({
    ahorroInicial: safeAhorroInicial,
    ahorroMensualInicial: 0,
    meses: safeMeses,
    rendimientoAnual,
    aumentoAnualAporte,
  });

  if (withoutMonthlySaving.valorFinal >= safeMetaAhorro) return 0;

  let low = 0;
  let high = Math.max((safeMetaAhorro - safeAhorroInicial) / safeMeses, 1);

  for (let i = 0; i < 80; i++) {
    const simulation = simulateGoal({
      ahorroInicial: safeAhorroInicial,
      ahorroMensualInicial: high,
      meses: safeMeses,
      rendimientoAnual,
      aumentoAnualAporte,
    });

    if (simulation.valorFinal >= safeMetaAhorro) {
      break;
    }

    high = high * 2;
  }

  for (let i = 0; i < 100; i++) {
    const mid = (low + high) / 2;

    const simulation = simulateGoal({
      ahorroInicial: safeAhorroInicial,
      ahorroMensualInicial: mid,
      meses: safeMeses,
      rendimientoAnual,
      aumentoAnualAporte,
    });

    if (simulation.valorFinal >= safeMetaAhorro) {
      high = mid;
    } else {
      low = mid;
    }
  }

  return high;
}

function calculateResults({
  metaAhorro,
  ahorroInicial,
  meses,
  rendimientoAnual,
  aumentoAnualAporte,
}: {
  metaAhorro: number;
  ahorroInicial: number;
  meses: number;
  rendimientoAnual: number;
  aumentoAnualAporte: number;
}): Results {
  const safeMetaAhorro = Math.max(0, metaAhorro);
  const safeAhorroInicial = Math.max(0, ahorroInicial);
  const safeMeses = Math.max(0, Math.round(meses));

  const ahorroMensualNecesario = findRequiredMonthlySaving({
    metaAhorro: safeMetaAhorro,
    ahorroInicial: safeAhorroInicial,
    meses: safeMeses,
    rendimientoAnual,
    aumentoAnualAporte,
  });

  const simulation = simulateGoal({
    ahorroInicial: safeAhorroInicial,
    ahorroMensualInicial: ahorroMensualNecesario ?? 0,
    meses: safeMeses,
    rendimientoAnual,
    aumentoAnualAporte,
  });

  const montoFaltaJuntar = Math.max(safeMetaAhorro - safeAhorroInicial, 0);

  const porcentajeCubiertoInicial =
    safeMetaAhorro > 0 ? (safeAhorroInicial / safeMetaAhorro) * 100 : 0;

  const porcentajeMetaFinal =
    safeMetaAhorro > 0 ? (simulation.valorFinal / safeMetaAhorro) * 100 : 0;

  let estado = "Cargá una meta de ahorro";

  if (safeMetaAhorro > 0 && safeAhorroInicial >= safeMetaAhorro) {
    estado = "Ya alcanzaste la meta";
  }

  if (
    safeMetaAhorro > 0 &&
    safeAhorroInicial < safeMetaAhorro &&
    safeMeses <= 0
  ) {
    estado = "Necesitás cargar un plazo";
  }

  if (
    safeMetaAhorro > 0 &&
    safeAhorroInicial < safeMetaAhorro &&
    safeMeses > 0 &&
    ahorroMensualNecesario !== null
  ) {
    estado = "Meta posible con ahorro mensual";
  }

  return {
    ahorroMensualNecesario,
    metaAhorro: safeMetaAhorro,
    ahorroInicial: safeAhorroInicial,
    montoFaltaJuntar,
    valorFinalEstimado: simulation.valorFinal,
    totalAportado: simulation.totalAportado,
    aportesMensualesTotales: simulation.aportesMensualesTotales,
    rendimientoGenerado: simulation.rendimientoGenerado,
    porcentajeCubiertoInicial,
    porcentajeMetaFinal,
    ultimoAporteMensual: simulation.ultimoAporteMensual,
    meses: safeMeses,
    estado,
  };
}

type InputFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  helper?: string;
  prefix?: string;
  suffix?: string;
};

function InputField({
  label,
  value,
  onChange,
  helper,
  prefix,
  suffix,
}: InputFieldProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-zinc-200">
        {label}
      </label>

      <div className="relative">
        {prefix && (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
            {prefix}
          </span>
        )}

        <input
          type="number"
          min="0"
          inputMode="decimal"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="0"
          className={`w-full appearance-none rounded-2xl border border-zinc-800 bg-zinc-950 py-3 text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-zinc-500 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
            prefix ? "pl-9" : "pl-4"
          } ${suffix ? "pr-16" : "pr-4"}`}
        />

        {suffix && (
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500">
            {suffix}
          </span>
        )}
      </div>

      {helper && (
        <p className="mt-2 text-xs leading-relaxed text-zinc-500">{helper}</p>
      )}
    </div>
  );
}

type ResultCardProps = {
  title: string;
  value: string;
  muted?: boolean;
  highlight?: boolean;
};

function ResultCard({
  title,
  value,
  muted = false,
  highlight = false,
}: ResultCardProps) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        highlight
          ? "border-zinc-600 bg-zinc-900"
          : "border-zinc-800 bg-zinc-950"
      }`}
    >
      <p className="text-sm text-zinc-400">{title}</p>

      <p
        className={`mt-2 text-2xl font-bold ${
          muted ? "text-zinc-600" : "text-zinc-50"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function SeoSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white">{title}</h2>
      <div className="mt-4 space-y-4 text-zinc-400">{children}</div>
    </div>
  );
}

export default function MetaDeAhorroPage() {
  const [currency, setCurrency] = useState<Currency>("ARS");

  const [metaAhorro, setMetaAhorro] = useState("");
  const [ahorroInicial, setAhorroInicial] = useState("");
  const [meses, setMeses] = useState("");
  const [rendimientoAnual, setRendimientoAnual] = useState("");
  const [aumentoAnualAporte, setAumentoAnualAporte] = useState("");

  const [results, setResults] = useState<Results | null>(null);

  const moneyPrefix = currency === "ARS" ? "$" : "US$";

  function handleCalculate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const calculatedResults = calculateResults({
      metaAhorro: parseInput(metaAhorro),
      ahorroInicial: parseInput(ahorroInicial),
      meses: parseInput(meses),
      rendimientoAnual: parseInput(rendimientoAnual),
      aumentoAnualAporte: parseInput(aumentoAnualAporte),
    });

    setResults(calculatedResults);
  }

  const emptyResults: Results = {
    ahorroMensualNecesario: 0,
    metaAhorro: 0,
    ahorroInicial: 0,
    montoFaltaJuntar: 0,
    valorFinalEstimado: 0,
    totalAportado: 0,
    aportesMensualesTotales: 0,
    rendimientoGenerado: 0,
    porcentajeCubiertoInicial: 0,
    porcentajeMetaFinal: 0,
    ultimoAporteMensual: 0,
    meses: 0,
    estado: "Sin calcular",
  };

  const displayedResults = results ?? emptyResults;
  const isMuted = results === null;

  return (
    <main className="min-h-screen bg-black px-4 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <section className="mb-10">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Inversión y ahorro
          </p>

          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Meta de ahorro
          </h1>

          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-zinc-400">
            Calculá cuánto necesitás ahorrar por mes.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_1.15fr]">
          <form
            onSubmit={handleCalculate}
            className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6"
          >
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-2xl font-bold">Datos</h2>

              <div className="flex rounded-full border border-zinc-800 bg-black p-1">
                <button
                  type="button"
                  onClick={() => setCurrency("ARS")}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    currency === "ARS"
                      ? "bg-white text-black"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  ARS
                </button>

                <button
                  type="button"
                  onClick={() => setCurrency("USD")}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    currency === "USD"
                      ? "bg-white text-black"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  USD
                </button>
              </div>
            </div>

            <div className="space-y-7">
              <div>
                <h3 className="mb-4 text-lg font-semibold text-zinc-100">
                  Objetivo
                </h3>

                <div className="space-y-4">
                  <InputField
                    label="Meta de ahorro"
                    value={metaAhorro}
                    onChange={setMetaAhorro}
                    prefix={moneyPrefix}
                    helper="Es el monto total que querés juntar."
                  />

                  <InputField
                    label="Ahorro inicial"
                    value={ahorroInicial}
                    onChange={setAhorroInicial}
                    prefix={moneyPrefix}
                    helper="Es el dinero que ya tenés ahorrado. Si empezás de cero, dejalo en 0."
                  />

                  <InputField
                    label="Tiempo para llegar"
                    value={meses}
                    onChange={setMeses}
                    suffix="meses"
                    helper="Cantidad de meses que tenés para alcanzar la meta."
                  />
                </div>
              </div>

              <div>
                <h3 className="mb-4 text-lg font-semibold text-zinc-100">
                  Rendimiento opcional
                </h3>

                <div className="space-y-4">
                  <InputField
                    label="Rendimiento anual estimado"
                    value={rendimientoAnual}
                    onChange={setRendimientoAnual}
                    suffix="%"
                    helper="Opcional. Si no aplica, dejalo en 0."
                  />

                  <InputField
                    label="Aumento anual del aporte"
                    value={aumentoAnualAporte}
                    onChange={setAumentoAnualAporte}
                    suffix="%"
                    helper="Opcional. Si no aplica, dejalo en 0."
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-white px-5 py-3 font-semibold text-black transition hover:bg-zinc-200"
              >
                Calcular
              </button>
            </div>
          </form>

          <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
            <h2 className="text-2xl font-bold">Resultados</h2>

            {results === null && (
              <p className="mt-3 text-sm text-zinc-500">
                Cargá tus datos y tocá Calcular.
              </p>
            )}

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <ResultCard
                title="Ahorro mensual necesario"
                value={formatMonthlySaving(
                  displayedResults.ahorroMensualNecesario,
                  currency
                )}
                muted={isMuted}
                highlight
              />

              <ResultCard
                title="Estado"
                value={displayedResults.estado}
                muted={isMuted}
              />

              <ResultCard
                title="Meta de ahorro"
                value={formatMoney(displayedResults.metaAhorro, currency)}
                muted={isMuted}
              />

              <ResultCard
                title="Monto que falta juntar"
                value={formatMoney(displayedResults.montoFaltaJuntar, currency)}
                muted={isMuted}
              />

              <ResultCard
                title="Ahorro inicial"
                value={formatMoney(displayedResults.ahorroInicial, currency)}
                muted={isMuted}
              />

              <ResultCard
                title="Valor final estimado"
                value={formatMoney(
                  displayedResults.valorFinalEstimado,
                  currency
                )}
                muted={isMuted}
              />

              <ResultCard
                title="Total aportado"
                value={formatMoney(displayedResults.totalAportado, currency)}
                muted={isMuted}
              />

              <ResultCard
                title="Rendimiento generado"
                value={formatMoney(
                  displayedResults.rendimientoGenerado,
                  currency
                )}
                muted={isMuted}
              />

              <ResultCard
                title="Meta cubierta al inicio"
                value={formatPercent(displayedResults.porcentajeCubiertoInicial)}
                muted={isMuted}
              />

              <ResultCard
                title="Meta cubierta al final"
                value={formatPercent(displayedResults.porcentajeMetaFinal)}
                muted={isMuted}
              />

              <ResultCard
                title="Plazo"
                value={`${formatNumber(displayedResults.meses)} meses`}
                muted={isMuted}
              />

              <ResultCard
                title="Tipo de cálculo"
                value="Meta de ahorro"
                muted={isMuted}
              />
            </div>
          </section>
        </section>

        <section className="mt-10 rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="text-2xl font-bold text-white">Cómo lo calculamos</h2>

          <ul className="mt-4 space-y-2 text-sm leading-relaxed text-zinc-400">
            <li>• Monto que falta juntar = meta de ahorro − ahorro inicial.</li>
            <li>
              • Si el ahorro inicial ya alcanza la meta, el ahorro mensual
              necesario es cero.
            </li>
            <li>
              • Si cargás rendimiento anual, se convierte en una tasa mensual
              equivalente.
            </li>
            <li>
              • Cada mes se aplica el rendimiento sobre el saldo acumulado.
            </li>
            <li>
              • Después se suma el ahorro mensual necesario para alcanzar la
              meta.
            </li>
            <li>
              • Total aportado = ahorro inicial + todos los aportes mensuales.
            </li>
            <li>
              • Rendimiento generado = valor final estimado − total aportado.
            </li>
          </ul>
        </section>

        <section className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="text-2xl font-bold text-white">Limitaciones</h2>

          <ul className="mt-4 space-y-2 text-sm leading-relaxed text-zinc-400">
            <li>
              • La calculadora no garantiza que puedas alcanzar la meta en la
              vida real.
            </li>
            <li>
              • No contempla inflación, impuestos, comisiones ni devaluación.
            </li>
            <li>
              • El rendimiento anual es una estimación y puede cambiar con el
              tiempo.
            </li>
            <li>• No considera retiros parciales durante el período.</li>
            <li>
              • Los resultados son una simulación matemática, no asesoramiento
              financiero.
            </li>
          </ul>
        </section>

        <section className="mt-10 space-y-8 rounded-3xl border border-zinc-800 bg-zinc-950 p-6 leading-relaxed text-zinc-400">
          <SeoSection title="Calculadora de meta de ahorro">
            <p>
              Esta calculadora de meta de ahorro sirve para estimar cuánto
              necesitás ahorrar por mes para llegar a un objetivo de dinero en
              un plazo determinado.
            </p>

            <p>
              Podés cargar la meta total, el ahorro inicial, la cantidad de
              meses y un rendimiento anual estimado si tu dinero va a estar
              invertido.
            </p>
          </SeoSection>

          <SeoSection title="Para qué sirve esta calculadora">
            <p>
              Esta calculadora sirve para planificar objetivos concretos. Por
              ejemplo, juntar dinero para comprar algo, armar un fondo de
              emergencia, ahorrar para un viaje, reunir capital para un negocio o
              alcanzar una meta personal en pesos o dólares.
            </p>

            <p>
              También sirve para saber si una meta es realista. Muchas veces una
              persona sabe cuánto quiere juntar, pero no sabe cuánto debería
              separar todos los meses para llegar a tiempo.
            </p>
          </SeoSection>

          <SeoSection title="Qué significa ahorro mensual necesario">
            <p>
              El ahorro mensual necesario es el monto que tendrías que separar
              cada mes para alcanzar la meta dentro del plazo elegido.
            </p>

            <p>
              Si cargás un rendimiento anual estimado, la calculadora considera
              que el dinero acumulado también genera rendimiento durante el
              período.
            </p>
          </SeoSection>

          <SeoSection title="Ejemplo práctico">
            <p>
              Supongamos que querés juntar $2.000.000 en 12 meses y ya tenés
              $500.000 ahorrados. Si no considerás rendimiento, todavía necesitás
              juntar $1.500.000. Dividido en 12 meses, deberías ahorrar
              aproximadamente $125.000 por mes.
            </p>
          </SeoSection>

          <SeoSection title="Errores comunes">
            <ul className="space-y-2">
              <li>• No definir un plazo concreto para la meta.</li>
              <li>• No separar el ahorro inicial del monto que falta juntar.</li>
              <li>• Suponer un rendimiento anual demasiado alto.</li>
              <li>• No considerar inflación o aumento de precios.</li>
              <li>• Planificar un ahorro mensual difícil de sostener.</li>
            </ul>
          </SeoSection>

          <SeoSection title="Preguntas frecuentes">
            <h3 className="mt-5 text-lg font-semibold text-white">
              ¿Esta calculadora sirve para pesos y dólares?
            </h3>

            <p className="mt-2">
              Sí. Podés usarla en pesos argentinos o en dólares. La fórmula es
              la misma; lo que cambia es la moneda en la que cargás e interpretás
              los resultados.
            </p>

            <h3 className="mt-5 text-lg font-semibold text-white">
              ¿Qué pongo en meta de ahorro?
            </h3>

            <p className="mt-2">
              Tenés que poner el monto total que querés alcanzar.
            </p>

            <h3 className="mt-5 text-lg font-semibold text-white">
              ¿Qué pasa si no quiero considerar rendimiento?
            </h3>

            <p className="mt-2">
              Podés dejar el rendimiento anual estimado en cero. En ese caso, la
              calculadora hace una estimación simple de ahorro mensual sin
              intereses.
            </p>
          </SeoSection>
        </section>
      </div>
    </main>
  );
}