"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { formatLocaleNumberInputChange, parseLocaleNumber } from "@/lib/numberInput";

import { trackEvent } from "@/lib/analytics";
import { hasStoredSession } from "@/lib/authBrowserSession";

const SIGNUP_PROMPT_DISMISSED_KEY = "ce:home-signup-prompt-dismissed:v1";
const SIGNUP_PROMPT_DELAY_MS = 1_500;

function formatMoney(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

function clampAmount(value: string) {
  const parsed = parseLocaleNumber(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

export default function HomeProfitPreview() {
  const [cost, setCost] = useState("14.000");
  const [price, setPrice] = useState("25.000");
  const [signupPromptVisible, setSignupPromptVisible] = useState(false);
  const interactionStarted = useRef(false);
  const completedInputs = useRef(new Set<string>());
  const signupPromptTimeout = useRef<number | null>(null);

  useEffect(() => () => {
    if (signupPromptTimeout.current !== null) {
      window.clearTimeout(signupPromptTimeout.current);
    }
  }, []);

  function promptWasDismissed() {
    try {
      return window.sessionStorage.getItem(SIGNUP_PROMPT_DISMISSED_KEY) === "true";
    } catch {
      return false;
    }
  }

  function rememberPromptDismissal() {
    try {
      window.sessionStorage.setItem(SIGNUP_PROMPT_DISMISSED_KEY, "true");
    } catch {
      // The prompt still closes when storage is unavailable.
    }
  }

  function scheduleSignupPrompt() {
    if (signupPromptVisible || promptWasDismissed() || hasStoredSession()) return;
    if (signupPromptTimeout.current !== null) {
      window.clearTimeout(signupPromptTimeout.current);
    }
    signupPromptTimeout.current = window.setTimeout(() => {
      signupPromptTimeout.current = null;
      if (promptWasDismissed()) return;
      setSignupPromptVisible(true);
      trackEvent("registration_prompt_view", {
        location: "home_hero_result",
        trigger: "hero_calculator_change",
        variant: "contextual_banner",
        delay_ms: SIGNUP_PROMPT_DELAY_MS,
      });
    }, SIGNUP_PROMPT_DELAY_MS);
  }

  function dismissSignupPrompt() {
    rememberPromptDismissal();
    setSignupPromptVisible(false);
    trackEvent("registration_prompt_dismiss", {
      location: "home_hero_result",
      trigger: "hero_calculator_change",
      variant: "contextual_banner",
    });
  }

  function updateInput(
    field: "cost" | "price",
    value: string,
    setter: (nextValue: string) => void,
  ) {
    if (!interactionStarted.current) {
      interactionStarted.current = true;
      trackEvent("hero_calculator_start", { location: "home_hero" });
    }
    setter(value);
    scheduleSignupPrompt();
  }

  function completeInput(field: "cost" | "price", value: string) {
    if (!interactionStarted.current || !value || completedInputs.current.has(field)) return;
    completedInputs.current.add(field);
    trackEvent("hero_input_complete", {
      location: "home_hero",
      field_name: field,
      completed_fields: completedInputs.current.size,
    });
  }

  const result = useMemo(() => {
    const numericCost = clampAmount(cost);
    const numericPrice = clampAmount(price);
    const profit = numericPrice - numericCost;
    const margin = numericPrice > 0 ? (profit / numericPrice) * 100 : null;
    const markup = numericCost > 0 ? (profit / numericCost) * 100 : null;

    return { profit, margin, markup };
  }, [cost, price]);
  const completeHref = `/markup?${new URLSearchParams({ costo: String(clampAmount(cost)), precio: String(clampAmount(price)) })}`;

  const status = result.profit > 0
    ? { label: "Resultado positivo", className: "bg-emerald-300/10 text-emerald-200" }
    : result.profit < 0
      ? { label: "Precio por debajo del costo", className: "bg-red-300/10 text-red-200" }
      : { label: "Sin ganancia", className: "bg-amber-300/10 text-amber-100" };

  return (
    <section aria-labelledby="hero-preview-title" className="relative rounded-[28px] border border-white/10 bg-[#0b0d0c]/95 p-4 shadow-[0_30px_100px_rgba(0,0,0,0.45)] sm:p-5">
      <div className="flex items-center justify-between gap-4 border-b border-white/[0.07] pb-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-200/65">
            Probalo ahora
          </p>
          <h2 id="hero-preview-title" className="mt-1 text-base font-semibold text-white">Resultado rápido por unidad</h2>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${status.className}`}>
          {status.label}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-3">
          <span className="text-xs text-white/65">Costo por unidad</span>
          <span className="mt-2 flex items-center gap-2">
            <span className="text-sm text-white/65">$</span>
            <input
              aria-label="Costo por unidad"
              type="text"
              inputMode="decimal"
              value={cost}
              onChange={(event) => updateInput("cost", formatLocaleNumberInputChange(cost, event.target.value, { maxDecimals: 2, allowNegative: false }, (event.nativeEvent as InputEvent).inputType), setCost)}
              onBlur={(event) => completeInput("cost", event.target.value)}
              className="min-w-0 flex-1 bg-transparent text-lg font-semibold text-white outline-none"
            />
          </span>
        </label>
        <label className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-3">
          <span className="text-xs text-white/65">Precio de venta</span>
          <span className="mt-2 flex items-center gap-2">
            <span className="text-sm text-white/65">$</span>
            <input
              aria-label="Precio de venta"
              type="text"
              inputMode="decimal"
              value={price}
              onChange={(event) => updateInput("price", formatLocaleNumberInputChange(price, event.target.value, { maxDecimals: 2, allowNegative: false }, (event.nativeEvent as InputEvent).inputType), setPrice)}
              onBlur={(event) => completeInput("price", event.target.value)}
              className="min-w-0 flex-1 bg-transparent text-lg font-semibold text-white outline-none"
            />
          </span>
        </label>
      </div>

      <div aria-live="polite" className="mt-3 rounded-2xl border border-emerald-300/10 bg-emerald-300/[0.045] p-4">
        <p className="text-xs text-white/65">{result.profit < 0 ? "Pérdida bruta por unidad" : "Ganancia bruta por unidad"}</p>
        <p data-tone={result.profit > 0 ? "positive" : result.profit < 0 ? "negative" : "neutral"} className="mt-1 text-3xl font-semibold tracking-tight">
          {formatMoney(result.profit)}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/[0.07] pt-4">
          <div>
            <p className="text-[11px] text-white/65">Margen</p>
            <p data-tone={result.margin === null || result.margin === 0 ? "neutral" : result.margin > 0 ? "positive" : "negative"} className="mt-1 text-base font-semibold">{result.margin === null ? "—" : `${result.margin.toLocaleString("es-AR", { maximumFractionDigits: 1 })}%`}</p>
          </div>
          <div>
            <p className="text-[11px] text-white/65">Markup</p>
            <p className="mt-1 text-base font-semibold text-white/80">{result.markup === null ? "—" : `${result.markup.toLocaleString("es-AR", { maximumFractionDigits: 1 })}%`}</p>
          </div>
        </div>
      </div>

      {signupPromptVisible ? (
        <aside
          aria-label="Guardar este cálculo"
          className="relative mt-3 rounded-2xl border border-emerald-300/20 bg-emerald-300/[0.075] p-4 pr-11"
        >
          <button
            type="button"
            onClick={dismissSignupPrompt}
            aria-label="Cerrar invitación de registro"
            className="absolute right-2.5 top-2.5 grid size-8 place-items-center rounded-full text-lg text-white/45 transition hover:bg-white/[0.06] hover:text-white"
          >
            ×
          </button>
          <p className="text-sm font-bold text-white">Guardá este resultado y comparalo después</p>
          <p className="mt-1.5 text-xs leading-5 text-white/65">
            Con un costo de {formatMoney(clampAmount(cost))} y un precio de {formatMoney(clampAmount(price))},
            este cálculo deja {formatMoney(result.profit)} por unidad
            {result.margin === null
              ? "."
              : ` y ${result.margin.toLocaleString("es-AR", { maximumFractionDigits: 1 })}% de margen.`}
          </p>
          <Link
            prefetch={false}
            href="/perfil?modo=registro"
            onClick={() => {
              rememberPromptDismissal();
              trackEvent("registration_prompt_click", {
                location: "home_hero_result",
                trigger: "hero_calculator_change",
                variant: "contextual_banner",
              });
            }}
            className="mt-3 inline-flex text-xs font-bold text-emerald-200 transition hover:text-emerald-100"
          >
            Registrarme gratis →
          </Link>
        </aside>
      ) : null}

      <p className="mt-3 text-[11px] leading-5 text-white/65">
        Vista rápida sin costos fijos ni impuestos. La calculadora completa incorpora más variables.
      </p>
      <Link
        href={completeHref}
        onClick={() =>
          trackEvent("hero_calculator_cta", {
            location: "home_hero",
            destination: "/markup",
          })
        }
        className="mt-4 flex items-center justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-bold !text-zinc-950 transition hover:bg-emerald-100"
      >
        Ver el cálculo completo →
      </Link>
    </section>
  );
}
