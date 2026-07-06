"use client";

import { FormEvent, useState } from "react";

type Currency = "ARS" | "USD";

type Results = {
  comisionPorOperacion: number;
  gananciaPorOperacion: number;
  ingresoBrutoMensual: number;
  gastosVariablesMensuales: number;
  gananciaNetaMensual: number;
  puntoEquilibrioMensual: number | null;
  recuperoCapital: number | null;
  roiMensual: number | null;
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

function formatDecimal(value: number) {
  const safeValue = Number.isFinite(value) ? value : 0;

  return new Intl.NumberFormat("es-AR", {
    maximumFractionDigits: 1,
  }).format(safeValue);
}

function formatPercent(value: number) {
  const safeValue = Number.isFinite(value) ? value : 0;
  return `${safeValue.toFixed(2)} %`;
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
          } ${suffix ? "pr-12" : "pr-4"}`}
        />

        {suffix && (
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500">
            {suffix}
          </span>
        )}
      </div>

      {helper && (
        <p className="mt-2 text-xs leading-relaxed text-zinc-500">
          {helper}
        </p>
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

export default function ComisionesPage() {
  const [currency, setCurrency] = useState<Currency>("ARS");

  const [valorOperacion, setValorOperacion] = useState("");
  const [porcentajeComision, setPorcentajeComision] = useState("");
  const [gastosOperacion, setGastosOperacion] = useState("");
  const [operacionesPorMes, setOperacionesPorMes] = useState("");
  const [costosFijos, setCostosFijos] = useState("");
  const [capitalInvertido, setCapitalInvertido] = useState("");

  const [results, setResults] = useState<Results | null>(null);

  const moneyPrefix = currency === "ARS" ? "$" : "US$";

  function handleCalculate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const valorOperacionNumber = parseInput(valorOperacion);
    const porcentajeComisionNumber = parseInput(porcentajeComision);
    const gastosOperacionNumber = parseInput(gastosOperacion);
    const operacionesPorMesNumber = parseInput(operacionesPorMes);
    const costosFijosNumber = parseInput(costosFijos);
    const capitalInvertidoNumber = parseInput(capitalInvertido);

    const comisionPorOperacion =
      valorOperacionNumber * (porcentajeComisionNumber / 100);

    const gananciaPorOperacion = comisionPorOperacion - gastosOperacionNumber;

    const ingresoBrutoMensual = comisionPorOperacion * operacionesPorMesNumber;

    const gastosVariablesMensuales =
      gastosOperacionNumber * operacionesPorMesNumber;

    const gananciaNetaMensual =
      ingresoBrutoMensual - gastosVariablesMensuales - costosFijosNumber;

    const puntoEquilibrioMensual =
      gananciaPorOperacion > 0
        ? costosFijosNumber / gananciaPorOperacion
        : null;

    const recuperoCapital =
      capitalInvertidoNumber > 0 && gananciaNetaMensual > 0
        ? capitalInvertidoNumber / gananciaNetaMensual
        : null;

    const roiMensual =
      capitalInvertidoNumber > 0
        ? (gananciaNetaMensual / capitalInvertidoNumber) * 100
        : null;

    setResults({
      comisionPorOperacion,
      gananciaPorOperacion,
      ingresoBrutoMensual,
      gastosVariablesMensuales,
      gananciaNetaMensual,
      puntoEquilibrioMensual,
      recuperoCapital,
      roiMensual,
    });
  }

  const emptyResults: Results = {
    comisionPorOperacion: 0,
    gananciaPorOperacion: 0,
    ingresoBrutoMensual: 0,
    gastosVariablesMensuales: 0,
    gananciaNetaMensual: 0,
    puntoEquilibrioMensual: 0,
    recuperoCapital: 0,
    roiMensual: 0,
  };

  const displayedResults = results ?? emptyResults;
  const isMuted = results === null;

  return (
    <main className="min-h-screen bg-black px-4 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <section className="mb-10">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Calculadoras para emprendedores
          </p>

          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Comisiones
          </h1>

          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-zinc-400">
            Calculá cuánto ganás por operación, tu ganancia mensual estimada, el
            punto de equilibrio, el recupero del capital y el ROI si trabajás a
            comisión o como intermediario.
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
                  Operación y comisión
                </h3>

                <div className="space-y-4">
                  <InputField
                    label="Valor promedio de operación"
                    value={valorOperacion}
                    onChange={setValorOperacion}
                    prefix={moneyPrefix}
                    helper="Es el valor promedio de cada venta, contrato, cliente, servicio, operación o negocio que intermediás."
                  />

                  <InputField
                    label="Comisión que cobrás"
                    value={porcentajeComision}
                    onChange={setPorcentajeComision}
                    suffix="%"
                    helper="Ingresá el porcentaje de comisión. Por ejemplo: 3, 5, 10 o 15."
                  />

                  <InputField
                    label="Gastos por operación"
                    value={gastosOperacion}
                    onChange={setGastosOperacion}
                    prefix={moneyPrefix}
                    helper="Incluye traslados, llamadas, reuniones, publicidad, documentación, plataformas o gastos variables por cierre."
                  />
                </div>
              </div>

              <div>
                <h3 className="mb-4 text-lg font-semibold text-zinc-100">
                  Volumen mensual
                </h3>

                <div className="space-y-4">
                  <InputField
                    label="Operaciones cerradas por mes"
                    value={operacionesPorMes}
                    onChange={setOperacionesPorMes}
                    helper="Cantidad de operaciones, ventas, clientes o contratos que cerrás o esperás cerrar por mes."
                  />

                  <InputField
                    label="Costos fijos mensuales"
                    value={costosFijos}
                    onChange={setCostosFijos}
                    prefix={moneyPrefix}
                    helper="Incluye internet, oficina, publicidad mensual, teléfono, CRM, herramientas, suscripciones o gastos fijos."
                  />

                  <InputField
                    label="Capital invertido"
                    value={capitalInvertido}
                    onChange={setCapitalInvertido}
                    prefix={moneyPrefix}
                    helper="Es el dinero invertido en publicidad, marca personal, página web, herramientas, capacitación o arranque."
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
                title="Ganancia neta mensual"
                value={formatMoney(
                  displayedResults.gananciaNetaMensual,
                  currency
                )}
                muted={isMuted}
                highlight
              />

              <ResultCard
                title="Comisión por operación"
                value={formatMoney(
                  displayedResults.comisionPorOperacion,
                  currency
                )}
                muted={isMuted}
              />

              <ResultCard
                title="Ganancia neta por operación"
                value={formatMoney(
                  displayedResults.gananciaPorOperacion,
                  currency
                )}
                muted={isMuted}
              />

              <ResultCard
                title="Ingreso bruto mensual"
                value={formatMoney(
                  displayedResults.ingresoBrutoMensual,
                  currency
                )}
                muted={isMuted}
              />

              <ResultCard
                title="Gastos variables mensuales"
                value={formatMoney(
                  displayedResults.gastosVariablesMensuales,
                  currency
                )}
                muted={isMuted}
              />

              <ResultCard
                title="Punto de equilibrio mensual"
                value={
                  displayedResults.puntoEquilibrioMensual === null
                    ? "No rentable"
                    : `${formatNumber(
                        Math.ceil(displayedResults.puntoEquilibrioMensual)
                      )} operaciones`
                }
                muted={isMuted}
              />

              <ResultCard
                title="Recupero del capital"
                value={
                  displayedResults.recuperoCapital === null
                    ? "No calculable"
                    : `${formatDecimal(displayedResults.recuperoCapital)} meses`
                }
                muted={isMuted}
              />

              <ResultCard
                title="ROI mensual estimado"
                value={
                  displayedResults.roiMensual === null
                    ? "No calculable"
                    : formatPercent(displayedResults.roiMensual)
                }
                muted={isMuted}
              />
            </div>
          </section>
        </section>

        <section className="mt-10 rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="text-2xl font-bold text-white">Cómo lo calculamos</h2>

          <ul className="mt-4 space-y-2 text-sm leading-relaxed text-zinc-400">
            <li>
              • Comisión por operación = valor promedio de operación × comisión
              porcentual.
            </li>
            <li>
              • Ganancia neta por operación = comisión por operación − gastos
              por operación.
            </li>
            <li>
              • Ingreso bruto mensual = comisión por operación × operaciones
              cerradas por mes.
            </li>
            <li>
              • Gastos variables mensuales = gastos por operación × operaciones
              cerradas por mes.
            </li>
            <li>
              • Ganancia neta mensual = ingreso bruto mensual − gastos variables
              mensuales − costos fijos mensuales.
            </li>
            <li>
              • Punto de equilibrio = costos fijos mensuales / ganancia neta por
              operación.
            </li>
            <li>
              • Recupero del capital = capital invertido / ganancia neta
              mensual.
            </li>
            <li>
              • ROI mensual = ganancia neta mensual / capital invertido × 100.
            </li>
          </ul>
        </section>

        <section className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="text-2xl font-bold text-white">Limitaciones</h2>

          <ul className="mt-4 space-y-2 text-sm leading-relaxed text-zinc-400">
            <li>
              • La calculadora no reemplaza un análisis contable profesional.
            </li>
            <li>
              • No contempla impuestos si no los incluís dentro de tus costos.
            </li>
            <li>
              • No incluye inflación, cambios de precios ni variaciones de
              demanda.
            </li>
            <li>
              • Supone que todas las operaciones tienen el mismo valor promedio
              y la misma comisión.
            </li>
            <li>
              • No contempla operaciones caídas, clientes que no pagan,
              cancelaciones o demoras de cobro.
            </li>
            <li>
              • El recupero del capital se calcula con la ganancia neta mensual
              estimada.
            </li>
            <li>
              • Los resultados son estimaciones para tomar mejores decisiones,
              no un balance final del negocio.
            </li>
          </ul>
        </section>

        <section className="mt-10 space-y-8 rounded-3xl border border-zinc-800 bg-zinc-950 p-6 leading-relaxed text-zinc-400">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Calculadora de comisiones para intermediarios
            </h2>

            <p className="mt-4">
              Esta calculadora de comisiones permite estimar cuánto podés ganar
              si trabajás como intermediario, vendedor, broker, representante,
              agente o persona que cobra un porcentaje por cada operación
              cerrada.
            </p>

            <p className="mt-4">
              La herramienta sirve para calcular comisión por operación,
              ganancia neta por operación, ingreso mensual por comisiones,
              ganancia neta mensual, punto de equilibrio, recupero del capital y
              ROI mensual estimado.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white">
              Qué es el valor promedio de operación
            </h2>

            <p className="mt-4">
              El valor promedio de operación es el monto promedio de cada negocio
              que cerrás o intermediás. Puede ser una venta de producto, un
              contrato, un servicio, un inmueble, un auto, un cliente conseguido
              o cualquier operación donde cobrás una comisión.
            </p>

            <p className="mt-4">
              Si cada operación tiene valores distintos, podés cargar un promedio
              estimado para obtener una referencia mensual.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white">
              Qué incluir en gastos por operación
            </h2>

            <p className="mt-4">
              En gastos por operación podés cargar los costos que aparecen cada
              vez que intentás cerrar o concretar una operación: traslados,
              llamadas, combustible, reuniones, publicidad específica,
              documentación, plataformas, comisiones de terceros o gastos de
              gestión.
            </p>

            <p className="mt-4">
              Separar la comisión bruta de los gastos por operación ayuda a ver
              cuánto queda realmente por cada cierre.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white">
              Por qué calcular el punto de equilibrio
            </h2>

            <p className="mt-4">
              El punto de equilibrio muestra cuántas operaciones necesitás cerrar
              por mes para cubrir tus costos fijos. Si tenés gastos mensuales de
              oficina, publicidad, teléfono, herramientas o suscripciones, este
              dato ayuda a saber cuál es el mínimo de cierres necesario para no
              perder plata.
            </p>

            <p className="mt-4">
              Si el punto de equilibrio es muy alto, puede convenir mejorar la
              comisión, reducir gastos, aumentar el valor promedio de operación o
              mejorar la tasa de cierre.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white">
              Ejemplo práctico
            </h2>

            <p className="mt-4">
              Supongamos que intermediás operaciones promedio de $1.000.000 y
              cobrás una comisión del 5 %. La comisión por operación sería de
              $50.000. Si además tenés $5.000 de gastos por operación, la
              ganancia neta por operación sería de $45.000 antes de descontar
              costos fijos.
            </p>

            <p className="mt-4">
              Si cerrás 4 operaciones por mes, el ingreso bruto mensual por
              comisiones sería de $200.000. Después de descontar gastos variables
              y costos fijos, la calculadora estima la ganancia neta mensual, el
              punto de equilibrio, el recupero del capital y el ROI.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white">
              Preguntas frecuentes
            </h2>

            <h3 className="mt-5 text-lg font-semibold text-white">
              ¿Esta calculadora sirve para vendedores a comisión?
            </h3>

            <p className="mt-2">
              Sí. Sirve para vendedores, intermediarios, brokers, representantes,
              agentes comerciales, inmobiliarios, vendedores de autos o personas
              que cobran comisión por operación.
            </p>

            <h3 className="mt-5 text-lg font-semibold text-white">
              ¿Dónde cargo publicidad?
            </h3>

            <p className="mt-2">
              Si la publicidad depende de cada operación, cargala en gastos por
              operación. Si es una pauta mensual fija, cargala en costos fijos
              mensuales.
            </p>

            <h3 className="mt-5 text-lg font-semibold text-white">
              ¿Qué pasa si no tengo costos fijos?
            </h3>

            <p className="mt-2">
              Podés cargar 0 en costos fijos y enfocarte en la comisión por
              operación, la ganancia neta por operación y la ganancia mensual.
            </p>

            <h3 className="mt-5 text-lg font-semibold text-white">
              ¿Qué datos necesito para usarla?
            </h3>

            <p className="mt-2">
              Necesitás conocer el valor promedio de operación, porcentaje de
              comisión, gastos por operación, operaciones cerradas por mes,
              costos fijos mensuales y capital invertido.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
