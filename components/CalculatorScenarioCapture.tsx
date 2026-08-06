"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import SaveScenarioButton from "@/components/SaveScenarioButton";
import AiAssistant from "@/components/AiAssistant";
import { buildScenarioResults } from "@/lib/scenarios";
import type { ScenarioDraft, ScenarioValue } from "@/types/scenario";

const calculators: Record<string, { type: string; name: string }> = {
  "/margen": { type: "margen", name: "Margen de ganancia" },
  "/markup": { type: "precio-venta", name: "Precio de venta" },
  "/roi": { type: "roi", name: "ROI" },
  "/punto-de-equilibrio": {
    type: "punto-de-equilibrio",
    name: "Punto de equilibrio",
  },
  "/interes-compuesto": {
    type: "interes-compuesto",
    name: "Interés compuesto",
  },
  "/aporte-mensual": { type: "aporte-mensual", name: "Aporte mensual" },
  "/cafeteria": { type: "cafeteria", name: "Cafetería" },
  "/distribuidora": { type: "distribuidora", name: "Distribuidora" },
  "/hamburgueseria": { type: "hamburgueseria", name: "Hamburguesería" },
  "/Intermediarios": { type: "intermediarios", name: "Intermediarios" },
  "/meta-ahorro": { type: "meta-ahorro", name: "Meta de ahorro" },
  "/produccion": { type: "produccion", name: "Producción" },
  "/recupero-capital": {
    type: "recupero-capital",
    name: "Recupero de capital",
  },
  "/rendimiento-real": {
    type: "rendimiento-real",
    name: "Rendimiento real",
  },
  "/reventa": { type: "reventa", name: "Compra y venta" },
  "/roi-inversion": { type: "roi-inversion", name: "ROI de inversión" },
};

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
  const calculator = calculators[pathname];
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
    (heading) => heading.textContent?.toLowerCase().includes("resultado")
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

  useEffect(() => {
    if (!calculators[pathname]) return;

    let cancelled = false;
    const anchor = document.createElement("div");
    anchor.dataset.saveScenarioAnchor = "true";

    const seoHeading = Array.from(document.querySelectorAll("h2, h3")).find(
      (heading) => {
        const text = cleanLabel(heading.textContent || "").toLowerCase();
        return (
          text.startsWith("cómo lo calculamos") ||
          text.startsWith("como lo calculamos") ||
          text.startsWith("qué es") ||
          text.startsWith("¿qué es") ||
          text.startsWith("ejemplo práctico")
        );
      }
    );
    const seoSection = seoHeading?.closest("section");

    if (seoSection?.parentElement) {
      seoSection.parentElement.insertBefore(anchor, seoSection);
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
    if (!calculators[pathname]) return;

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

  if (!calculators[pathname]) return null;

  if (!portalTarget) return null;

  return createPortal(
    <>
      <AiAssistant draft={snapshot?.draft ?? null} hasResults={snapshot?.hasResults ?? false} />
      <SaveScenarioButton draft={snapshot?.draft ?? null} hasResults={snapshot?.hasResults ?? false} />
    </>,
    portalTarget
  );
}
