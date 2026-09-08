"use client";

import { lazy, Suspense, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { trackEvent } from "@/lib/analytics";
import { calculatorTracking } from "@/lib/calculatorTracking";

const CalculatorScenarioCapture = lazy(
  () => import("@/components/CalculatorScenarioCapture"),
);

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
    const dirtyControls = new WeakSet<Element>();
    const completedFields = new Set<string>();

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
