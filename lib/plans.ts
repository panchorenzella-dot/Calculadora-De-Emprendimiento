export const PLAN_NAMES = ["free", "basic", "pro", "premium"] as const;
export type PlanName = (typeof PLAN_NAMES)[number];
export type PaidPlanName = Exclude<PlanName, "free">;

export const PAID_PLAN_NAMES = ["basic", "pro", "premium"] as const satisfies readonly PaidPlanName[];

export const PLAN_LIMITS = {
  free: {
    analysis: 1,
    analysisPeriod: "semana",
    chat: 5,
    chatPeriod: "día",
    scenarios: 2,
    scenariosPeriod: "total",
    canCompare: false,
    simultaneousComparisons: 0,
  },
  basic: {
    analysis: 5,
    analysisPeriod: "mes",
    chat: 50,
    chatPeriod: "mes",
    scenarios: 2,
    scenariosPeriod: "total",
    canCompare: false,
    simultaneousComparisons: 0,
  },
  pro: {
    analysis: 50,
    analysisPeriod: "mes",
    chat: 500,
    chatPeriod: "mes",
    scenarios: null,
    scenariosPeriod: "sin límite",
    canCompare: true,
    simultaneousComparisons: 3,
  },
  premium: {
    analysis: null,
    analysisPeriod: "sin límite",
    chat: null,
    chatPeriod: "sin límite",
    scenarios: null,
    scenariosPeriod: "sin límite",
    canCompare: true,
    simultaneousComparisons: null,
  },
} as const;

export const PAID_PLANS = [
  {
    id: "basic",
    name: "Básico",
    priceUsd: 7.99,
    tagline: "Para ordenar tus primeros números",
    description: "Las herramientas esenciales y una ayuda puntual de IA para empezar con claridad.",
    features: [
      "Calculadoras de precio, margen y punto de equilibrio",
      "Hasta 2 escenarios guardados",
      "5 análisis con IA por mes",
      "Soporte por email",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    priceUsd: 19.99,
    tagline: "El punto justo para decidir mejor",
    description: "Todas las calculadoras, comparación y capacidad suficiente para trabajar cada mes.",
    features: [
      "Todas las calculadoras, incluidas las de rubro",
      "Escenarios guardados ilimitados",
      "Comparación de hasta 3 escenarios lado a lado",
      "50 análisis con IA por mes",
      "Soporte prioritario",
    ],
    recommended: true,
  },
  {
    id: "premium",
    name: "Premium",
    priceUsd: 39.99,
    tagline: "Para uso intensivo y acompañamiento",
    description: "Máxima capacidad, acceso anticipado y una instancia mensual de consulta personalizada.",
    features: [
      "Todo lo incluido en Pro",
      "Acceso anticipado a nuevas calculadoras",
      "Comparaciones simultáneas sin límite",
      "Análisis con IA ilimitados",
      "Soporte prioritario + consulta 1 a 1 mensual",
    ],
  },
] as const;

export const PLAN_LABELS: Record<PlanName, string> = {
  free: "Gratis",
  basic: "Básico",
  pro: "Pro",
  premium: "Premium",
};

export const PLAN_GRACE_DAYS = 2;

export type PlanRecord = {
  plan?: string | null;
  status?: string | null;
  current_period_end?: string | null;
};

export function isPlanName(value: unknown): value is PlanName {
  return typeof value === "string" && PLAN_NAMES.includes(value as PlanName);
}

export function isPaidPlanName(value: unknown): value is PaidPlanName {
  return typeof value === "string" && PAID_PLAN_NAMES.includes(value as PaidPlanName);
}

export function effectivePlan(record: PlanRecord | null | undefined, now = Date.now()): PlanName {
  if (!record || !isPaidPlanName(record.plan)) return "free";

  const periodEnd = record.current_period_end ? new Date(record.current_period_end).getTime() : null;
  const validEnd = periodEnd === null
    || (!Number.isNaN(periodEnd) && now <= periodEnd + PLAN_GRACE_DAYS * 86_400_000);
  const validStatus = record.status === "active"
    || record.status === "trialing"
    || (record.status === "past_due" && periodEnd !== null);

  return validStatus && validEnd ? record.plan : "free";
}

export function canCompareScenarios(plan: PlanName) {
  return PLAN_LIMITS[plan].canCompare;
}

export function comparisonLimit(plan: PlanName) {
  return PLAN_LIMITS[plan].simultaneousComparisons;
}

export function paidPlan(plan: PaidPlanName) {
  return PAID_PLANS.find((candidate) => candidate.id === plan)!;
}

export const FREE_PLAN_COPY = "1 análisis semanal · 5 mensajes diarios · hasta 2 escenarios guardados";
export const PRO_PLAN_COPY = "50 análisis · 500 mensajes · escenarios ilimitados · comparación lado a lado";
