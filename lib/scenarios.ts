import type { SavedScenario, ScenarioData, ScenarioValue } from "@/types/scenario";

export type ScenarioMetric = {
  label: string;
  value: string;
};

export type ScenarioField = {
  label: string;
  value: string;
};

type CalculatorInfo = {
  name: string;
  description: string;
  icon: string;
};

const CALCULATORS: Record<string, CalculatorInfo> = {
  margen: { name: "Margen de ganancia", description: "Rentabilidad, ventas y recupero", icon: "%" },
  "precio-venta": { name: "Precio de venta", description: "Costos, markup y precio sugerido", icon: "$" },
  roi: { name: "ROI", description: "Retorno y rendimiento de una inversión", icon: "↗" },
  "punto-de-equilibrio": { name: "Punto de equilibrio", description: "Ventas mínimas para cubrir costos", icon: "◎" },
  "interes-compuesto": { name: "Interés compuesto", description: "Proyección y crecimiento del capital", icon: "∿" },
  "aporte-mensual": { name: "Aporte mensual", description: "Ahorro periódico y capital futuro", icon: "+" },
  cafeteria: { name: "Cafetería", description: "Costos, ventas y rentabilidad del local", icon: "☕" },
  distribuidora: { name: "Distribuidora", description: "Volumen, margen y resultado mensual", icon: "▦" },
  hamburgueseria: { name: "Hamburguesería", description: "Ganancia, margen y punto de equilibrio", icon: "◉" },
  intermediarios: { name: "Intermediarios", description: "Comisiones y rentabilidad de operaciones", icon: "⇄" },
  "meta-ahorro": { name: "Meta de ahorro", description: "Objetivo, plazo y aporte necesario", icon: "◆" },
  produccion: { name: "Producción", description: "Costos productivos y resultado operativo", icon: "⌁" },
  "recupero-capital": { name: "Recupero de capital", description: "Tiempo estimado para recuperar una inversión", icon: "◷" },
  "rendimiento-real": { name: "Rendimiento real", description: "Retorno descontando inflación", icon: "≈" },
  reventa: { name: "Compra y venta", description: "Margen y ganancia de reventa", icon: "↻" },
  "roi-inversion": { name: "ROI de inversión", description: "Retorno total de un proyecto", icon: "△" },
};

const RESULT_LABELS: Record<string, string[]> = {
  hamburgueseria: [
    "Ganancia neta mensual",
    "Ganancia por hamburguesa",
    "Costo total por hamburguesa",
    "Margen de ganancia",
    "Hamburguesas vendidas por mes",
    "Ventas mensuales",
    "Costo variable mensual",
    "Ganancia bruta mensual",
    "Punto de equilibrio mensual",
    "Punto de equilibrio diario",
  ],
  margen: ["Unidades / mes", "Ventas brutas", "Ventas netas", "Costo unitario", "Margen unitario", "Ganancia mensual", "Break-even", "Período de recupero", "ROI anual"],
  "precio-venta": ["Costo total", "Precio de venta", "Ganancia por unidad", "Margen", "Markup", "Ventas mensuales", "Ganancia mensual"],
  roi: ["Ganancia neta", "ROI", "Retorno total", "Capital final"],
  "punto-de-equilibrio": ["Punto de equilibrio", "Ventas de equilibrio", "Margen de contribución", "Ganancia estimada"],
};

const FALLBACK_RESULT_LABELS = [
  "Ganancia neta mensual",
  "Ganancia bruta mensual",
  "Ganancia mensual",
  "Ganancia por unidad",
  "Ventas mensuales",
  "Ventas netas",
  "Ventas brutas",
  "Margen de ganancia",
  "Margen neto",
  "Margen unitario",
  "Margen de contribución",
  "Punto de equilibrio mensual",
  "Punto de equilibrio diario",
  "Punto de equilibrio",
  "Costo variable mensual",
  "Costo total por hamburguesa",
  "Costo total",
  "Costo unitario",
  "Capital final",
  "Retorno total",
  "ROI anual",
  "ROI",
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function clean(value: unknown) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function readableLabel(value: string, index: number) {
  const normalized = clean(value);
  if (!normalized || /^\d+$/.test(normalized) || /^campo\s+\d+$/i.test(normalized)) {
    return index === 0 ? "Dato principal" : `Dato ${index + 1}`;
  }
  return normalized.replace(/[_-]+/g, " ").replace(/^./, (letter) => letter.toUpperCase());
}

function readableValue(value: unknown): string {
  if (typeof value === "boolean") return value ? "Sí" : "No";
  if (value === null || value === undefined || value === "") return "Sin completar";
  if (Array.isArray(value)) return value.map(readableValue).join(", ");
  if (isRecord(value)) return Object.values(value).map(readableValue).filter(Boolean).join(" · ");
  return clean(value);
}

function metricsFromRecord(value: unknown): ScenarioMetric[] {
  if (!isRecord(value)) return [];
  return Object.entries(value)
    .map(([label, metricValue]) => ({ label: readableLabel(label, 0), value: readableValue(metricValue) }))
    .filter((item) => item.value !== "Sin completar");
}

function parseLegacySummary(summary: string, calculatorType: string) {
  const text = clean(summary).replace(/^Resultados\s*/i, "");
  if (!text) return [];

  const labels = Array.from(new Set([...(RESULT_LABELS[calculatorType] ?? []), ...FALLBACK_RESULT_LABELS]));
  const found = labels
    .map((label) => ({ label, index: text.toLocaleLowerCase("es").indexOf(label.toLocaleLowerCase("es")) }))
    .filter((item) => item.index >= 0)
    .sort((a, b) => a.index - b.index)
    .filter((item, index, items) => index === 0 || item.index !== items[index - 1].index);

  return found.map((item, index) => {
    const start = item.index + item.label.length;
    const end = found[index + 1]?.index ?? text.length;
    return { label: item.label, value: clean(text.slice(start, end)) || "—" };
  }).filter((item) => item.value.length <= 180);
}

export function getCalculatorInfo(calculatorType: string): CalculatorInfo {
  return CALCULATORS[calculatorType] ?? {
    name: calculatorType.replace(/[_-]+/g, " ").replace(/^./, (letter) => letter.toUpperCase()),
    description: "Escenario guardado en tu cuenta",
    icon: "◇",
  };
}

export function getScenarioFields(scenario: Pick<SavedScenario, "inputs">): ScenarioField[] {
  const inputSource = isRecord(scenario.inputs.campos) ? scenario.inputs.campos : scenario.inputs;
  return Object.entries(inputSource)
    .filter(([label, value]) => {
      const normalized = label.toLocaleLowerCase("es");
      return label !== "calculator_path"
        && !normalized.startsWith("nombre opcional")
        && value !== ""
        && value !== null
        && value !== undefined;
    })
    .map(([label, value], index) => ({ label: readableLabel(label, index), value: readableValue(value) }));
}

export function getScenarioMetrics(scenario: Pick<SavedScenario, "calculator_type" | "results">): ScenarioMetric[] {
  const structured = metricsFromRecord(scenario.results.metricas ?? scenario.results.metrics);
  if (structured.length) return structured;

  const direct = Object.entries(scenario.results)
    .filter(([key]) => !["resumen", "summary", "metricas", "metrics"].includes(key))
    .flatMap(([label, value]) => {
      if (isRecord(value)) return metricsFromRecord(value);
      if (Array.isArray(value)) return [];
      return [{ label: readableLabel(label, 0), value: readableValue(value) }];
    });
  if (direct.length) return direct;

  return parseLegacySummary(clean(scenario.results.resumen ?? scenario.results.summary), scenario.calculator_type);
}

export function getScenarioPreview(scenario: Pick<SavedScenario, "calculator_type" | "results">) {
  const metrics = getScenarioMetrics(scenario).slice(0, 3);
  if (!metrics.length) return "Resultado guardado y listo para revisar.";
  return metrics.map((metric) => `${metric.label}: ${metric.value}`).join(" · ");
}

export function getScenarioResultNarrative(scenario: Pick<SavedScenario, "calculator_type" | "results">) {
  const summary = clean(scenario.results.resumen ?? scenario.results.summary);
  if (!summary) return "Este escenario conserva los datos y resultados ingresados en la calculadora.";
  if (getScenarioMetrics(scenario).length) return "Los resultados principales están organizados abajo para que puedas revisarlos y compararlos rápidamente.";
  return summary.replace(/^Resultados\s*/i, "");
}

export function buildScenarioResults(metrics: Record<string, ScenarioValue>, fallback = ""): ScenarioData {
  const normalized = Object.fromEntries(
    Object.entries(metrics).filter(([label, value]) => clean(label) && clean(value)),
  );
  return {
    metricas: normalized,
    resumen: Object.entries(normalized).map(([label, value]) => `${label}: ${readableValue(value)}`).join("\n") || fallback,
  };
}
