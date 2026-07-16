"use client";

import { FormEvent, useState } from "react";

type Currency = "ARS" | "USD";

type Results = {
  gananciaPorUnidad: number;
  margenGanancia: number;
  markup: number;
  unidadesPorMes: number;
  ventasMensuales: number;
  costoMercaderiaMensual: number;
  otrosGastosMensuales: number;
  gananciaBrutaMensual: number;
  gananciaNetaMensual: number;
  puntoEquilibrioMensual: number | null;
  puntoEquilibrioDiario: number | null;
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
};

function InputField({
  label,
  value,
  onChange,
  helper,
  prefix,
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
          className={`w-full appearance-none rounded-2xl border border-zinc-800 bg-zinc-950 py-3 text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-emerald-300/50 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
            prefix ? "pl-9 pr-4" : "px-4"
          }`}
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
        className={`mt-2 text-2xl font-bold ${
          muted ? "text-zinc-600" : "text-zinc-50"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export default function DistribuidoraPage() {
  const [currency, setCurrency] = useState<Currency>("ARS");

  const [costoCompra, setCostoCompra] = useState("");
  const [precioVenta, setPrecioVenta] = useState("");
  const [otrosGastos, setOtrosGastos] = useState("");
  const [unidadesPorDia, setUnidadesPorDia] = useState("");
  const [diasVenta, setDiasVenta] = useState("");
  const [costosFijos, setCostosFijos] = useState("");
  const [capitalInvertido, setCapitalInvertido] = useState("");

  const [results, setResults] = useState<Results | null>(null);

  const moneyPrefix = currency === "ARS" ? "$" : "US$";

  function handleCalculate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const costoCompraNumber = parseInput(costoCompra);
    const precioVentaNumber = parseInput(precioVenta);
    const otrosGastosNumber = parseInput(otrosGastos);
    const unidadesPorDiaNumber = parseInput(unidadesPorDia);
    const diasVentaNumber = parseInput(diasVenta);
    const costosFijosNumber = parseInput(costosFijos);
    const capitalInvertidoNumber = parseInput(capitalInvertido);

    const gananciaPorUnidad =
      precioVentaNumber - costoCompraNumber - otrosGastosNumber;

    const margenGanancia =
      precioVentaNumber > 0
        ? (gananciaPorUnidad / precioVentaNumber) * 100
        : 0;

    const markup =
      costoCompraNumber > 0
        ? (gananciaPorUnidad / costoCompraNumber) * 100
        : 0;

    const unidadesPorMes = unidadesPorDiaNumber * diasVentaNumber;

    const ventasMensuales = precioVentaNumber * unidadesPorMes;

    const costoMercaderiaMensual = costoCompraNumber * unidadesPorMes;

    const otrosGastosMensuales = otrosGastosNumber * unidadesPorMes;

    const gananciaBrutaMensual =
      ventasMensuales - costoMercaderiaMensual - otrosGastosMensuales;

    const gananciaNetaMensual = gananciaBrutaMensual - costosFijosNumber;

    const puntoEquilibrioMensual =
      gananciaPorUnidad > 0 ? costosFijosNumber / gananciaPorUnidad : null;

    const puntoEquilibrioDiario =
      puntoEquilibrioMensual !== null && diasVentaNumber > 0
        ? puntoEquilibrioMensual / diasVentaNumber
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
      gananciaPorUnidad,
      margenGanancia,
      markup,
      unidadesPorMes,
      ventasMensuales,
      costoMercaderiaMensual,
      otrosGastosMensuales,
      gananciaBrutaMensual,
      gananciaNetaMensual,
      puntoEquilibrioMensual,
      puntoEquilibrioDiario,
      recuperoCapital,
      roiMensual,
    });
  }

  const emptyResults: Results = {
    gananciaPorUnidad: 0,
    margenGanancia: 0,
    markup: 0,
    unidadesPorMes: 0,
    ventasMensuales: 0,
    costoMercaderiaMensual: 0,
    otrosGastosMensuales: 0,
    gananciaBrutaMensual: 0,
    gananciaNetaMensual: 0,
    puntoEquilibrioMensual: 0,
    puntoEquilibrioDiario: 0,
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
            Distribuidora
          </h1>

          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-zinc-400">
            Calculá la rentabilidad de una distribuidora a partir del costo de
            compra, precio de venta, unidades vendidas, gastos variables, costos
            fijos y capital invertido en mercadería.
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
                  Compra y venta
                </h3>

                <div className="space-y-4">
                  <InputField
                    label="Costo de compra por unidad"
                    value={costoCompra}
                    onChange={setCostoCompra}
                    prefix={moneyPrefix}
                    helper="Es lo que pagás por cada producto al proveedor."
                  />

                  <InputField
                    label="Precio de venta por unidad"
                    value={precioVenta}
                    onChange={setPrecioVenta}
                    prefix={moneyPrefix}
                    helper="Es el precio al que vendés cada unidad a tus clientes."
                  />

                  <InputField
                    label="Otros gastos por unidad"
                    value={otrosGastos}
                    onChange={setOtrosGastos}
                    prefix={moneyPrefix}
                    helper="Incluye logística, combustible, embalaje, comisiones, medios de pago, descuentos o gastos variables por venta."
                  />
                </div>
              </div>

              <div>
                <h3 className="mb-4 text-lg font-semibold text-zinc-100">
                  Volumen de ventas
                </h3>

                <div className="space-y-4">
                  <InputField
                    label="Unidades vendidas por día"
                    value={unidadesPorDia}
                    onChange={setUnidadesPorDia}
                    helper="Cantidad promedio de productos que vendés por día."
                  />

                  <InputField
                    label="Días de venta por mes"
                    value={diasVenta}
                    onChange={setDiasVenta}
                    helper="Cantidad de días del mes en los que vendés o repartís."
                  />
                </div>
              </div>

              <div>
                <h3 className="mb-4 text-lg font-semibold text-zinc-100">
                  Costos e inversión
                </h3>

                <div className="space-y-4">
                  <InputField
                    label="Costos fijos mensuales"
                    value={costosFijos}
                    onChange={setCostosFijos}
                    prefix={moneyPrefix}
                    helper="Incluye depósito, sueldos, vehículo, seguro, internet, contador, mantenimiento, marketing y otros gastos mensuales."
                  />

                  <InputField
                    label="Capital invertido en mercadería"
                    value={capitalInvertido}
                    onChange={setCapitalInvertido}
                    prefix={moneyPrefix}
                    helper="Es el dinero inicial que pusiste o pensás poner en stock."
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
                value={formatNumber(displayedResults.unidadesPorMes)}
                muted={isMuted}
              />

              <ResultCard
                title="Ventas mensuales"
                value={formatMoney(displayedResults.ventasMensuales, currency)}
                muted={isMuted}
              />

              <ResultCard
                title="Costo de mercadería mensual"
                value={formatMoney(
                  displayedResults.costoMercaderiaMensual,
                  currency
                )}
                muted={isMuted}
              />

              <ResultCard
                title="Otros gastos variables mensuales"
                value={formatMoney(
                  displayedResults.otrosGastosMensuales,
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
                title="Punto de equilibrio diario"
                value={
                  displayedResults.puntoEquilibrioDiario === null
                    ? "No rentable"
                    : `${formatNumber(
                        Math.ceil(displayedResults.puntoEquilibrioDiario)
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
              • Ganancia por unidad = precio de venta − costo de compra − otros
              gastos por unidad.
            </li>
            <li>
              • Margen de ganancia = ganancia por unidad / precio de venta ×
              100.
            </li>
            <li>
              • Markup = ganancia por unidad / costo de compra × 100.
            </li>
            <li>
              • Unidades vendidas por mes = unidades vendidas por día × días de
              venta por mes.
            </li>
            <li>
              • Ventas mensuales = precio de venta × unidades vendidas por mes.
            </li>
            <li>
              • Costo de mercadería mensual = costo de compra × unidades
              vendidas por mes.
            </li>
            <li>
              • Otros gastos variables mensuales = otros gastos por unidad ×
              unidades vendidas por mes.
            </li>
            <li>
              • Ganancia bruta mensual = ventas mensuales − costo de mercadería
              mensual − otros gastos variables mensuales.
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
              • Recupero del capital = capital invertido en mercadería /
              ganancia neta mensual.
            </li>
            <li>
              • ROI mensual = ganancia neta mensual / capital invertido en
              mercadería × 100.
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
              • Supone que todas las unidades compradas se venden.
            </li>
            <li>
              • Supone que todas las unidades tienen el mismo costo de compra y
              el mismo precio de venta.
            </li>
            <li>
              • No contempla productos vencidos, roturas, devoluciones o
              mercadería sin vender si no los cargás dentro de otros gastos.
            </li>
            <li>
              • El recupero del capital se calcula con la ganancia neta mensual
              estimada, por lo que puede variar si cambian las ventas o los
              costos.
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
              Calculadora de rentabilidad para distribuidoras
            </h2>

            <p className="mt-4">
              Esta calculadora para distribuidoras permite estimar la
              rentabilidad de un negocio que compra productos y los revende. Con
              pocos datos podés calcular ganancia por unidad, margen, markup,
              ventas mensuales, ganancia neta, punto de equilibrio, recupero del
              capital y ROI mensual estimado.
            </p>

            <p className="mt-4">
              La herramienta está pensada para distribuidoras de alimentos,
              bebidas, panificados, productos congelados, productos de limpieza,
              kioscos, almacenes mayoristas, revendedores y emprendimientos que
              trabajan con compra y reventa de mercadería.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white">
              Qué incluir en el costo de compra por unidad
            </h2>

            <p className="mt-4">
              En el costo de compra por unidad tenés que cargar lo que pagás por
              cada producto al proveedor. Si comprás por caja, pack o bulto,
              conviene dividir el costo total por la cantidad de unidades para
              obtener el costo unitario.
            </p>

            <p className="mt-4">
              Por ejemplo, si una caja cuesta $60.000 y trae 100 unidades, el
              costo de compra por unidad es de $600. Ese número es la base para
              saber cuánto margen te deja cada venta.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white">
              Qué son los otros gastos por unidad
            </h2>

            <p className="mt-4">
              Los otros gastos por unidad son costos que aumentan cuando vendés
              más. En una distribuidora pueden incluir combustible, logística,
              embalaje, comisiones de venta, descuentos comerciales, medios de
              pago, envíos, roturas o cualquier gasto variable asociado a cada
              unidad vendida.
            </p>

            <p className="mt-4">
              Separar el costo de compra de los otros gastos ayuda a calcular una
              ganancia más realista. Muchas veces un producto parece rentable
              mirando solo el precio de compra, pero el margen baja cuando se
              suman reparto, comisiones o descuentos.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white">
              Diferencia entre margen y markup
            </h2>

            <p className="mt-4">
              El margen de ganancia mide qué porcentaje de la venta queda como
              ganancia. Se calcula sobre el precio de venta. El markup mide
              cuánto se agrega sobre el costo de compra. Se calcula sobre el
              costo.
            </p>

            <p className="mt-4">
              Esta diferencia es importante para distribuidores porque muchos
              negocios fijan precios agregando un porcentaje sobre el costo, pero
              después necesitan saber cuánto margen real queda sobre el precio de
              venta.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white">
              Cómo interpretar la ganancia neta mensual
            </h2>

            <p className="mt-4">
              La ganancia neta mensual es el resultado estimado después de
              descontar el costo de la mercadería, los gastos variables y los
              costos fijos mensuales. Si el resultado es positivo, la
              distribuidora estaría generando ganancia con los datos cargados.
            </p>

            <p className="mt-4">
              Si el resultado es negativo, puede ser una señal de que el precio
              de venta es bajo, el costo de compra es alto, hay demasiados gastos
              logísticos, falta volumen de ventas o la estructura fija mensual es
              demasiado pesada.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white">
              Qué significa el punto de equilibrio
            </h2>

            <p className="mt-4">
              El punto de equilibrio indica cuántas unidades necesitás vender
              para cubrir tus costos fijos sin ganar ni perder dinero. Este dato
              sirve para saber si tu objetivo de ventas diario o mensual es
              realista.
            </p>

            <p className="mt-4">
              Si el punto de equilibrio es muy alto, puede convenir revisar el
              precio de venta, negociar mejor con proveedores, reducir gastos de
              reparto, bajar costos fijos o aumentar el volumen de clientes.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white">
              Recupero del capital invertido
            </h2>

            <p className="mt-4">
              En una distribuidora, el capital invertido en mercadería es un dato
              clave porque muchas veces el negocio necesita comprar stock antes
              de vender. La calculadora estima en cuántos meses podrías recuperar
              ese capital usando la ganancia neta mensual.
            </p>

            <p className="mt-4">
              Si invertís $2.000.000 en mercadería y la ganancia neta mensual
              estimada es de $500.000, el recupero del capital sería de 4 meses.
              Este cálculo sirve para comparar oportunidades y medir si el
              negocio tiene sentido con el dinero inmovilizado en stock.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white">Ejemplo práctico</h2>

            <p className="mt-4">
              Supongamos que comprás un producto a $800, lo vendés a $1.100 y
              tenés otros gastos variables de $80 por unidad. En ese caso, la
              ganancia por unidad sería de $220 antes de descontar costos fijos.
            </p>

            <p className="mt-4">
              Si vendés 300 unidades por día durante 22 días al mes, venderías
              6.600 unidades mensuales. Con esos datos, la calculadora estima
              ventas mensuales, costo de mercadería, gastos variables, ganancia
              bruta, ganancia neta, punto de equilibrio, recupero del capital y
              ROI mensual.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white">
              Preguntas frecuentes
            </h2>

            <h3 className="mt-5 text-lg font-semibold text-white">
              ¿Esta calculadora sirve para una distribuidora de alimentos?
            </h3>

            <p className="mt-2">
              Sí. Sirve para distribuidoras de alimentos, bebidas, panificados,
              productos congelados, productos de limpieza, kioscos, almacenes
              mayoristas y negocios de reventa.
            </p>

            <h3 className="mt-5 text-lg font-semibold text-white">
              ¿Qué pasa si compro por caja o por bulto?
            </h3>

            <p className="mt-2">
              Tenés que dividir el costo total de la caja o bulto por la cantidad
              de unidades que trae. Así obtenés el costo de compra por unidad.
            </p>

            <h3 className="mt-5 text-lg font-semibold text-white">
              ¿Dónde cargo el combustible o reparto?
            </h3>

            <p className="mt-2">
              Si el gasto depende de cada venta o reparto, cargalo en otros
              gastos por unidad. Si es un gasto fijo mensual, cargalo en costos
              fijos.
            </p>

            <h3 className="mt-5 text-lg font-semibold text-white">
              ¿Qué diferencia hay entre margen y markup?
            </h3>

            <p className="mt-2">
              El margen se calcula sobre el precio de venta. El markup se calcula
              sobre el costo de compra. Por eso pueden dar porcentajes distintos
              aunque el producto sea el mismo.
            </p>

            <h3 className="mt-5 text-lg font-semibold text-white">
              ¿Qué pasa si la ganancia por unidad es negativa?
            </h3>

            <p className="mt-2">
              Si la ganancia por unidad es negativa, cada producto vendido genera
              pérdida antes de cubrir costos fijos. En ese caso, la calculadora
              mostrará que el punto de equilibrio no es rentable.
            </p>

            <h3 className="mt-5 text-lg font-semibold text-white">
              ¿Qué datos necesito para usarla?
            </h3>

            <p className="mt-2">
              Necesitás conocer el costo de compra por unidad, precio de venta,
              otros gastos por unidad, unidades vendidas por día, días de venta
              por mes, costos fijos mensuales y capital invertido en mercadería.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}