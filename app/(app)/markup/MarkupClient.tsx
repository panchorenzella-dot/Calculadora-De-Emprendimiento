"use client";

import { useState } from "react";
import Card from "@/components/Card";
import MoneyInput, { Currency } from "@/components/MoneyInput";
import { parseDigitsToNumber, onlyDigits } from "@/lib/numberInput";
import { fmtMoney, fmtNum } from "@/lib/format";

type ModoGanancia = "desde_ganancia" | "desde_precio";

export default function Page() {
  const [currency, setCurrency] = useState<Currency>("ARS");
  const [modo, setModo] = useState<ModoGanancia>("desde_ganancia");

  const [costo, setCosto] = useState("0");
  const [gananciaDeseadaPct, setGananciaDeseadaPct] = useState("0");
  const [precio, setPrecio] = useState("0");
  const [unidadesMes, setUnidadesMes] = useState("0");

  const costoNum = parseDigitsToNumber(costo);
  const gananciaDeseadaPctNum = parseDigitsToNumber(gananciaDeseadaPct);
  const precioNum = parseDigitsToNumber(precio);
  const unidadesMesNum = parseDigitsToNumber(unidadesMes);

  const precioCalculado =
    modo === "desde_ganancia"
      ? costoNum * (1 + gananciaDeseadaPctNum / 100)
      : precioNum;

  const gananciaPorUnidad = precioCalculado - costoNum;

  const gananciaEsperadaPct =
    costoNum > 0 ? (gananciaPorUnidad / costoNum) * 100 : 0;

  const rentabilidadSobreVentaPct =
    precioCalculado > 0 ? (gananciaPorUnidad / precioCalculado) * 100 : 0;

  const costoMensual = costoNum * unidadesMesNum;
  const facturacionMensual = precioCalculado * unidadesMesNum;
  const gananciaMensual = gananciaPorUnidad * unidadesMesNum;

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-5xl px-4 py-0">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Calculadora de Precio de Venta
        </h1>

        <p className="mt-2 max-w-2xl text-white/70">
          Calculá precio de venta, ganancia por unidad, facturación y ganancia
          mensual estimada para tu negocio.
        </p>

        <div className="mt-6 flex items-center gap-3">
          <span className="text-sm text-white/70">Moneda</span>
          <select
            className="rounded-xl bg-zinc-900 px-4 py-2 outline-none ring-1 ring-white/10 focus:ring-white/30"
            value={currency}
            onChange={(e) => setCurrency(e.target.value as Currency)}
          >
            <option value="ARS">ARS ($)</option>
            <option value="USD">USD (US$)</option>
          </select>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setModo("desde_ganancia")}
            className={`rounded-xl px-4 py-2 text-sm font-semibold ring-1 ${
              modo === "desde_ganancia"
                ? "bg-white text-zinc-950 ring-white"
                : "bg-white/10 text-white ring-white/10 hover:bg-white/20"
            }`}
          >
            Calcular precio desde ganancia esperada
          </button>

          <button
            type="button"
            onClick={() => setModo("desde_precio")}
            className={`rounded-xl px-4 py-2 text-sm font-semibold ring-1 ${
              modo === "desde_precio"
                ? "bg-white text-zinc-950 ring-white"
                : "bg-white/10 text-white ring-white/10 hover:bg-white/20"
            }`}
          >
            Calcular ganancia desde precio
          </button>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">Datos</h2>

            <div className="mt-5 grid gap-4">
              <MoneyInput
                label="Costo del producto"
                valueDigits={costo}
                onChangeDigits={setCosto}
                currency={currency}
              />

              {modo === "desde_ganancia" ? (
                <label className="grid gap-2">
                  <span className="text-sm text-white/70">
                    Ganancia esperada (%)
                  </span>
                  <input
                    className="rounded-xl bg-zinc-900 px-4 py-3 outline-none ring-1 ring-white/10 focus:ring-white/30"
                    inputMode="numeric"
                    value={gananciaDeseadaPct}
                    onChange={(e) =>
                      setGananciaDeseadaPct(onlyDigits(e.target.value))
                    }
                    placeholder="0"
                  />
                </label>
              ) : (
                <MoneyInput
                  label="Precio de venta"
                  valueDigits={precio}
                  onChangeDigits={setPrecio}
                  currency={currency}
                />
              )}

              <label className="grid gap-2">
                <span className="text-sm text-white/70">
                  Unidades vendidas por mes
                </span>
                <input
                  className="rounded-xl bg-zinc-900 px-4 py-3 outline-none ring-1 ring-white/10 focus:ring-white/30"
                  inputMode="numeric"
                  value={unidadesMes}
                  onChange={(e) => setUnidadesMes(onlyDigits(e.target.value))}
                  placeholder="0"
                />
              </label>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">Resultados</h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Card
                title="Precio de venta"
                value={fmtMoney(precioCalculado, currency)}
              />
              <Card
                title="Ganancia por unidad"
                value={fmtMoney(gananciaPorUnidad, currency)}
              />
              <Card
                title="Ganancia esperada"
                value={`${fmtNum(gananciaEsperadaPct, 2)}%`}
              />
              <Card
                title="Rentabilidad sobre venta"
                value={`${fmtNum(rentabilidadSobreVentaPct, 2)}%`}
              />
              <Card
                title="Costo mensual estimado"
                value={fmtMoney(costoMensual, currency)}
              />
              <Card
                title="Facturación mensual"
                value={fmtMoney(facturacionMensual, currency)}
              />
              <Card
                title="Ganancia mensual estimada"
                value={fmtMoney(gananciaMensual, currency)}
              />
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-lg font-semibold">Cómo lo calculamos</h3>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-white/70">
              <li>
                Precio de venta = costo × (1 + ganancia esperada % / 100)
              </li>
              <li>Ganancia por unidad = precio de venta − costo</li>
              <li>
                Ganancia esperada (%) = ganancia por unidad / costo × 100
              </li>
              <li>
                Rentabilidad sobre venta = ganancia por unidad / precio × 100
              </li>
              <li>Costo mensual = costo × unidades vendidas al mes</li>
              <li>Facturación mensual = precio × unidades vendidas al mes</li>
              <li>
                Ganancia mensual estimada = ganancia por unidad × unidades del
                mes
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-lg font-semibold">Limitaciones</h3>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-white/70">
              <li>No contempla IVA ni otros impuestos.</li>
              <li>No incluye costos fijos mensuales.</li>
              <li>No contempla descuentos, promociones o devoluciones.</li>
              <li>No considera estacionalidad ni cambios de demanda.</li>
              <li>
                La ganancia mensual estimada es orientativa y no reemplaza un
                análisis financiero completo.
              </li>
            </ul>
          </div>
        </div>

        <section className="mt-10 space-y-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-2xl font-semibold">
              ¿Para qué sirve esta calculadora?
            </h2>
            <p className="mt-3 text-white/75">
              Esta calculadora te ayuda a definir un precio de venta más claro a
              partir del costo de tu producto. También te permite estimar cuánto
              podrías ganar por unidad y cuánto podrías generar en un mes según
              tu volumen de ventas.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-2xl font-semibold">
              Diferencia entre ganancia sobre costo y sobre venta
            </h2>
            <p className="mt-3 text-white/75">
              La ganancia esperada se calcula sobre el costo del producto.
              En cambio, la rentabilidad sobre venta se calcula sobre el precio
              final. Por eso ambos porcentajes pueden ser distintos aunque
              salgan del mismo producto.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-2xl font-semibold">Ejemplo práctico</h2>
            <p className="mt-3 text-white/75">
              Si tu producto cuesta $10.000 y querés una ganancia esperada del
              80%, el precio de venta sería $18.000. La ganancia por unidad
              sería $8.000. Si vendés 100 unidades en un mes, la ganancia
              mensual estimada sería de $800.000 antes de otros costos e
              impuestos.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}