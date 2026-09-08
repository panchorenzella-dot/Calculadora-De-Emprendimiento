import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateIibb,
  calculateIvaMonthly,
  calculateLaborCost,
  calculateProductIva,
} from "../lib/argentinaCalculators";

function closeTo(actual: number, expected: number, tolerance = 1e-8) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} ≠ ${expected}`);
}

test("monthly VAT reconciles debit, credit and both balance types", () => {
  const result = calculateIvaMonthly({
    sales: { "21": 1000 },
    purchases: { "21": 500 },
    previousTechnicalBalance: 20,
    withholdings: 10,
    perceptions: 5,
    paymentsOnAccount: 0,
    previousFreeBalance: 15,
  });
  assert.equal(result.taxDebit, 210);
  assert.equal(result.taxCredit, 105);
  assert.equal(result.determinedTax, 85);
  assert.equal(result.freeCredits, 30);
  assert.equal(result.taxToPay, 55);
  assert.equal(result.newTechnicalBalance, 0);
});

test("product VAT can add or extract tax", () => {
  const added = calculateProductIva({ amount: 100, rate: 21, quantity: 2, mode: "add" });
  assert.equal(added.netUnit, 100);
  closeTo(added.ivaUnit, 21);
  closeTo(added.grandTotal, 242);

  const extracted = calculateProductIva({ amount: 121, rate: 21, quantity: 1, mode: "extract" });
  closeTo(extracted.netUnit, 100);
  closeTo(extracted.ivaUnit, 21);
  closeTo(extracted.totalUnit, 121);
});

test("gross-revenue tax applies minimum and credits", () => {
  const result = calculateIibb({
    taxableRevenue: 100_000,
    rate: 3.5,
    minimumTax: 4000,
    withholdings: 500,
    perceptions: 300,
    bankCollections: 200,
    previousBalance: 100,
  });
  assert.equal(result.calculatedTax, 3500);
  assert.equal(result.determinedTax, 4000);
  assert.equal(result.credits, 1100);
  assert.equal(result.taxToPay, 2900);
  assert.equal(result.effectiveRate, 4);
});

test("labor cost includes cash and annual provisions", () => {
  const result = calculateLaborCost({
    grossSalary: 1_000_000,
    socialSecurityRate: 18,
    healthInsuranceRate: 6,
    artRate: 3,
    artFixed: 1000,
    collectiveAgreementRate: 1,
    lifeInsurance: 500,
    otherCosts: 2500,
    vacationDays: 14,
  });
  assert.equal(result.socialSecurity, 180_000);
  assert.equal(result.healthInsurance, 60_000);
  assert.equal(result.artVariable, 30_000);
  assert.equal(result.collectiveAgreement, 10_000);
  assert.equal(result.monthlyCashCost, 1_284_000);
  closeTo(result.sacProvision, 1_000_000 / 12);
  assert.ok(result.annualizedMonthlyCost > result.monthlyCashCost);
  assert.ok(result.extraRate > 0);
});

test("tax calculators clamp negative and non-finite data", () => {
  const product = calculateProductIva({ amount: -100, rate: Number.POSITIVE_INFINITY, quantity: -2, mode: "add" });
  assert.deepEqual(product, { netUnit: 0, ivaUnit: 0, totalUnit: 0, netTotal: 0, ivaTotal: 0, grandTotal: 0 });

  const iibb = calculateIibb({ taxableRevenue: Number.NaN, rate: -3, minimumTax: -1, withholdings: -2, perceptions: 0, bankCollections: 0, previousBalance: 0 });
  assert.ok(Object.values(iibb).every(Number.isFinite));
  assert.equal(iibb.taxToPay, 0);
});
