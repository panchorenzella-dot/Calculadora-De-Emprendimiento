export const ANNIVERSARY_PROMOTION = {
  analyticsId: "aniversario_2_meses",
  discountPercent: 25,
  regularPriceUsd: 19.99,
  promotionalPriceUsd: 14.99,
  endsAt: "2026-11-01T02:59:59.999Z",
  endsLabel: "31 de octubre",
} as const;

export function isAnniversaryPromotionActive(now = Date.now()) {
  return now <= Date.parse(ANNIVERSARY_PROMOTION.endsAt);
}

export function promotionalPriceForPlan(plan: string, regularPriceUsd: number, now = Date.now()) {
  return plan === "pro" && isAnniversaryPromotionActive(now)
    ? ANNIVERSARY_PROMOTION.promotionalPriceUsd
    : regularPriceUsd;
}
