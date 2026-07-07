"use client";

import { type FormEvent, type ReactNode, useState } from "react";

type Currency = "ARS" | "USD";

type Results = {
  capitalFinal: number;
  totalInvertido: number;
  gananciaGenerada: number;
  rendimientoTotal: number;
  aportesRealizados: number;
  aportePromedio: number;
  ultimoAporteMensual: number;
  escenarioConservador: number;
  escenarioEstimado: number;
  escenarioOptimista: number;
  tasaConservadora: number;
  tasaEstimada: number;
  tasaOptimista: number;
};

function parseInput(value: string) {
  const parsed = Number(value.replace(",", "."));
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

function simulateMonthlyInvestment({
  capitalInicial,
  aporteMensual,
  anos,
  rendimientoAnual,
  aumentoAnualAporte,
}: {
  capitalInicial: number;
  aporteMensual: number;
  anos: number;
  rendimientoAnual: number;
  aumentoAnualAporte: number;
}) {
  const safeCapitalInicial = Math.max(0, capitalInicial);
  const safeAporteMensual = Math.max(0, aporteMensual);
  const safeAnos = Math.max(0, anos);
  const safeRendimientoAnual = Math.max(0, rendimientoAnual);
  const safeAumentoAnualAporte = Math.max(0, aumentoAnualAporte);

  const mesesTotales = Math.round(safeAnos * 12);
  const tasaMensual = Math.pow(1 + safeRendimientoAnual / 100, 1 / 12) - 1;
  const aumentoAporteDecimal = safeAumentoAnualAporte / 100;

  let saldo = safeCapitalInicial;
  let aporteActual = safeAporteMensual;
  let totalInvertido = safeCapitalInicial;
  let sumaAportesMensuales = 0;
  let aportesRealizados = 0;
  let ultimoAporteMensual = 0;

  for (let mes = 1; mes <= mesesTotales; mes++) {
    saldo = saldo * (1 + tasaMensual);

    saldo = saldo + aporteActual;
    totalInvertido = totalInvertido + aporteActual;
    sumaAportesMensuales = sumaAportesMensuales + aporteActual;
    aportesRealizados = aportesRealizados + 1;
    ultimoAporteMensual = aporteActual;

    if (mes % 12 === 0) {
      aporteActual = aporteActual * (1 + aumentoAporteDecimal);
    }
  }

  const gananciaGenerada = saldo - totalInvertido;

  const rendimientoTotal =
    totalInvertido > 0 ? (gananciaGenerada / totalInvertido) * 100 : 0;

  const aportePromedio =
    aportesRealizados > 0 ? sumaAportesMensuales / aportesRealizados : 0;

  return {
    capitalFinal: saldo,
    totalInvertido,
    gananciaGenerada,
    rendimientoTotal,
    aportesRealizados,
    aportePromedio,
    ultimoAporteMensual,
  };
}

function calculateResults({
  capitalInicial,
  aporteMensual,
  anos,
  rendimientoAnual,
  aumentoAnualAporte,
}: {
  capitalInicial: number;
  aporteMensual: number;
  anos: number;
  rendimientoAnual: number;
  aumentoAnualAporte: number;
}): Results {
  const safeRendimientoAnual = Math.max(0, rendimientoAnual);

  const tasaConservadora = Math.max(0, safeRendimientoAnual - 5);
  const tasaEstimada = safeRendimientoAnual;
  const tasaOptimista = safeRendimientoAnual + 5;

  const conservador = simulateMonthlyInvestment({
    capitalInicial,
    aporteMensual,
    anos,
    rendimientoAnual: tasaConservadora,
    aumentoAnualAporte,
  });

  const estimado = simulateMonthlyInvestment({
    capitalInicial,
    aporteMensual,
    anos,
    rendimientoAnual: tasaEstimada,
    aumentoAnualAporte,
  });

  const optimista = simulateMonthlyInvestment({
    capitalInicial,
    aporteMensual,
    anos,
    rendimientoAnual: tasaOptimista,
    aumentoAnualAporte,
  });

  return {
    capitalFinal: estimado.capitalFinal,
    totalInvertido: estimado.totalInvertido,
    gananciaGenerada: estimado.gananciaGenerada,
    rendimientoTotal: estimado.rendimientoTotal,
    aportesRealizados: estimado.aportesRealizados,
    aportePromedio: estimado.aportePromedio,
    ultimoAporteMensual: estimado.ultimoAporteMensual,
    escenarioConservador: conservador.capitalFinal,
    escenarioEstimado: estimado.capitalFinal,
    escenarioOptimista: optimista.capitalFinal,
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
          type="number"
          min="0"
          inputMode="decimal"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="0"
          className={`w-full appearance-none rounded-2xl border border-zinc-800 bg-zinc-950 py-3 text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-zinc-500 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
            prefix ? "pl-9" : "pl-4"
          } ${suffix ? "pr-14" : "pr-4"}`}
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
      className={`rounded-2xl border p-5 ${
        highlight
          ? "border-zinc-600 bg-zinc-900"
          : "border-zinc-800 bg-zinc-950"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold text-zinc-100">{title}</p>
          <p className="mt-1 text-sm text-zinc-500">
            Rendimiento anual: {formatPercent(rate)}
          </p>
        </div>

        <p
          className={`text-right text-xl font-bold ${
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

export default function InversionConAportesMensualesPage() {
  const [currency, setCurrency] = useState<Currency>("ARS");

  const [capitalInicial, setCapitalInicial] = useState("");
  const [aporteMensual, setAporteMensual] = useState("");
  const [anos, setAnos] = useState("");
  const [rendimientoAnual, setRendimientoAnual] = useState("");
  const [aumentoAnualAporte, setAumentoAnualAporte] = useState("");

  const [results, setResults] = useState<Results | null>(null);

  const moneyPrefix = currency === "ARS" ? "$" : "US$";

  function handleCalculate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const capitalInicialNumber = parseInput(capitalInicial);
    const aporteMensualNumber = parseInput(aporteMensual);
    const anosNumber = parseInput(anos);
    const rendimientoAnualNumber = parseInput(rendimientoAnual);
    const aumentoAnualAporteNumber = parseInput(aumentoAnualAporte);

    const calculatedResults = calculateResults({
      capitalInicial: capitalInicialNumber,
      aporteMensual: aporteMensualNumber,
      anos: anosNumber,
      rendimientoAnual: rendimientoAnualNumber,
      aumentoAnualAporte: aumentoAnualAporteNumber,
    });

    setResults(calculatedResults);
  }

  const emptyResults: Results = {
    capitalFinal: 0,
    totalInvertido: 0,
    gananciaGenerada: 0,
    rendimientoTotal: 0,
    aportesRealizados: 0,
    aportePromedio: 0,
    ultimoAporteMensual: 0,
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
            Inversión con aportes mensuales
          </h1>

          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-zinc-400">
            Calculá cuánto podés juntar invirtiendo todos los meses, con una
            inversión inicial, aportes mensuales, rendimiento anual estimado y
            aumento anual del aporte.
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
                    label="Capital inicial"
                    value={capitalInicial}
                    onChange={setCapitalInicial}
                    prefix={moneyPrefix}
                    helper="Es el dinero con el que empezás la inversión."
                  />

                  <InputField
                    label="Aporte mensual inicial"
                    value={aporteMensual}
                    onChange={setAporteMensual}
                    prefix={moneyPrefix}
                    helper="Es el monto que pensás invertir todos los meses al comienzo."
                  />

                  <InputField
                    label="Aumento anual del aporte"
                    value={aumentoAnualAporte}
                    onChange={setAumentoAnualAporte}
                    suffix="%"
                    helper="Opcional. Sirve para simular que cada año aumentás tu aporte mensual. Si no aplica, dejalo en 0."
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
                    helper="Cantidad de años que pensás invertir todos los meses."
                  />

                  <InputField
                    label="Rendimiento anual estimado"
                    value={rendimientoAnual}
                    onChange={setRendimientoAnual}
                    suffix="%"
                    helper="Ingresá un rendimiento anual estimado. Por ejemplo: 10, 20, 30 o 50."
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
                title="Capital final estimado"
                value={formatMoney(displayedResults.capitalFinal, currency)}
                muted={isMuted}
                highlight
              />

              <ResultCard
                title="Total invertido"
                value={formatMoney(displayedResults.totalInvertido, currency)}
                muted={isMuted}
              />

              <ResultCard
                title="Ganancia generada"
                value={formatMoney(displayedResults.gananciaGenerada, currency)}
                muted={isMuted}
              />

              <ResultCard
                title="Rendimiento total"
                value={formatPercent(displayedResults.rendimientoTotal)}
                muted={isMuted}
              />

              <ResultCard
                title="Aportes realizados"
                value={`${formatNumber(displayedResults.aportesRealizados)} aportes`}
                muted={isMuted}
              />

              <ResultCard
                title="Aporte mensual promedio"
                value={formatMoney(displayedResults.aportePromedio, currency)}
                muted={isMuted}
              />

              <ResultCard
                title="Último aporte mensual"
                value={formatMoney(
                  displayedResults.ultimoAporteMensual,
                  currency
                )}
                muted={isMuted}
              />

              <ResultCard
                title="Tipo de cálculo"
                value="Aportes mensuales"
                muted={isMuted}
              />
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-bold">Escenarios</h3>

              <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                Simulación con un rendimiento anual 5 puntos menor, el
                rendimiento ingresado y un rendimiento 5 puntos mayor.
              </p>

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
              • Se parte del capital inicial y del aporte mensual inicial.
            </li>
            <li>
              • El rendimiento anual estimado se convierte en una tasa mensual
              equivalente.
            </li>
            <li>
              • Cada mes se aplica el rendimiento sobre el saldo acumulado.
            </li>
            <li>
              • Luego se suma el aporte mensual correspondiente a ese mes.
            </li>
            <li>
              • Si ingresaste un aumento anual del aporte, el aporte mensual
              crece una vez por año.
            </li>
            <li>
              • Total invertido = capital inicial + todos los aportes mensuales
              realizados.
            </li>
            <li>
              • Ganancia generada = capital final estimado − total invertido.
            </li>
            <li>
              • Rendimiento total = ganancia generada / total invertido × 100.
            </li>
            <li>
              • Escenario conservador = rendimiento anual estimado − 5 puntos
              porcentuales.
            </li>
            <li>
              • Escenario optimista = rendimiento anual estimado + 5 puntos
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
              • El rendimiento anual puede cambiar con el tiempo.
            </li>
            <li>
              • No contempla retiros parciales durante el período.
            </li>
            <li>
              • No mide riesgo, volatilidad ni probabilidad de pérdida.
            </li>
            <li>
              • Los aportes mensuales se consideran al final de cada mes.
            </li>
            <li>
              • El aumento anual del aporte es una estimación simple.
            </li>
            <li>
              • Los resultados son una simulación matemática, no asesoramiento
              financiero.
            </li>
          </ul>
        </section>

        <section className="mt-10 space-y-8 rounded-3xl border border-zinc-800 bg-zinc-950 p-6 leading-relaxed text-zinc-400">
          <SeoSection title="Calculadora de inversión con aportes mensuales">
            <p>
              Esta calculadora de inversión con aportes mensuales permite
              estimar cuánto podés acumular si invertís dinero todos los meses.
              Podés ingresar un capital inicial, un aporte mensual, un plazo en
              años, un rendimiento anual estimado y un posible aumento anual del
              aporte.
            </p>

            <p>
              La herramienta muestra el capital final estimado, el total
              invertido de tu bolsillo, la ganancia generada, el rendimiento
              total, la cantidad de aportes realizados y distintos escenarios de
              rendimiento.
            </p>
          </SeoSection>

          <SeoSection title="Para qué sirve esta calculadora">
            <p>
              Esta calculadora sirve para planificar una estrategia de inversión
              mensual. Es útil para personas que quieren invertir todos los
              meses, ahorrar a largo plazo, proyectar capital futuro o comparar
              distintos niveles de aporte.
            </p>

            <p>
              También puede servir para responder preguntas simples como cuánto
              podrías juntar invirtiendo $50.000 por mes, cuánto impacta aumentar
              el aporte todos los años o qué diferencia hay entre invertir
              durante 3, 5, 10 o más años.
            </p>
          </SeoSection>

          <SeoSection title="Qué diferencia tiene con una calculadora de interés compuesto">
            <p>
              Una calculadora de interés compuesto suele enfocarse en el
              crecimiento de un capital inicial con una tasa determinada. Esta
              calculadora, en cambio, pone el foco en el hábito de invertir todos
              los meses.
            </p>

            <p>
              Por eso incluye datos como el aporte mensual, la cantidad total de
              aportes, el aporte promedio y el aumento anual del aporte. Es una
              herramienta más orientada a planificar una inversión constante en
              el tiempo.
            </p>
          </SeoSection>

          <SeoSection title="Qué significa el capital final estimado">
            <p>
              El capital final estimado es el monto que podrías tener al terminar
              el plazo elegido. Incluye el capital inicial, todos los aportes
              mensuales realizados y la ganancia generada por el rendimiento
              anual estimado.
            </p>

            <p>
              Este resultado es una proyección matemática. No significa que la
              inversión vaya a dar exactamente ese resultado, porque en la vida
              real pueden existir cambios de tasa, comisiones, inflación,
              impuestos o variaciones del mercado.
            </p>
          </SeoSection>

          <SeoSection title="Qué significa el total invertido">
            <p>
              El total invertido es la suma de todo el dinero que aportaste de tu
              bolsillo. Incluye el capital inicial y todos los aportes mensuales
              realizados durante el plazo elegido.
            </p>

            <p>
              Separar el total invertido de la ganancia generada es importante
              porque permite ver cuánto del capital final corresponde a tus
              aportes y cuánto corresponde al rendimiento de la inversión.
            </p>
          </SeoSection>

          <SeoSection title="Ejemplo práctico">
            <p>
              Supongamos que una persona empieza con $100.000, invierte $50.000
              por mes durante 5 años y estima un rendimiento anual del 20 %. La
              calculadora proyecta el capital final y separa cuánto fue dinero
              aportado y cuánto fue ganancia generada.
            </p>

            <p>
              Si además esa persona aumenta su aporte mensual cada año, el
              capital final puede crecer más rápido. Por eso el campo de aumento
              anual del aporte sirve para simular una estrategia más realista,
              especialmente cuando los ingresos o la capacidad de ahorro crecen
              con el tiempo.
            </p>
          </SeoSection>

          <SeoSection title="Errores comunes al proyectar aportes mensuales">
            <ul className="space-y-2">
              <li>• Pensar que el rendimiento anual está garantizado.</li>
              <li>• No considerar inflación, impuestos o comisiones.</li>
              <li>• Confundir capital final con ganancia neta.</li>
              <li>• No separar el total invertido de la ganancia generada.</li>
              <li>• Estimar aportes mensuales que después no se pueden sostener.</li>
              <li>• No tener en cuenta que toda inversión puede tener riesgo.</li>
            </ul>
          </SeoSection>

          <SeoSection title="Preguntas frecuentes">
            <h3 className="mt-5 text-lg font-semibold text-white">
              ¿Esta calculadora sirve para pesos y dólares?
            </h3>

            <p className="mt-2">
              Sí. Podés usarla tanto en pesos argentinos como en dólares. La
              lógica del cálculo es la misma; lo que cambia es la moneda en la
              que interpretás los resultados.
            </p>

            <h3 className="mt-5 text-lg font-semibold text-white">
              ¿Qué pasa si no tengo capital inicial?
            </h3>

            <p className="mt-2">
              Podés dejar el capital inicial en cero. En ese caso, la
              calculadora proyecta el crecimiento solamente a partir de los
              aportes mensuales.
            </p>

            <h3 className="mt-5 text-lg font-semibold text-white">
              ¿Qué pasa si no quiero aumentar el aporte todos los años?
            </h3>

            <p className="mt-2">
              Podés dejar el aumento anual del aporte en cero. En ese caso, la
              calculadora considera que aportás siempre el mismo monto mensual.
            </p>

            <h3 className="mt-5 text-lg font-semibold text-white">
              ¿El resultado incluye inflación?
            </h3>

            <p className="mt-2">
              No. Esta calculadora muestra una estimación nominal. No descuenta
              inflación, impuestos, comisiones ni cambios en el poder de compra.
            </p>

            <h3 className="mt-5 text-lg font-semibold text-white">
              ¿Es una recomendación de inversión?
            </h3>

            <p className="mt-2">
              No. Es una herramienta de simulación. Sirve para hacer cálculos y
              comparar escenarios, pero no reemplaza el análisis financiero ni el
              asesoramiento profesional.
            </p>
          </SeoSection>
        </section>
      </div>
    </main>
  );
}