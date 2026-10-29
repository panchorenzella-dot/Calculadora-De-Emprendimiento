import Link from "next/link";

import { ANNIVERSARY_PROMOTION } from "@/lib/promotions";

type Props = {
  variant?: "home" | "pricing";
};

export default function AnniversaryPromoBanner({ variant = "home" }: Props) {
  const isPricing = variant === "pricing";

  return (
    <section
      aria-labelledby={`anniversary-promo-${variant}`}
      className={`anniversary-promo relative isolate overflow-hidden border border-white/[0.08] bg-emerald-200/[0.025] ${isPricing
        ? "rounded-2xl px-6 py-9 sm:px-10 sm:py-11"
        : "rounded-2xl px-5 py-7 sm:px-8 sm:py-9"}`}
    >
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-emerald-200/35 to-transparent" />

      <div className={`relative grid gap-7 ${isPricing ? "lg:grid-cols-[1fr_auto] lg:items-center" : "md:grid-cols-[1fr_auto] md:items-center"}`}>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-emerald-200/65">
            Aniversario · 2 meses
          </p>
          <h2 id={`anniversary-promo-${variant}`} className={`mt-4 font-semibold leading-[1.02] tracking-[-0.045em] text-white ${isPricing ? "text-4xl sm:text-5xl lg:text-6xl" : "text-3xl sm:text-4xl lg:text-5xl"}`}>
            Plan Pro, ahora 25% menos
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/58 sm:text-base sm:leading-7">
            Celebramos dos meses ayudando a emprendedores a decidir con números claros. El precio especial se aplica automáticamente.
          </p>
          <p className="mt-5 inline-flex rounded-full border border-white/[0.1] bg-white/[0.035] px-3 py-1.5 text-xs font-medium text-white/55">
            Hasta el {ANNIVERSARY_PROMOTION.endsLabel}
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:min-w-64">
          <div className="flex items-end gap-3 tabular-nums md:justify-end">
            <del className="promo-price-strike relative pb-1 text-lg font-medium text-white/32 decoration-transparent sm:text-xl">
              US$ {ANNIVERSARY_PROMOTION.regularPriceUsd.toFixed(2)}
            </del>
            <div>
              <span className="text-4xl font-semibold tracking-[-0.045em] text-emerald-100 sm:text-5xl">
                US$ {ANNIVERSARY_PROMOTION.promotionalPriceUsd.toFixed(2)}
              </span>
              <span className="ml-1 text-sm font-medium text-white/38">/mes</span>
            </div>
          </div>
          <Link
            href="/precios#plan-pro"
            className="inline-flex justify-center rounded-lg bg-emerald-100 px-6 py-3.5 text-sm font-semibold !text-[#072317] transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#07160e]"
          >
            Ver plan Pro <span aria-hidden="true" className="ml-2 font-normal">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
