"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import SaveScenarioButton from "@/components/SaveScenarioButton";
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

function capture(pathname: string): { draft: ScenarioDraft; hasResults: boolean } | null {
  const calculator = calculators[pathname];
  if (!calculator) return null;

  const fields: Record<string, ScenarioValue> = {};
  const controls = document.querySelectorAll<HTMLInputElement | HTMLSelectElement>(
    "input:not([type='hidden']), select"
  );

  controls.forEach((control, index) => {
    const label = control.closest("label");
    const labelText = cleanLabel(
      label?.querySelector("span")?.textContent ||
        control.getAttribute("aria-label") ||
        control.getAttribute("placeholder") ||
        control.name ||
        `Campo ${index + 1}`
    );
    fields[labelText] =
      control instanceof HTMLInputElement && control.type === "checkbox"
        ? control.checked
        : control.value;
  });

  const resultHeadings = Array.from(document.querySelectorAll("h2, h3")).filter(
    (heading) => heading.textContent?.toLowerCase().includes("resultado")
  );
  const resultBlocks = resultHeadings
    .map((heading) => cleanLabel(heading.parentElement?.innerText || ""))
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

  return {
    hasResults: resultBlocks.length > 0 && hasMeaningfulInput,
    draft: {
      calculatorType: calculator.type,
      calculatorName: calculator.name,
      calculatorPath: pathname,
      inputs: { campos: fields },
      results: {
        resumen: resultBlocks.join("\n\n").slice(0, 12000),
      },
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
        return text.startsWith("qué es") || text.startsWith("¿qué es");
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
    <SaveScenarioButton
      draft={snapshot?.draft ?? null}
      hasResults={snapshot?.hasResults ?? false}
    />,
    portalTarget
  );
}
