"use client";

import { type FormEvent, useMemo, useState } from "react";
import Card from "@/components/Card";
import MoneyInput, { Currency } from "@/components/MoneyInput";
import { calculateMarkupPricing } from "@/lib/calculations/business";
import { fmtMoney, fmtNum } from "@/lib/format";
import { formatLocaleNumberInput, formatLocaleNumberInputChange, parseDigitsToNumber, parseLocaleNumber, validateNumericFields } from "@/lib/numberInput";

type ModoGanancia = "desde_ganancia" | "desde_precio";
type NivelCalculo = "rapido" | "completo";

type Results = {
  precioCalculado: number;
  costoVariableUnitario: number;
  costoFijoPorUnidad: number;
  costoTotalUnitario: number;
  cargosPorVenta: number;
  gananciaPorUnidad: number;
  gananciaEsperadaPct: number;
  rentabilidadSobreVentaPct: number;
  costoMensual: number;
  cargosMensuales: number;
  facturacionMensual: number;
  gananciaMensual: number;
  puntoEquilibrio: number | null;
};

function normalizePercentInput(previousValue: string, nextValue: string, inputType: string) {
  return formatLocaleNumberInputChange(previousValue, nextValue, { maxDecimals: 2 }, inputType);
}

function parsePercent(value: string) {
  return parseLocaleNumber(value);
}

function PercentInput({ label, value, onChange, hint }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-white/80">{label}</span>
      <div className="flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-3 ring-1 ring-white/10 focus-within:ring-white/30">
        <input
          aria-label={label}
          className="w-full bg-transparent font-semibold text-white outline-none placeholder:text-white/35"
          inputMode="decimal"
          value={value}
          onChange={(event) => onChange(normalizePercentInput(value, event.target.value, (event.nativeEvent as InputEvent).inputType))}
          onFocus={(event) => event.currentTarget.select()}
          placeholder="0"
        />
        <span aria-hidden="true" className="font-semibold text-white/45">%</span>
      </div>
      {hint ? <span className="text-xs leading-5 text-white/45">{hint}</span> : null}
    </label>
  );
}

function ToggleGroup<T extends string>({ label, name, value, options, onChange }: {
  label: string;
  name: string;
  value: T;
  options: Array<{ value: T; label: string; description?: string }>;
  onChange: (value: T) => void;
}) {
  return (
    <fieldset>
      <legend className="sr-only">{label}</legend>
      <div className="grid gap-2 rounded-2xl border border-white/10 bg-black/25 p-1 sm:grid-cols-2">
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <label
              key={option.value}
              className={`cursor-pointer rounded-xl px-4 py-3 text-left transition focus-within:ring-2 focus-within:ring-emerald-300/45 ${selected ? "bg-zinc-800 text-white shadow-sm ring-1 ring-inset ring-white/10" : "text-white/55 hover:bg-white/5 hover:text-white"}`}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              <span className="block text-sm font-bold">{option.label}</span>
              {option.description ? (
                <span className={`mt-1 block text-xs ${selected ? "text-white/60" : "text-white/35"}`}>
                  {option.description}
                </span>
              ) : null}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export default function Page() {
  const [currency, setCurrency] = useState<Currency>("ARS");
  const [modo, setModo] = useState<ModoGanancia>("desde_ganancia");
  const [nivel, setNivel] = useState<NivelCalculo>("rapido");
  const [costo, setCosto] = useState("");
  const [gananciaDeseadaPct, setGananciaDeseadaPct] = useState("");
  const [precio, setPrecio] = useState("");
  const [unidadesMes, setUnidadesMes] = useState("");
  const [otrosCostosUnitarios, setOtrosCostosUnitarios] = useState("");
  const [costosFijosMensuales, setCostosFijosMensuales] = useState("");
  const [comisionPct, setComisionPct] = useState("");
  const [impuestosPct, setImpuestosPct] = useState("");
  const [results, setResults] = useState<Results | null>(null);
  const [error, setError] = useState<string | null>(null);

  const draftResults = useMemo<Results>(() => {
    const costoProducto = parseDigitsToNumber(costo);
    const unidades = parseDigitsToNumber(unidadesMes);
    const markupObjetivo = parsePercent(gananciaDeseadaPct);
    const precioIngresado = parseDigitsToNumber(precio);
    const costoExtra = nivel === "completo" ? parseDigitsToNumber(otrosCostosUnitarios) : 0;
    const costosFijos = nivel === "completo" ? parseDigitsToNumber(costosFijosMensuales) : 0;
    const comision = nivel === "completo" ? parsePercent(comisionPct) : 0;
    const impuestos = nivel === "completo" ? parsePercent(impuestosPct) : 0;
    const result = calculateMarkupPricing({
      productCost: costoProducto,
      targetMarkupPct: markupObjetivo,
      salePrice: precioIngresado,
      unitsPerMonth: unidades,
      extraUnitCosts: costoExtra,
      monthlyFixedCosts: costosFijos,
      commissionPct: comision,
      taxPct: impuestos,
      mode: modo === "desde_ganancia" ? "from-markup" : "from-price",
    });

    return {
      precioCalculado: result.calculatedPrice,
      costoVariableUnitario: result.variableUnitCost,
      costoFijoPorUnidad: result.fixedCostPerUnit,
      costoTotalUnitario: result.totalUnitCost,
      cargosPorVenta: result.chargesPerSale,
      gananciaPorUnidad: result.profitPerUnit,
      gananciaEsperadaPct: result.actualMarkupPct,
      rentabilidadSobreVentaPct: result.marginPct,
      costoMensual: result.monthlyCost,
      cargosMensuales: result.monthlyCharges,
      facturacionMensual: result.monthlyRevenue,
      gananciaMensual: result.monthlyProfit,
      puntoEquilibrio: result.breakEvenUnits,
    };
  }, [comisionPct, costo, costosFijosMensuales, gananciaDeseadaPct, impuestosPct, modo, nivel, otrosCostosUnitarios, precio, unidadesMes]);

  function resetResult() {
    setResults(null);
    setError(null);
  }

  function updateField(setter: (value: string) => void, value: string) {
    setter(value);
    resetResult();
  }

  function handleCalculate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const costoNum = parseDigitsToNumber(costo);
    const unidades = parseDigitsToNumber(unidadesMes);
    const cargos = parsePercent(comisionPct) + parsePercent(impuestosPct);

    const fields = [
      { name: "cost", label: "Costo del producto", value: costo, required: true, min: 0 },
      { name: "markup", label: "Ganancia deseada", value: gananciaDeseadaPct, min: 0 },
      { name: "units", label: "Unidades vendidas por mes", value: unidadesMes, min: 0, integer: true },
      ...(modo === "desde_precio" ? [{ name: "price", label: "Precio de venta", value: precio, required: true, min: 0 }] : []),
      ...(nivel === "completo" ? [
        { name: "extra", label: "Otros costos por unidad", value: otrosCostosUnitarios, min: 0 },
        { name: "fixed", label: "Costos fijos mensuales", value: costosFijosMensuales, min: 0 },
        { name: "commission", label: "Comisión por venta", value: comisionPct, min: 0, max: 100 },
        { name: "taxes", label: "Impuestos y cargos sobre la venta", value: impuestosPct, min: 0, max: 100 },
      ] : []),
    ] as const;
    const validation = validateNumericFields(fields);

    if (!validation.valid) {
      setError(validation.firstError);
      setResults(null);
      return;
    }

    if (costoNum <= 0) {
      setError("Ingresá un costo de producto mayor que cero.");
      setResults(null);
      return;
    }
    if (modo === "desde_precio" && parseDigitsToNumber(precio) <= 0) {
      setError("Ingresá un precio de venta mayor que cero.");
      setResults(null);
      return;
    }
    if (nivel === "completo" && parseDigitsToNumber(costosFijosMensuales) > 0 && unidades <= 0) {
      setError("Ingresá las unidades mensuales para poder repartir los costos fijos.");
      setResults(null);
      return;
    }
    if (nivel === "completo" && cargos >= 95) {
      setError("La suma de comisiones e impuestos debe ser menor al 95%.");
      setResults(null);
      return;
    }

    setError(null);
    setResults(draftResults);
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-5xl px-4 py-0">
        <header className="calculator-hero mb-8">
          <p>Costos y rentabilidad</p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Calculadora de Precio de Venta</h1>
          <p className="mt-2 max-w-2xl text-white/70">
            Definí cuánto cobrar y estimá cuánto te queda. Podés empezar con tres datos
            o sumar costos fijos, comisiones e impuestos para una estimación más completa.
          </p>
        </header>

        <section aria-label="Configuración del cálculo" className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.025] p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-200/55">Nivel de detalle</p>
              <p className="mt-1 text-sm text-white/48">Usá el rápido para orientarte o el completo para decidir con más contexto.</p>
            </div>
            <fieldset>
              <legend className="sr-only">Moneda</legend>
              <div className="flex items-center gap-3">
                <span aria-hidden="true" className="text-sm text-white/50">Moneda</span>
                <div className="inline-flex rounded-xl border border-white/10 bg-black/40 p-1 shadow-inner shadow-black/40">
                  {(["ARS", "USD"] as Currency[]).map((item) => (
                    <label key={item} className={`cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium tracking-wide transition focus-within:ring-2 focus-within:ring-emerald-300/45 ${currency === item ? "bg-zinc-800 text-white shadow-sm ring-1 ring-inset ring-white/10" : "text-white/40 hover:bg-white/5 hover:text-white/75"}`}>
                      <input type="radio" name="markup-currency" value={item} checked={currency === item} onChange={() => { setCurrency(item); resetResult(); }} className="sr-only" />
                      {item}
                    </label>
                  ))}
                </div>
              </div>
            </fieldset>
          </div>

          <ToggleGroup<NivelCalculo>
            label="Nivel de detalle"
            name="markup-detail"
            value={nivel}
            onChange={(next) => { setNivel(next); resetResult(); }}
            options={[
              { value: "rapido", label: "Cálculo rápido", description: "Costo, ganancia y unidades" },
              { value: "completo", label: "Cálculo completo", description: "Sumá gastos, comisiones e impuestos" },
            ]}
          />
          <ToggleGroup<ModoGanancia>
            label="Objetivo del cálculo"
            name="markup-objective"
            value={modo}
            onChange={(next) => { setModo(next); resetResult(); }}
            options={[
              { value: "desde_ganancia", label: "Quiero definir un precio", description: "Parto del costo y la ganancia que busco" },
              { value: "desde_precio", label: "Ya tengo un precio", description: "Quiero estimar cuánto me queda" },
            ]}
          />
        </section>

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-2">
          <form onSubmit={handleCalculate} className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Datos del producto</h2>
                <p className="mt-1 text-xs leading-5 text-white/45">Los campos del cálculo completo son opcionales salvo que tengas costos fijos.</p>
              </div>
              <span className="rounded-full border border-emerald-200/15 bg-emerald-200/[0.055] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-100/65">{nivel === "rapido" ? "Rápido" : "Completo"}</span>
            </div>

            <div className="mt-5 grid gap-4">
              <MoneyInput label="Costo del producto" valueDigits={costo} onChangeDigits={(value) => updateField(setCosto, value)} currency={currency} />
              {nivel === "completo" ? (
                <>
                  <MoneyInput label="Otros costos por unidad" hint="embalaje, envío o insumos" valueDigits={otrosCostosUnitarios} onChangeDigits={(value) => updateField(setOtrosCostosUnitarios, value)} currency={currency} />
                  <MoneyInput label="Costos fijos mensuales" hint="alquiler, servicios o sueldos" valueDigits={costosFijosMensuales} onChangeDigits={(value) => updateField(setCostosFijosMensuales, value)} currency={currency} />
                </>
              ) : null}
              {modo === "desde_ganancia" ? (
                <PercentInput label="Ganancia deseada sobre el costo" hint="También conocida como markup. No es lo mismo que margen sobre venta." value={gananciaDeseadaPct} onChange={(value) => updateField(setGananciaDeseadaPct, value)} />
              ) : (
                <MoneyInput label="Precio de venta actual" valueDigits={precio} onChangeDigits={(value) => updateField(setPrecio, value)} currency={currency} />
              )}
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-white/80">Unidades vendidas por mes</span>
                <input aria-label="Unidades vendidas por mes" className="rounded-xl bg-zinc-900 px-4 py-3 font-semibold text-white outline-none ring-1 ring-white/10 placeholder:text-white/35 focus:ring-white/30" inputMode="numeric" value={formatLocaleNumberInput(unidadesMes, { maxDecimals: 0 })} onChange={(event) => updateField(setUnidadesMes, formatLocaleNumberInputChange(unidadesMes, event.target.value, { maxDecimals: 0 }, (event.nativeEvent as InputEvent).inputType))} onFocus={(event) => event.currentTarget.select()} placeholder="0" />
              </label>
              {nivel === "completo" ? (
                <div className="grid gap-4 border-t border-white/[0.08] pt-4 sm:grid-cols-2">
                  <PercentInput label="Comisión por venta" hint="Tarjeta, plataforma o marketplace" value={comisionPct} onChange={(value) => updateField(setComisionPct, value)} />
                  <PercentInput label="Impuestos y cargos sobre la venta" hint="Por ejemplo, IIBB u otros cargos porcentuales" value={impuestosPct} onChange={(value) => updateField(setImpuestosPct, value)} />
                </div>
              ) : null}
            </div>

            {error ? <p role="alert" className="mt-5 rounded-xl border border-rose-300/20 bg-rose-300/[0.06] px-4 py-3 text-sm font-semibold text-rose-100">{error}</p> : null}
            <button type="submit" className="mt-5 w-full rounded-full bg-white px-4 py-3 text-sm font-black text-zinc-950 transition hover:bg-zinc-200">
              {modo === "desde_ganancia" ? "Calcular precio sugerido" : "Calcular ganancia estimada"}
            </button>
          </form>

          <section aria-live="polite" className="self-start rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold">Resultados</h2>
              {results ? <span className="text-xs font-semibold text-emerald-200/60">Estimación actual</span> : null}
            </div>
            {!results ? (
              <div className="mt-5 rounded-2xl border border-dashed border-white/10 bg-black/15 px-5 py-8 text-center">
                <p className="text-sm font-semibold text-white/65">Completá tus datos para ver el desglose.</p>
                <p className="mt-2 text-xs leading-5 text-white/38">No necesitás registrarte y no guardamos este cálculo automáticamente.</p>
              </div>
            ) : (
              <>
                <div className="mt-5 rounded-2xl border border-emerald-300/20 bg-emerald-300/[0.055] p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.15em] text-emerald-200/55">{modo === "desde_ganancia" ? "Precio sugerido" : nivel === "completo" ? "Ganancia neta por unidad" : "Ganancia bruta por unidad"}</p>
                  <p data-scenario-metric className="mt-3">
                    <span data-scenario-label className="sr-only">{modo === "desde_ganancia" ? "Precio de venta" : nivel === "completo" ? "Ganancia neta por unidad" : "Ganancia bruta por unidad"}</span>
                    <span data-scenario-value className="text-4xl font-bold tracking-tight text-white">{fmtMoney(modo === "desde_ganancia" ? results.precioCalculado : results.gananciaPorUnidad, currency)}</span>
                  </p>
                  <p className="mt-2 text-xs leading-5 text-white/45">{nivel === "completo" ? "Incluye los costos y porcentajes que cargaste." : "Resultado orientativo antes de costos fijos, comisiones e impuestos."}</p>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Card title="Precio de venta" value={fmtMoney(results.precioCalculado, currency)} />
                  <Card title="Costo total por unidad" value={fmtMoney(results.costoTotalUnitario, currency)} note={results.costoFijoPorUnidad > 0 ? `Incluye ${fmtMoney(results.costoFijoPorUnidad, currency)} de costos fijos` : undefined} />
                  {nivel === "completo" ? <Card title="Cargos por venta" value={fmtMoney(results.cargosPorVenta, currency)} /> : null}
                  <Card title={nivel === "completo" ? "Ganancia neta por unidad" : "Ganancia bruta por unidad"} value={fmtMoney(results.gananciaPorUnidad, currency)} />
                  <Card title={nivel === "completo" ? "Markup neto" : "Markup sobre costo"} value={`${fmtNum(results.gananciaEsperadaPct, 2)}%`} />
                  <Card title={nivel === "completo" ? "Margen neto sobre venta" : "Margen bruto sobre venta"} value={`${fmtNum(results.rentabilidadSobreVentaPct, 2)}%`} />
                  {parseDigitsToNumber(unidadesMes) > 0 ? <Card title="Costo mensual total" value={fmtMoney(results.costoMensual, currency)} /> : null}
                  <Card title="Facturación mensual" value={fmtMoney(results.facturacionMensual, currency)} />
                  {nivel === "completo" && results.cargosMensuales > 0 ? <Card title="Cargos mensuales estimados" value={fmtMoney(results.cargosMensuales, currency)} /> : null}
                  <Card title="Ganancia mensual estimada" value={fmtMoney(results.gananciaMensual, currency)} />
                  {results.puntoEquilibrio ? <Card title="Punto de equilibrio" value={`${fmtNum(results.puntoEquilibrio, 0)} unidades`} /> : null}
                </div>
              </>
            )}
          </section>
        </div>

        <div data-scenario-actions-before className="mt-10 grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold">Cómo lo calculamos</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-white/70">
              <li>El costo total unitario suma producto, costos por unidad y la parte proporcional de los costos fijos.</li>
              <li>Comisiones e impuestos porcentuales se descuentan del precio de venta.</li>
              <li>En modo precio sugerido, el valor compensa esos cargos y conserva la ganancia buscada.</li>
              <li>Margen se mide sobre el precio de venta; markup se mide sobre el costo total.</li>
            </ul>
          </section>
          <section className="rounded-2xl border border-amber-300/15 bg-amber-300/[0.035] p-6">
            <h2 className="text-lg font-semibold text-amber-100">Antes de decidir</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-white/70">
              <li>Ingresá solo impuestos o cargos que realmente se calculen como porcentaje de la venta.</li>
              <li>El tratamiento del IVA depende de tu condición fiscal y no se reemplaza con este campo general.</li>
              <li>No contempla estacionalidad, devoluciones ni cambios de demanda.</li>
              <li>La estimación sirve para comparar escenarios y no reemplaza el asesoramiento contable.</li>
            </ul>
          </section>
        </div>

        <section className="mt-10 grid gap-6 lg:grid-cols-3">
          <article className="rounded-2xl border border-white/10 bg-white/5 p-6 lg:col-span-2">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-200/55">Concepto clave</p>
            <h2 className="mt-3 text-2xl font-semibold">Margen y markup no son lo mismo</h2>
            <p className="mt-3 text-sm leading-7 text-white/70 sm:text-base">Si un producto cuesta $10.000 y sumás 80% sobre ese costo, el precio base es $18.000. El markup es 80%, pero el margen sobre la venta es 44,44%. El modo completo además compensa los cargos que se descuentan de cada cobro.</p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/35">Siguiente paso</p>
            <h2 className="mt-3 text-lg font-semibold">Probá dos escenarios</h2>
            <p className="mt-2 text-sm leading-6 text-white/55">Cambiá unidades, comisiones o ganancia objetivo para encontrar un precio sostenible antes de publicarlo.</p>
          </article>
        </section>
      </div>
    </main>
  );
}
