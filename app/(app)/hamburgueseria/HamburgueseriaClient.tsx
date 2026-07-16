"use client";

import { FormEvent, useState } from "react";

type Currency = "ARS" | "USD";

type Results = {
  costoHamburguesa: number;
  costoTotalUnitario: number;
  gananciaPorUnidad: number;
  margenGanancia: number;
  hamburguesasPorMes: number;
  ventasMensuales: number;
  costoVariableMensual: number;
  gananciaBrutaMensual: number;
  gananciaNetaMensual: number;
  puntoEquilibrioMensual: number | null;
  puntoEquilibrioDiario: number | null;
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
  const cleanedValue = value.replace(/[^0-9,]/g, "");
  const hasDecimalComma = cleanedValue.includes(",");

  const [integerPartRaw, decimalPartRaw = ""] = cleanedValue.split(",");
  const integerPart = integerPartRaw.replace(/\D/g, "");

  const formattedInteger =
    integerPart.length > 0
      ? new Intl.NumberFormat("es-AR").format(Number(integerPart))
      : "";

  if (hasDecimalComma) {
    const decimalPart = decimalPartRaw.replace(/\D/g, "").slice(0, 2);
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
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(event) => onChange(formatInputValue(event.target.value))}
          placeholder="0"
          className={`w-full appearance-none rounded-2xl border border-zinc-800 bg-zinc-950 py-3 text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-emerald-300/50 ${
            prefix ? "pl-16 pr-4" : "px-4"
          }`}
        />
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

export default function HamburgueseriaPage() {
  const [currency, setCurrency] = useState<Currency>("ARS");

  const [costoHamburguesa, setCostoHamburguesa] = useState("");
  const [otrosGastos, setOtrosGastos] = useState("");
  const [precioVenta, setPrecioVenta] = useState("");
  const [hamburguesasPorDia, setHamburguesasPorDia] = useState("");
  const [diasAbiertos, setDiasAbiertos] = useState("");
  const [costosFijos, setCostosFijos] = useState("");

  const [results, setResults] = useState<Results | null>(null);

  const moneyPrefix = currency === "ARS" ? "$" : "US$";

  function handleCalculate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const costoHamburguesaNumber = parseInput(costoHamburguesa);
    const otrosGastosNumber = parseInput(otrosGastos);
    const precioVentaNumber = parseInput(precioVenta);
    const hamburguesasPorDiaNumber = parseInput(hamburguesasPorDia);
    const diasAbiertosNumber = parseInput(diasAbiertos);
    const costosFijosNumber = parseInput(costosFijos);

    const costoTotalUnitario = costoHamburguesaNumber + otrosGastosNumber;
    const gananciaPorUnidad = precioVentaNumber - costoTotalUnitario;

    const margenGanancia =
      precioVentaNumber > 0
        ? (gananciaPorUnidad / precioVentaNumber) * 100
        : 0;

    const hamburguesasPorMes = hamburguesasPorDiaNumber * diasAbiertosNumber;
    const ventasMensuales = precioVentaNumber * hamburguesasPorMes;
    const costoVariableMensual = costoTotalUnitario * hamburguesasPorMes;
    const gananciaBrutaMensual = ventasMensuales - costoVariableMensual;
    const gananciaNetaMensual = gananciaBrutaMensual - costosFijosNumber;

    const puntoEquilibrioMensual =
      gananciaPorUnidad > 0 ? costosFijosNumber / gananciaPorUnidad : null;

    const puntoEquilibrioDiario =
      puntoEquilibrioMensual !== null && diasAbiertosNumber > 0
        ? puntoEquilibrioMensual / diasAbiertosNumber
        : null;

    setResults({
      costoHamburguesa: costoHamburguesaNumber,
      costoTotalUnitario,
      gananciaPorUnidad,
      margenGanancia,
      hamburguesasPorMes,
      ventasMensuales,
      costoVariableMensual,
      gananciaBrutaMensual,
      gananciaNetaMensual,
      puntoEquilibrioMensual,
      puntoEquilibrioDiario,
    });
  }

  const emptyResults: Results = {
    costoHamburguesa: 0,
    costoTotalUnitario: 0,
    gananciaPorUnidad: 0,
    margenGanancia: 0,
    hamburguesasPorMes: 0,
    ventasMensuales: 0,
    costoVariableMensual: 0,
    gananciaBrutaMensual: 0,
    gananciaNetaMensual: 0,
    puntoEquilibrioMensual: 0,
    puntoEquilibrioDiario: 0,
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
            Hamburguesería
          </h1>

          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-zinc-400">
            Calculá el costo por hamburguesa, la ganancia por unidad, el margen,
            la ganancia mensual estimada y el punto de equilibrio de tu negocio.
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
                  Costos por hamburguesa
                </h3>

                <div className="space-y-4">
                  <InputField
                    label="Costo de hamburguesa"
                    value={costoHamburguesa}
                    onChange={setCostoHamburguesa}
                    prefix={moneyPrefix}
                    helper="Incluye ingredientes y packaging: pan, carne, queso, toppings, salsas, caja, bolsa, papel y servilletas."
                  />

                  <InputField
                    label="Otros gastos por hamburguesa"
                    value={otrosGastos}
                    onChange={setOtrosGastos}
                    prefix={moneyPrefix}
                    helper="Incluye comisiones, promociones, delivery, extras o cualquier costo variable que dependa de cada venta."
                  />
                </div>
              </div>

              <div>
                <h3 className="mb-4 text-lg font-semibold text-zinc-100">
                  Ventas
                </h3>

                <div className="space-y-4">
                  <InputField
                    label="Precio de venta por hamburguesa"
                    value={precioVenta}
                    onChange={setPrecioVenta}
                    prefix={moneyPrefix}
                  />

                  <InputField
                    label="Hamburguesas vendidas por día"
                    value={hamburguesasPorDia}
                    onChange={setHamburguesasPorDia}
                  />

                  <InputField
                    label="Días abiertos por mes"
                    value={diasAbiertos}
                    onChange={setDiasAbiertos}
                  />
                </div>
              </div>

              <div>
                <h3 className="mb-4 text-lg font-semibold text-zinc-100">
                  Costos fijos
                </h3>

                <InputField
                  label="Costos fijos mensuales"
                  value={costosFijos}
                  onChange={setCostosFijos}
                  prefix={moneyPrefix}
                  helper="Incluye alquiler, sueldos, luz, gas, agua, internet, contador, marketing y mantenimiento."
                />
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
                title="Ganancia por hamburguesa"
                value={formatMoney(
                  displayedResults.gananciaPorUnidad,
                  currency
                )}
                muted={isMuted}
              />

              <ResultCard
                title="Costo total por hamburguesa"
                value={formatMoney(
                  displayedResults.costoTotalUnitario,
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
                title="Hamburguesas vendidas por mes"
                value={formatNumber(displayedResults.hamburguesasPorMes)}
                muted={isMuted}
              />

              <ResultCard
                title="Ventas mensuales"
                value={formatMoney(displayedResults.ventasMensuales, currency)}
                muted={isMuted}
              />

              <ResultCard
                title="Costo variable mensual"
                value={formatMoney(
                  displayedResults.costoVariableMensual,
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
                      )} Unidades`
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
                      )} Unidades`
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
              • Costo total por hamburguesa = costo de hamburguesa + otros
              gastos por hamburguesa.
            </li>
            <li>
              • Ganancia por hamburguesa = precio de venta − costo total por
              hamburguesa.
            </li>
            <li>
              • Margen de ganancia = ganancia por hamburguesa / precio de venta
              × 100.
            </li>
            <li>
              • Hamburguesas vendidas por mes = hamburguesas vendidas por día ×
              días abiertos por mes.
            </li>
            <li>
              • Ventas mensuales = precio de venta × hamburguesas vendidas por
              mes.
            </li>
            <li>
              • Costo variable mensual = costo total por hamburguesa ×
              hamburguesas vendidas por mes.
            </li>
            <li>
              • Ganancia bruta mensual = ventas mensuales − costo variable
              mensual.
            </li>
            <li>
              • Ganancia neta mensual = ganancia bruta mensual − costos fijos
              mensuales.
            </li>
            <li>
              • Punto de equilibrio = costos fijos mensuales / ganancia por
              hamburguesa.
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
              • Supone que todas las hamburguesas tienen el mismo precio de
              venta y el mismo costo.
            </li>
            <li>
              • Si vendés por apps, conviene sumar las comisiones dentro de
              otros gastos por hamburguesa.
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
              Calculadora de rentabilidad para hamburgueserías
            </h2>

            <p className="mt-4">
              Esta calculadora para hamburgueserías permite estimar la
              rentabilidad de un negocio gastronómico a partir de pocos datos:
              costo por hamburguesa, otros gastos variables, precio de venta,
              ventas diarias, días abiertos y costos fijos mensuales.
            </p>

            <p className="mt-4">
              La herramienta está pensada para dueños de hamburgueserías, dark
              kitchens, food trucks, locales de comida rápida y emprendimientos
              gastronómicos que necesitan saber si su precio de venta alcanza
              para cubrir los costos y generar ganancia.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white">
              Qué incluir en el costo de una hamburguesa
            </h2>

            <p className="mt-4">
              En el campo costo de hamburguesa podés cargar el costo completo de
              producir una unidad. Ahí conviene incluir ingredientes y packaging:
              pan, carne, queso, verduras, salsas, toppings, caja, bolsa, papel,
              servilletas y otros elementos necesarios para entregar el producto.
            </p>

            <p className="mt-4">
              Si tenés gastos que dependen de cada venta, pero no forman parte
              directa del producto, podés sumarlos en otros gastos por
              hamburguesa. Por ejemplo, comisiones de aplicaciones, descuentos,
              promociones, delivery, medios de pago o costos variables
              adicionales.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white">
              Por qué no alcanza con mirar la facturación
            </h2>

            <p className="mt-4">
              Una hamburguesería puede vender mucho y aun así ganar poco si el
              costo por unidad es alto, si el precio de venta está mal calculado
              o si los costos fijos mensuales son demasiado elevados. Por eso es
              importante mirar la ganancia por hamburguesa, el margen y la
              ganancia neta mensual.
            </p>

            <p className="mt-4">
              La facturación mensual muestra cuánto ingresa por ventas, pero no
              muestra cuánto queda después de pagar ingredientes, packaging,
              comisiones, sueldos, alquiler, servicios y otros gastos del
              negocio.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white">
              Cómo interpretar la ganancia neta mensual
            </h2>

            <p className="mt-4">
              La ganancia neta mensual es el resultado estimado después de
              descontar los costos variables y los costos fijos. Si el resultado
              es positivo, el negocio estaría generando ganancia con los datos
              cargados. Si el resultado es negativo, puede ser una señal de que
              el precio es bajo, el costo por hamburguesa es alto, faltan ventas
              o la estructura fija mensual es demasiado pesada.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white">
              Qué significa el punto de equilibrio
            </h2>

            <p className="mt-4">
              El punto de equilibrio indica cuántas hamburguesas necesitás vender
              para cubrir tus costos fijos sin ganar ni perder plata. Este dato
              sirve para saber si el objetivo de ventas diario es realista y si
              el negocio puede sostener su estructura actual.
            </p>

            <p className="mt-4">
              Si el punto de equilibrio es muy alto, puede convenir revisar el
              precio de venta, negociar costos, reducir gastos fijos o aumentar
              el volumen de ventas.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white">Ejemplo práctico</h2>

            <p className="mt-4">
              Supongamos que una hamburguesa se vende a $4.500, que el costo de
              hamburguesa es de $1.800 y que otros gastos variables suman $200
              por unidad. En ese caso, el costo total por hamburguesa sería de
              $2.000 y la ganancia por unidad sería de $2.500 antes de descontar
              costos fijos.
            </p>

            <p className="mt-4">
              Si el negocio vende 80 hamburguesas por día y abre 26 días al mes,
              vendería 2.080 hamburguesas mensuales. Con esos datos, la
              calculadora estima ventas mensuales, costo variable mensual,
              ganancia bruta, ganancia neta y punto de equilibrio.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white">
              Preguntas frecuentes
            </h2>

            <h3 className="mt-5 text-lg font-semibold text-white">
              ¿Esta calculadora sirve para una dark kitchen?
            </h3>

            <p className="mt-2">
              Sí. También puede usarse para dark kitchens, food trucks,
              emprendimientos de delivery o locales gastronómicos que vendan
              hamburguesas.
            </p>

            <h3 className="mt-5 text-lg font-semibold text-white">
              ¿Dónde cargo las comisiones de apps?
            </h3>

            <p className="mt-2">
              Si la comisión depende de cada venta, cargala en otros gastos por
              hamburguesa. Si es un gasto fijo mensual, cargala en costos fijos.
            </p>

            <h3 className="mt-5 text-lg font-semibold text-white">
              ¿Qué pasa si el costo es mayor al precio de venta?
            </h3>

            <p className="mt-2">
              Si el costo total por hamburguesa es mayor que el precio de venta,
              la hamburguesa deja pérdida por unidad y no alcanza para cubrir
              los costos fijos.
            </p>

            <h3 className="mt-5 text-lg font-semibold text-white">
              ¿Qué datos necesito para usarla?
            </h3>

            <p className="mt-2">
              Necesitás conocer el costo estimado de una hamburguesa, otros
              gastos por venta, precio de venta, cantidad vendida por día, días
              abiertos al mes y costos fijos mensuales.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}