"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import CalculatorFinder from "@/components/CalculatorFinder";
import { trackEvent } from "@/lib/analytics";
import { calculatorSections, type Calculator } from "./catalog";

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es")
    .trim();
}

function matchesSearch(calculator: Calculator, query: string) {
  const searchableText = [
    calculator.title,
    calculator.description,
    calculator.idealFor,
    ...calculator.tags,
  ].join(" ");

  return normalizeSearch(searchableText).includes(query);
}

export default function CalculadorasPage() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(() => searchParams.get("buscar") || "");

  const { availableSections, comingSoonCalculators } = useMemo(() => {
    const query = normalizeSearch(search);

    const filteredSections = calculatorSections
      .map((section) => ({
        ...section,
        calculators: section.calculators.filter(
          (calculator) =>
            !calculator.comingSoon &&
            (!query || matchesSearch(calculator, query)),
        ),
      }))
      .filter((section) => section.calculators.length > 0);

    const upcoming = calculatorSections
      .flatMap((section) => section.calculators)
      .filter(
        (calculator) =>
          calculator.comingSoon &&
          (!query || matchesSearch(calculator, query)),
      );

    return {
      availableSections: filteredSections,
      comingSoonCalculators: upcoming,
    };
  }, [search]);

  const availableCount = availableSections.reduce(
    (total, section) => total + section.calculators.length,
    0,
  );
  const totalResults = availableCount + comingSoonCalculators.length;
  const hasResults = totalResults > 0;
  const trimmedSearch = search.trim();
  const resultStatus = trimmedSearch
    ? `${totalResults} ${totalResults === 1 ? "resultado" : "resultados"} para “${trimmedSearch}”`
    : `${availableCount} calculadoras disponibles`;

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
                Calculadoras para emprendedores
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60 sm:text-base">
                Empezá por precios y rentabilidad, o buscá la herramienta que
                necesitás para tu próxima decisión.
              </p>
            </div>

            <div>
              <label
                htmlFor="calculator-search"
                className="mb-2 block text-sm font-medium text-white/70"
              >
                ¿Qué querés calcular?
              </label>
              <input
                id="calculator-search"
                name="calculator-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Precio, margen, inversión..."
                aria-controls="calculator-results"
                aria-describedby="calculator-results-status"
                autoComplete="off"
                className="w-full rounded-xl border border-emerald-300/15 bg-zinc-950/75 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-emerald-300/45 focus:bg-zinc-950"
              />
              <p
                id="calculator-results-status"
                role="status"
                aria-live="polite"
                className="mt-2 min-h-5 text-xs font-medium text-white/45"
              >
                {resultStatus}
              </p>
            </div>
          </div>
        </section>

        <div className="mt-8">
          <CalculatorFinder compact />
        </div>

        <div id="calculator-results">
          {hasResults ? (
            <div className="mt-12 space-y-14">
              {availableSections.map((section) => {
                const sectionTitleId = `calculator-section-${section.id}`;

                return (
                  <section key={section.id} aria-labelledby={sectionTitleId}>
                    <div className="mb-6">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300/60">
                        Herramientas disponibles
                      </p>
                      <h2
                        id={sectionTitleId}
                        className="text-2xl font-bold tracking-tight"
                      >
                        {section.title}
                      </h2>
                      <p className="mt-2 max-w-3xl text-sm leading-6 text-white/60">
                        {section.description}
                      </p>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                      {section.calculators.map((calculator) => {
                        const titleId = `calculator-${calculator.href.slice(1)}`;

                        return (
                          <Link
                            key={calculator.href}
                            href={calculator.href}
                            aria-labelledby={titleId}
                            onClick={() =>
                              trackEvent("select_calculator", {
                                calculator_name: calculator.title,
                                calculator_category: section.id,
                                destination: calculator.href,
                                source: "calculator_catalog",
                              })
                            }
                            className="group block h-full"
                          >
                            <article className="flex h-full min-h-[250px] flex-col rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.055] to-emerald-300/[0.025] p-5 shadow-lg shadow-black/10 transition duration-200 group-hover:-translate-y-0.5 group-hover:border-emerald-300/30 group-hover:shadow-emerald-950/20">
                              <div className="flex items-start justify-between gap-4">
                                <h3
                                  id={titleId}
                                  className="text-xl font-semibold tracking-tight text-white"
                                >
                                  {calculator.title}
                                </h3>
                                <span
                                  aria-hidden="true"
                                  className="rounded-full border border-emerald-300/15 bg-emerald-300/[0.07] px-2.5 py-1 text-xs font-medium text-emerald-200/70"
                                >
                                  Online
                                </span>
                              </div>

                              <p className="mt-4 text-sm leading-6 text-white/66">
                                {calculator.description}
                              </p>
                              <div className="mt-5 rounded-xl border border-white/10 bg-zinc-950/55 p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-white/40">
                                  Ideal para
                                </p>
                                <p className="mt-1.5 text-sm leading-5 text-white/72">
                                  {calculator.idealFor}
                                </p>
                              </div>
                              <div className="mt-auto pt-5">
                                <span className="text-sm font-semibold text-emerald-200 transition group-hover:text-emerald-100">
                                  Usar calculadora{" "}
                                  <span aria-hidden="true">→</span>
                                </span>
                              </div>
                            </article>
                          </Link>
                        );
                      })}
                    </div>
                  </section>
                );
              })}

              {comingSoonCalculators.length > 0 ? (
                <section aria-labelledby="coming-soon-title">
                  <div className="mb-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/40">
                      En desarrollo
                    </p>
                    <h2
                      id="coming-soon-title"
                      className="mt-2 text-2xl font-bold tracking-tight"
                    >
                      Próximas calculadoras
                    </h2>
                    <p className="mt-2 text-sm text-white/60">
                      Nuevas herramientas que estamos preparando.
                    </p>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {comingSoonCalculators.map((calculator) => (
                      <article
                        key={calculator.title}
                        className="flex h-full min-h-[220px] flex-col rounded-2xl border border-dashed border-emerald-300/15 bg-emerald-300/[0.025] p-5"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <h3 className="text-xl font-semibold tracking-tight text-white/85">
                            {calculator.title}
                          </h3>
                          <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-white/55">
                            Próximamente
                          </span>
                        </div>
                        <p className="mt-4 text-sm leading-6 text-white/60">
                          {calculator.description}
                        </p>
                        <div className="mt-auto pt-5 text-sm font-semibold text-white/40">
                          En preparación
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              ) : null}
            </div>
          ) : (
            <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
              <h2 className="text-xl font-semibold">
                No encontramos una herramienta con esa búsqueda
              </h2>
              <p className="mt-2 text-sm text-white/60">
                Probá buscar por precio, margen, inversión, ROI, ahorro, punto
                de equilibrio, IVA o costos laborales.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
