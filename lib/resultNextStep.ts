export type BusinessOutcome = {
  marginPct: number;
  unitProfit: number;
  monthlyProfit: number | null;
  plannedUnits: number;
  breakEvenUnits: number | null;
  includesFixedCosts: boolean;
};

export function classifyBusinessOutcome(outcome: BusinessOutcome) {
  const values = [outcome.marginPct, outcome.unitProfit, outcome.plannedUnits, outcome.monthlyProfit ?? 0, outcome.breakEvenUnits ?? 0];
  if (!values.every(Number.isFinite)) return "neutral";
  if (outcome.unitProfit < 0 || (outcome.monthlyProfit !== null && outcome.monthlyProfit < 0)
    || (outcome.plannedUnits > 0 && outcome.breakEvenUnits !== null && outcome.plannedUnits < outcome.breakEvenUnits)) return "weak";
  if (outcome.includesFixedCosts && outcome.marginPct >= 30 && outcome.unitProfit > 0
    && outcome.monthlyProfit !== null && outcome.monthlyProfit > 0 && outcome.plannedUnits > 0
    && outcome.breakEvenUnits !== null && outcome.breakEvenUnits <= outcome.plannedUnits * 0.7) return "healthy";
  return "neutral";
}

export function getResultNextStep(outcome: BusinessOutcome, weakAttempts: number) {
  const status = classifyBusinessOutcome(outcome);
  if (status === "healthy") return "marketplace";
  if (status === "weak" && weakAttempts >= 2) return "diagnosis";
  return null;
}
