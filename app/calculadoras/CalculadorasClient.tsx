"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Calculator = {
  title: string;
  description: string;
  idealFor: string;
  href: string;
  tags: string[];
  comingSoon?: boolean;
};

type Section = {
  title: string;
  description: string;
  calculators: Calculator[];
};

const secciones: Section[] = [
  {
    title: "Calculadoras por tipo de negocio",
    description:
      "Herramientas pensadas para rubros concretos, con costos y variables reales de cada negocio.",
    calculators: [
      {
        title: "Hamburgueserías",
        description:
          "Calculá costos por hamburguesa, margen, precio recomendado y ganancia mensual.",
        idealFor: "Hamburgueserías, dark kitchens y locales de comida",
        href: "/hamburgueseria",
        tags: ["hamburguesería", "comida", "delivery", "margen"],
      },
      {
        title: "Cafeterías",
        description:
          "Estimá costos, ticket promedio, margen por venta y punto de equilibrio.",
        idealFor: "Cafeterías, bares y locales gastronómicos",
        href: "/cafeteria",
        tags: ["cafetería", "café", "ticket", "margen"],
      },
      {
        title: "Fábrica / Producción",
        description:
          "Calculá costo por unidad, ganancia, margen y punto de equilibrio.",
        idealFor: "Panaderías, producción de alimentos y fabricación",
        href: "/produccion",
        tags: ["panadería", "producción", "costos", "precio"],
      },
      {
        title: "Distribuidoras",
        description:
          "Calculá margen por caja, costo de reparto, ganancia por cliente y stock necesario.",
        idealFor: "Distribuidores y vendedores mayoristas",
        href: "/distribuidora",
        tags: ["distribuidora", "stock", "reparto", "clientes"],
      },
      {
        title: "Compra / Venta",
        description:
          "Calculá precio final, margen, comisiones, envíos y ganancia real.",
        idealFor: "Tiendas online, reventa y emprendimientos de ropa",
        href: "/reventa",
        tags: ["ropa", "reventa", "tienda", "comisiones"],
      },
      {
        title: "Intermediarios / Comisión",
        description:
          "Calculá comisiones, ganancia mensual, punto de equilibrio, recupero y ROI.",
        idealFor: "Vendedores a comisión, brokers e intermediarios comerciales",
        href: "/Intermediarios",
        tags: ["comisiones", "pedidos", "intermediarios", "ventas"],
      },
    ],
  },
  {
    title: "Inversión y ahorro",
    description:
      "Herramientas para proyectar ahorro, crecimiento de capital e inversiones.",
    calculators: [
      {
        title: "Interés compuesto",
        description:
          "Proyectá el crecimiento de tu plata con aportes mensuales e interés compuesto.",
        idealFor: "Ahorro, inversión y planificación financiera",
        href: "/interes-compuesto",
        tags: ["interés compuesto", "inversión", "ahorro", "capital"],
      },
      {
        title: "Inversión con aporte mensual",
        description:
          "Calculá cuánto podés juntar invirtiendo todos los meses.",
        idealFor: "Planificar inversiones mensuales en pesos o dólares",
        href: "/aporte-mensual",
        tags: ["ahorro", "mensual", "meta", "inversión"],
      },
      {
        title: "ROI de inversión",
        description:
          "Medí cuánto rinde una inversión comparando capital inicial y resultado final.",
        idealFor: "Inversiones personales y proyectos",
        href: "/roi-inversion",
        tags: ["roi", "inversión", "retorno", "capital"],
      },
      {
        title: "Recupero de capital",
        description:
          "Calculá cuánto tardás en recuperar el dinero invertido en un activo o proyecto.",
        idealFor: "Inversores y emprendedores",
        href: "/recupero-capital",
        tags: ["recupero", "capital", "inversión", "retorno"],
      },
      {
        title: "Meta de ahorro",
        description:
          "Calculá cuánto necesitás ahorrar por mes para llegar a una meta.",
        idealFor: "Planificar una meta de ahorro",
        href: "/meta-ahorro",
        tags: ["ahorro", "mensual", "meta", "inversión"],
      },
      {
        title: "Rendimiento real",
        description:
          "Calculá si realmente ganaste después de descontar inflación.",
        idealFor: "Medir el poder de compra de una inversión",
        href: "/rendimiento-real",
        tags: ["rendimiento", "inflación", "inversión", "ahorro"],
      },
    ],
  },
  {
    title: "Costos y rentabilidad",
    description:
      "Herramientas para calcular precios, márgenes, costos, rentabilidad y punto de equilibrio.",
    calculators: [
      {
        title: "Margen de ganancia",
        description:
          "Calculá si tu producto deja ganancia real después de costos, ventas e inversión.",
        idealFor: "Comercios, reventa, gastronomía y servicios",
        href: "/margen",
        tags: ["margen", "ganancia", "rentabilidad", "precio"],
      },
      {
        title: "Precio de venta",
        description:
          "Definí cuánto cobrar según tu costo, margen deseado y rentabilidad esperada.",
        idealFor: "Productos, servicios y emprendimientos",
        href: "/markup",
        tags: ["precio", "venta", "markup", "margen"],
      },
      {
        title: "Punto de equilibrio",
        description:
          "Descubrí cuántas unidades necesitás vender para cubrir tus costos.",
        idealFor: "Negocios con costos fijos y variables",
        href: "/punto-de-equilibrio",
        tags: ["punto de equilibrio", "costos", "ventas", "unidades"],
      },
      {
        title: "ROI del negocio",
        description:
          "Medí el retorno de inversión de un negocio o de una compra importante.",
        idealFor: "Inversiones, negocios y proyectos",
        href: "/roi",
        tags: ["roi", "inversión", "retorno", "rentabilidad"],
      },
      {
        title: "Recupero de inversión del negocio",
        description:
          "Estimará en cuánto tiempo se recupera una inversión dentro de un negocio.",
        idealFor: "Emprendedores que quieren medir recupero operativo",
        href: "",
        tags: ["recupero", "inversión", "capital", "negocio"],
        comingSoon: true,
      },
      {
        title: "Costo unitario",
        description:
          "Calculá cuánto te cuesta producir o comprar cada unidad de tu producto.",
        idealFor: "Producción, reventa y gastronomía",
        href: "",
        tags: ["costo", "unitario", "producto", "producción"],
        comingSoon: true,
      },
      {
        title: "Ganancia mensual",
        description:
          "Estimá cuánto podés ganar por mes según ventas, costos y gastos fijos.",
        idealFor: "Negocios chicos y emprendimientos",
        href: "",
        tags: ["ganancia", "mensual", "ventas", "costos"],
        comingSoon: true,
      },
    ],
  },
];

function matchesSearch(calc: Calculator, query: string) {
  const searchableText = [
    calc.title,
    calc.description,
    calc.idealFor,
    ...calc.tags,
  ]
    .join(" ")
    .toLowerCase();

  return searchableText.includes(query);
}

export default function CalculadorasPage() {
  const [search, setSearch] = useState("");

  const { availableSections, comingSoonCalculators } = useMemo(() => {
    const query = search.toLowerCase().trim();

    const filteredSections = secciones
      .map((section) => ({
        ...section,
        calculators: section.calculators.filter(
          (calc) => !calc.comingSoon && (!query || matchesSearch(calc, query))
        ),
      }))
      .filter((section) => section.calculators.length > 0);

    const upcoming = secciones
      .flatMap((section) => section.calculators)
      .filter((calc) => calc.comingSoon && (!query || matchesSearch(calc, query)));

    return {
      availableSections: filteredSections,
      comingSoonCalculators: upcoming,
    };
  }, [search]);

  const hasResults =
    availableSections.length > 0 || comingSoonCalculators.length > 0;

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:py-12">
        <section className="relative overflow-hidden rounded-3xl border border-emerald-300/15 bg-gradient-to-br from-emerald-300/[0.07] via-white/[0.035] to-sky-300/[0.035] px-5 py-8 shadow-2xl shadow-black/20 sm:px-8 sm:py-10">
            <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-emerald-300/10 blur-3xl" />
            <p className="relative text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300/75">
              Directorio de herramientas
            </p>

            <div className="relative mt-4 grid gap-6 lg:grid-cols-[1fr_360px] lg:items-end">
              <div>
                <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Calculadoras online
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60 sm:text-base">
                  Buscá una herramienta o recorré las categorías disponibles.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white/70">
                  ¿Qué querés calcular?
                </label>

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Precio, margen, inversión..."
                  className="w-full rounded-xl border border-emerald-300/15 bg-zinc-950/75 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-emerald-300/45 focus:bg-zinc-950"
                />
              </div>
            </div>
        </section>

        {hasResults ? (
          <div className="mt-12 space-y-14">
            {availableSections.map((section) => (
              <section key={section.title}>
                <div className="mb-6">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300/60">
                    Herramientas disponibles
                  </p>
                  <h2 className="text-2xl font-bold tracking-tight">
                    {section.title}
                  </h2>

                  <p className="mt-2 max-w-3xl text-sm leading-6 text-white/60">
                    {section.description}
                  </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {section.calculators.map((calc) => (
                    <Link key={calc.href} href={calc.href} className="group">
                      <article className="flex h-full min-h-[250px] flex-col rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.055] to-emerald-300/[0.025] p-5 shadow-lg shadow-black/10 transition duration-200 group-hover:-translate-y-0.5 group-hover:border-emerald-300/30 group-hover:shadow-emerald-950/20">
                        <div className="flex items-start justify-between gap-4">
                          <h3 className="text-xl font-semibold tracking-tight text-white">
                            {calc.title}
                          </h3>

                          <span className="rounded-full border border-emerald-300/15 bg-emerald-300/[0.07] px-2.5 py-1 text-xs font-medium text-emerald-200/70">
                            Online
                          </span>
                        </div>

                        <p className="mt-4 text-sm leading-6 text-white/66">
                          {calc.description}
                        </p>

                        <div className="mt-5 rounded-xl border border-white/10 bg-zinc-950/55 p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-white/40">
                            Ideal para
                          </p>

                          <p className="mt-1.5 text-sm leading-5 text-white/72">
                            {calc.idealFor}
                          </p>
                        </div>

                        <div className="mt-auto pt-5">
                          <span className="text-sm font-semibold text-emerald-200 transition group-hover:text-emerald-100">
                            Usar calculadora →
                          </span>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              </section>
            ))}

            {comingSoonCalculators.length > 0 && (
              <section>
                <div className="mb-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/40">
                    En desarrollo
                  </p>

                  <h2 className="mt-2 text-2xl font-bold tracking-tight">
                    Próximas calculadoras
                  </h2>

                  <p className="mt-2 text-sm text-white/60">
                    Nuevas herramientas que estamos preparando.
                  </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {comingSoonCalculators.map((calc) => (
                    <article
                      key={calc.title}
                    className="flex h-full min-h-[220px] flex-col rounded-2xl border border-dashed border-emerald-300/15 bg-emerald-300/[0.025] p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="text-xl font-semibold tracking-tight text-white/85">
                          {calc.title}
                        </h3>

                        <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-white/55">
                          Próximamente
                        </span>
                      </div>

                      <p className="mt-4 text-sm leading-6 text-white/60">
                        {calc.description}
                      </p>

                      <div className="mt-auto pt-5 text-sm font-semibold text-white/40">
                        En preparación
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </div>
        ) : (
          <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
            <h2 className="text-xl font-semibold">
              No encontré una herramienta con esa búsqueda
            </h2>

            <p className="mt-2 text-sm text-white/60">
              Probá buscar por margen, precio, inversión, ROI, ahorro o punto de
              equilibrio.
            </p>
          </div>
        )}

      </div>
    </main>
  );
}
