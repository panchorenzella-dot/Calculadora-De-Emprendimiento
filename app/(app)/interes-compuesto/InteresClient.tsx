"use client";

import { type FormEvent, type ReactNode, useState } from "react";

type Currency = "ARS" | "USD";
type Frequency = "annual" | "monthly" | "daily";

type Results = {
  valorFuturo: number;
  totalAportado: number;
  interesGanado: number;
  rendimientoTotal: number;
  mesesTotales: number;
  escenarioConservador: number;
  escenarioEstimado: number;
  escenarioOptimista: number;
  tasaConservadora: number;
  tasaEstimada: number;
  tasaOptimista: number;
};

const frequencies: Record<
  Frequency,
  {
    label: string;
    periodsPerYear: number;
    helper: string;
  }
> = {
  annual: {
    label: "Anual",
    periodsPerYear: 1,
    helper: "El interés se capitaliza una vez por año.",
  },
  monthly: {
    label: "Mensual",
    periodsPerYear: 12,
    helper: "El interés se capitaliza todos los meses.",
  },
  daily: {
    label: "Diaria",
    periodsPerYear: 365,
    helper: "El interés se capitaliza todos los días.",
  },
};

function parseInput(value: string) {
  const normalizedValue = value
    .replace(/\./g, "")
    .replace(",", ".")
    .replace(/[^0-9.]/g, "");

  const parsed = Number(normalizedValue);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatInputValue(value: string) {
  const cleanedValue = value.replace(/\./g, "").replace(/[^0-9,]/g, "");
  const hasDecimalComma = cleanedValue.includes(",");

  const [integerPartRaw, ...decimalParts] = cleanedValue.split(",");
  const integerPart = integerPartRaw.replace(/\D/g, "");
  const decimalPartRaw = decimalParts.join("").replace(/\D/g, "");

  const formattedInteger =
    integerPart.length > 0
      ? new Intl.NumberFormat("es-AR").format(Number(integerPart))
      : "";

  if (hasDecimalComma) {
    const decimalPart = decimalPartRaw.slice(0, 2);
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

function formatNumber(value: number) {
  const safeValue = Number.isFinite(value) ? value : 0;

  return new Intl.NumberFormat("es-AR", {
    maximumFractionDigits: 0,
  }).format(safeValue);
}

function formatPercent(value: number) {
  const safeValue = Number.isFinite(value) ? value : 0;
  return `${safeValue.toFixed(2)} %`;
}

function calculateCompoundInterest({
  inversionInicial,
  aporteMensual,
  anos,
  tasaAnual,
  frecuencia,
}: {
  inversionInicial: number;
  aporteMensual: number;
  anos: number;
  tasaAnual: number;
  frecuencia: Frequency;
}) {
  const safeInversionInicial = Math.max(0, inversionInicial);
  const safeAporteMensual = Math.max(0, aporteMensual);
  const safeAnos = Math.max(0, anos);
  const safeTasaAnual = Math.max(0, tasaAnual);

  const mesesTotales = Math.round(safeAnos * 12);
  const periodsPerYear = frequencies[frecuencia].periodsPerYear;
  const tasaAnualDecimal = safeTasaAnual / 100;

  const tasaPorPeriodo = tasaAnualDecimal / periodsPerYear;
  const tasaMensualEquivalente =
    Math.pow(1 + tasaPorPeriodo, periodsPerYear / 12) - 1;

  let saldo = safeInversionInicial;

  for (let mes = 1; mes <= mesesTotales; mes++) {
    saldo = saldo * (1 + tasaMensualEquivalente);
    saldo = saldo + safeAporteMensual;
  }

  return saldo;
}

function calculateResults({
  inversionInicial,
  aporteMensual,
  anos,
  tasaAnual,
  frecuencia,
}: {
  inversionInicial: number;
  aporteMensual: number;
  anos: number;
  tasaAnual: number;
  frecuencia: Frequency;
}): Results {
  const safeTasaAnual = Math.max(0, tasaAnual);

  const tasaConservadora = Math.max(0, safeTasaAnual - 5);
  const tasaEstimada = safeTasaAnual;
  const tasaOptimista = safeTasaAnual + 5;

  const valorFuturo = calculateCompoundInterest({
    inversionInicial,
    aporteMensual,
    anos,
    tasaAnual: tasaEstimada,
    frecuencia,
  });

  const escenarioConservador = calculateCompoundInterest({
    inversionInicial,
    aporteMensual,
    anos,
    tasaAnual: tasaConservadora,
    frecuencia,
  });

  const escenarioOptimista = calculateCompoundInterest({
    inversionInicial,
    aporteMensual,
    anos,
    tasaAnual: tasaOptimista,
    frecuencia,
  });

  const mesesTotales = Math.round(Math.max(0, anos) * 12);

  const totalAportado =
    Math.max(0, inversionInicial) + Math.max(0, aporteMensual) * mesesTotales;

  const interesGanado = valorFuturo - totalAportado;

  const rendimientoTotal =
    totalAportado > 0 ? (interesGanado / totalAportado) * 100 : 0;

  return {
    valorFuturo,
    totalAportado,
    interesGanado,
    rendimientoTotal,
    mesesTotales,
    escenarioConservador,
    escenarioEstimado: valorFuturo,
    escenarioOptimista,
    tasaConservadora,
    tasaEstimada,
    tasaOptimista,
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
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(event) => onChange(formatInputValue(event.target.value))}
          placeholder="0"
          className={`w-full appearance-none rounded-2xl border border-zinc-800 bg-zinc-950 py-3 text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-zinc-500 ${
            prefix ? "pl-16" : "pl-4"
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
      className={`min-w-0 rounded-2xl border p-5 ${
        highlight
          ? "border-zinc-600 bg-zinc-900"
          : "border-zinc-800 bg-zinc-950"
      }`}
    >
      <p className="text-sm text-zinc-400">{title}</p>

      <p
        className={`mt-2 break-words text-xl font-bold leading-tight sm:text-2xl ${
          muted ? "text-zinc-600" : "text-zinc-50"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

type ScenarioCardProps = {
  title: string;
  rate: number;
  value: string;
  muted?: boolean;
  highlight?: boolean;
};

function ScenarioCard({
  title,
  rate,
  value,
  muted = false,
  highlight = false,
}: ScenarioCardProps) {
  return (
    <div
      className={`min-w-0 rounded-2xl border p-5 ${
        highlight
          ? "border-zinc-600 bg-zinc-900"
          : "border-zinc-800 bg-zinc-950"
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <p className="font-semibold text-zinc-100">{title}</p>
          <p className="mt-1 text-sm text-zinc-500">
            Tasa anual: {formatPercent(rate)}
          </p>
        </div>

        <p
          className={`break-words text-left text-xl font-bold leading-tight sm:text-right ${
            muted ? "text-zinc-600" : "text-zinc-50"
          }`}
        >
          {value}
        </p>
      </div>
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

export default function InteresCompuestoPage() {
  const [currency, setCurrency] = useState<Currency>("ARS");

  const [inversionInicial, setInversionInicial] = useState("");
  const [aporteMensual, setAporteMensual] = useState("");
  const [anos, setAnos] = useState("");
  const [tasaAnual, setTasaAnual] = useState("");
  const [frecuencia, setFrecuencia] = useState<Frequency>("monthly");

  const [results, setResults] = useState<Results | null>(null);

  const moneyPrefix = currency === "ARS" ? "$" : "US$";

  function handleCalculate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const inversionInicialNumber = parseInput(inversionInicial);
    const aporteMensualNumber = parseInput(aporteMensual);
    const anosNumber = parseInput(anos);
    const tasaAnualNumber = parseInput(tasaAnual);

    const calculatedResults = calculateResults({
      inversionInicial: inversionInicialNumber,
      aporteMensual: aporteMensualNumber,
      anos: anosNumber,
      tasaAnual: tasaAnualNumber,
      frecuencia,
    });

    setResults(calculatedResults);
  }

  const emptyResults: Results = {
    valorFuturo: 0,
    totalAportado: 0,
    interesGanado: 0,
    rendimientoTotal: 0,
    mesesTotales: 0,
    escenarioConservador: 0,
    escenarioEstimado: 0,
    escenarioOptimista: 0,
    tasaConservadora: 0,
    tasaEstimada: 0,
    tasaOptimista: 0,
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
            Interés compuesto
          </h1>

          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-zinc-400">
            Calculá cuánto puede crecer una inversión con el paso del tiempo.
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
                  Capital y aportes
                </h3>

                <div className="space-y-4">
                  <InputField
                    label="Inversión inicial"
                    value={inversionInicial}
                    onChange={setInversionInicial}
                    prefix={moneyPrefix}
                    helper="Es el dinero con el que empezás la inversión o simulación."
                  />

                  <InputField
                    label="Aporte mensual"
                    value={aporteMensual}
                    onChange={setAporteMensual}
                    prefix={moneyPrefix}
                    helper="Es el monto que pensás sumar todos los meses. Si no vas a aportar, dejalo en 0."
                  />
                </div>
              </div>

              <div>
                <h3 className="mb-4 text-lg font-semibold text-zinc-100">
                  Tiempo y rendimiento
                </h3>

                <div className="space-y-4">
                  <InputField
                    label="Tiempo"
                    value={anos}
                    onChange={setAnos}
                    suffix="años"
                    helper="Cantidad de años que pensás mantener la inversión."
                  />

                  <InputField
                    label="Tasa anual estimada"
                    value={tasaAnual}
                    onChange={setTasaAnual}
                    suffix="%"
                    helper="Ingresá una tasa anual estimada. Por ejemplo: 10, 20, 30 o 50."
                  />

                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-200">
                      Capitalización
                    </label>

                    <div className="grid gap-3 sm:grid-cols-3">
                      {(Object.keys(frequencies) as Frequency[]).map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setFrecuencia(item)}
                          className={`rounded-2xl border px-4 py-3 text-left text-sm font-medium transition ${
                            frecuencia === item
                              ? "border-zinc-500 bg-white text-black"
                              : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-600 hover:text-white"
                          }`}
                        >
                          {frequencies[item].label}
                        </button>
                      ))}
                    </div>

                    <p className="mt-2 text-xs leading-relaxed text-zinc-500">
                      {frequencies[frecuencia].helper}
                    </p>
                  </div>
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
                title="Valor futuro estimado"
                value={formatMoney(displayedResults.valorFuturo, currency)}
                muted={isMuted}
                highlight
              />

              <ResultCard
                title="Total aportado"
                value={formatMoney(displayedResults.totalAportado, currency)}
                muted={isMuted}
              />

              <ResultCard
                title="Interés ganado"
                value={formatMoney(displayedResults.interesGanado, currency)}
                muted={isMuted}
              />

              <ResultCard
                title="Rendimiento total"
                value={formatPercent(displayedResults.rendimientoTotal)}
                muted={isMuted}
              />

              <ResultCard
                title="Meses invertidos"
                value={`${formatNumber(displayedResults.mesesTotales)} meses`}
                muted={isMuted}
              />

              <ResultCard
                title="Capitalización elegida"
                value={frequencies[frecuencia].label}
                muted={isMuted}
              />
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-bold">Escenarios</h3>

              <div className="mt-5 grid gap-4">
                <ScenarioCard
                  title="Conservador"
                  rate={displayedResults.tasaConservadora}
                  value={formatMoney(
                    displayedResults.escenarioConservador,
                    currency
                  )}
                  muted={isMuted}
                />

                <ScenarioCard
                  title="Estimado"
                  rate={displayedResults.tasaEstimada}
                  value={formatMoney(
                    displayedResults.escenarioEstimado,
                    currency
                  )}
                  muted={isMuted}
                  highlight
                />

                <ScenarioCard
                  title="Optimista"
                  rate={displayedResults.tasaOptimista}
                  value={formatMoney(
                    displayedResults.escenarioOptimista,
                    currency
                  )}
                  muted={isMuted}
                />
              </div>
            </div>
          </section>
        </section>

        <section className="mt-10 rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="text-2xl font-bold text-white">Cómo lo calculamos</h2>

          <ul className="mt-4 space-y-2 text-sm leading-relaxed text-zinc-400">
            <li>
              • Total aportado = inversión inicial + aporte mensual × cantidad
              de meses.
            </li>
            <li>
              • La tasa anual estimada se convierte en una tasa mensual
              equivalente según la capitalización elegida.
            </li>
            <li>
              • Cada mes se aplica el rendimiento sobre el saldo acumulado.
            </li>
            <li>
              • Después de aplicar el rendimiento mensual, se suma el aporte
              mensual.
            </li>
            <li>
              • Valor futuro = saldo final acumulado al terminar el período.
            </li>
            <li>
              • Interés ganado = valor futuro − total aportado.
            </li>
            <li>
              • Rendimiento total = interés ganado / total aportado × 100.
            </li>
            <li>
              • Escenario conservador = tasa anual estimada − 5 puntos
              porcentuales.
            </li>
            <li>
              • Escenario optimista = tasa anual estimada + 5 puntos
              porcentuales.
            </li>
          </ul>
        </section>

        <section className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="text-2xl font-bold text-white">Limitaciones</h2>

          <ul className="mt-4 space-y-2 text-sm leading-relaxed text-zinc-400">
            <li>
              • La calculadora no garantiza resultados reales de ninguna
              inversión.
            </li>
            <li>
              • No contempla inflación, impuestos, comisiones, spreads ni
              devaluación.
            </li>
            <li>
              • La tasa anual puede cambiar con el tiempo.
            </li>
            <li>
              • Los aportes mensuales se consideran al final de cada mes.
            </li>
            <li>
              • No contempla retiros parciales durante el período.
            </li>
            <li>
              • No mide riesgo, volatilidad ni probabilidad de pérdida.
            </li>
            <li>
              • Los escenarios son estimaciones simples para comparar posibles
              resultados.
            </li>
            <li>
              • Los resultados son una simulación matemática, no asesoramiento
              financiero.
            </li>
          </ul>
        </section>

        <section className="mt-10 space-y-8 rounded-3xl border border-zinc-800 bg-zinc-950 p-6 leading-relaxed text-zinc-400">
          <SeoSection title="Calculadora de interés compuesto">
            <p>
              Esta calculadora de interés compuesto permite estimar cuánto puede
              crecer una inversión con el paso del tiempo. Podés cargar una
              inversión inicial, un aporte mensual, una tasa anual estimada y la
              cantidad de años para proyectar el valor futuro de tu capital.
            </p>

            <p>
              La herramienta también muestra el total aportado, el interés
              ganado, el rendimiento total y tres escenarios posibles:
              conservador, estimado y optimista. Esto ayuda a comparar cómo
              cambia el resultado cuando la tasa anual es menor o mayor a la
              esperada.
            </p>
          </SeoSection>

          <SeoSection title="Qué es el interés compuesto">
            <p>
              El interés compuesto es el crecimiento que se genera cuando los
              intereses obtenidos se reinvierten y empiezan también a generar
              nuevos intereses. Es decir, el rendimiento no se calcula siempre
              sobre el capital inicial, sino sobre un saldo acumulado que va
              creciendo con el tiempo.
            </p>

            <p>
              Por eso, el interés compuesto suele tener más impacto cuanto más
              largo es el plazo. En una inversión de pocos meses, el efecto puede
              ser limitado. En cambio, en varios años, la diferencia entre
              aportar y reinvertir puede volverse mucho más importante.
            </p>
          </SeoSection>

          <SeoSection title="Para qué sirve esta calculadora">
            <p>
              Esta calculadora sirve para planificar inversiones, objetivos de
              ahorro o simulaciones financieras. Puede usarse para estimar cuánto
              podrías juntar si invertís una suma inicial y además sumás dinero
              todos los meses.
            </p>

            <p>
              También puede servir para comparar diferentes estrategias. Por
              ejemplo, podés probar qué pasa si aumentás el aporte mensual, si
              extendés el plazo, si bajás la tasa anual o si cambiás la
              frecuencia de capitalización.
            </p>
          </SeoSection>

          <SeoSection title="Qué significa el valor futuro">
            <p>
              El valor futuro es el monto estimado que podrías tener al final del
              período elegido. Incluye la inversión inicial, todos los aportes
              mensuales y los intereses acumulados durante el plazo.
            </p>

            <p>
              Este resultado no debe interpretarse como una ganancia garantizada.
              Es una proyección basada en los datos ingresados. En una inversión
              real, el resultado puede variar por cambios de tasa, inflación,
              comisiones, impuestos, riesgo del activo o movimientos del mercado.
            </p>
          </SeoSection>

          <SeoSection title="Diferencia entre total aportado e interés ganado">
            <p>
              El total aportado es la suma del dinero que pusiste de tu bolsillo:
              inversión inicial más todos los aportes mensuales. El interés
              ganado, en cambio, es la diferencia entre el valor futuro y ese
              total aportado.
            </p>

            <p>
              Separar estos dos datos es importante porque permite entender qué
              parte del capital final viene de tus propios aportes y qué parte
              viene del rendimiento generado por la inversión.
            </p>
          </SeoSection>

          <SeoSection title="Ejemplo práctico de interés compuesto">
            <p>
              Supongamos que una persona empieza con una inversión inicial de
              $100.000, aporta $20.000 por mes durante 5 años y estima una tasa
              anual del 30 %. La calculadora proyecta cuánto podría acumular al
              final del período y separa el total aportado del interés ganado.
            </p>

            <p>
              En los primeros meses, la mayor parte del crecimiento suele venir
              de los aportes mensuales. Pero con el paso del tiempo, el saldo
              acumulado crece y los intereses empiezan a tener un peso mayor en
              el resultado final.
            </p>
          </SeoSection>

          <SeoSection title="Errores comunes al calcular interés compuesto">
            <ul className="space-y-2">
              <li>• Confundir tasa anual con tasa mensual.</li>
              <li>
                • Creer que una tasa estimada se mantiene fija para siempre.
              </li>
              <li>• No considerar inflación, impuestos o comisiones.</li>
              <li>• Confundir el total aportado con la ganancia real.</li>
              <li>• No tener en cuenta que toda inversión puede tener riesgo.</li>
              <li>• Pensar que el resultado proyectado está garantizado.</li>
            </ul>
          </SeoSection>

          <SeoSection title="Preguntas frecuentes">
            <h3 className="mt-5 text-lg font-semibold text-white">
              ¿Esta calculadora sirve para pesos y dólares?
            </h3>

            <p className="mt-2">
              Sí. Podés usarla tanto para pesos argentinos como para dólares. La
              lógica del cálculo es la misma; lo que cambia es la moneda en la
              que interpretás los resultados.
            </p>

            <h3 className="mt-5 text-lg font-semibold text-white">
              ¿La tasa anual está garantizada?
            </h3>

            <p className="mt-2">
              No. La tasa anual es una estimación. En una inversión real puede
              cambiar por inflación, mercado, riesgo, comisiones, impuestos o
              variaciones del instrumento elegido.
            </p>

            <h3 className="mt-5 text-lg font-semibold text-white">
              ¿Qué pasa si no hago aportes mensuales?
            </h3>

            <p className="mt-2">
              Podés dejar el aporte mensual en cero. En ese caso, la calculadora
              proyecta solamente el crecimiento de la inversión inicial.
            </p>

            <h3 className="mt-5 text-lg font-semibold text-white">
              ¿Qué capitalización conviene elegir?
            </h3>

            <p className="mt-2">
              Depende de cómo se comporte la inversión que querés simular. Si los
              intereses se reinvierten una vez por año, elegí capitalización
              anual. Si se reinvierten todos los meses, elegí mensual. Si querés
              una simulación más frecuente, podés elegir diaria.
            </p>

            <h3 className="mt-5 text-lg font-semibold text-white">
              ¿El resultado incluye inflación?
            </h3>

            <p className="mt-2">
              No. Esta calculadora muestra una estimación nominal. Eso significa
              que no descuenta inflación, impuestos, comisiones ni cambios en el
              poder de compra.
            </p>
          </SeoSection>
        </section>
      </div>
    </main>
  );
}