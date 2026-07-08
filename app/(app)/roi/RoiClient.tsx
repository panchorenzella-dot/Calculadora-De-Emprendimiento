"use client";

import { useMemo, useState } from "react";

import Card from "@/components/Card";
import MoneyInput, { Currency } from "@/components/MoneyInput";
import { fmtMoney } from "@/lib/format";
import { parseDigitsToNumber } from "@/lib/numberInput";

export default function Page() {
  const [currency] = useState<Currency>("ARS");

  const [inversionInicial, setInversionInicial] = useState("0");
  const [ingresosGenerados, setIngresosGenerados] = useState("0");
  const [costosTotales, setCostosTotales] = useState("0");
  const [valorFinal, setValorFinal] = useState("0");

  const calc = useMemo(() => {
    const inversion = parseDigitsToNumber(inversionInicial);
    const ingresos = parseDigitsToNumber(ingresosGenerados);
    const costos = parseDigitsToNumber(costosTotales);
    const finalValue = parseDigitsToNumber(valorFinal);

    const gananciaNeta = finalValue - inversion - costos;
    const roi = inversion > 0 ? (gananciaNeta / inversion) * 100 : 0;

    const retornoBruto = finalValue - inversion;
    const margenSobreRetorno =
      finalValue > 0 ? (gananciaNeta / finalValue) * 100 : 0;

    return {
      gananciaNeta,
      roi,
      retornoBruto,
      margenSobreRetorno,
    };
  }, [inversionInicial, ingresosGenerados, costosTotales, valorFinal]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-4xl font-bold tracking-tight">
        Calculadora de ROI
      </h1>

      <p className="mt-4 max-w-2xl text-white/70">
        Calculá la rentabilidad de una inversión de forma simple usando la
        inversión inicial, los ingresos, los costos y el valor final obtenido.
      </p>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold">Datos</h2>

          <div className="mt-6 grid gap-5">
            <MoneyInput
              label="Inversión inicial"
              valueDigits={inversionInicial}
              onChangeDigits={setInversionInicial}
              currency={currency}
            />

            <MoneyInput
              label="Ingresos generados"
              valueDigits={ingresosGenerados}
              onChangeDigits={setIngresosGenerados}
              currency={currency}
            />

            <MoneyInput
              label="Costos totales"
              valueDigits={costosTotales}
              onChangeDigits={setCostosTotales}
              currency={currency}
            />

            <MoneyInput
              label="Valor final obtenido"
              valueDigits={valorFinal}
              onChangeDigits={setValorFinal}
              currency={currency}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold">Resultados</h2>

          <div className="mt-6 grid gap-4">
            <Card
              title="Ganancia neta"
              value={fmtMoney(calc.gananciaNeta, currency)}
            />

            <Card
              title="ROI"
              value={`${calc.roi.toFixed(2)} %`}
            />

            <Card
              title="Retorno bruto"
              value={fmtMoney(calc.retornoBruto, currency)}
            />

            <Card
              title="Margen sobre retorno"
              value={`${calc.margenSobreRetorno.toFixed(2)} %`}
            />
          </div>
        </div>
      </div>

      <div className="mt-14 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold">Cómo lo calculamos</h2>

          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-white/70">
            <li>Tomamos la inversión inicial como base del análisis.</li>
            <li>Consideramos los ingresos generados por el proyecto.</li>
            <li>Restamos los costos totales para obtener el resultado real.</li>
            <li>Comparamos el beneficio neto contra la inversión realizada.</li>
            <li>Mostramos el retorno en porcentaje para facilitar la comparación entre distintas inversiones.</li>
            <li>También calculamos el retorno bruto y el margen sobre el valor final obtenido.</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold">Limitaciones</h2>

          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-white/70">
            <li>No contempla inflación ni devaluación.</li>
            <li>No incluye impuestos si no fueron cargados dentro de los costos.</li>
            <li>No mide riesgo ni costo de oportunidad.</li>
            <li>No analiza variaciones futuras en ventas o gastos.</li>
            <li>Es una herramienta práctica para estimar rentabilidad, no un análisis financiero completo.</li>
          </ul>
        </div>
      </div>

      <section className="mt-14 space-y-8 text-white/80">
        <div className="space-y-3">
          <h2 className="text-2xl font-semibold">¿Qué es el ROI?</h2>
          <p>
            El ROI es una forma de medir si una inversión valió la pena. Sirve
            para entender cuánto rendimiento generó un proyecto en relación con
            el capital que hubo que poner al principio.
          </p>
          <p>
            Es una métrica muy usada en negocios, campañas de marketing,
            compra de stock, herramientas, reformas y decisiones de crecimiento.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl font-semibold">¿Para qué sirve calcular el ROI?</h2>
          <p>
            Sirve para comparar inversiones y decidir cuáles tienen más sentido.
            Te ayuda a ver si un gasto realmente genera retorno o si inmoviliza
            capital sin dar un resultado atractivo.
          </p>
          <p>
            También es útil para ordenar prioridades cuando no podés invertir
            en todo al mismo tiempo.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl font-semibold">¿Qué se considera un buen ROI?</h2>
          <p>
            Depende del rubro, del tiempo que tarda el proyecto y del riesgo.
            Un retorno puede parecer bueno en un negocio estable y no alcanzar
            en otro más incierto o más lento.
          </p>
          <p>
            Lo importante es compararlo con otras alternativas reales y con el
            esfuerzo necesario para conseguir ese resultado.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl font-semibold">¿Cuál es la diferencia entre ROI y ganancia?</h2>
          <p>
            La ganancia muestra cuánto dinero queda. El ROI muestra qué tan
            eficiente fue esa ganancia en relación con la inversión inicial.
          </p>
          <p>
            Dos proyectos pueden dejar la misma ganancia en pesos y aun así
            tener ROI muy distinto.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl font-semibold">¿Por qué conviene medir el ROI en un negocio chico?</h2>
          <p>
            Porque cuando el capital es limitado, elegir bien en qué poner la
            plata hace una diferencia enorme. Medir el ROI ayuda a evitar gastos
            que parecen buenos pero no devuelven suficiente valor.
          </p>
          <p>
            Para emprendedores, esto puede servir para decidir entre comprar más
            stock, invertir en publicidad, sumar equipamiento o mejorar el local.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl font-semibold">¿Qué datos conviene tener antes de usar esta calculadora?</h2>
          <p>
            Lo ideal es contar con una inversión inicial clara, una estimación
            realista de ingresos, los costos más importantes y el valor final
            esperado del proyecto.
          </p>
          <p>
            Cuanto más precisos sean esos datos, más útil va a ser el resultado
            para tomar decisiones.
          </p>
        </div>
      </section>
    </main>
  );
}