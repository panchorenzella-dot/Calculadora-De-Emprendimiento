import Link from "next/link";

const calculadoras = [
  {
    title: "Calculadora de Margen",
    description:
      "Calculá margen de ganancia, ventas netas, punto de equilibrio, ROI anual y recupero.",
    href: "/",
  },
  {
    title: "Calculadora de Interés Compuesto",
    description:
      "Proyectá el crecimiento de tu plata con aportes mensuales e interés compuesto.",
    href: "/interes-compuesto",
  },
  {
    title: "Calculadora de Precio de Venta",
    description:
      "Definí cuánto cobrar según tu costo, margen deseado y rentabilidad esperada.",
    href: "/markup",
  },
  {
    title: "Calculadora de ROI",
    description:
      "Medí el retorno de inversión de tu negocio o de una compra importante.",
    href: "/roi",
  },
  {
    title: "Calculadora de Punto de Equilibrio",
    description:
      "Descubrí cuántas unidades necesitás vender para no perder plata.",
    href: "/punto-de-equilibrio",
  },
];

export default function CalculadorasPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Todas las calculadoras
        </h1>

        <p className="mt-2 max-w-2xl text-white/70">
          Elegí la herramienta que necesitás para calcular precios, márgenes,
          rentabilidad, inversión y crecimiento.
        </p>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {calculadoras.map((calc) => (
            <Link
              key={calc.href}
              href={calc.href}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:bg-white/10"
            >
              <h2 className="text-xl font-semibold">{calc.title}</h2>
              <p className="mt-3 text-sm text-white/70">{calc.description}</p>
              <div className="mt-5 text-sm font-semibold text-white">
                Abrir calculadora →
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}