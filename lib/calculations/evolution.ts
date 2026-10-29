import { calculateCompoundInterest, simulateMonthlyContributions, type CompoundingFrequency } from "./investments";

/** Sample exact existing simulations, always retaining the final month. */
export function capitalEvolution(input: { initial: number; contribution: number; years: number; rate: number; frequency?: CompoundingFrequency; annualIncrease?: number }) {
  const months = Math.min(1200, Math.max(0, Math.floor(input.years * 12)));
  if (!Number.isFinite(months) || months === 0) return [];
  const step = months <= 24 ? Math.max(1, Math.ceil(months / 12)) : Math.max(12, Math.ceil(months / 12 / 10) * 12);
  const periods: number[] = [];
  for (let month = step; month < months; month += step) periods.push(month);
  periods.push(months);
  return periods.map(month => {
    const label = month % 12 === 0 ? `Año ${month / 12}` : `Mes ${month}`;
    if (input.frequency) {
      const r = calculateCompoundInterest({ initialInvestment: input.initial, monthlyContribution: input.contribution, years: month / 12, annualRatePct: input.rate, frequency: input.frequency });
      return { label, value: r.futureValue, contribution: r.totalContributed, tone: "positive" as const };
    }
    const r = simulateMonthlyContributions({ initialCapital: input.initial, monthlyContribution: input.contribution, months: month, annualRatePct: input.rate, annualContributionIncreasePct: input.annualIncrease ?? 0 });
    return { label, value: r.finalBalance, contribution: r.totalInvested, tone: "positive" as const };
  });
}
