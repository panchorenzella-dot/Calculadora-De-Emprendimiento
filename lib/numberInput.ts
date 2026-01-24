const nfInt = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 });

export function onlyDigits(s: string) {
  return s.replace(/[^\d]/g, "");
}

export function formatARIntFromDigits(digits: string) {
  if (digits.trim() === "") return "";
  const n = Number(digits);
  if (!Number.isFinite(n)) return "";
  return nfInt.format(n);
}

export function parseDigitsToNumber(digits: string) {
  if (digits.trim() === "") return 0;
  const n = Number(digits);
  return Number.isFinite(n) ? n : 0;
}
