import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateAporteMensual,
  calculateCapitalRecovery,
  calculateCompoundBalance,
  calculateCompoundInterest,
  calculateInteresCompuesto,
  calculateInvestmentReturn,
  calculateMetaAhorro,
  calculateMonthlyContribution,
  calculateRealReturn,
  calculateRecuperoCapital,
  calculateRendimientoReal,
  calculateRequiredMonthlySaving,
  calculateRoiInversion,
  calculateSavingsGoal,
  simulateMonthlyContributions,
} from "../lib/calculations/investments";

function closeTo(actual: number, expected: number, tolerance = 1e-6) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} ≠ ${expected}`);
}

test("compound balance handles zero and periodic rates", () => {
  assert.equal(calculateCompoundBalance({ initialInvestment: 1000, monthlyContribution: 100, years: 1, annualRatePct: 0, frequency: "monthly" }), 2200);
  closeTo(calculateCompoundBalance({ initialInvestment: 1000, monthlyContribution: 0, years: 1, annualRatePct: 10, frequency: "annual" }), 1100);
  closeTo(calculateCompoundBalance({ initialInvestment: 1000, monthlyContribution: 0, years: 1, annualRatePct: 12, frequency: "monthly" }), 1000 * (1.01 ** 12));
});

test("compound-interest breakdown reconciles contributions and interest", () => {
  const result = calculateCompoundInterest({ initialInvestment: 1000, monthlyContribution: 100, years: 1, annualRatePct: 0, frequency: "monthly" });
  assert.equal(result.futureValue, 2200);
  assert.equal(result.totalContributed, 2200);
  assert.equal(result.earnedInterest, 0);
  assert.equal(result.months, 12);
  assert.ok(result.optimisticScenario > result.estimatedScenario);
});

test("monthly contribution increases are applied after each completed year", () => {
  const result = simulateMonthlyContributions({
    initialCapital: 0,
    monthlyContribution: 100,
    months: 24,
    annualRatePct: 0,
    annualContributionIncreasePct: 10,
  });
  closeTo(result.finalBalance, 2520);
  closeTo(result.totalInvested, 2520);
  closeTo(result.generatedReturn, 0);
  closeTo(result.lastMonthlyContribution, 110);
  assert.equal(result.contributionsMade, 24);
});

test("savings goal finds the required monthly contribution", () => {
  closeTo(calculateRequiredMonthlySaving({ target: 1200, initialSavings: 0, months: 12, annualRatePct: 0, annualContributionIncreasePct: 0 }) ?? 0, 100);
  assert.equal(calculateRequiredMonthlySaving({ target: 1000, initialSavings: 1000, months: 12, annualRatePct: 10, annualContributionIncreasePct: 0 }), 0);
  assert.equal(calculateRequiredMonthlySaving({ target: 1000, initialSavings: 0, months: 0, annualRatePct: 10, annualContributionIncreasePct: 0 }), null);

  const result = calculateSavingsGoal({ target: 1200, initialSavings: 0, months: 12, annualRatePct: 0, annualContributionIncreasePct: 0 });
  closeTo(result.estimatedFinalValue, 1200);
  closeTo(result.finalCoveragePct, 100);
  assert.equal(result.status, "Meta posible con ahorro mensual");
});

test("investment and real returns produce expected percentages", () => {
  const investment = calculateInvestmentReturn({ initialInvestment: 1000, finalValue: 1300, extraCosts: 100, months: 12 });
  assert.equal(investment.totalInvested, 1100);
  assert.equal(investment.netProfit, 200);
  closeTo(investment.totalRoiPct, 200 / 1100 * 100);
  assert.equal(investment.status, "Ganaste plata");

  const real = calculateRealReturn({ initialAmount: 1000, finalAmount: 1210, inflationPct: 10, extraCosts: 0, months: 12 });
  closeTo(real.nominalReturnPct, 21);
  closeTo(real.realReturnPct, 10);
  closeTo(real.inflationAdjustedFinalAmount, 1100);
  assert.equal(real.status, "Ganaste poder de compra");
});

test("capital recovery distinguishes recovered and pending capital", () => {
  const result = calculateCapitalRecovery({ initialInvestment: 1000, monthlyNetProfit: 100, analysisMonths: 12 });
  assert.equal(result.monthsToRecover, 10);
  assert.equal(result.accumulatedProfit, 1200);
  assert.equal(result.recoveredCapital, 1000);
  assert.equal(result.pendingCapital, 0);
  assert.equal(result.profitAfterRecovery, 200);
  assert.equal(result.recoversWithinPeriod, true);

  const zero = calculateCapitalRecovery({ initialInvestment: 1000, monthlyNetProfit: 0, analysisMonths: 12 });
  assert.equal(zero.monthsToRecover, null);
  assert.equal(zero.recoversWithinPeriod, false);
});

test("investment engines clamp invalid input and cap simulations", () => {
  const result = calculateCompoundInterest({
    initialInvestment: Number.NaN,
    monthlyContribution: -10,
    years: 1_000_000,
    annualRatePct: Number.POSITIVE_INFINITY,
    frequency: "monthly",
  });
  assert.equal(result.months, 1200);
  assert.ok(Object.values(result).every((value) => Number.isFinite(value)));
});

test("investment scenario helpers cover conservative and optimistic projections", () => {
  const result = calculateMonthlyContribution({
    initialCapital: 1000,
    monthlyContribution: 100,
    years: 1,
    annualRatePct: 10,
    annualContributionIncreasePct: 0,
  });
  assert.equal(result.contributionsMade, 12);
  assert.ok(result.conservativeScenario < result.estimatedScenario);
  assert.ok(result.optimisticScenario > result.estimatedScenario);
  assert.equal(result.estimatedRatePct, 10);
});

test("investment status messages handle reached, pending, loss and tie states", () => {
  assert.equal(calculateSavingsGoal({ target: 1000, initialSavings: 1000, months: 12, annualRatePct: 0, annualContributionIncreasePct: 0 }).status, "Ya alcanzaste la meta");
  assert.equal(calculateSavingsGoal({ target: 1000, initialSavings: 0, months: 0, annualRatePct: 0, annualContributionIncreasePct: 0 }).status, "Necesitás cargar un plazo");
  assert.equal(calculateSavingsGoal({ target: 0, initialSavings: 0, months: 0, annualRatePct: 0, annualContributionIncreasePct: 0 }).status, "Cargá una meta de ahorro");

  assert.equal(calculateInvestmentReturn({ initialInvestment: 1000, finalValue: 900, extraCosts: 0, months: 12 }).status, "Perdiste plata");
  assert.equal(calculateInvestmentReturn({ initialInvestment: 1000, finalValue: 1000, extraCosts: 0, months: 12 }).status, "Saliste empatado");
  assert.equal(calculateRealReturn({ initialAmount: 1000, finalAmount: 1000, inflationPct: 10, extraCosts: 0, months: 12 }).status, "Perdiste poder de compra");
  assert.equal(calculateRealReturn({ initialAmount: 1000, finalAmount: 1100, inflationPct: 10, extraCosts: 0, months: 12 }).status, "Empataste contra la inflación");
  assert.equal(calculateRealReturn({ initialAmount: 0, finalAmount: 0, inflationPct: 0, extraCosts: 0, months: 0 }).status, "Cargá los datos para calcular");

  assert.equal(calculateCapitalRecovery({ initialInvestment: 0, monthlyNetProfit: 100, analysisMonths: 12 }).status, "No hay inversión inicial cargada");
  assert.equal(calculateCapitalRecovery({ initialInvestment: 1000, monthlyNetProfit: 50, analysisMonths: 12 }).status, "Todavía falta recuperar capital");
});

test("Spanish UI adapters preserve the audited investment formulas", () => {
  const aporte = calculateAporteMensual({ capitalInicial: 1000, aporteMensual: 100, anos: 1, rendimientoAnual: 0, aumentoAnualAporte: 0 });
  assert.equal(aporte.capitalFinal, 2200);
  assert.equal(aporte.totalInvertido, 2200);

  const interes = calculateInteresCompuesto({ inversionInicial: 1000, aporteMensual: 100, anos: 1, tasaAnual: 0, frecuencia: "monthly" });
  assert.equal(interes.valorFuturo, 2200);
  assert.equal(interes.totalAportado, 2200);

  const meta = calculateMetaAhorro({ metaAhorro: 1200, ahorroInicial: 0, meses: 12, rendimientoAnual: 0, aumentoAnualAporte: 0 });
  closeTo(meta.ahorroMensualNecesario ?? 0, 100);
  closeTo(meta.porcentajeMetaFinal, 100);

  const roi = calculateRoiInversion({ inversionInicial: 1000, valorFinal: 1300, costosExtra: 100, meses: 12 });
  assert.equal(roi.gananciaNeta, 200);
  closeTo(roi.roiTotal, 200 / 1100 * 100);

  const real = calculateRendimientoReal({ montoInicial: 1000, montoFinal: 1210, inflacionPeriodo: 10, costosExtra: 0, meses: 12 });
  closeTo(real.rendimientoReal, 10);

  const recupero = calculateRecuperoCapital({ inversionInicial: 1000, gananciaMensualNeta: 100, mesesAnalisis: 12 });
  assert.equal(recupero.mesesParaRecuperar, 10);
  assert.equal(recupero.recuperaDentroDelPeriodo, true);
});
