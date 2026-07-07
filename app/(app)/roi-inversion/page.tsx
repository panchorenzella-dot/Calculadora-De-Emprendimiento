"use client";

import { type FormEvent, type ReactNode, useState } from "react";

type Currency = "ARS" | "USD";

type Results = {
  totalInvertidoReal: number;
  gananciaNeta: number;
  roiTotal: number;
  rendimientoMensual: number;
  rendimientoAnualizado: number;
  meses: number;
  estado: string;
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
  inversionInicial,
  valorFinal,
  costosExtra,
  meses,
}: {
  inversionInicial: number;
  valorFinal: number;
  costosExtra: number;
  meses: number;
}): Results {
  const safeInversionInicial = Math.max(0, inversionInicial);
  const safeValorFinal = Math.max(0, valorFinal);
  const safeCostosExtra = Math.max(0, costosExtra);
  const safeMeses = Math.max(0, meses);

  const totalInvertidoReal = safeInversionInicial + safeCostosExtra;
  const gananciaNeta = safeValorFinal - totalInvertidoReal;

  const roiTotal =
    totalInvertidoReal > 0 ? (gananciaNeta / totalInvertidoReal) * 100 : 0;

  let rendimientoMensual = 0;
  let rendimientoAnualizado = 0;

  if (totalInvertidoReal > 0 && safeMeses > 0) {
    const ratio = safeValorFinal / totalInvertidoReal;

    rendimientoMensual = (Math.pow(ratio, 1 / safeMeses) - 1) * 100;
    rendimientoAnualizado =
      (Math.pow(1 + rendimientoMensual / 100, 12) - 1) * 100;
  }

  let estado = "Saliste empatado";

  if (gananciaNeta > 0) {
    estado = "Ganaste plata";
  }

  if (gananciaNeta < 0) {
    estado = "Perdiste plata";
  }

  return {
    totalInvertidoReal,
    gananciaNeta,
    roiTotal,
    rendimientoMensual,
    rendimientoAnualizado,
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

export default function RoiDeInversionPage() {
  const [currency, setCurrency] = useState<Currency>("ARS");

  const [inversionInicial, setInversionInicial] = useState("");
  const [valorFinal, setValorFinal] = useState("");
  const [costosExtra, setCostosExtra] = useState("");
  const [meses, setMeses] = useState("");

  const [results, setResults] = useState<Results | null>(null);

  const moneyPrefix = currency === "ARS" ? "$" : "US$";

  function handleCalculate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const inversionInicialNumber = parseInput(inversionInicial);
    const valorFinalNumber = parseInput(valorFinal);
    const costosExtraNumber = parseInput(costosExtra);
    const mesesNumber = parseInput(meses);

    const calculatedResults = calculateResults({
      inversionInicial: inversionInicialNumber,
      valorFinal: valorFinalNumber,
      costosExtra: costosExtraNumber,
      meses: mesesNumber,
    });

    setResults(calculatedResults);
  }

  const emptyResults: Results = {
    totalInvertidoReal: 0,
    gananciaNeta: 0,
    roiTotal: 0,
    rendimientoMensual: 0,
    rendimientoAnualizado: 0,
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
            ROI de inversión
          </h1>

          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-zinc-400">
            Calculá cuánto ganaste o perdiste con una inversión.
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
                  Inversión
                </h3>

                <div className="space-y-4">
                  <InputField
                    label="Inversión inicial"
                    value={inversionInicial}
                    onChange={setInversionInicial}
                    prefix={moneyPrefix}
                    helper="Es el dinero que pusiste al comienzo."
                  />

                  <InputField
                    label="Valor final"
                    value={valorFinal}
                    onChange={setValorFinal}
                    prefix={moneyPrefix}
                    helper="Es cuánto vale ahora la inversión o cuánto recuperaste al vender."
                  />

                  <InputField
                    label="Costos extra"
                    value={costosExtra}
                    onChange={setCostosExtra}
                    prefix={moneyPrefix}
                    helper="Incluye comisiones, gastos, impuestos, mantenimiento u otros costos. Si no hubo, dejalo en 0."
                  />
                </div>
              </div>

              <div>
                <h3 className="mb-4 text-lg font-semibold text-zinc-100">
                  Tiempo
                </h3>

                <InputField
                  label="Tiempo de inversión"
                  value={meses}
                  onChange={setMeses}
                  suffix="meses"
                  helper="Sirve para estimar el rendimiento mensual y anualizado. Si no lo sabés, podés dejarlo en 0."
                />
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
                title="ROI total"
                value={formatPercent(displayedResults.roiTotal)}
                muted={isMuted}
                highlight
              />

              <ResultCard
                title="Ganancia neta"
                value={formatMoney(displayedResults.gananciaNeta, currency)}
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
                title="Estado"
                value={displayedResults.estado}
                muted={isMuted}
              />

              <ResultCard
                title="Rendimiento mensual estimado"
                value={formatPercent(displayedResults.rendimientoMensual)}
                muted={isMuted}
              />

              <ResultCard
                title="Rendimiento anualizado"
                value={formatPercent(displayedResults.rendimientoAnualizado)}
                muted={isMuted}
              />

              <ResultCard
                title="Tiempo cargado"
                value={`${formatNumber(displayedResults.meses)} meses`}
                muted={isMuted}
              />

              <ResultCard title="Tipo de cálculo" value="ROI" muted={isMuted} />
            </div>
          </section>
        </section>

        <section className="mt-10 rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="text-2xl font-bold text-white">Cómo lo calculamos</h2>

          <ul className="mt-4 space-y-2 text-sm leading-relaxed text-zinc-400">
            <li>
              • Total invertido real = inversión inicial + costos extra.
            </li>
            <li>
              • Ganancia neta = valor final − total invertido real.
            </li>
            <li>
              • ROI total = ganancia neta / total invertido real × 100.
            </li>
            <li>
              • Si el ROI es positivo, la inversión generó ganancia.
            </li>
            <li>
              • Si el ROI es cero, la inversión quedó empatada.
            </li>
            <li>
              • Si el ROI es negativo, la inversión generó pérdida.
            </li>
            <li>
              • El rendimiento mensual estimado se calcula usando el tiempo de
              inversión cargado.
            </li>
            <li>
              • El rendimiento anualizado estima cuánto habría rendido la
              inversión en un año manteniendo el mismo ritmo mensual.
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
              • No contempla inflación, riesgo, impuestos no cargados ni
              devaluación.
            </li>
            <li>
              • El rendimiento mensual y anualizado son estimaciones
              matemáticas.
            </li>
            <li>
              • Si el tiempo ingresado es cero, no se calcula rendimiento
              mensual ni anualizado.
            </li>
            <li>
              • No mide volatilidad ni probabilidad de pérdida.
            </li>
            <li>
              • El resultado depende de que los datos ingresados sean correctos.
            </li>
            <li>
              • Es una herramienta de cálculo, no asesoramiento financiero.
            </li>
          </ul>
        </section>

        <section className="mt-10 space-y-8 rounded-3xl border border-zinc-800 bg-zinc-950 p-6 leading-relaxed text-zinc-400">
          <SeoSection title="Calculadora de ROI de inversión">
            <p>
              Esta calculadora de ROI de inversión permite medir cuánto ganaste
              o perdiste en relación con el dinero que invertiste. Podés cargar
              la inversión inicial, el valor final, los costos extra y el tiempo
              de inversión para obtener el ROI total, la ganancia neta y el
              rendimiento estimado.
            </p>

            <p>
              El ROI es una de las formas más simples de comparar inversiones,
              porque expresa el resultado en porcentaje. Esto permite analizar si
              una inversión fue rentable y compararla con otras alternativas.
            </p>
          </SeoSection>

          <SeoSection title="Qué significa ROI">
            <p>
              ROI significa retorno sobre la inversión. Es un indicador que
              muestra qué porcentaje ganaste o perdiste en relación con el dinero
              invertido. Si el ROI es positivo, la inversión dejó ganancia. Si es
              negativo, la inversión dejó pérdida.
            </p>

            <p>
              Por ejemplo, si invertiste $100.000 y después de descontar costos
              ganaste $20.000, el ROI sería del 20 %. En cambio, si terminaste
              perdiendo $10.000, el ROI sería negativo.
            </p>
          </SeoSection>

          <SeoSection title="Para qué sirve esta calculadora">
            <p>
              Esta calculadora sirve para analizar inversiones puntuales. Puede
              usarse para medir el resultado de una compra y venta, una inversión
              en un negocio, una campaña publicitaria, una operación con acciones,
              una compra de dólares, una inversión en cripto o cualquier caso en
              el que quieras comparar cuánto pusiste contra cuánto recuperaste.
            </p>

            <p>
              También ayuda a ordenar los números cuando existen costos extra.
              Muchas veces una inversión parece rentable, pero al sumar
              comisiones, impuestos, mantenimiento u otros gastos, la ganancia
              real puede ser menor.
            </p>
          </SeoSection>

          <SeoSection title="Qué significa la ganancia neta">
            <p>
              La ganancia neta es la diferencia entre el valor final de la
              inversión y el total invertido real. El total invertido real incluye
              la inversión inicial más los costos extra cargados.
            </p>

            <p>
              Este dato es importante porque muestra la ganancia o pérdida en
              dinero, no solamente en porcentaje. Una inversión puede tener un
              ROI alto pero una ganancia chica en términos absolutos si el monto
              invertido fue bajo.
            </p>
          </SeoSection>

          <SeoSection title="Qué significa el total invertido real">
            <p>
              El total invertido real es todo el dinero que pusiste para realizar
              la inversión. Incluye el monto inicial y los gastos adicionales.
              Por ejemplo, comisiones, impuestos, envío, mantenimiento, costos
              operativos o cualquier gasto necesario para concretar la inversión.
            </p>

            <p>
              Incluir estos costos ayuda a calcular un ROI más realista. Si no se
              cargan los gastos adicionales, el rendimiento puede parecer mejor
              de lo que fue realmente.
            </p>
          </SeoSection>

          <SeoSection title="Ejemplo práctico de ROI">
            <p>
              Supongamos que una persona invierte $100.000, vende la inversión
              por $140.000 y tuvo $10.000 de costos extra. En ese caso, el total
              invertido real fue de $110.000 y la ganancia neta fue de $30.000.
            </p>

            <p>
              El ROI se calcula dividiendo la ganancia neta por el total
              invertido real y multiplicando por 100. En este ejemplo, el ROI
              sería 27,27 %. Esto significa que la inversión generó una ganancia
              equivalente al 27,27 % del dinero realmente invertido.
            </p>
          </SeoSection>

          <SeoSection title="Diferencia entre ROI total y rendimiento anualizado">
            <p>
              El ROI total muestra cuánto ganaste o perdiste en todo el período
              de la inversión. No importa si la inversión duró un mes, seis meses
              o tres años: el ROI total mide el resultado completo.
            </p>

            <p>
              El rendimiento anualizado sirve para comparar inversiones con
              distinta duración. Por ejemplo, una inversión que ganó 10 % en un
              mes no es igual a una inversión que ganó 10 % en un año. Por eso,
              cuando se carga el tiempo, la calculadora estima un rendimiento
              mensual y anualizado.
            </p>
          </SeoSection>

          <SeoSection title="Errores comunes al calcular ROI">
            <ul className="space-y-2">
              <li>• No sumar comisiones, impuestos o costos extra.</li>
              <li>• Confundir ganancia neta con valor final.</li>
              <li>• Comparar inversiones sin tener en cuenta el tiempo.</li>
              <li>• Pensar que un ROI alto siempre significa mejor inversión.</li>
              <li>• No considerar inflación o pérdida de poder adquisitivo.</li>
              <li>• No tener en cuenta el riesgo asumido.</li>
            </ul>
          </SeoSection>

          <SeoSection title="Preguntas frecuentes">
            <h3 className="mt-5 text-lg font-semibold text-white">
              ¿Esta calculadora sirve para pesos y dólares?
            </h3>

            <p className="mt-2">
              Sí. Podés usarla tanto en pesos argentinos como en dólares. La
              fórmula es la misma; lo que cambia es la moneda en la que cargás e
              interpretás los resultados.
            </p>

            <h3 className="mt-5 text-lg font-semibold text-white">
              ¿Qué pongo en valor final?
            </h3>

            <p className="mt-2">
              Tenés que poner cuánto vale ahora la inversión o cuánto dinero
              recuperaste al venderla. Por ejemplo, si compraste algo por
              $100.000 y lo vendiste por $130.000, el valor final es $130.000.
            </p>

            <h3 className="mt-5 text-lg font-semibold text-white">
              ¿Qué pongo en costos extra?
            </h3>

            <p className="mt-2">
              Podés poner comisiones, impuestos, gastos de envío, mantenimiento,
              costos operativos o cualquier gasto adicional relacionado con la
              inversión. Si no tuviste costos extra, dejalo en cero.
            </p>

            <h3 className="mt-5 text-lg font-semibold text-white">
              ¿Qué pasa si no sé el tiempo de inversión?
            </h3>

            <p className="mt-2">
              Podés dejar el tiempo en cero. En ese caso, la calculadora muestra
              el ROI total y la ganancia neta, pero no calcula rendimiento
              mensual ni anualizado.
            </p>

            <h3 className="mt-5 text-lg font-semibold text-white">
              ¿El ROI incluye inflación?
            </h3>

            <p className="mt-2">
              No. Esta calculadora muestra un ROI nominal. No descuenta
              inflación, impuestos no cargados, devaluación ni cambios en el
              poder de compra.
            </p>

            <h3 className="mt-5 text-lg font-semibold text-white">
              ¿Es una recomendación de inversión?
            </h3>

            <p className="mt-2">
              No. Es una herramienta de cálculo. Sirve para ordenar números y
              comparar resultados, pero no reemplaza asesoramiento financiero ni
              análisis de riesgo.
            </p>
          </SeoSection>
        </section>
      </div>
    </main>
  );
}