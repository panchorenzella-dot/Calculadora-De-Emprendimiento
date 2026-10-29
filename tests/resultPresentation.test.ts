import { test } from "node:test";
import assert from "node:assert/strict";
import { resultPresentation } from "../lib/resultPresentation";
import { capitalEvolution } from "../lib/calculations/evolution";
import { calculateCompoundInterest, simulateMonthlyContributions } from "../lib/calculations/investments";

test("profit and loss use signed locale numbers while costs and tax remain neutral", () => {
  assert.equal(resultPresentation("Ganancia mensual", "$ -42.500,50").tone, "negative");
  assert.equal(resultPresentation("Ganancia mensual", "-$42,500.50").title, "Pérdida mensual");
  assert.equal(resultPresentation("Margen", "30,5 %").tone, "positive");
  assert.equal(resultPresentation("Ganancia", "$0").tone, "neutral");
  assert.equal(resultPresentation("Costo mensual", "$100.000").tone, "neutral");
  assert.equal(resultPresentation("IVA a pagar", "$100").tone, "neutral");
  assert.equal(resultPresentation("ROI", "—").tone, "neutral");
});

test("evolution reconciles every sampled period with the financial engine", () => {
  for (const years of [0.5, 2, 5, 35, 200]) {
    const input = { initial: 1000.25, contribution: 100.75, years, rate: 12, frequency: "monthly" as const };
    const rows = capitalEvolution(input);
    assert.ok(rows.length <= 13);
    const final = rows.at(-1)!;
    const result = calculateCompoundInterest({ initialInvestment: input.initial, monthlyContribution: input.contribution, years, annualRatePct: 12, frequency: "monthly" });
    assert.equal(final.value, result.futureValue);
    assert.equal(final.contribution, result.totalContributed);
    assert.ok(rows.every(row => Number.isFinite(row.value)));
  }
  const final = capitalEvolution({ initial: 100, contribution: 10, years: 3, rate: 10, annualIncrease: 20 }).at(-1)!;
  const result = simulateMonthlyContributions({ initialCapital: 100, monthlyContribution: 10, months: 36, annualRatePct: 10, annualContributionIncreasePct: 20 });
  assert.equal(final.value, result.finalBalance);
  assert.equal(final.contribution, result.totalInvested);
  assert.deepEqual(capitalEvolution({ initial: 0, contribution: 0, years: 0, rate: 0 }), []);
});
