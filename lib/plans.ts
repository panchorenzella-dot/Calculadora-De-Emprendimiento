export const PLAN_LIMITS = {
  free: {
    analysis: 1,
    analysisPeriod: "semana",
    chat: 5,
    chatPeriod: "día",
  },
  pro: {
    analysis: 30,
    analysisPeriod: "mes",
    chat: 300,
    chatPeriod: "mes",
  },
} as const;

export type PlanName = keyof typeof PLAN_LIMITS;

export const FREE_PLAN_COPY = "1 análisis por semana · 5 mensajes por día";
export const PRO_PLAN_COPY = "30 análisis por mes · 300 mensajes por mes";
