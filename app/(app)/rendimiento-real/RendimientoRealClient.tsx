"use client";

import { type FormEvent, type ReactNode, useState } from "react";

type Currency = "ARS" | "USD";

type Results = {
  totalInvertidoReal: number;
  gananciaNominal: number;
  rendimientoNominal: number;
  rendimientoReal: number;
  gananciaRealAjustada: number;
  montoFinalAjustado: number;
  inflacionCargada: number;
  rendimientoMensualReal: number;
  rendimientoAnualizadoReal: number;
  meses: number;
  estado: string;
};

function parseInput(value: string) {
  const cleanValue = value.replace(/\./g, "").replace(",", ".");
  const parsed = Number(cleanValue);
  return Number.isFinite(parsed) ? parsed : 0;
}

function addThousandsSeparator(value: string) {
  return value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function formatInputValue(value: string) {
  const cleanValue = value.replace(/[^\d,]/g, "");

  if (!cleanValue) return "";

  const hasComma = cleanValue.includes(",");
  const [integerRaw, ...decimalParts] = cleanValue.split(",");

  const integerPart = integerRaw.replace(/\D/g, "");
  const decimalPart = decimalParts.join("").replace(/\D/g, "");

  const formattedInteger = integerPart
    ? addThousandsSeparator(integerPart)
    : "";

  if (hasComma) {
    return `${formattedInteger},${decimalPart}`;
  }

  return formattedInteger;
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

function calculateResults({
  montoInicial,
  montoFinal,
  inflacionPeriodo,
  costosExtra,
  meses,
}: {
  montoInicial: number;
  montoFinal: number;
  inflacionPeriodo: number;
  costosExtra: number;
  meses: number;
}): Results {
  const safeMontoInicial = Math.max(0, montoInicial);
  const safeMontoFinal = Math.max(0, montoFinal);
  const safeInflacionPeriodo = Math.max(0, inflacionPeriodo);
  const safeCostosExtra = Math.max(0, costosExtra);
  const safeMeses = Math.max(0, meses);

  const totalInvertidoReal = safeMontoInicial + safeCostosExtra;
  const gananciaNominal = safeMontoFinal - totalInvertidoReal;

  const rendimientoNominal =
    totalInvertidoReal > 0 ? (gananciaNominal / totalInvertidoReal) * 100 : 0;

  const rendimientoNominalDecimal = rendimientoNominal / 100;
  const inflacionDecimal = safeInflacionPeriodo / 100;

  const rendimientoRealDecimal =
    (1 + rendimientoNominalDecimal) / (1 + inflacionDecimal) - 1;

  const rendimientoReal = rendimientoRealDecimal * 100;

  const montoFinalAjustado = safeMontoFinal / (1 + inflacionDecimal);

  const gananciaRealAjustada = montoFinalAjustado - totalInvertidoReal;

  let rendimientoMensualReal = 0;
  let rendimientoAnualizadoReal = 0;

  if (safeMeses > 0 && rendimientoRealDecimal > -1) {
    rendimientoMensualReal =
      (Math.pow(1 + rendimientoRealDecimal, 1 / safeMeses) - 1) * 100;

    rendimientoAnualizadoReal =
      (Math.pow(1 + rendimientoMensualReal / 100, 12) - 1) * 100;
  }

  let estado = "Cargá los datos para calcular";

  if (totalInvertidoReal > 0) {
    if (rendimientoReal > 0) {
      estado = "Ganaste poder de compra";
    } else if (rendimientoReal < 0) {
      estado = "Perdiste poder de compra";
    } else {
      estado = "Empataste contra la inflación";
    }
  }

  return {
    totalInvertidoReal,
    gananciaNominal,
    rendimientoNominal,
    rendimientoReal,
    gananciaRealAjustada,
    montoFinalAjustado,
    inflacionCargada: safeInflacionPeriodo,
    rendimientoMensualReal,
    rendimientoAnualizadoReal,
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
  const leftPaddingClass = prefix
    ? prefix.length > 1
      ? "pl-16"
      : "pl-10"
    : "pl-4";

  const rightPaddingClass = suffix
    ? suffix.length > 1
      ? "pr-24"
      : "pr-12"
    : "pr-4";

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
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(event) => onChange(formatInputValue(event.target.value))}
          placeholder="0"
          className={`w-full rounded-2xl border border-zinc-800 bg-zinc-950 py-3 text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-emerald-300/50 ${leftPaddingClass} ${rightPaddingClass}`}
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
        className={`mt-2 break-words text-2xl font-bold ${
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

export default function RendimientoRealPage() {
  const [currency, setCurrency] = useState<Currency>("ARS");

  const [montoInicial, setMontoInicial] = useState("");
  const [montoFinal, setMontoFinal] = useState("");
  const [inflacionPeriodo, setInflacionPeriodo] = useState("");
  const [costosExtra, setCostosExtra] = useState("");
  const [meses, setMeses] = useState("");

  const [results, setResults] = useState<Results | null>(null);

  const moneyPrefix = currency === "ARS" ? "$" : "US$";

  function handleCalculate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const calculatedResults = calculateResults({
      montoInicial: parseInput(montoInicial),
      montoFinal: parseInput(montoFinal),
      inflacionPeriodo: parseInput(inflacionPeriodo),
      costosExtra: parseInput(costosExtra),
      meses: parseInput(meses),
    });

    setResults(calculatedResults);
  }

  const emptyResults: Results = {
    totalInvertidoReal: 0,
    gananciaNominal: 0,
    rendimientoNominal: 0,
    rendimientoReal: 0,
    gananciaRealAjustada: 0,
    montoFinalAjustado: 0,
    inflacionCargada: 0,
    rendimientoMensualReal: 0,
    rendimientoAnualizadoReal: 0,
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
            Rendimiento real
          </h1>

          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-zinc-400">
            Calculá si realmente ganaste después de la inflación.
          </p>

          <p className="mt-3 max-w-3xl text-base leading-relaxed text-zinc-500">
            Ideal para medir el poder de compra de una inversión.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_1.15fr]">
          <form
            onSubmit={handleCalculate}
            className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6"
          >
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-2xl font-bold">Datos</h2>

              <div className="flex rounded-xl border border-white/10 bg-black/40 p-1 shadow-inner shadow-black/40">
                <button
                  type="button"
                  onClick={() => setCurrency("ARS")}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                    currency === "ARS"
                      ? "bg-zinc-800 text-white shadow-sm shadow-black ring-1 ring-inset ring-white/10"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  ARS
                </button>

                <button
                  type="button"
                  onClick={() => setCurrency("USD")}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                    currency === "USD"
                      ? "bg-zinc-800 text-white shadow-sm shadow-black ring-1 ring-inset ring-white/10"
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
                  Inversión
                </h3>

                <div className="space-y-4">
                  <InputField
                    label="Monto inicial"
                    value={montoInicial}
                    onChange={setMontoInicial}
                    prefix={moneyPrefix}
                    helper="Es el dinero inicial invertido o el valor de referencia al comienzo."
                  />

                  <InputField
                    label="Monto final"
                    value={montoFinal}
                    onChange={setMontoFinal}
                    prefix={moneyPrefix}
                    helper="Es el dinero final obtenido o el valor actual de la inversión."
                  />

                  <InputField
                    label="Costos extra"
                    value={costosExtra}
                    onChange={setCostosExtra}
                    prefix={moneyPrefix}
                    helper="Opcional. Incluye comisiones, impuestos, gastos u otros costos. Si no aplica, dejalo en 0."
                  />
                </div>
              </div>

              <div>
                <h3 className="mb-4 text-lg font-semibold text-zinc-100">
                  Inflación y tiempo
                </h3>

                <div className="space-y-4">
                  <InputField
                    label="Inflación del período"
                    value={inflacionPeriodo}
                    onChange={setInflacionPeriodo}
                    suffix="%"
                    helper="Ingresá la inflación acumulada del mismo período de la inversión."
                  />

                  <InputField
                    label="Tiempo de inversión"
                    value={meses}
                    onChange={setMeses}
                    suffix="meses"
                    helper="Opcional. Sirve para estimar rendimiento real mensual y anualizado."
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-full bg-white px-4 py-2.5 font-semibold text-zinc-950 transition hover:bg-zinc-200"
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
                title="Rendimiento real"
                value={formatPercent(displayedResults.rendimientoReal)}
                muted={isMuted}
                highlight
              />

              <ResultCard
                title="Estado"
                value={displayedResults.estado}
                muted={isMuted}
              />

              <ResultCard
                title="Rendimiento nominal"
                value={formatPercent(displayedResults.rendimientoNominal)}
                muted={isMuted}
              />

              <ResultCard
                title="Inflación cargada"
                value={formatPercent(displayedResults.inflacionCargada)}
                muted={isMuted}
              />

              <ResultCard
                title="Ganancia nominal"
                value={formatMoney(displayedResults.gananciaNominal, currency)}
                muted={isMuted}
              />

              <ResultCard
                title="Ganancia real ajustada"
                value={formatMoney(
                  displayedResults.gananciaRealAjustada,
                  currency
                )}
                muted={isMuted}
              />

              <ResultCard
                title="Total invertido real"
                value={formatMoney(
                  displayedResults.totalInvertidoReal,
                  currency
                )}
                muted={isMuted}
              />

              <ResultCard
                title="Monto final ajustado"
                value={formatMoney(displayedResults.montoFinalAjustado, currency)}
                muted={isMuted}
              />

              <ResultCard
                title="Rendimiento real mensual"
                value={formatPercent(displayedResults.rendimientoMensualReal)}
                muted={isMuted}
              />

              <ResultCard
                title="Rendimiento real anualizado"
                value={formatPercent(displayedResults.rendimientoAnualizadoReal)}
                muted={isMuted}
              />

              <ResultCard
                title="Tiempo cargado"
                value={`${formatNumber(displayedResults.meses)} meses`}
                muted={isMuted}
              />

              <ResultCard
                title="Tipo de cálculo"
                value="Rendimiento real"
                muted={isMuted}
              />
            </div>
          </section>
        </section>

        <section className="mt-10 rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="text-2xl font-bold text-white">Cómo lo calculamos</h2>

          <ul className="mt-4 space-y-2 text-sm leading-relaxed text-zinc-400">
            <li>• Total invertido real = monto inicial + costos extra.</li>
            <li>• Ganancia nominal = monto final − total invertido real.</li>
            <li>
              • Rendimiento nominal = ganancia nominal / total invertido real ×
              100.
            </li>
            <li>
              • Rendimiento real = ((1 + rendimiento nominal) / (1 +
              inflación)) − 1.
            </li>
            <li>
              • Monto final ajustado = monto final / (1 + inflación del
              período).
            </li>
            <li>
              • Ganancia real ajustada = monto final ajustado − total invertido
              real.
            </li>
            <li>• Si el rendimiento real es positivo, ganaste poder de compra.</li>
            <li>• Si el rendimiento real es negativo, perdiste poder de compra.</li>
          </ul>
        </section>

        <section className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="text-2xl font-bold text-white">Limitaciones</h2>

          <ul className="mt-4 space-y-2 text-sm leading-relaxed text-zinc-400">
            <li>
              • La calculadora depende de que la inflación cargada corresponda al
              mismo período de la inversión.
            </li>
            <li>• No contempla impuestos o costos que no hayan sido cargados.</li>
            <li>• No mide riesgo, volatilidad ni probabilidad de pérdida.</li>
            <li>
              • El rendimiento real mensual y anualizado son estimaciones
              matemáticas.
            </li>
            <li>• Los resultados son una simulación, no asesoramiento financiero.</li>
          </ul>
        </section>

        <section className="mt-10 space-y-8 rounded-3xl border border-zinc-800 bg-zinc-950 p-6 leading-relaxed text-zinc-400">
          <SeoSection title="Calculadora de rendimiento real">
            <p>
              Esta calculadora de rendimiento real sirve para estimar si una
              inversión realmente ganó poder de compra después de descontar la
              inflación del período.
            </p>

            <p>
              Podés cargar el monto inicial, el monto final, la inflación
              acumulada, costos extra y el tiempo de inversión para comparar el
              rendimiento nominal contra el rendimiento real.
            </p>
          </SeoSection>

          <SeoSection title="Qué es el rendimiento real">
            <p>
              El rendimiento real es el resultado de una inversión después de
              descontar el efecto de la inflación. Sirve para saber si una
              ganancia nominal realmente aumentó tu poder de compra.
            </p>

            <p>
              Por ejemplo, si una inversión subió 50 %, pero la inflación del
              período fue 60 %, el rendimiento nominal fue positivo, pero el
              rendimiento real fue negativo.
            </p>
          </SeoSection>

          <SeoSection title="Para qué sirve esta calculadora">
            <p>
              Esta calculadora sirve para analizar inversiones en contextos donde
              la inflación es importante. Ayuda a entender si una inversión
              solamente subió de precio o si realmente permitió comprar más que
              antes.
            </p>

            <p>
              También sirve para comparar alternativas de inversión, revisar
              resultados pasados o analizar si una ganancia superó la pérdida de
              poder adquisitivo.
            </p>
          </SeoSection>

          <SeoSection title="Diferencia entre rendimiento nominal y rendimiento real">
            <p>
              El rendimiento nominal muestra cuánto creció una inversión sin
              descontar inflación. El rendimiento real muestra cuánto creció
              después de ajustar por inflación.
            </p>

            <p>
              Por eso, una inversión puede tener rendimiento nominal positivo y
              rendimiento real negativo al mismo tiempo. Esto pasa cuando la
              inversión crece menos que los precios.
            </p>
          </SeoSection>

          <SeoSection title="Ejemplo práctico">
            <p>
              Supongamos que invertiste $100.000 y terminaste con $150.000. El
              rendimiento nominal fue 50 %. Pero si durante ese mismo período la
              inflación fue 60 %, el rendimiento real fue negativo.
            </p>

            <p>
              En ese caso, aunque terminaste con más pesos, esos pesos compran
              menos que antes. Por eso el rendimiento real es clave para medir la
              ganancia en términos de poder de compra.
            </p>
          </SeoSection>

          <SeoSection title="Errores comunes">
            <ul className="space-y-2">
              <li>• Mirar solo la ganancia nominal.</li>
              <li>• No descontar la inflación del período.</li>
              <li>• Comparar períodos distintos.</li>
              <li>• No sumar comisiones, impuestos o costos extra.</li>
              <li>
                • Pensar que ganar más dinero siempre significa ganar poder de
                compra.
              </li>
              <li>
                • Usar una inflación que no corresponde al plazo de la inversión.
              </li>
            </ul>
          </SeoSection>

          <SeoSection title="Preguntas frecuentes">
            <h3 className="mt-5 text-lg font-semibold text-white">
              ¿Esta calculadora sirve para pesos y dólares?
            </h3>

            <p className="mt-2">
              Sí. Podés usarla en pesos argentinos o en dólares. La fórmula es
              la misma; lo importante es cargar una inflación correspondiente al
              período que querés analizar.
            </p>

            <h3 className="mt-5 text-lg font-semibold text-white">
              ¿Qué pongo en monto inicial?
            </h3>

            <p className="mt-2">
              Tenés que poner el valor inicial de la inversión o el dinero que
              pusiste al comienzo.
            </p>

            <h3 className="mt-5 text-lg font-semibold text-white">
              ¿Qué pongo en monto final?
            </h3>

            <p className="mt-2">
              Tenés que poner cuánto vale ahora la inversión o cuánto dinero
              obtuviste al finalizar.
            </p>

            <h3 className="mt-5 text-lg font-semibold text-white">
              ¿Qué inflación tengo que cargar?
            </h3>

            <p className="mt-2">
              Tenés que cargar la inflación acumulada del mismo período de la
              inversión. Si la inversión duró 12 meses, usá la inflación de esos
              12 meses.
            </p>

            <h3 className="mt-5 text-lg font-semibold text-white">
              ¿Es una recomendación financiera?
            </h3>

            <p className="mt-2">
              No. Es una herramienta de cálculo para comparar rendimiento nominal
              y rendimiento real. No reemplaza asesoramiento financiero.
            </p>
          </SeoSection>
        </section>
      </div>
    </main>
  );
}