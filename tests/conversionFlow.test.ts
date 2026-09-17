import assert from "node:assert/strict";
import test from "node:test";
import { convertProfitPercent, readHeroAmount } from "../lib/pricingIntent";
import { calculateMarkupPricing } from "../lib/calculations/business";
import { getResultNextStep, type BusinessOutcome } from "../lib/resultNextStep";
import { getRelatedCalculators, homeCalculatorGroups } from "../lib/calculatorDiscovery";
import { availableCalculators } from "../app/calculadoras/catalog";

test("markup and margin convert in both directions without changing the base price", () => {
  const margin = convertProfitPercent(80, "markup")!;
  assert.ok(Math.abs(margin - 44.4444444444) < 1e-8);
  assert.ok(Math.abs(convertProfitPercent(margin, "margin")! - 80) < 1e-8);
  assert.equal(convertProfitPercent(50, "margin"), 100);
  assert.equal(convertProfitPercent(0, "markup"), 0);
  for (const value of [-1, 100, Infinity, NaN]) assert.equal(convertProfitPercent(value, "margin"), null);
});

test("hero prefills retain decimal cents and reject invalid or unbounded URL values", () => {
  assert.equal(readHeroAmount("14000"), "14000");
  assert.equal(readHeroAmount("14000.50"), "14000,5");
  assert.equal(readHeroAmount("0"), "0");
  for (const value of [null, "", "-10", "Infinity", "1e8", "14.000,50", "2.345", "1000000000001", "<script>"]) {
    assert.equal(readHeroAmount(value), "");
  }
});

test("target margin prices include fixed costs and compensate fees while preserving net margin", () => {
  const result = calculateMarkupPricing({ productCost: 10000, extraUnitCosts: 1000, monthlyFixedCosts: 100000,
    unitsPerMonth: 100, commissionPct: 10, taxPct: 5, targetMarkupPct: 0, targetMarginPct: 40, mode: "from-margin" });
  assert.equal(result.totalUnitCost, 12000);
  assert.ok(Math.abs(result.calculatedPrice - 12000 / 0.45) < 1e-8);
  assert.ok(Math.abs(result.marginPct - 40) < 1e-8);
  assert.ok(Math.abs(result.monthlyProfit - result.monthlyRevenue * 0.4) < 1e-8);
  const zero = calculateMarkupPricing({ productCost: 10000, targetMarkupPct: 0, targetMarginPct: 0, mode: "from-margin" });
  assert.equal(zero.calculatedPrice, 10000);
  assert.equal(zero.profitPerUnit, 0);
});

const healthy: BusinessOutcome = { marginPct: 40, unitProfit: 1000, monthlyProfit: 100000, plannedUnits: 100, breakEvenUnits: 20, includesFixedCosts: true };
test("next steps need a complete healthy result or repeated distinct weak attempts", () => {
  assert.equal(getResultNextStep(healthy, 0), "marketplace");
  for (const patch of [{ includesFixedCosts: false }, { marginPct: 29.99 }, { monthlyProfit: null }, { plannedUnits: 0 }, { breakEvenUnits: null }, { breakEvenUnits: 71 }, { marginPct: NaN }]) {
    assert.equal(getResultNextStep({ ...healthy, ...patch }, 0), null);
  }
  for (const patch of [{ unitProfit: -10 }, { monthlyProfit: -100 }, { plannedUnits: 10 }]) {
    assert.equal(getResultNextStep({ ...healthy, ...patch }, 1), null);
    assert.equal(getResultNextStep({ ...healthy, ...patch }, 2), "diagnosis");
  }
  assert.equal(getResultNextStep({ ...healthy, marginPct: 20 }, 5), null);
});

test("the home groups cover the entire active catalog exactly once and every calculator has valid related tools", () => {
  const paths = homeCalculatorGroups.flatMap((group) => group.calculators.map((calculator) => calculator.href));
  assert.equal(homeCalculatorGroups.length, 5);
  assert.equal(new Set(paths).size, paths.length);
  assert.deepEqual([...paths].sort(), availableCalculators.map((calculator) => calculator.href).sort());
  for (const calculator of availableCalculators) {
    const related = getRelatedCalculators(calculator.href);
    assert.ok(related.length >= 2 && related.length <= 3, calculator.href);
    assert.equal(new Set(related.map((tool) => tool.href)).size, related.length);
    assert.ok(related.every((tool) => tool.href !== calculator.href && paths.includes(tool.href)));
  }
  assert.deepEqual(getRelatedCalculators("/unknown"), []);
});
