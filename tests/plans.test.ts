import assert from "node:assert/strict";
import test from "node:test";

import {
  canCompareScenarios,
  comparisonLimit,
  effectivePlan,
  isPaidPlanName,
  PAID_PLANS,
  PLAN_LIMITS,
} from "../lib/plans";
import { ANNIVERSARY_PROMOTION, isAnniversaryPromotionActive, promotionalPriceForPlan } from "../lib/promotions";

test("exposes the three monthly paid plans with Pro as the recommended anchor", () => {
  assert.deepEqual(PAID_PLANS.map((plan) => [plan.id, plan.priceUsd]), [
    ["basic", 7.99],
    ["pro", 19.99],
    ["premium", 39.99],
  ]);
  assert.equal(PAID_PLANS.filter((plan) => "recommended" in plan && plan.recommended).length, 1);
  assert.equal(PAID_PLANS.find((plan) => plan.id === "pro")?.recommended, true);
});

test("applies the anniversary discount to Pro through October 31", () => {
  const duringPromotion = Date.parse("2026-10-31T20:00:00-03:00");
  const afterPromotion = Date.parse("2026-11-01T00:00:01-03:00");
  assert.equal(isAnniversaryPromotionActive(duringPromotion), true);
  assert.equal(isAnniversaryPromotionActive(afterPromotion), false);
  assert.equal(promotionalPriceForPlan("pro", 19.99, duringPromotion), 14.99);
  assert.equal(promotionalPriceForPlan("basic", 7.99, duringPromotion), 7.99);
  assert.equal(ANNIVERSARY_PROMOTION.discountPercent, 25);
});

test("applies scenario and comparison entitlements by plan", () => {
  assert.equal(PLAN_LIMITS.free.scenarios, 2);
  assert.equal(PLAN_LIMITS.basic.scenarios, 2);
  assert.equal(PLAN_LIMITS.pro.scenarios, null);
  assert.equal(PLAN_LIMITS.premium.scenarios, null);
  assert.equal(canCompareScenarios("basic"), false);
  assert.equal(canCompareScenarios("pro"), true);
  assert.equal(comparisonLimit("pro"), 3);
  assert.equal(comparisonLimit("premium"), null);
});

test("effective plan requires a paid tier with an active period", () => {
  const now = Date.parse("2026-09-14T12:00:00Z");
  assert.equal(effectivePlan({ plan: "basic", status: "active", current_period_end: "2026-10-14T12:00:00Z" }, now), "basic");
  assert.equal(effectivePlan({ plan: "premium", status: "past_due", current_period_end: "2026-09-13T12:00:00Z" }, now), "premium");
  assert.equal(effectivePlan({ plan: "pro", status: "canceled", current_period_end: "2026-10-14T12:00:00Z" }, now), "free");
  assert.equal(effectivePlan({ plan: "premium", status: "active", current_period_end: "2026-09-10T12:00:00Z" }, now), "free");
  assert.equal(isPaidPlanName("basic"), true);
  assert.equal(isPaidPlanName("free"), false);
});
