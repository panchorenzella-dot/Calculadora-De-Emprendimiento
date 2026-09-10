"use client";

import { lazy, Suspense, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { trackEvent } from "@/lib/analytics";
import { calculatorTracking } from "@/lib/calculatorTracking";

const CalculatorScenarioCapture = lazy(
  () => import("@/components/CalculatorScenarioCapture"),
);

const RESULT_FEEDBACK_MS = 620;
const CALCULATION_TIMEOUT_MS = 15_000;

function findResultPanels() {
  const explicitPanels = Array.from(
    document.querySelectorAll<HTMLElement>(
      ".calculator-page-shell [data-calculator-results]",
    ),
  );

  const legacyPanels = Array.from(
    document.querySelectorAll<HTMLElement>(".calculator-page-shell h2"),
  )
    .filter((heading) => heading.textContent?.trim() === "Resultados")
    .map(
      (heading) =>
        heading.closest<HTMLElement>("section") ?? heading.parentElement,
    )
    .filter((panel): panel is HTMLElement => Boolean(panel));

  return Array.from(new Set([...explicitPanels, ...legacyPanels]));
}

export default function CalculatorEnhancementsLoader() {
  const pathname = usePathname();
  const calculator = calculatorTracking[pathname];
  const [enabledPath, setEnabledPath] = useState<string | null>(null);

  useEffect(() => {
    if (!calculator) return;

    let formStarted = false;
    let formStartedAt = 0;
    let formSubmitted = false;
    let abandonmentTracked = false;
    let pendingCalculationForm: HTMLFormElement | null = null;
    let pendingCalculationTimeout: number | null = null;
    const feedbackTimeouts = new Set<number>();
    const dirtyControls = new WeakSet<Element>();
    const completedFields = new Set<string>();
    const resultPanels = findResultPanels();

    resultPanels.forEach((panel) => {
      panel.dataset.calculatorResults = "";
      panel.setAttribute("aria-live", "polite");
      panel.setAttribute("aria-atomic", "false");
    });

    const clearCalculationFeedback = () => {
      if (pendingCalculationTimeout !== null) {
        window.clearTimeout(pendingCalculationTimeout);
        pendingCalculationTimeout = null;
      }
      pendingCalculationForm = null;
    };

    const animateResultPanel = (panel: HTMLElement) => {
      panel.removeAttribute("data-result-updated");
      // Restart the same lightweight CSS animation when a user recalculates.
      void panel.offsetWidth;
      panel.dataset.resultUpdated = "true";

      const timeout = window.setTimeout(() => {
        panel.removeAttribute("data-result-updated");
        feedbackTimeouts.delete(timeout);
      }, RESULT_FEEDBACK_MS);
      feedbackTimeouts.add(timeout);
    };

    const resultObserver = new MutationObserver((mutations) => {
      const submittedForm = pendingCalculationForm;
      if (!submittedForm) return;
      if (submittedForm.querySelector("[role='alert']")) {
        clearCalculationFeedback();
        return;
      }

      const changedPanels = new Set<HTMLElement>();
      mutations.forEach((mutation) => {
        const target = mutation.target instanceof Element
          ? mutation.target
          : mutation.target.parentElement;
        const panel = target?.closest<HTMLElement>("[data-calculator-results]");
        const copy = panel?.textContent ?? "";
        const isEmptyState =
          copy.includes("Cargá tus datos") ||
          copy.includes("Completá tus datos");
        if (panel && !isEmptyState) changedPanels.add(panel);
      });

      if (!changedPanels.size) return;
      changedPanels.forEach(animateResultPanel);
      clearCalculationFeedback();
    });

    resultPanels.forEach((panel) => {
      resultObserver.observe(panel, {
        childList: true,
        characterData: true,
        subtree: true,
      });
    });

    trackEvent("view_calculator", {
      calculator_name: calculator.name,
      calculator_type: calculator.type,
      page_path: pathname,
    });

    const getControl = (target: EventTarget | null) => {
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLSelectElement ||
        target instanceof HTMLTextAreaElement
      ) {
        return target;
      }
      return null;
    };

    const fieldName = (
      control: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
    ) => {
      const ariaLabel = control.getAttribute("aria-label")?.trim();
      if (ariaLabel) return ariaLabel;
      if (control.name) return control.name;
      if (control.id) return control.id;
      const form = control.closest("form");
      const controls = form
        ? Array.from(
            form.querySelectorAll("input:not([type='hidden']), select, textarea"),
          )
        : [];
      const index = controls.indexOf(control);
      return index >= 0 ? `campo_${index + 1}` : "campo_sin_nombre";
    };

    const startForm = () => {
      if (formStarted) return;
      formStarted = true;
      formStartedAt = Date.now();
      trackEvent("calculator_form_start", {
        calculator_name: calculator.name,
        calculator_type: calculator.type,
        page_path: pathname,
      });
    };

    const completeField = (
      control: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
    ) => {
      if (!dirtyControls.has(control) || !control.value.trim()) return;
      const label = fieldName(control).slice(0, 100);
      if (completedFields.has(label)) return;
      completedFields.add(label);
      trackEvent("calculator_input_complete", {
        calculator_name: calculator.name,
        calculator_type: calculator.type,
        field_name: label,
        completed_fields: completedFields.size,
      });
    };

    const handleInteraction = (event: Event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (!target.closest(".calculator-page-shell form")) return;
      setEnabledPath(pathname);

      if (event.type === "submit") {
        formSubmitted = true;
        const form = target.closest<HTMLFormElement>("form");
        const submitter =
          event instanceof SubmitEvent &&
          event.submitter instanceof HTMLButtonElement
            ? event.submitter
            : form?.querySelector<HTMLButtonElement>("button[type='submit']") ??
              null;

        if (form) {
          clearCalculationFeedback();
          pendingCalculationForm = form;
          pendingCalculationTimeout = window.setTimeout(
            clearCalculationFeedback,
            CALCULATION_TIMEOUT_MS,
          );
        }

        if (submitter) {
          submitter.dataset.calculationFeedback = "true";
          const timeout = window.setTimeout(() => {
            submitter.removeAttribute("data-calculation-feedback");
            feedbackTimeouts.delete(timeout);
          }, RESULT_FEEDBACK_MS);
          feedbackTimeouts.add(timeout);
        }
        return;
      }

      const control = getControl(target);
      if (!control || (event.type !== "input" && event.type !== "change")) return;
      dirtyControls.add(control);
      startForm();
      if (event.type === "change") completeField(control);
    };

    const handleFocusOut = (event: FocusEvent) => {
      const control = getControl(event.target);
      if (control) completeField(control);
    };

    const trackAbandonment = () => {
      if (!formStarted || formSubmitted || abandonmentTracked) return;
      abandonmentTracked = true;
      trackEvent("calculator_form_abandon", {
        calculator_name: calculator.name,
        calculator_type: calculator.type,
        completed_fields: completedFields.size,
        time_spent_seconds: Math.max(
          0,
          Math.round((Date.now() - formStartedAt) / 1000),
        ),
        transport_type: "beacon",
      });
    };

    document.addEventListener("focusin", handleInteraction, true);
    document.addEventListener("input", handleInteraction, true);
    document.addEventListener("change", handleInteraction, true);
    document.addEventListener("focusout", handleFocusOut, true);
    document.addEventListener("submit", handleInteraction, true);
    window.addEventListener("pagehide", trackAbandonment);

    return () => {
      document.removeEventListener("focusin", handleInteraction, true);
      document.removeEventListener("input", handleInteraction, true);
      document.removeEventListener("change", handleInteraction, true);
      document.removeEventListener("focusout", handleFocusOut, true);
      document.removeEventListener("submit", handleInteraction, true);
      window.removeEventListener("pagehide", trackAbandonment);
      resultObserver.disconnect();
      clearCalculationFeedback();
      feedbackTimeouts.forEach((timeout) => window.clearTimeout(timeout));
      resultPanels.forEach((panel) => {
        panel.removeAttribute("data-result-updated");
      });
      trackAbandonment();
    };
  }, [calculator, pathname]);

  if (!calculator || enabledPath !== pathname) return null;

  return (
    <Suspense fallback={null}>
      <CalculatorScenarioCapture />
    </Suspense>
  );
}
