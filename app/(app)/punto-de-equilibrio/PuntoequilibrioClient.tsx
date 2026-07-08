"use client";

import { useMemo, useState } from "react";
import Card from "@/components/Card";
import MoneyInput, { Currency } from "@/components/MoneyInput";
import { fmtMoney, fmtNum } from "@/lib/format";
import { onlyDigits, parseDigitsToNumber } from "@/lib/numberInput";

export default function PuntoEquilibrioPage() {
  const [currency, setCurrency] = useState<Currency>("ARS");

  const [costosFijos, setCostosFijos] = useState("0");
  const [precioVenta, setPrecioVenta] = useState("0");
  const [costoVariable, setCostoVariable] = useState("0");
  const [ventasEstimadas, setVentasEstimadas] = useState("0");

  const calc = useMemo(() => {
    const CF = parseDigitsToNumber(costosFijos);
    const PV = parseDigitsToNumber(precioVenta);
    const CV = parseDigitsToNumber(costoVariable);
    const ventas = parseDigitsToNumber(ventasEstimadas);

    const margenContribucionUnit = PV - CV;
    const margenContribucionPct =
      PV > 0 ? (margenContribucionUnit / PV) * 100 : 0;

    const unidadesEquilibrio =
      margenContribucionUnit > 0 ? CF / margenContribucionUnit : 0;

    const facturacionEquilibrio =
      margenContribucionUnit > 0 ? unidadesEquilibrio * PV : 0;

    const gananciaEstimada =
      ventas > 0 ? ventas * margenContribucionUnit - CF : 0;

    const rentable = margenContribucionUnit > 0;

    return {
      CF,
      PV,
      CV,
      ventas,
      margenContribucionUnit,
      margenContribucionPct,
      unidadesEquilibrio,
      facturacionEquilibrio,
      gananciaEstimada,
      rentable,
    };
  }, [costosFijos, precioVenta, costoVariable, ventasEstimadas]);

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">
            Calculadora de Punto de Equilibrio
          </h1>
          <p className="mt-3 max-w-3xl text-white/70">
            Calculá cuántas unidades necesitás vender para cubrir tus costos
            fijos y empezar a generar ganancia en tu negocio.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="mb-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setCurrency("ARS")}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  currency === "ARS"
                    ? "bg-white text-zinc-900"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                ARS
              </button>

              <button
                type="button"
                onClick={() => setCurrency("USD")}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  currency === "USD"
                    ? "bg-white text-zinc-900"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                USD
              </button>
            </div>

            <div className="grid gap-4">
              <MoneyInput
                label="Costos fijos mensuales"
                valueDigits={costosFijos}
                onChangeDigits={(v) => setCostosFijos(onlyDigits(v))}
                hint="alquiler, sueldos, servicios, etc."
                currency={currency}
              />

              <MoneyInput
                label="Precio de venta por unidad"
                valueDigits={precioVenta}
                onChangeDigits={(v) => setPrecioVenta(onlyDigits(v))}
                currency={currency}
              />

              <MoneyInput
                label="Costo variable por unidad"
                valueDigits={costoVariable}
                onChangeDigits={(v) => setCostoVariable(onlyDigits(v))}
                hint="materia prima, packaging, comisión, etc."
                currency={currency}
              />

              <label className="grid gap-2">
                <span className="text-sm text-white/70">
                  Unidades estimadas por mes{" "}
                  <span className="text-xs text-white/40">(opcional)</span>
                </span>
                <input
                  inputMode="numeric"
                  value={
                    ventasEstimadas === "0"
                      ? ""
                      : fmtNum(parseDigitsToNumber(ventasEstimadas))
                  }
                  onChange={(e) =>
                    setVentasEstimadas(onlyDigits(e.target.value) || "0")
                  }
                  placeholder="0"
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/30"
                />
              </label>
            </div>
          </div>

          <div className="grid gap-4 self-start">
            <Card
              title="Punto de equilibrio (unidades)"
              value={
                calc.rentable
                  ? fmtNum(Math.ceil(calc.unidadesEquilibrio))
                  : "No rentable"
              }
              note={
                calc.rentable
                  ? "Unidades mínimas para cubrir costos fijos."
                  : "El precio no alcanza para cubrir el costo variable."
              }
            />

            <Card
              title="Punto de equilibrio (facturación)"
              value={
                calc.rentable
                  ? fmtMoney(calc.facturacionEquilibrio, currency)
                  : "No rentable"
              }
              note="Facturación necesaria para no ganar ni perder."
            />

            <Card
              title="Margen de contribución por unidad"
              value={fmtMoney(calc.margenContribucionUnit, currency)}
              note={`${fmtNum(calc.margenContribucionPct)}% del precio de venta`}
            />

            <Card
              title="Ganancia estimada mensual"
              value={fmtMoney(calc.gananciaEstimada, currency)}
              note={
                calc.ventas > 0
                  ? `Tomando ${fmtNum(calc.ventas)} unidades por mes`
                  : "Completá unidades estimadas para ver este dato"
              }
            />
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold">Cómo lo calculamos</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-white/70">
              <li>Margen de contribución = precio de venta − costo variable</li>
              <li>
                Punto de equilibrio en unidades = costos fijos / margen de
                contribución por unidad
              </li>
              <li>
                Punto de equilibrio en facturación = unidades de equilibrio ×
                precio de venta
              </li>
              <li>
                Ganancia estimada = (unidades estimadas × margen de
                contribución) − costos fijos
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold">Limitaciones</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-white/70">
              <li>No contempla impuestos, promociones ni descuentos.</li>
              <li>No incluye cambios de precio o costo durante el mes.</li>
              <li>Supone que todas las unidades tienen el mismo margen.</li>
              <li>
                Si el costo variable es igual o mayor al precio, no hay punto de
                equilibrio posible.
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 space-y-6">
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-2xl font-semibold">
              Qué es el punto de equilibrio
            </h2>
            <p className="mt-3 text-white/70">
              El punto de equilibrio es el nivel mínimo de ventas que un negocio
              necesita para cubrir todos sus costos, sin ganar ni perder dinero.
              Se usa para saber cuántas unidades hay que vender o cuánto hay que
              facturar para que la actividad sea sostenible.
            </p>
            <p className="mt-3 text-white/70">
              Esta métrica es clave para emprendedores, comercios, negocios
              gastronómicos, revendedores, tiendas online y cualquier proyecto
              que tenga costos fijos y costos variables. Entender el punto de
              equilibrio ayuda a poner mejores precios, ordenar objetivos de
              ventas y detectar si el margen actual alcanza.
            </p>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-2xl font-semibold">
              Para qué sirve calcular el punto de equilibrio
            </h2>
            <p className="mt-3 text-white/70">
              Calcular el punto de equilibrio sirve para saber si un producto o
              servicio tiene una estructura rentable. También permite estimar el
              volumen de ventas necesario para cubrir alquiler, sueldos,
              servicios, publicidad, plataformas, logística y otros costos fijos
              del negocio.
            </p>
            <p className="mt-3 text-white/70">
              Además, esta calculadora de punto de equilibrio te ayuda a
              comparar escenarios. Por ejemplo, podés ver qué pasa si subís el
              precio, si bajás el costo variable o si aumentan tus costos fijos
              mensuales. Eso te da una base concreta para tomar decisiones y no
              manejarte solamente por intuición.
            </p>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-2xl font-semibold">
              Cómo interpretar el resultado
            </h2>
            <p className="mt-3 text-white/70">
              Si la calculadora te muestra que necesitás vender 200 unidades por
              mes para llegar al punto de equilibrio, eso significa que recién a
              partir de la unidad 201 empezás a generar ganancia operativa.
              Antes de ese punto, tus ventas solo cubren costos.
            </p>
            <p className="mt-3 text-white/70">
              Cuanto más bajo sea el punto de equilibrio, más flexible suele ser
              el negocio. En cambio, si necesitás vender demasiado para empatar,
              puede ser una señal de que el precio es bajo, los costos variables
              son altos o la estructura fija está sobredimensionada.
            </p>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-2xl font-semibold">
              Ejemplo de punto de equilibrio
            </h2>
            <p className="mt-3 text-white/70">
              Supongamos que tu emprendimiento tiene costos fijos mensuales de
              500.000. Vendés cada producto a 10.000 y el costo variable por
              unidad es 6.000. En ese caso, el margen de contribución por unidad
              es 4.000.
            </p>
            <p className="mt-3 text-white/70">
              Entonces, para cubrir 500.000 de costos fijos, necesitás vender
              125 unidades. Ese sería tu punto de equilibrio. Si vendés menos,
              perdés plata. Si vendés más, empezás a generar ganancia.
            </p>
            <p className="mt-3 text-white/70">
              Este análisis parece simple, pero sirve muchísimo para negocios
              chicos y medianos porque permite poner objetivos reales de ventas
              y entender mejor la rentabilidad.
            </p>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-2xl font-semibold">
              Diferencia entre costos fijos y costos variables
            </h2>
            <p className="mt-3 text-white/70">
              Los costos fijos son los que pagás aunque no vendas nada, como
              alquiler, sueldos, servicios, software, abonos o administración.
              Los costos variables, en cambio, cambian según la cantidad
              vendida, como materia prima, envases, comisiones, packaging o
              envío por producto.
            </p>
            <p className="mt-3 text-white/70">
              Separar bien ambos tipos de costos es fundamental para calcular
              correctamente el punto de equilibrio. Si cargás mal esa
              información, el resultado puede quedar distorsionado y llevarte a
              tomar decisiones equivocadas.
            </p>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-2xl font-semibold">
              Cómo bajar el punto de equilibrio
            </h2>
            <p className="mt-3 text-white/70">
              Hay tres caminos principales para bajar el punto de equilibrio de
              un negocio: reducir costos fijos, bajar el costo variable por
              unidad o aumentar el precio de venta sin afectar demasiado la
              demanda. Cada uno mejora el margen de una manera distinta.
            </p>
            <p className="mt-3 text-white/70">
              En la práctica, muchos negocios trabajan una combinación de estas
              tres cosas. Negocian mejor con proveedores, ajustan precios,
              mejoran procesos o enfocan la venta en productos con mayor margen.
              Cuanto mejor sea el margen de contribución, menos unidades
              necesitás vender para empatar.
            </p>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-2xl font-semibold">
              Cuándo usar esta calculadora
            </h2>
            <p className="mt-3 text-white/70">
              Esta calculadora online de punto de equilibrio es útil si estás
              por lanzar un producto, querés validar un precio, necesitás
              definir un objetivo mensual de ventas o querés entender mejor la
              rentabilidad de tu emprendimiento.
            </p>
            <p className="mt-3 text-white/70">
              También puede servirte si tenés una tienda física, vendés por
              redes sociales, manejás un ecommerce, ofrecés servicios o
              trabajás con productos de reventa. En todos esos casos, conocer el
              punto de equilibrio ayuda a tomar decisiones con números más
              claros.
            </p>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-2xl font-semibold">
              Preguntas frecuentes sobre el punto de equilibrio
            </h2>

            <div className="mt-5 space-y-5">
              <div>
                <h3 className="text-lg font-semibold">
                  ¿Qué pasa si el costo variable es igual al precio de venta?
                </h3>
                <p className="mt-2 text-white/70">
                  En ese caso no hay margen de contribución. Cada venta solo
                  cubre el costo directo del producto y no deja nada para pagar
                  costos fijos, por lo que el punto de equilibrio no se alcanza.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold">
                  ¿El punto de equilibrio incluye ganancia?
                </h3>
                <p className="mt-2 text-white/70">
                  No. El punto de equilibrio marca el nivel exacto donde no
                  ganás ni perdés. La ganancia aparece recién después de superar
                  ese volumen de ventas.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold">
                  ¿Sirve para servicios además de productos?
                </h3>
                <p className="mt-2 text-white/70">
                  Sí. Mientras puedas estimar tus costos fijos, tu precio de
                  venta y el costo variable asociado a cada servicio, el cálculo
                  también aplica.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold">
                  ¿Cada cuánto conviene recalcularlo?
                </h3>
                <p className="mt-2 text-white/70">
                  Conviene revisarlo cada vez que cambian tus precios, costos,
                  comisiones, estructura o volumen de ventas. Si tu negocio
                  cambia, el punto de equilibrio también cambia.
                </p>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}