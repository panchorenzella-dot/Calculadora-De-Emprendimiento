"use client";

import { FormEvent, useState } from "react";

type Currency = "ARS" | "USD";

type Results = {
  gananciaPorUnidad: number;
  margenGanancia: number;
  markup: number;
  unidadesVendidasMes: number;
  ventasMensuales: number;
  costoCompraMensual: number;
  gastosVariablesMensuales: number;
  gananciaBrutaMensual: number;
  gananciaNetaMensual: number;
  puntoEquilibrioMensual: number | null;
  recuperoCapital: number | null;
  roiMensual: number | null;
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
};

function InputField({
  label,
  value,
  onChange,
  helper,
  prefix,
}: InputFieldProps) {
  const leftPaddingClass = prefix
    ? prefix.length > 1
      ? "pl-16"
      : "pl-10"
    : "pl-4";

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
          className={`w-full rounded-2xl border border-zinc-800 bg-zinc-950 py-3 pr-4 text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-zinc-500 ${leftPaddingClass}`}
        />
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
        className={`mt-2 break-words text-2xl font-bold ${
          muted ? "text-zinc-600" : "text-zinc-50"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export default function CompraVentaPage() {
  const [currency, setCurrency] = useState<Currency>("ARS");

  const [costoCompra, setCostoCompra] = useState("");
  const [precioVenta, setPrecioVenta] = useState("");
  const [gastosVenta, setGastosVenta] = useState("");
  const [unidadesVendidasMes, setUnidadesVendidasMes] = useState("");
  const [costosFijos, setCostosFijos] = useState("");
  const [capitalInvertido, setCapitalInvertido] = useState("");

  const [results, setResults] = useState<Results | null>(null);

  const moneyPrefix = currency === "ARS" ? "$" : "US$";

  function handleCalculate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const costoCompraNumber = parseInput(costoCompra);
    const precioVentaNumber = parseInput(precioVenta);
    const gastosVentaNumber = parseInput(gastosVenta);
    const unidadesVendidasMesNumber = parseInput(unidadesVendidasMes);
    const costosFijosNumber = parseInput(costosFijos);
    const capitalInvertidoNumber = parseInput(capitalInvertido);

    const gananciaPorUnidad =
      precioVentaNumber - costoCompraNumber - gastosVentaNumber;

    const margenGanancia =
      precioVentaNumber > 0
        ? (gananciaPorUnidad / precioVentaNumber) * 100
        : 0;

    const markup =
      costoCompraNumber > 0
        ? (gananciaPorUnidad / costoCompraNumber) * 100
        : 0;

    const ventasMensuales = precioVentaNumber * unidadesVendidasMesNumber;

    const costoCompraMensual = costoCompraNumber * unidadesVendidasMesNumber;

    const gastosVariablesMensuales =
      gastosVentaNumber * unidadesVendidasMesNumber;

    const gananciaBrutaMensual =
      ventasMensuales - costoCompraMensual - gastosVariablesMensuales;

    const gananciaNetaMensual = gananciaBrutaMensual - costosFijosNumber;

    const puntoEquilibrioMensual =
      gananciaPorUnidad > 0 ? costosFijosNumber / gananciaPorUnidad : null;

    const recuperoCapital =
      capitalInvertidoNumber > 0 && gananciaNetaMensual > 0
        ? capitalInvertidoNumber / gananciaNetaMensual
        : null;

    const roiMensual =
      capitalInvertidoNumber > 0
        ? (gananciaNetaMensual / capitalInvertidoNumber) * 100
        : null;

    setResults({
      gananciaPorUnidad,
      margenGanancia,
      markup,
      unidadesVendidasMes: unidadesVendidasMesNumber,
      ventasMensuales,
      costoCompraMensual,
      gastosVariablesMensuales,
      gananciaBrutaMensual,
      gananciaNetaMensual,
      puntoEquilibrioMensual,
      recuperoCapital,
      roiMensual,
    });
  }

  const emptyResults: Results = {
    gananciaPorUnidad: 0,
    margenGanancia: 0,
    markup: 0,
    unidadesVendidasMes: 0,
    ventasMensuales: 0,
    costoCompraMensual: 0,
    gastosVariablesMensuales: 0,
    gananciaBrutaMensual: 0,
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
            Compra/Venta
          </h1>

          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-zinc-400">
            Calculá cuánto ganás comprando y revendiendo productos según el
            costo de compra, precio de venta, gastos por venta, unidades
            vendidas y capital invertido.
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
                  Compra y venta
                </h3>

                <div className="space-y-4">
                  <InputField
                    label="Costo de compra"
                    value={costoCompra}
                    onChange={setCostoCompra}
                    prefix={moneyPrefix}
                    helper="Es lo que pagás por cada producto que vas a revender."
                  />

                  <InputField
                    label="Precio de venta"
                    value={precioVenta}
                    onChange={setPrecioVenta}
                    prefix={moneyPrefix}
                    helper="Es el precio al que vendés cada unidad."
                  />

                  <InputField
                    label="Gastos por venta"
                    value={gastosVenta}
                    onChange={setGastosVenta}
                    prefix={moneyPrefix}
                    helper="Incluye comisión, envío, packaging, publicidad, combustible, descuento o cualquier gasto de cada venta."
                  />
                </div>
              </div>

              <div>
                <h3 className="mb-4 text-lg font-semibold text-zinc-100">
                  Volumen mensual
                </h3>

                <div className="space-y-4">
                  <InputField
                    label="Unidades vendidas por mes"
                    value={unidadesVendidasMes}
                    onChange={setUnidadesVendidasMes}
                    helper="Cantidad de productos que vendés o esperás vender en un mes."
                  />

                  <InputField
                    label="Costos fijos mensuales"
                    value={costosFijos}
                    onChange={setCostosFijos}
                    prefix={moneyPrefix}
                    helper="Incluye local, depósito, internet, publicidad fija, suscripciones, herramientas o gastos mensuales."
                  />

                  <InputField
                    label="Capital invertido"
                    value={capitalInvertido}
                    onChange={setCapitalInvertido}
                    prefix={moneyPrefix}
                    helper="Es el dinero que pusiste para comprar mercadería o arrancar la operación."
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
                title="Ganancia por unidad"
                value={formatMoney(
                  displayedResults.gananciaPorUnidad,
                  currency
                )}
                muted={isMuted}
              />

              <ResultCard
                title="Margen de ganancia"
                value={formatPercent(displayedResults.margenGanancia)}
                muted={isMuted}
              />

              <ResultCard
                title="Markup"
                value={formatPercent(displayedResults.markup)}
                muted={isMuted}
              />

              <ResultCard
                title="Unidades vendidas por mes"
                value={formatNumber(displayedResults.unidadesVendidasMes)}
                muted={isMuted}
              />

              <ResultCard
                title="Ventas mensuales"
                value={formatMoney(displayedResults.ventasMensuales, currency)}
                muted={isMuted}
              />

              <ResultCard
                title="Costo de compra mensual"
                value={formatMoney(
                  displayedResults.costoCompraMensual,
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
                title="Ganancia bruta mensual"
                value={formatMoney(
                  displayedResults.gananciaBrutaMensual,
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
                      )} unidades`
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
              • Ganancia por unidad = precio de venta − costo de compra − gastos
              por venta.
            </li>
            <li>
              • Margen de ganancia = ganancia por unidad / precio de venta ×
              100.
            </li>
            <li>• Markup = ganancia por unidad / costo de compra × 100.</li>
            <li>
              • Ventas mensuales = precio de venta × unidades vendidas por mes.
            </li>
            <li>
              • Costo de compra mensual = costo de compra × unidades vendidas
              por mes.
            </li>
            <li>
              • Gastos variables mensuales = gastos por venta × unidades vendidas
              por mes.
            </li>
            <li>
              • Ganancia bruta mensual = ventas mensuales − costo de compra
              mensual − gastos variables mensuales.
            </li>
            <li>
              • Ganancia neta mensual = ganancia bruta mensual − costos fijos
              mensuales.
            </li>
            <li>
              • Punto de equilibrio = costos fijos mensuales / ganancia por
              unidad.
            </li>
            <li>
              • Recupero del capital = capital invertido / ganancia neta
              mensual.
            </li>
            <li>• ROI mensual = ganancia neta mensual / capital invertido × 100.</li>
          </ul>
        </section>

        <section className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="text-2xl font-bold text-white">Limitaciones</h2>

          <ul className="mt-4 space-y-2 text-sm leading-relaxed text-zinc-400">
            <li>• La calculadora no reemplaza un análisis contable profesional.</li>
            <li>• No contempla impuestos si no los incluís dentro de tus costos.</li>
            <li>
              • No incluye inflación, cambios de precios ni variaciones de
              demanda.
            </li>
            <li>
              • Supone que todas las unidades tienen el mismo costo de compra y
              el mismo precio de venta.
            </li>
            <li>
              • No contempla devoluciones, productos rotos, publicaciones
              pausadas o mercadería sin vender si no lo cargás dentro de los
              gastos.
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
              Calculadora de compra y venta
            </h2>

            <p className="mt-4">
              Esta calculadora de compra y venta permite estimar cuánto podés
              ganar comprando productos a un precio y vendiéndolos a otro. Sirve
              para calcular la ganancia por unidad, el margen, el markup, la
              ganancia mensual, el punto de equilibrio, el recupero del capital y
              el ROI mensual estimado.
            </p>

            <p className="mt-4">
              La herramienta está pensada para reventa de productos, compra y
              venta de ropa, celulares, zapatillas, artículos usados, productos
              importados, mercadería de marketplace, ventas por Instagram,
              Mercado Libre, ferias, locales chicos o emprendimientos que compran
              y revenden.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}