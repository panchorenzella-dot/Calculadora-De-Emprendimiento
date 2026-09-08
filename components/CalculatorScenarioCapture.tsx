"use client";

import { usePathname } from "next/navigation";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { trackEvent } from "@/lib/analytics";
import { calculatorTracking } from "@/lib/calculatorTracking";
import { buildScenarioResults } from "@/lib/scenarios";
import type { ScenarioDraft, ScenarioValue } from "@/types/scenario";

const SaveScenarioButton = lazy(() => import("@/components/SaveScenarioButton"));
const AiAssistant = lazy(() => import("@/components/AiAssistant"));

function cleanLabel(value: string) {
  return value.replace(/\s+/g, " ").replace(/[:*]$/, "").trim();
}

function controlLabel(control: HTMLInputElement | HTMLSelectElement, index: number) {
  const ariaLabel = control.getAttribute("aria-label");
  if (ariaLabel) return cleanLabel(ariaLabel);

  const wrappingLabel = control.closest("label");
  if (wrappingLabel) {
    const labelText = cleanLabel(wrappingLabel.innerText);
    if (labelText) return labelText;
  }

  let ancestor: HTMLElement | null = control.parentElement;
  for (let depth = 0; ancestor && depth < 4; depth += 1) {
    const directLabel = Array.from(ancestor.children).find((child) => child.tagName === "LABEL") as HTMLElement | undefined;
    if (directLabel) {
      const labelText = cleanLabel(directLabel.innerText);
      if (labelText) return labelText;
    }
    ancestor = ancestor.parentElement;
  }

  const name = cleanLabel(control.name || "");
  if (name) return name;
  const placeholder = cleanLabel(control.getAttribute("placeholder") || "");
  if (placeholder && placeholder !== "0") return placeholder;
  return `Dato ${index + 1}`;
}

function captureMetrics(resultContainers: HTMLElement[]) {
  const metrics: Record<string, ScenarioValue> = {};

  for (const container of resultContainers) {
    const explicitCards = Array.from(container.querySelectorAll<HTMLElement>("[data-scenario-metric]"));
    for (const card of explicitCards) {
      const label = cleanLabel(card.querySelector<HTMLElement>("[data-scenario-label]")?.innerText || "");
      const value = cleanLabel(card.querySelector<HTMLElement>("[data-scenario-value]")?.innerText || "");
      if (label && value) metrics[label] = value;
    }

    const candidates = Array.from(container.querySelectorAll<HTMLElement>("div, article"));
    for (const candidate of candidates) {
      if (candidate.matches("[data-scenario-metric]") || candidate.closest("[data-scenario-metric]")) continue;
      const children = Array.from(candidate.children).filter((child): child is HTMLElement => child instanceof HTMLElement);
      if (children.length < 2 || children.length > 3) continue;

      const label = cleanLabel(children[0].innerText || "");
      const value = cleanLabel(children[1].innerText || "");
      const looksLikeMetric = /[$€£%\d]/.test(value) || /^(rentable|no rentable|positivo|negativo|sí|no)$/i.test(value);
      if (!label || !value || label.length > 72 || value.length > 160 || !looksLikeMetric || /^resultados?$/i.test(label)) continue;
      if (!(label in metrics)) metrics[label] = value;
    }
  }

  return metrics;
}

function capture(pathname: string): { draft: ScenarioDraft; hasResults: boolean } | null {
  const calculator = calculatorTracking[pathname];
  if (!calculator) return null;

  const fields: Record<string, ScenarioValue> = {};
  const calculatorRoot = document.querySelector("main main") ?? document.querySelector("main") ?? document.body;
  const controls = calculatorRoot.querySelectorAll<HTMLInputElement | HTMLSelectElement>(
    "input:not([type='hidden']), select"
  );

  controls.forEach((control, index) => {
    if (control.closest("[data-save-scenario-anchor]") || control.disabled) return;
    if (control instanceof HTMLInputElement && control.type === "radio" && !control.checked) return;

    const labelText = controlLabel(control, index);
    let value: ScenarioValue;
    if (control instanceof HTMLInputElement && (control.type === "checkbox" || control.type === "radio")) {
      value = control.type === "checkbox" ? control.checked : cleanLabel(control.closest("label")?.innerText || control.value);
    } else if (control instanceof HTMLSelectElement) {
      value = cleanLabel(control.selectedOptions[0]?.text || control.value);
    } else {
      value = control.value;
    }
    if (value !== "") fields[labelText] = value;
  });

  const resultHeadings = Array.from(document.querySelectorAll("h2, h3")).filter(
    (heading) =>
      !heading.closest("[data-save-scenario-anchor]") &&
      heading.textContent?.toLowerCase().includes("resultado"),
  );
  const resultContainers = resultHeadings
    .map((heading) => heading.parentElement)
    .filter((element): element is HTMLElement => element instanceof HTMLElement);
  const resultBlocks = resultContainers
    .map((container) => cleanLabel(container.innerText || ""))
    .filter(
      (text) =>
        text.length > 20 &&
        !text.toLowerCase().includes("cargá tus datos") &&
        !text.toLowerCase().includes("completá los datos")
    );

  const hasMeaningfulInput = Object.values(fields).some((value) => {
    if (typeof value === "boolean") return value;
    const normalized = String(value).replace(/[^0-9,.-]/g, "").replace(",", ".");
    return Number(normalized) !== 0 || String(value).length > 3;
  });
  const metrics = captureMetrics(resultContainers);
  const fallbackSummary = resultBlocks.join("\n\n").slice(0, 12000);

  return {
    hasResults: resultBlocks.length > 0 && hasMeaningfulInput,
    draft: {
      calculatorType: calculator.type,
      calculatorName: calculator.name,
      calculatorPath: pathname,
      inputs: { campos: fields },
      results: buildScenarioResults(metrics, fallbackSummary),
    },
  };
}

export default function CalculatorScenarioCapture() {
  const pathname = usePathname();
  const [snapshot, setSnapshot] = useState<ReturnType<typeof capture>>(null);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const lastSnapshot = useRef("");
  const resultTracked = useRef(false);

  useEffect(() => {
    resultTracked.current = false;
  }, [pathname]);

  useEffect(() => {
    if (!snapshot?.hasResults || resultTracked.current) return;
    resultTracked.current = true;
    trackEvent("calculate", {
      calculator_name: snapshot.draft.calculatorName,
      calculator_type: snapshot.draft.calculatorType,
    });
  }, [snapshot]);

  useEffect(() => {
    if (!calculatorTracking[pathname]) return;

    let cancelled = false;
    const anchor = document.createElement("div");
    anchor.dataset.saveScenarioAnchor = "true";

    const explicitBoundary = document.querySelector<HTMLElement>("[data-scenario-actions-before]");
    const contentHeadings = Array.from(document.querySelectorAll("h2, h3"));
    const calculationHeading = contentHeadings.find((heading) => {
      const text = cleanLabel(heading.textContent || "").toLowerCase();
      return text.startsWith("cómo lo calculamos")
        || text.startsWith("como lo calculamos")
        || text.startsWith("cómo se calcula")
        || text.startsWith("como se calcula");
    });
    const fallbackHeading = contentHeadings.find((heading) => {
      const text = cleanLabel(heading.textContent || "").toLowerCase();
      return text.startsWith("qué es")
        || text.startsWith("¿qué es")
        || text.startsWith("ejemplo práctico");
    });
    const seoHeading = calculationHeading ?? fallbackHeading;
    const seoBoundary = seoHeading?.closest<HTMLElement>(
      "[data-scenario-actions-before], .mt-10, .mt-12, .mt-16, section",
    );

    if (explicitBoundary?.parentElement) {
      explicitBoundary.parentElement.insertBefore(anchor, explicitBoundary);
    } else if (seoBoundary?.parentElement) {
      seoBoundary.parentElement.insertBefore(anchor, seoBoundary);
    } else {
      document.querySelector("main main")?.appendChild(anchor);
    }

    queueMicrotask(() => {
      if (!cancelled) setPortalTarget(anchor);
    });
    return () => {
      cancelled = true;
      anchor.remove();
    };
  }, [pathname]);

  useEffect(() => {
    if (!calculatorTracking[pathname]) return;

    let timeout: ReturnType<typeof setTimeout>;
    const update = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        const next = capture(pathname);
        const serialized = JSON.stringify(next);
        if (serialized !== lastSnapshot.current) {
          lastSnapshot.current = serialized;
          setSnapshot(next);
        }
      }, 80);
    };

    update();
    document.addEventListener("input", update);
    document.addEventListener("change", update);
    document.addEventListener("click", update);
    const observer = new MutationObserver(update);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      clearTimeout(timeout);
      document.removeEventListener("input", update);
      document.removeEventListener("change", update);
      document.removeEventListener("click", update);
      observer.disconnect();
    };
  }, [pathname]);

  if (!calculatorTracking[pathname]) return null;

  if (!portalTarget) return null;

  return createPortal(
    <section className="mx-auto mt-10 max-w-5xl overflow-hidden rounded-2xl border border-white/[0.1] bg-[#0a0d0b] shadow-[0_24px_70px_rgba(0,0,0,0.22)]">
      <header className="grid gap-4 px-6 py-6 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-200/55">Después del cálculo</p>
          <h2 className="mt-2 text-xl font-semibold tracking-[-0.025em] text-white sm:text-2xl">Guardá el escenario o profundizá el resultado</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/48">Las dos acciones usan los datos y resultados de esta calculadora. Elegí cómo querés continuar.</p>
        </div>
        <p className="text-xs text-white/30">Disponible con una cuenta</p>
      </header>
      {snapshot?.hasResults ? (
        <Suspense
          fallback={
            <p className="border-t border-white/[0.08] px-6 py-7 text-sm text-white/45 sm:px-8">
              Preparando las opciones para guardar y analizar…
            </p>
          }
        >
          <div className="grid border-t border-white/[0.08] md:grid-cols-2 md:divide-x md:divide-white/[0.08]">
            <SaveScenarioButton draft={snapshot.draft} hasResults />
            <AiAssistant draft={snapshot.draft} hasResults />
          </div>
        </Suspense>
      ) : (
        <p className="border-t border-white/[0.08] px-6 py-7 text-sm text-white/45 sm:px-8">
          Completá los datos y calculá para habilitar estas opciones.
        </p>
      )}
    </section>,
    portalTarget
  );
}
