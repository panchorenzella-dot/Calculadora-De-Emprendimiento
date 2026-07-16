export const PLAN_LIMITS = {
  free: {
    analysis: 1,
    analysisPeriod: "semana",
    chat: 5,
    chatPeriod: "día",
    scenarios: 3,
    scenariosPeriod: "día",
  },
  pro: {
    analysis: 30,
    analysisPeriod: "mes",
    chat: 300,
    chatPeriod: "mes",
    scenarios: null,
    scenariosPeriod: "sin límite",
  },
} as const;

export type PlanName = keyof typeof PLAN_LIMITS;

export const BILLING_OPTIONS = [
  { id: "monthly", label: "Mensual", months: 1, totalUsd: 19.99, monthlyUsd: 19.99, discount: 0 },
  { id: "quarterly", label: "Trimestral", months: 3, totalUsd: 53.99, monthlyUsd: 18, discount: 10 },
  { id: "annual", label: "Anual", months: 12, totalUsd: 191.99, monthlyUsd: 16, discount: 20 },
] as const;

export type BillingInterval = (typeof BILLING_OPTIONS)[number]["id"];

export const FREE_PLAN_COPY = "1 análisis semanal · 5 mensajes diarios · 3 escenarios diarios";
export const PRO_PLAN_COPY = "30 análisis · 300 mensajes · escenarios ilimitados";
