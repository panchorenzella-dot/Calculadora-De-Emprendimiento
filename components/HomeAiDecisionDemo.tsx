import Link from "next/link";

const decisionSignals = [
  {
    label: "Precio objetivo",
    value: "$28.000",
    detail: "para llegar a 50% de margen",
  },
  {
    label: "Impacto en 100 ventas",
    value: "+$300.000",
    detail: "de ganancia bruta estimada",
  },
];

export default function HomeAiDecisionDemo() {
  return (
    <section
      aria-labelledby="home-ai-demo-title"
      className="relative overflow-hidden rounded-[30px] border border-emerald-300/15 bg-[linear-gradient(135deg,rgba(16,185,129,.08),rgba(255,255,255,.025)_48%,rgba(0,0,0,.18))] p-6 sm:p-9"
    >
      <div className="pointer-events-none absolute -right-24 -top-28 size-64 rounded-full bg-emerald-300/10 blur-3xl" />
      <div className="relative grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-center lg:gap-12">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-200/65">
            Después del cálculo
          </p>
          <h2
            id="home-ai-demo-title"
            className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl"
          >
            Convertí el resultado en una decisión concreta
          </h2>
          <p className="mt-4 text-sm leading-7 text-white/58 sm:text-base">
            Guardá un escenario y pedile a la IA que lo explique, compare alternativas
            o marque qué conviene validar. La conversación parte de tus costos, precio
            y resultados: no de una pregunta aislada.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
            <Link
              href="/precios"
              className="app-dark-action rounded-full px-5 py-3 text-center text-sm transition"
            >
              Conocer el análisis con IA
            </Link>
            <Link
              href="/markup"
              className="rounded-full border border-white/12 bg-black/15 px-5 py-3 text-center text-sm font-bold text-white/68 transition hover:border-white/25 hover:text-white"
            >
              Crear mi escenario
            </Link>
          </div>
        </div>

        <div className="rounded-[26px] border border-white/10 bg-[#080b09]/90 p-4 shadow-[0_24px_70px_rgba(0,0,0,.28)] sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] pb-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-200/55">
                Ejemplo ilustrativo
              </p>
              <p className="mt-1 text-sm font-bold text-white/85">Escenario · Precio de venta</p>
            </div>
            <span className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-[10px] font-semibold text-white/45">
              Usa los datos guardados
            </span>
          </div>

          <div className="mt-4 space-y-3">
            <div className="ml-auto max-w-[88%] rounded-2xl rounded-br-md bg-white px-4 py-3 text-sm font-medium leading-6 text-zinc-900">
              Con un costo de $14.000 y un precio de $25.000, ¿qué cambia si busco
              un margen del 50%?
            </div>
            <div className="max-w-[94%] rounded-2xl rounded-bl-md border border-emerald-300/12 bg-emerald-300/[0.055] px-4 py-3 text-sm leading-6 text-white/68">
              Para alcanzar ese margen, el precio objetivo es <strong className="font-bold text-white">$28.000</strong>.
              Son $3.000 más por unidad. En 100 ventas, la ganancia bruta estimada
              pasaría de $1.100.000 a $1.400.000, antes de costos fijos e impuestos.
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {decisionSignals.map((signal) => (
              <div
                key={signal.label}
                className="rounded-2xl border border-white/[0.08] bg-black/25 p-4"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/35">
                  {signal.label}
                </p>
                <p className="mt-2 text-xl font-bold tracking-tight text-emerald-100">
                  {signal.value}
                </p>
                <p className="mt-1 text-xs leading-5 text-white/38">{signal.detail}</p>
              </div>
            ))}
          </div>

          <p className="mt-4 border-t border-white/[0.07] pt-4 text-xs leading-5 text-white/38">
            <span className="font-bold text-amber-100/75">Antes de decidir:</span>{" "}
            validá si tus clientes aceptarían el nuevo precio y sumá los costos que
            todavía no estén incluidos.
          </p>
        </div>
      </div>
    </section>
  );
}
