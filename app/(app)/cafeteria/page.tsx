"use client";

import { FormEvent, useState } from "react";

type Currency = "ARS" | "USD";

type Results = {
  costoPedido: number;
  costoTotalPedido: number;
  gananciaPorPedido: number;
  margenGanancia: number;
  clientesPorMes: number;
  ventasMensuales: number;
  costoVariableMensual: number;
  gananciaBrutaMensual: number;
  gananciaNetaMensual: number;
  puntoEquilibrioMensual: number | null;
  puntoEquilibrioDiario: number | null;
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
          className={`w-full appearance-none rounded-2xl border border-zinc-800 bg-zinc-950 py-3 text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-zinc-500 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
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

export default function CafeteriaPage() {
  const [currency, setCurrency] = useState<Currency>("ARS");

  const [costoPedido, setCostoPedido] = useState("");
  const [otrosGastos, setOtrosGastos] = useState("");
  const [ticketPromedio, setTicketPromedio] = useState("");
  const [clientesPorDia, setClientesPorDia] = useState("");
  const [diasAbiertos, setDiasAbiertos] = useState("");
  const [costosFijos, setCostosFijos] = useState("");

  const [results, setResults] = useState<Results | null>(null);

  const moneyPrefix = currency === "ARS" ? "$" : "US$";

  function handleCalculate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const costoPedidoNumber = parseInput(costoPedido);
    const otrosGastosNumber = parseInput(otrosGastos);
    const ticketPromedioNumber = parseInput(ticketPromedio);
    const clientesPorDiaNumber = parseInput(clientesPorDia);
    const diasAbiertosNumber = parseInput(diasAbiertos);
    const costosFijosNumber = parseInput(costosFijos);

    const costoTotalPedido = costoPedidoNumber + otrosGastosNumber;

    const gananciaPorPedido = ticketPromedioNumber - costoTotalPedido;

    const margenGanancia =
      ticketPromedioNumber > 0
        ? (gananciaPorPedido / ticketPromedioNumber) * 100
        : 0;

    const clientesPorMes = clientesPorDiaNumber * diasAbiertosNumber;

    const ventasMensuales = ticketPromedioNumber * clientesPorMes;

    const costoVariableMensual = costoTotalPedido * clientesPorMes;

    const gananciaBrutaMensual = ventasMensuales - costoVariableMensual;

    const gananciaNetaMensual = gananciaBrutaMensual - costosFijosNumber;

    const puntoEquilibrioMensual =
      gananciaPorPedido > 0 ? costosFijosNumber / gananciaPorPedido : null;

    const puntoEquilibrioDiario =
      puntoEquilibrioMensual !== null && diasAbiertosNumber > 0
        ? puntoEquilibrioMensual / diasAbiertosNumber
        : null;

    setResults({
      costoPedido: costoPedidoNumber,
      costoTotalPedido,
      gananciaPorPedido,
      margenGanancia,
      clientesPorMes,
      ventasMensuales,
      costoVariableMensual,
      gananciaBrutaMensual,
      gananciaNetaMensual,
      puntoEquilibrioMensual,
      puntoEquilibrioDiario,
    });
  }

  const emptyResults: Results = {
    costoPedido: 0,
    costoTotalPedido: 0,
    gananciaPorPedido: 0,
    margenGanancia: 0,
    clientesPorMes: 0,
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
            Cafetería
          </h1>

          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-zinc-400">
            Calculá la rentabilidad de una cafetería usando el ticket promedio,
            el costo por pedido, los clientes diarios y los costos fijos
            mensuales.
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
                  Costos por pedido
                </h3>

                <div className="space-y-4">
                  <InputField
                    label="Costo promedio por pedido"
                    value={costoPedido}
                    onChange={setCostoPedido}
                    prefix={moneyPrefix}
                    helper="Incluye café, leche, azúcar, vaso, tapa, servilleta, medialunas, pastelería, packaging y productos usados en una venta promedio."
                  />

                  <InputField
                    label="Otros gastos por pedido"
                    value={otrosGastos}
                    onChange={setOtrosGastos}
                    prefix={moneyPrefix}
                    helper="Incluye comisiones, promociones, delivery, medios de pago o cualquier costo variable que dependa de cada venta."
                  />
                </div>
              </div>

              <div>
                <h3 className="mb-4 text-lg font-semibold text-zinc-100">
                  Ventas
                </h3>

                <div className="space-y-4">
                  <InputField
                    label="Ticket promedio por cliente"
                    value={ticketPromedio}
                    onChange={setTicketPromedio}
                    prefix={moneyPrefix}
                    helper="Es el gasto promedio de cada cliente. Por ejemplo: café + medialuna, desayuno, merienda o take away."
                  />

                  <InputField
                    label="Clientes por día"
                    value={clientesPorDia}
                    onChange={setClientesPorDia}
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
                  helper="Incluye alquiler, sueldos, luz, gas, agua, internet, contador, marketing, mantenimiento y otros gastos del local."
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
                title="Ganancia por pedido"
                value={formatMoney(
                  displayedResults.gananciaPorPedido,
                  currency
                )}
                muted={isMuted}
              />

              <ResultCard
                title="Costo total por pedido"
                value={formatMoney(displayedResults.costoTotalPedido, currency)}
                muted={isMuted}
              />

              <ResultCard
                title="Margen de ganancia"
                value={formatPercent(displayedResults.margenGanancia)}
                muted={isMuted}
              />

              <ResultCard
                title="Clientes por mes"
                value={formatNumber(displayedResults.clientesPorMes)}
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
                      )} clientes`
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
                      )} clientes`
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
              • Costo total por pedido = costo promedio por pedido + otros
              gastos por pedido.
            </li>
            <li>
              • Ganancia por pedido = ticket promedio − costo total por pedido.
            </li>
            <li>
              • Margen de ganancia = ganancia por pedido / ticket promedio ×
              100.
            </li>
            <li>
              • Clientes por mes = clientes por día × días abiertos por mes.
            </li>
            <li>
              • Ventas mensuales = ticket promedio × clientes por mes.
            </li>
            <li>
              • Costo variable mensual = costo total por pedido × clientes por
              mes.
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
              pedido.
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
              • Supone que todos los clientes tienen el mismo ticket promedio.
            </li>
            <li>
              • Supone que todos los pedidos tienen el mismo costo promedio.
            </li>
            <li>
              • Si vendés por apps, conviene sumar las comisiones dentro de
              otros gastos por pedido.
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
              Calculadora de rentabilidad para cafeterías
            </h2>

            <p className="mt-4">
              Esta calculadora para cafeterías permite estimar la rentabilidad
              de un negocio a partir de pocos datos: costo promedio por pedido,
              otros gastos variables, ticket promedio, clientes por día, días
              abiertos y costos fijos mensuales.
            </p>

            <p className="mt-4">
              La herramienta está pensada para cafeterías, coffee shops, locales
              de especialidad, cafeterías take away, panaderías con café,
              emprendimientos gastronómicos y negocios que venden desayunos,
              meriendas o productos para llevar.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white">
              Qué incluir en el costo promedio por pedido
            </h2>

            <p className="mt-4">
              En el campo costo promedio por pedido podés cargar el costo
              estimado de preparar una venta promedio. Ahí conviene incluir café,
              leche, azúcar, vasos, tapas, servilletas, medialunas, tortas,
              productos de panadería, packaging y cualquier insumo necesario
              para entregar el pedido.
            </p>

            <p className="mt-4">
              En otros gastos por pedido podés sumar costos que dependen de cada
              venta, pero que no forman parte directa del producto. Por ejemplo:
              comisiones de aplicaciones, promociones, descuentos, delivery,
              medios de pago o costos variables adicionales.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white">
              Por qué usar ticket promedio en una cafetería
            </h2>

            <p className="mt-4">
              En una cafetería no todos los clientes compran lo mismo. Algunos
              compran solo un café, otros un café con medialuna, otros una
              merienda completa y otros productos para llevar. Por eso, en vez
              de calcular solo el precio de un café, conviene usar el ticket
              promedio por cliente.
            </p>

            <p className="mt-4">
              El ticket promedio permite estimar mejor la facturación mensual,
              porque resume cuánto gasta en promedio cada cliente que entra al
              local o compra por delivery.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white">
              Por qué no alcanza con mirar la facturación
            </h2>

            <p className="mt-4">
              Una cafetería puede tener mucho movimiento y aun así ganar poco si
              el costo promedio por pedido es alto, si el ticket promedio es
              bajo o si los costos fijos mensuales son demasiado elevados. Por
              eso es importante mirar la ganancia por pedido, el margen de
              ganancia y la ganancia neta mensual.
            </p>

            <p className="mt-4">
              La facturación mensual muestra cuánto ingresa por ventas, pero no
              muestra cuánto queda después de pagar insumos, packaging,
              comisiones, sueldos, alquiler, servicios, mantenimiento y otros
              gastos del negocio.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white">
              Cómo interpretar la ganancia neta mensual
            </h2>

            <p className="mt-4">
              La ganancia neta mensual es el resultado estimado después de
              descontar los costos variables y los costos fijos. Si el resultado
              es positivo, la cafetería estaría generando ganancia con los datos
              cargados. Si el resultado es negativo, puede ser una señal de que
              el ticket promedio es bajo, los costos son altos, faltan clientes
              o la estructura fija mensual es demasiado pesada.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white">
              Qué significa el punto de equilibrio
            </h2>

            <p className="mt-4">
              El punto de equilibrio indica cuántos clientes necesitás atender
              para cubrir tus costos fijos sin ganar ni perder plata. Este dato
              sirve para saber si el objetivo de clientes diarios es realista y
              si el negocio puede sostener su estructura actual.
            </p>

            <p className="mt-4">
              Si el punto de equilibrio es muy alto, puede convenir revisar el
              ticket promedio, negociar costos, reducir gastos fijos, mejorar el
              margen o aumentar el volumen de clientes.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white">Ejemplo práctico</h2>

            <p className="mt-4">
              Supongamos que una cafetería tiene un ticket promedio de $5.000,
              un costo promedio por pedido de $2.000 y otros gastos variables de
              $300 por pedido. En ese caso, el costo total por pedido sería de
              $2.300 y la ganancia por pedido sería de $2.700 antes de descontar
              costos fijos.
            </p>

            <p className="mt-4">
              Si el negocio recibe 100 clientes por día y abre 26 días al mes,
              atendería 2.600 clientes mensuales. Con esos datos, la calculadora
              estima ventas mensuales, costo variable mensual, ganancia bruta,
              ganancia neta y punto de equilibrio.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white">
              Preguntas frecuentes
            </h2>

            <h3 className="mt-5 text-lg font-semibold text-white">
              ¿Esta calculadora sirve para cafeterías take away?
            </h3>

            <p className="mt-2">
              Sí. También puede usarse para cafeterías take away, coffee shops,
              locales de especialidad, panaderías con café o emprendimientos de
              delivery.
            </p>

            <h3 className="mt-5 text-lg font-semibold text-white">
              ¿Dónde cargo las comisiones de apps?
            </h3>

            <p className="mt-2">
              Si la comisión depende de cada venta, cargala en otros gastos por
              pedido. Si es un gasto fijo mensual, cargala en costos fijos.
            </p>

            <h3 className="mt-5 text-lg font-semibold text-white">
              ¿Qué es el ticket promedio?
            </h3>

            <p className="mt-2">
              Es el gasto promedio de cada cliente. Por ejemplo, si algunos
              clientes gastan $3.000 y otros $7.000, el ticket promedio sirve
              para estimar cuánto ingresa por cliente en promedio.
            </p>

            <h3 className="mt-5 text-lg font-semibold text-white">
              ¿Qué pasa si el costo es mayor al ticket promedio?
            </h3>

            <p className="mt-2">
              Si el costo total por pedido es mayor que el ticket promedio, cada
              venta deja pérdida y no alcanza para cubrir los costos fijos.
            </p>

            <h3 className="mt-5 text-lg font-semibold text-white">
              ¿Qué datos necesito para usarla?
            </h3>

            <p className="mt-2">
              Necesitás conocer el costo promedio por pedido, otros gastos por
              venta, ticket promedio, clientes por día, días abiertos al mes y
              costos fijos mensuales.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}