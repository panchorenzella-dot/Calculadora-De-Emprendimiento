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
          "Calculá costo por hamburguesa, margen, precio recomendado y ganancia mensual.",
        idealFor: "Hamburgueserías, dark kitchens y locales de comida",
        href: "",
        tags: ["hamburguesería", "comida", "delivery", "margen"],
        comingSoon: true,
      },
      {
        title: "Cafeterías",
        description:
          "Estimá costos, ticket promedio, margen por venta y punto de equilibrio.",
        idealFor: "Cafeterías, bares y locales gastronómicos",
        href: "",
        tags: ["cafetería", "café", "ticket", "margen"],
        comingSoon: true,
      },
      {
        title: "Panaderías",
        description:
          "Calculá costos de producción, desperdicio, margen y precio de venta.",
        idealFor: "Panaderías y producción de alimentos",
        href: "",
        tags: ["panadería", "producción", "costos", "precio"],
        comingSoon: true,
      },
      {
        title: "Distribuidoras",
        description:
          "Calculá margen por caja, costo de reparto, ganancia por cliente y stock necesario.",
        idealFor: "Distribuidores y vendedores mayoristas",
        href: "",
        tags: ["distribuidora", "stock", "reparto", "clientes"],
        comingSoon: true,
      },
      {
        title: "Compra / Venta",
        description:
          "Calculá precio final, margen, comisiones, envíos y ganancia real.",
        idealFor: "Tiendas online, reventa y emprendimientos de ropa",
        href: "",
        tags: ["ropa", "reventa", "tienda", "comisiones"],
        comingSoon: true,
      },
      {
        title: "Delivery",
        description:
          "Calculá si te conviene vender por apps considerando comisiones, packaging y descuentos.",
        idealFor: "Locales gastronómicos y comida rápida",
        href: "",
        tags: ["delivery", "comisiones", "pedidos", "gastronomía"],
        comingSoon: true,
      },
    ],
  },
  {
    title: "Inversión y ahorro",
    description:
      "Herramientas para proyectar ahorro, crecimiento de capital e inversiones.",
    calculators: [
      {
        title: "Calculadora Interés compuesto",
        description:
          "Proyectá el crecimiento de tu plata con aportes mensuales e interés compuesto.",
        idealFor: "Ahorro, inversión y planificación financiera",
        href: "/interes-compuesto",
        tags: ["interés compuesto", "inversión", "ahorro", "capital"],
      },
      {
        title: "Ahorro mensual",
        description:
          "Calculá cuánto podés juntar según tu aporte mensual, plazo y objetivo.",
        idealFor: "Personas que quieren ahorrar con metas claras",
        href: "",
        tags: ["ahorro", "mensual", "meta", "inversión"],
        comingSoon: true,
      },
      {
        title: "ROI de inversión",
        description:
          "Medí cuánto rinde una inversión comparando capital inicial y resultado final.",
        idealFor: "Inversiones personales y proyectos",
        href: "",
        tags: ["roi", "inversión", "retorno", "capital"],
        comingSoon: true,
      },
      {
        title: "Recupero de capital",
        description:
          "Calculá cuánto tardás en recuperar el dinero invertido en un activo o proyecto.",
        idealFor: "Inversores y emprendedores",
        href: "",
        tags: ["recupero", "capital", "inversión", "retorno"],
        comingSoon: true,
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
          "Descubrí cuántas unidades necesitás vender para no perder plata.",
        idealFor: "Negocios con costos fijos y variables",
        href: "/punto-de-equilibrio",
        tags: ["punto de equilibrio", "costos", "ventas", "unidades"],
      },
      {
        title: "Retorno de Inversion",
        description:
          "Medí el retorno de inversión de tu negocio o de una compra importante.",
        idealFor: "Inversiones, negocios y proyectos",
        href: "/roi",
        tags: ["roi", "inversión", "retorno", "rentabilidad"],
      },
      {
        title: "Recupero de inversión",
        description:
          "Calculá en cuánto tiempo recuperás la plata que invertiste en un negocio.",
        idealFor: "Emprendedores que quieren medir recupero",
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

export default function CalculadorasPage() {
  const [search, setSearch] = useState("");

  const seccionesFiltradas = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return secciones;

    return secciones
      .map((section) => ({
        ...section,
        calculators: section.calculators.filter((calc) => {
          const searchableText = [
            calc.title,
            calc.description,
            calc.idealFor,
            ...calc.tags,
          ]
            .join(" ")
            .toLowerCase();

          return searchableText.includes(query);
        }),
      }))
      .filter((section) => section.calculators.length > 0);
  }, [search]);

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
            Calculadora Emprendedora
          </p>

          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Todas las herramientas
          </h1>

          <p className="mt-3 max-w-2xl text-sm text-white/65">
            Elegí la herramienta que necesitás para calcular precios, márgenes,
            rentabilidad, inversión, costos y crecimiento de tu negocio.
          </p>

          <div className="mt-4 max-w-sm">
            <label className="mb-2 block text-xs font-medium text-white/70">
              ¿Qué querés calcular?
            </label>

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Precio, margen, inversión..."
              className="w-full rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-xs text-white outline-none transition placeholder:text-white/40 focus:border-white/30"
            />
          </div>
        </section>

        <div className="mt-10 space-y-12">
          {seccionesFiltradas.map((section) => (
            <section key={section.title}>
              <div className="mb-5">
                <h2 className="text-2xl font-bold tracking-tight">
                  {section.title}
                </h2>

                <p className="mt-2 max-w-3xl text-sm text-white/60">
                  {section.description}
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {section.calculators.map((calc) => {
                  const cardContent = (
                    <article className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:border-white/20 hover:bg-white/10">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="text-xl font-semibold">{calc.title}</h3>

                        {calc.comingSoon && (
                          <span className="shrink-0 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium text-white/60">
                            Próximamente
                          </span>
                        )}
                      </div>

                      <div className="mt-4 rounded-xl border border-white/10 bg-zinc-950/50 p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-white/40">
                          Ideal para
                        </p>

                        <p className="mt-1 text-sm text-white/75">
                          {calc.idealFor}
                        </p>
                      </div>

                      <div className="mt-auto pt-5">
                        {calc.comingSoon ? (
                          <div className="text-sm font-semibold text-white/40">
                            Disponible pronto
                          </div>
                        ) : (
                          <div className="text-sm font-semibold text-white">
                            Abrir →
                          </div>
                        )}
                      </div>
                    </article>
                  );

                  if (calc.comingSoon || !calc.href) {
                    return <div key={calc.title}>{cardContent}</div>;
                  }

                  return (
                    <Link key={calc.href} href={calc.href}>
                      {cardContent}
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        {seccionesFiltradas.length === 0 && (
          <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
            <h2 className="text-xl font-semibold">
              No encontré una herramienta con esa búsqueda
            </h2>

            <p className="mt-2 text-sm text-white/60">
              Probá buscar por margen, precio, inversión, ROI, delivery o punto
              de equilibrio.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}