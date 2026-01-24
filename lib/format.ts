export function fmtMoney(n: number, currency: "ARS" | "USD") {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(n);
}

export function fmtNum(n: number, digits = 2) {
  return new Intl.NumberFormat("es-AR", {
    maximumFractionDigits: digits,
  }).format(n);
}
