/**
 * Numeric guards shared by every calculator.
 *
 * Calculation functions never return NaN or Infinity. User-entered quantities
 * are non-negative by default because a negative price, cost, duration or tax
 * rate is not meaningful in the calculators currently exposed by the site.
 */
export function finiteNumber(value: number, fallback = 0) {
  return Number.isFinite(value) ? value : fallback;
}

export function nonNegative(value: number) {
  return Math.max(0, finiteNumber(value));
}

export function nonNegativeInteger(value: number) {
  return Math.max(0, Math.round(finiteNumber(value)));
}

export function percentage(value: number, maximum = Number.POSITIVE_INFINITY) {
  return Math.min(nonNegative(value), maximum);
}

export function safeDivide(numerator: number, denominator: number, fallback = 0) {
  const safeNumerator = finiteNumber(numerator);
  const safeDenominator = finiteNumber(denominator);
  if (safeDenominator === 0) return fallback;
  return finiteNumber(safeNumerator / safeDenominator, fallback);
}

export function safePower(base: number, exponent: number, fallback = 0) {
  if (!Number.isFinite(base) || !Number.isFinite(exponent) || base < 0) return fallback;
  return finiteNumber(Math.pow(base, exponent), fallback);
}
