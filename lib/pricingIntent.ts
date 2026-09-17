export type ProfitBasis = "markup" | "margin";

export function convertProfitPercent(value: number, from: ProfitBasis) {
  if (!Number.isFinite(value) || value < 0 || (from === "margin" && value >= 100)) return null;
  return from === "markup" ? value / (100 + value) * 100 : value / (100 - value) * 100;
}

export function readHeroAmount(value: string | null) {
  if (value === null || !/^\d{1,13}(?:\.\d{1,2})?$/.test(value)) return "";
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount > 1e12) return "";
  return new Intl.NumberFormat("es-AR", { maximumFractionDigits: 2, useGrouping: false }).format(amount);
}
