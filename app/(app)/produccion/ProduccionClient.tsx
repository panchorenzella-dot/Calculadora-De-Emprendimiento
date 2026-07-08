"use client";

import { FormEvent, useState } from "react";

type Currency = "ARS" | "USD";

type Results = {
  costoProduccion: number;
  packaging: number;
  otrosGastos: number;
  costoTotalUnitario: number;
  gananciaPorUnidad: number;
  margenGanancia: number;
  unidadesPorMes: number;
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
          className={`w-full appearance-none rounded-2xl border border-zinc-800 bg-zinc-950 py-3 text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-zinc-500 ${
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

export default function ProduccionPage() {
  const [currency, setCurrency] = useState<Currency>("ARS");

  const [costoProduccion, setCostoProduccion] = useState("");
  const [packaging, setPackaging] = useState("");
  const [otrosGastos, setOtrosGastos] = useState("");
  const [precioVenta, setPrecioVenta] = useState("");
  const [unidadesPorDia, setUnidadesPorDia] = useState("");
  const [diasProduccion, setDiasProduccion] = useState("");
  const [costosFijos, setCostosFijos] = useState("");

  const [results, setResults] = useState<Results | null>(null);

  const moneyPrefix = currency === "ARS" ? "$" : "US$";

  function handleCalculate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const costoProduccionNumber = parseInput(costoProduccion);
    const packagingNumber = parseInput(packaging);
    const otrosGastosNumber = parseInput(otrosGastos);
    const precioVentaNumber = parseInput(precioVenta);
    const unidadesPorDiaNumber = parseInput(unidadesPorDia);
    const diasProduccionNumber = parseInput(diasProduccion);
    const costosFijosNumber = parseInput(costosFijos);

    const costoTotalUnitario =
      costoProduccionNumber + packagingNumber + otrosGastosNumber;

    const gananciaPorUnidad = precioVentaNumber - costoTotalUnitario;

    const margenGanancia =
      precioVentaNumber > 0
        ? (gananciaPorUnidad / precioVentaNumber) * 100
        : 0;

    const unidadesPorMes = unidadesPorDiaNumber * diasProduccionNumber;
    const ventasMensuales = precioVentaNumber * unidadesPorMes;
    const costoVariableMensual = costoTotalUnitario * unidadesPorMes;
    const gananciaBrutaMensual = ventasMensuales - costoVariableMensual;
    const gananciaNetaMensual = gananciaBrutaMensual - costosFijosNumber;

    const puntoEquilibrioMensual =
      gananciaPorUnidad > 0 ? costosFijosNumber / gananciaPorUnidad : null;

    const puntoEquilibrioDiario =
      puntoEquilibrioMensual !== null && diasProduccionNumber > 0
        ? puntoEquilibrioMensual / diasProduccionNumber
        : null;

    setResults({
      costoProduccion: costoProduccionNumber,
      packaging: packagingNumber,
      otrosGastos: otrosGastosNumber,
      costoTotalUnitario,
      gananciaPorUnidad,
      margenGanancia,
      unidadesPorMes,
      ventasMensuales,
      costoVariableMensual,
      gananciaBrutaMensual,
      gananciaNetaMensual,
      puntoEquilibrioMensual,
      puntoEquilibrioDiario,
    });
  }

  const emptyResults: Results = {
    costoProduccion: 0,
    packaging: 0,
    otrosGastos: 0,
    costoTotalUnitario: 0,
    gananciaPorUnidad: 0,
    margenGanancia: 0,
    unidadesPorMes: 0,
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
            Producción
          </h1>

          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-zinc-400">
            Calculá el costo por unidad, la ganancia, el margen, la ganancia
            mensual estimada y el punto de equilibrio de un negocio de
            producción.
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
                  Costos por unidad
                </h3>

                <div className="space-y-4">
                  <InputField
                    label="Costo de producción por unidad"
                    value={costoProduccion}
                    onChange={setCostoProduccion}
                    prefix={moneyPrefix}
                    helper="Incluye materia prima e insumos principales: harina, carne, queso, azúcar, huevos, aceite, masa, relleno o ingredientes del producto."
                  />

                  <InputField
                    label="Packaging por unidad"
                    value={packaging}
                    onChange={setPackaging}
                    prefix={moneyPrefix}
                    helper="Incluye caja, bolsa, etiqueta, film, bandeja, separadores o cualquier empaque necesario para vender la unidad."
                  />

                  <InputField
                    label="Otros gastos por unidad"
                    value={otrosGastos}
                    onChange={setOtrosGastos}
                    prefix={moneyPrefix}
                    helper="Incluye comisiones, logística por unidad, merma estimada, descartables o cualquier costo variable adicional."
                  />
                </div>
              </div>

              <div>
                <h3 className="mb-4 text-lg font-semibold text-zinc-100">
                  Producción y venta
                </h3>

                <div className="space-y-4">
                  <InputField
                    label="Precio de venta por unidad"
                    value={precioVenta}
                    onChange={setPrecioVenta}
                    prefix={moneyPrefix}
                    helper="Puede ser precio mayorista, minorista o el precio promedio al que vendés cada unidad."
                  />

                  <InputField
                    label="Unidades producidas por día"
                    value={unidadesPorDia}
                    onChange={setUnidadesPorDia}
                    helper="Por ejemplo: panes, medialunas, alfajores, empanadas, viandas, cajas o unidades vendibles."
                  />

                  <InputField
                    label="Días de producción por mes"
                    value={diasProduccion}
                    onChange={setDiasProduccion}
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
                  helper="Incluye alquiler, sueldos, luz, gas, agua, maquinaria, mantenimiento, contador, marketing y otros gastos mensuales."
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
                title="Costo total por unidad"
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
                title="Unidades producidas por mes"
                value={formatNumber(displayedResults.unidadesPorMes)}
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
            </div>
          </section>
        </section>

        <section className="mt-10 rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="text-2xl font-bold text-white">Cómo lo calculamos</h2>

          <ul className="mt-4 space-y-2 text-sm leading-relaxed text-zinc-400">
            <li>
              • Costo total por unidad = costo de producción + packaging + otros
              gastos por unidad.
            </li>
            <li>
              • Ganancia por unidad = precio de venta por unidad − costo total
              por unidad.
            </li>
            <li>
              • Margen de ganancia = ganancia por unidad / precio de venta por
              unidad × 100.
            </li>
            <li>
              • Unidades producidas por mes = unidades producidas por día × días
              de producción por mes.
            </li>
            <li>
              • Ventas mensuales = precio de venta por unidad × unidades
              producidas por mes.
            </li>
            <li>
              • Costo variable mensual = costo total por unidad × unidades
              producidas por mes.
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
              unidad.
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
            <li>• Supone que todas las unidades producidas se venden.</li>
            <li>
              • Supone que todas las unidades tienen el mismo costo y el mismo
              precio de venta.
            </li>
            <li>
              • La merma, desperdicio o producto no vendido debe cargarse dentro
              de otros gastos por unidad si querés incluirla.
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
              Calculadora de producción para negocios y fábricas
            </h2>

            <p className="mt-4">
              Esta calculadora de producción permite estimar la rentabilidad de
              un negocio que fabrica o produce unidades para vender. Sirve para
              calcular el costo por unidad, la ganancia por unidad, el margen de
              ganancia, la ganancia mensual estimada y el punto de equilibrio.
            </p>

            <p className="mt-4">
              La herramienta está pensada para panaderías, fábricas de alimentos,
              pastas, empanadas, alfajores, panificados, viandas, productos
              congelados, emprendimientos gastronómicos, productores mayoristas y
              negocios que venden productos por unidad.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white">
              Qué incluir en el costo de producción por unidad
            </h2>

            <p className="mt-4">
              En el campo costo de producción por unidad conviene cargar todos
              los insumos principales necesarios para fabricar una unidad del
              producto. Por ejemplo: harina, azúcar, huevos, aceite, carne,
              queso, masa, relleno, levadura, chocolate, dulce de leche o
              cualquier materia prima usada en la producción.
            </p>

            <p className="mt-4">
              En packaging por unidad podés sumar cajas, bolsas, etiquetas,
              film, bandejas, separadores, envoltorios o cualquier empaque que
              uses para entregar o vender el producto. Si el packaging cambia
              según el producto, podés cargar un promedio.
            </p>

            <p className="mt-4">
              En otros gastos por unidad podés incluir costos variables que
              dependen de la producción o de cada venta: comisiones, logística,
              descartables, merma, desperdicio, productos fallados o costos
              adicionales que aumentan cuando producís más unidades.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white">
              Por qué calcular la ganancia por unidad
            </h2>

            <p className="mt-4">
              La ganancia por unidad muestra cuánto deja cada producto vendido
              después de descontar su costo variable. Es una de las métricas más
              importantes en un negocio de producción, porque ayuda a saber si el
              precio de venta alcanza para cubrir los costos y generar margen.
            </p>

            <p className="mt-4">
              Si la ganancia por unidad es baja, el negocio puede necesitar
              vender muchas unidades para cubrir los costos fijos. Si la ganancia
              por unidad es negativa, cada venta genera pérdida antes de pagar
              alquiler, sueldos, servicios y otros gastos mensuales.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white">
              Producción mensual y ventas estimadas
            </h2>

            <p className="mt-4">
              La calculadora estima las unidades producidas por mes multiplicando
              las unidades producidas por día por los días de producción del mes.
              Luego calcula las ventas mensuales multiplicando esas unidades por
              el precio de venta.
            </p>

            <p className="mt-4">
              Este dato es útil para negocios que trabajan con producción diaria
              o semanal, como panaderías, fábricas de alimentos, productores
              mayoristas o emprendimientos que necesitan planificar capacidad,
              costos y ventas.
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
              cargados. Si es negativo, puede ser una señal de que el precio de
              venta es bajo, el costo por unidad es alto, falta volumen de
              producción o los costos fijos mensuales son demasiado elevados.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white">
              Qué significa el punto de equilibrio
            </h2>

            <p className="mt-4">
              El punto de equilibrio indica cuántas unidades necesitás vender
              para cubrir tus costos fijos sin ganar ni perder dinero. Este
              resultado sirve para saber si el objetivo de producción y venta es
              realista.
            </p>

            <p className="mt-4">
              Si el punto de equilibrio es muy alto, puede convenir revisar el
              precio de venta, reducir costos de producción, mejorar el
              packaging, negociar insumos, bajar gastos fijos o aumentar el
              volumen de unidades vendidas.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white">Ejemplo práctico</h2>

            <p className="mt-4">
              Supongamos que un producto se vende a $1.500, que el costo de
              producción por unidad es de $700, el packaging cuesta $100 y otros
              gastos variables suman $50. En ese caso, el costo total por unidad
              sería de $850 y la ganancia por unidad sería de $650 antes de
              descontar costos fijos.
            </p>

            <p className="mt-4">
              Si el negocio produce 500 unidades por día y trabaja 22 días al
              mes, produciría 11.000 unidades mensuales. Con esos datos, la
              calculadora estima ventas mensuales, costo variable mensual,
              ganancia bruta, ganancia neta y punto de equilibrio.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white">
              Preguntas frecuentes
            </h2>

            <h3 className="mt-5 text-lg font-semibold text-white">
              ¿Esta calculadora sirve para una panadería?
            </h3>

            <p className="mt-2">
              Sí. Sirve para panaderías, fábricas de panificados, medialunas,
              facturas, alfajores, pastas, empanadas, viandas y otros productos
              fabricados por unidad.
            </p>

            <h3 className="mt-5 text-lg font-semibold text-white">
              ¿Qué pasa si vendo por mayor y por menor?
            </h3>

            <p className="mt-2">
              Podés usar un precio promedio por unidad o hacer dos cálculos
              separados: uno con precio mayorista y otro con precio minorista.
            </p>

            <h3 className="mt-5 text-lg font-semibold text-white">
              ¿Dónde cargo la merma o producto que se pierde?
            </h3>

            <p className="mt-2">
              Podés cargarla dentro de otros gastos por unidad. Si la merma es
              importante, conviene estimar cuánto representa por cada unidad
              producida.
            </p>

            <h3 className="mt-5 text-lg font-semibold text-white">
              ¿La calculadora asume que vendo todo lo que produzco?
            </h3>

            <p className="mt-2">
              Sí. La calculadora supone que las unidades producidas por mes se
              venden. Si no vendés todo, conviene cargar solo las unidades que
              realmente esperás vender o sumar la pérdida dentro de otros gastos.
            </p>

            <h3 className="mt-5 text-lg font-semibold text-white">
              ¿Qué datos necesito para usarla?
            </h3>

            <p className="mt-2">
              Necesitás conocer el costo de producción por unidad, packaging,
              otros gastos por unidad, precio de venta, unidades producidas por
              día, días de producción por mes y costos fijos mensuales.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}