"use client";

import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

import templateData from "@/data/calculatorTemplates.json";
import { trackEvent } from "@/lib/analytics";

type CalculatorTemplate = {
  id: string;
  title: string;
  description: string;
  currency?: "ARS" | "USD";
  values: Record<string, string>;
};

const templatesByPath = templateData as Record<string, CalculatorTemplate[]>;

function updateNativeInput(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value",
  )?.set;
  setter?.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

function CalculatorTemplatePortal({
  pathname,
  templates,
}: {
  pathname: string;
  templates: CalculatorTemplate[];
}) {
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (templates.length === 0) return;

    const calculatorForm = document.querySelector<HTMLElement>(
      ".calculator-page-shell form",
    );
    const calculatorWorkspace = calculatorForm?.parentElement;
    const workspaceParent = calculatorWorkspace?.parentElement;
    if (!calculatorWorkspace || !workspaceParent) return;

    const anchor = document.createElement("div");
    anchor.dataset.calculatorTemplates = "true";
    workspaceParent.insertBefore(anchor, calculatorWorkspace);
    queueMicrotask(() => setPortalTarget(anchor));

    return () => {
      anchor.remove();
    };
  }, [pathname, templates.length]);

  function applyTemplate(template: CalculatorTemplate) {
    const calculatorForm = document.querySelector<HTMLFormElement>(
      ".calculator-page-shell form",
    );
    if (!calculatorForm) return;

    const inputs = Array.from(
      calculatorForm.querySelectorAll<HTMLInputElement>("input"),
    );
    const currency = template.currency ?? "ARS";
    const currencyButton = Array.from(
      calculatorForm.querySelectorAll<HTMLButtonElement>("button[type='button']"),
    ).find((button) => button.textContent?.trim() === currency);
    currencyButton?.click();
    let applied = 0;

    for (const [label, value] of Object.entries(template.values)) {
      const input = inputs.find(
        (candidate) => candidate.getAttribute("aria-label") === label,
      );
      if (!input || input.disabled) continue;
      updateNativeInput(input, value);
      applied += 1;
    }

    setSelectedId(template.id);
    setStatus(
      applied === Object.keys(template.values).length
        ? `Plantilla “${template.title}” aplicada. Estamos actualizando el resultado.`
        : "Aplicamos los valores disponibles y actualizamos el resultado. Revisalos antes de decidir.",
    );
    trackEvent("apply_calculator_template", {
      calculator_path: pathname,
      template_id: template.id,
      fields_applied: applied,
      currency,
    });
    window.requestAnimationFrame(() => {
      calculatorForm.requestSubmit();
      inputs[0]?.focus();
    });
  }

  if (!portalTarget || templates.length === 0) return null;

  return createPortal(
    <section
      aria-labelledby="calculator-templates-title"
      className="mb-5 overflow-hidden rounded-2xl border border-emerald-300/[0.16] bg-[linear-gradient(135deg,rgba(16,185,129,.08),rgba(255,255,255,.025))] p-3.5 sm:p-4"
    >
      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.16em] text-emerald-200/55">
            Empezá más rápido
          </p>
          <h2
            id="calculator-templates-title"
            className="mt-0.5 text-base font-semibold text-white"
          >
            Plantillas editables del rubro
          </h2>
        </div>
        <p className="max-w-md text-xs leading-5 text-white/60 sm:text-right">
          Son ejemplos ilustrativos en pesos argentinos, no valores recomendados.
        </p>
      </div>
      <div className="mt-3 grid gap-2 md:grid-cols-2">
        {templates.map((template) => (
          <button
            key={template.id}
            type="button"
            aria-pressed={selectedId === template.id}
            onClick={() => applyTemplate(template)}
            className={`rounded-xl border px-3.5 py-2.5 text-left transition sm:flex sm:items-center sm:gap-3 ${
              selectedId === template.id
                ? "border-emerald-300/35 bg-emerald-300/[0.09]"
                : "border-white/[0.08] bg-black/20 hover:border-white/15 hover:bg-white/[0.035]"
            }`}
          >
            <span className="block shrink-0 text-sm font-semibold text-white/90">
              {template.title}
            </span>
            <span className="mt-1 block text-xs leading-5 text-white/60 sm:mt-0 sm:border-l sm:border-white/10 sm:pl-3">
              {template.description}
            </span>
          </button>
        ))}
      </div>
      {status ? (
        <p role="status" className="mt-3 text-xs font-medium text-emerald-100/65">
          {status}
        </p>
      ) : null}
    </section>,
    portalTarget,
  );
}

export default function CalculatorTemplates() {
  const pathname = usePathname();
  const templates = templatesByPath[pathname] ?? [];

  return (
    <CalculatorTemplatePortal
      key={pathname}
      pathname={pathname}
      templates={templates}
    />
  );
}
