"use client";

import { type FormEvent, type ReactNode, useState } from "react";

type Currency = "ARS" | "USD";

type Results = {
  mesesParaRecuperar: number | null;
  gananciaAcumulada: number;
  capitalRecuperado: number;
  capitalPendiente: number;
  porcentajeRecuperado: number;
  gananciaDespuesDeRecuperar: number;
  estado: string;
  recuperaDentroDelPeriodo: boolean;
  mesesAnalisis: number;
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
    maximumFractionDigits: 1,
  }).format(safeValue);
}

function formatMonths(value: number | null) {
  if (value === null) return "No se recupera";

  if (value === 1) return "1 mes";

  return `${formatNumber(value)} meses`;
}

function calculateResults({
  inversionInicial,
  gananciaMensualNeta,
  mesesAnalisis,
}: {
  inversionInicial: number;
  gananciaMensualNeta: number;
  mesesAnalisis: number;
}): Results {
  const safeInversionInicial = Math.max(0, inversionInicial);
  const safeGananciaMensualNeta = Math.max(0, gananciaMensualNeta);
  const safeMesesAnalisis = Math.max(0, mesesAnalisis);

  const gananciaAcumulada = safeGananciaMensualNeta * safeMesesAnalisis;

  const capitalRecuperado = Math.min(gananciaAcumulada, safeInversionInicial);

  const capitalPendiente = Math.max(
    safeInversionInicial - gananciaAcumulada,
    0
  );

  const porcentajeRecuperado =
    safeInversionInicial > 0
      ? (capitalRecuperado / safeInversionInicial) * 100
      : 0;

  const mesesParaRecuperar =
    safeGananciaMensualNeta > 0 && safeInversionInicial > 0
      ? safeInversionInicial / safeGananciaMensualNeta
      : null;

  const recuperaDentroDelPeriodo =
    mesesParaRecuperar !== null && mesesParaRecuperar <= safeMesesAnalisis;

  const gananciaDespuesDeRecuperar = Math.max(
    gananciaAcumulada - safeInversionInicial,
    0
  );

  let estado = "Cargá una inversión y una ganancia mensual";

  if (safeInversionInicial > 0 && safeGananciaMensualNeta === 0) {
    estado = "No se recupera con ganancia mensual cero";
  }

  if (
    safeInversionInicial > 0 &&
    safeGananciaMensualNeta > 0 &&
    recuperaDentroDelPeriodo
  ) {
    estado = "Recuperás la inversión dentro del período";
  }

  if (
    safeInversionInicial > 0 &&
    safeGananciaMensualNeta > 0 &&
    !recuperaDentroDelPeriodo
  ) {
    estado = "Todavía falta recuperar capital";
  }

  if (safeInversionInicial === 0) {
    estado = "No hay inversión inicial cargada";
  }

  return {
    mesesParaRecuperar,
    gananciaAcumulada,
    capitalRecuperado,
    capitalPendiente,
    porcentajeRecuperado,
    gananciaDespuesDeRecuperar,
    estado,
    recuperaDentroDelPeriodo,
    mesesAnalisis: safeMesesAnalisis,
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

  const rightPaddingClass = suffix ? "pr-24" : "pr-4";

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

export default function RecuperoDeCapitalPage() {
  const [currency, setCurrency] = useState<Currency>("ARS");

  const [inversionInicial, setInversionInicial] = useState("");
  const [gananciaMensualNeta, setGananciaMensualNeta] = useState("");
  const [mesesAnalisis, setMesesAnalisis] = useState("");

  const [results, setResults] = useState<Results | null>(null);

  const moneyPrefix = currency === "ARS" ? "$" : "US$";

  function handleCalculate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const inversionInicialNumber = parseInput(inversionInicial);
    const gananciaMensualNetaNumber = parseInput(gananciaMensualNeta);
    const mesesAnalisisNumber = parseInput(mesesAnalisis);

    const calculatedResults = calculateResults({
      inversionInicial: inversionInicialNumber,
      gananciaMensualNeta: gananciaMensualNetaNumber,
      mesesAnalisis: mesesAnalisisNumber,
    });

    setResults(calculatedResults);
  }

  const emptyResults: Results = {
    mesesParaRecuperar: 0,
    gananciaAcumulada: 0,
    capitalRecuperado: 0,
    capitalPendiente: 0,
    porcentajeRecuperado: 0,
    gananciaDespuesDeRecuperar: 0,
    estado: "Sin calcular",
    recuperaDentroDelPeriodo: false,
    mesesAnalisis: 0,
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
            Recupero de capital
          </h1>

          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-zinc-400">
            Calculá en cuánto tiempo recuperás una inversión.
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
                    label="Inversión inicial"
                    value={inversionInicial}
                    onChange={setInversionInicial}
                    prefix={moneyPrefix}
                    helper="Es el dinero que pusiste al comienzo del proyecto, negocio o inversión."
                  />

                  <InputField
                    label="Ganancia mensual neta"
                    value={gananciaMensualNeta}
                    onChange={setGananciaMensualNeta}
                    prefix={moneyPrefix}
                    helper="Es lo que te queda por mes después de pagar costos. No cargues ventas brutas si todavía no descontaste gastos."
                  />

                  <InputField
                    label="Meses de análisis"
                    value={mesesAnalisis}
                    onChange={setMesesAnalisis}
                    suffix="meses"
                    helper="Sirve para ver si recuperás la inversión dentro de un período específico."
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
                title="Meses para recuperar"
                value={formatMonths(displayedResults.mesesParaRecuperar)}
                muted={isMuted}
                highlight
              />

              <ResultCard
                title="Estado"
                value={displayedResults.estado}
                muted={isMuted}
              />

              <ResultCard
                title="Ganancia acumulada"
                value={formatMoney(displayedResults.gananciaAcumulada, currency)}
                muted={isMuted}
              />

              <ResultCard
                title="Capital recuperado"
                value={formatMoney(displayedResults.capitalRecuperado, currency)}
                muted={isMuted}
              />

              <ResultCard
                title="Capital pendiente"
                value={formatMoney(displayedResults.capitalPendiente, currency)}
                muted={isMuted}
              />

              <ResultCard
                title="Porcentaje recuperado"
                value={formatPercent(displayedResults.porcentajeRecuperado)}
                muted={isMuted}
              />

              <ResultCard
                title="Ganancia después del recupero"
                value={formatMoney(
                  displayedResults.gananciaDespuesDeRecuperar,
                  currency
                )}
                muted={isMuted}
              />

              <ResultCard
                title="Período analizado"
                value={`${formatNumber(displayedResults.mesesAnalisis)} meses`}
                muted={isMuted}
              />
            </div>
          </section>
        </section>

        <section className="mt-10 rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="text-2xl font-bold text-white">Cómo lo calculamos</h2>

          <ul className="mt-4 space-y-2 text-sm leading-relaxed text-zinc-400">
            <li>
              • Meses para recuperar = inversión inicial / ganancia mensual
              neta.
            </li>
            <li>
              • Ganancia acumulada = ganancia mensual neta × meses de análisis.
            </li>
            <li>
              • Capital recuperado = parte de la inversión inicial cubierta por
              la ganancia acumulada.
            </li>
            <li>
              • Capital pendiente = inversión inicial − ganancia acumulada.
            </li>
            <li>
              • Porcentaje recuperado = capital recuperado / inversión inicial ×
              100.
            </li>
            <li>
              • Ganancia después del recupero = ganancia acumulada − inversión
              inicial, si el resultado es positivo.
            </li>
            <li>
              • Si la ganancia mensual neta es cero, la inversión no se recupera
              con los datos cargados.
            </li>
          </ul>
        </section>

        <section className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="text-2xl font-bold text-white">Limitaciones</h2>

          <ul className="mt-4 space-y-2 text-sm leading-relaxed text-zinc-400">
            <li>
              • La calculadora asume que la ganancia mensual neta se mantiene
              igual todos los meses.
            </li>
            <li>
              • No contempla inflación, impuestos, devaluación ni cambios de
              costos.
            </li>
            <li>
              • No considera meses con pérdida, estacionalidad o variación de
              ventas.
            </li>
            <li>
              • No contempla reinversión de ganancias ni retiros de capital.
            </li>
            <li>
              • El resultado depende de que la ganancia mensual neta esté bien
              calculada.
            </li>
            <li>
              • Es una herramienta de simulación, no una garantía de recupero.
            </li>
          </ul>
        </section>

        <section className="mt-10 space-y-8 rounded-3xl border border-zinc-800 bg-zinc-950 p-6 leading-relaxed text-zinc-400">
          <SeoSection title="Calculadora de recupero de capital">
            <p>
              Esta calculadora de recupero de capital sirve para estimar en
              cuánto tiempo se recupera una inversión inicial. Podés ingresar el
              monto invertido, la ganancia mensual neta y un período de análisis
              para saber si el capital se recupera dentro de ese plazo.
            </p>

            <p>
              Es una herramienta útil para analizar proyectos, negocios,
              compras de maquinaria, mercadería, publicidad, locales,
              emprendimientos o cualquier inversión que genere una ganancia
              mensual.
            </p>
          </SeoSection>

          <SeoSection title="Qué es el recupero de capital">
            <p>
              El recupero de capital es el momento en el que la ganancia
              acumulada iguala la inversión inicial. A partir de ese punto, el
              dinero generado deja de cubrir la inversión original y empieza a
              representar ganancia real para el proyecto.
            </p>

            <p>
              Por ejemplo, si invertís $1.000.000 y el negocio deja $200.000 de
              ganancia mensual neta, el recupero de capital se alcanza en 5
              meses.
            </p>
          </SeoSection>

          <SeoSection title="Para qué sirve esta calculadora">
            <p>
              Esta calculadora sirve para responder una pregunta muy común:
              cuánto tiempo tarda una inversión en pagarse sola. Esto ayuda a
              comparar alternativas y a entender si un proyecto recupera el
              capital rápido o si necesita mucho tiempo para empezar a ser
              rentable.
            </p>

            <p>
              También sirve para analizar si un negocio tiene sentido según el
              plazo que esperás. Una inversión puede ser rentable, pero si tarda
              demasiado en recuperar el capital, puede no ser conveniente para tu
              situación.
            </p>
          </SeoSection>

          <SeoSection title="Qué significa la ganancia mensual neta">
            <p>
              La ganancia mensual neta es el dinero que queda después de pagar
              todos los costos del mes. No es lo mismo que ventas mensuales. Si
              un negocio vende $1.000.000 pero tiene $700.000 de costos, la
              ganancia mensual neta es $300.000.
            </p>

            <p>
              Este dato es clave para calcular correctamente el recupero de
              capital. Si cargás ventas brutas en vez de ganancia neta, el
              resultado puede parecer mejor de lo que realmente es.
            </p>
          </SeoSection>

          <SeoSection title="Qué significa el capital pendiente">
            <p>
              El capital pendiente es la parte de la inversión inicial que
              todavía no fue recuperada. Se calcula restando la ganancia
              acumulada al monto invertido.
            </p>

            <p>
              Si el capital pendiente llega a cero, significa que la inversión
              inicial ya fue cubierta por la ganancia generada durante el período
              analizado.
            </p>
          </SeoSection>

          <SeoSection title="Ejemplo práctico de recupero de capital">
            <p>
              Supongamos que una persona invierte $2.000.000 en un proyecto y el
              negocio deja una ganancia mensual neta de $400.000. En ese caso,
              el recupero de capital sería de 5 meses.
            </p>

            <p>
              Si esa persona analiza un período de 12 meses, la ganancia
              acumulada sería $4.800.000. Primero recupera los $2.000.000
              invertidos y luego queda una ganancia adicional de $2.800.000
              después del recupero.
            </p>
          </SeoSection>

          <SeoSection title="Diferencia entre recupero de capital y ROI">
            <p>
              El recupero de capital muestra cuánto tiempo tarda una inversión en
              devolver el dinero inicial. El ROI, en cambio, muestra qué
              porcentaje de ganancia o pérdida generó una inversión.
            </p>

            <p>
              Las dos métricas son útiles, pero responden preguntas distintas.
              El recupero responde “cuándo recupero mi plata”. El ROI responde
              “qué tan rentable fue la inversión”.
            </p>
          </SeoSection>

          <SeoSection title="Errores comunes al calcular recupero de capital">
            <ul className="space-y-2">
              <li>• Usar ventas mensuales en vez de ganancia mensual neta.</li>
              <li>• No incluir todos los costos del negocio o proyecto.</li>
              <li>• Suponer que la ganancia será igual todos los meses.</li>
              <li>• No considerar meses flojos o estacionalidad.</li>
              <li>• No tener en cuenta inflación o suba de costos.</li>
              <li>• Confundir recuperar la inversión con obtener ganancia neta.</li>
            </ul>
          </SeoSection>

          <SeoSection title="Preguntas frecuentes">
            <h3 className="mt-5 text-lg font-semibold text-white">
              ¿Esta calculadora sirve para pesos y dólares?
            </h3>

            <p className="mt-2">
              Sí. Podés usarla en pesos argentinos o en dólares. La fórmula es
              la misma; lo que cambia es la moneda en la que cargás e
              interpretás los resultados.
            </p>

            <h3 className="mt-5 text-lg font-semibold text-white">
              ¿Qué pongo en inversión inicial?
            </h3>

            <p className="mt-2">
              Tenés que poner todo el dinero que necesitaste para empezar la
              inversión. Puede incluir compra de mercadería, maquinaria,
              publicidad, alquiler inicial, reformas, equipamiento u otros
              gastos iniciales.
            </p>

            <h3 className="mt-5 text-lg font-semibold text-white">
              ¿Qué pongo en ganancia mensual neta?
            </h3>

            <p className="mt-2">
              Tenés que poner lo que te queda por mes después de pagar costos.
              No cargues ventas brutas si todavía no descontaste gastos.
            </p>

            <h3 className="mt-5 text-lg font-semibold text-white">
              ¿Qué pasa si la ganancia mensual es cero?
            </h3>

            <p className="mt-2">
              Si la ganancia mensual neta es cero, la calculadora muestra que la
              inversión no se recupera con los datos cargados.
            </p>

            <h3 className="mt-5 text-lg font-semibold text-white">
              ¿El resultado es exacto?
            </h3>

            <p className="mt-2">
              No necesariamente. Es una estimación matemática. En la realidad,
              la ganancia mensual puede cambiar por ventas, costos, inflación,
              impuestos, competencia o estacionalidad.
            </p>
          </SeoSection>
        </section>
      </div>
    </main>
  );
}