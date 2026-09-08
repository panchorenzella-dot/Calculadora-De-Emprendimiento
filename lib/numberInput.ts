const nfInt = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 });

export type NumericInput = string | number | null | undefined;

type NumericParts = {
  negative: boolean;
  integerDigits: string;
  decimalDigits: string;
  hasDecimal: boolean;
};

function numericParts(value: string, maxDecimals = 20): NumericParts | null {
  const trimmed = value.trim().replace(/[\u00a0\s]/g, "");
  if (!trimmed) return null;

  const negative = trimmed.startsWith("-") || /^\(.*\)$/.test(trimmed);
  const clean = trimmed.replace(/[^\d.,]/g, "");
  if (!/\d/.test(clean)) return null;

  const dots = [...clean.matchAll(/\./g)].map((match) => match.index ?? -1);
  const commas = [...clean.matchAll(/,/g)].map((match) => match.index ?? -1);
  const separators = [...dots, ...commas].sort((a, b) => a - b);
  let decimalIndex = -1;

  if (dots.length > 0 && commas.length > 0) {
    // With both conventions present, the right-most separator is the decimal one.
    decimalIndex = Math.max(dots.at(-1) ?? -1, commas.at(-1) ?? -1);
  } else if (separators.length === 1) {
    const index = separators[0];
    const integerDigits = clean.slice(0, index).replace(/\D/g, "");
    const decimals = clean.slice(index + 1).replace(/\D/g, "");
    // A single three-digit group is normally a thousands separator in es-AR.
    // Values such as 0.125 and 1234.567 remain valid decimals.
    const looksLikeThousands = decimals.length === 3
      && integerDigits.length > 0
      && integerDigits.length <= 3
      && Number(integerDigits) !== 0;
    decimalIndex = looksLikeThousands ? -1 : index;
  } else if (separators.length > 1) {
    const lastIndex = separators.at(-1) ?? -1;
    const separator = clean[lastIndex];
    const allSameSeparator = separators.every((index) => clean[index] === separator);
    const chunks = clean.split(separator);
    const allThousandsGroups = allSameSeparator
      && chunks.length > 1
      && chunks.slice(1).every((chunk) => /^\d{3}$/.test(chunk));
    decimalIndex = allThousandsGroups ? -1 : lastIndex;
  }

  const integerSource = decimalIndex >= 0 ? clean.slice(0, decimalIndex) : clean;
  const decimalSource = decimalIndex >= 0 ? clean.slice(decimalIndex + 1) : "";
  return {
    negative,
    integerDigits: integerSource.replace(/\D/g, "") || "0",
    decimalDigits: decimalSource.replace(/\D/g, "").slice(0, maxDecimals),
    hasDecimal: decimalIndex >= 0,
  };
}

/** Parses both Argentine (1.234,56) and international (1,234.56) notation. */
export function parseLocaleNumber(value: NumericInput, fallback = 0) {
  if (typeof value === "number") return Number.isFinite(value) ? value : fallback;
  if (value === null || value === undefined) return fallback;
  const parts = numericParts(value);
  if (!parts) return fallback;
  const unsigned = Number(`${parts.integerDigits}${parts.hasDecimal ? `.${parts.decimalDigits || "0"}` : ""}`);
  if (!Number.isFinite(unsigned)) return fallback;
  return parts.negative ? -unsigned : unsigned;
}

export function parseOptionalLocaleNumber(value: NumericInput) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (value === null || value === undefined || value.trim() === "") return null;
  const parts = numericParts(value);
  if (!parts) return null;
  return parseLocaleNumber(value);
}

/**
 * Formats while typing, preserving a trailing decimal comma. A period or comma
 * may be used as the decimal separator and pasted thousands separators are safe.
 */
export function formatLocaleNumberInput(
  value: string,
  options: { maxDecimals?: number; allowNegative?: boolean } = {},
) {
  const maxDecimals = Math.max(0, options.maxDecimals ?? 2);
  // Keep a typed negative sign visible so form validation can explain the
  // problem instead of silently turning -500 into +500.
  const allowNegative = options.allowNegative ?? true;
  const raw = value.trim();
  if (!raw) return "";
  const negative = allowNegative && raw.startsWith("-");
  const parts = numericParts(raw, maxDecimals);
  if (!parts) return negative ? "-" : "";
  const significantInteger = parts.integerDigits.replace(/^0+(?=\d)/, "").slice(0, 15) || "0";
  const formattedInteger = nfInt.format(Number(significantInteger));
  const decimal = parts.hasDecimal && maxDecimals > 0 ? `,${parts.decimalDigits}` : "";
  return `${negative ? "-" : ""}${formattedInteger}${decimal}`;
}

export function onlyDigits(value: string) {
  return value.replace(/[^\d]/g, "");
}

/** Kept for existing components; now safely supports decimal values as well. */
export function formatARIntFromDigits(value: string) {
  if (value.trim() === "") return "";
  return formatLocaleNumberInput(value);
}

/** Kept for existing components; accepts empty, comma, point and grouped values. */
export function parseDigitsToNumber(value: string) {
  return parseLocaleNumber(value);
}

export type NumericFieldRule = {
  name: string;
  label: string;
  value: NumericInput;
  required?: boolean;
  min?: number;
  max?: number;
  integer?: boolean;
};

export type NumericValidationResult = {
  valid: boolean;
  values: Record<string, number>;
  errors: Record<string, string>;
  firstError: string | null;
};

/** Shared Spanish validation messages for calculator forms. */
export function validateNumericFields(fields: readonly NumericFieldRule[]): NumericValidationResult {
  const values: Record<string, number> = {};
  const errors: Record<string, string> = {};

  for (const field of fields) {
    const rawEmpty = field.value === null
      || field.value === undefined
      || (typeof field.value === "string" && field.value.trim() === "");
    const parsed = parseOptionalLocaleNumber(field.value);
    let error: string | null = null;

    if (rawEmpty && field.required) {
      error = `Ingresá ${field.label.toLocaleLowerCase("es-AR")}.`;
    } else if (!rawEmpty && parsed === null) {
      error = `${field.label}: ingresá un número válido.`;
    } else if (parsed !== null && field.min !== undefined && parsed < field.min) {
      error = field.min === 0
        ? `${field.label} no puede ser negativo.`
        : `${field.label} debe ser mayor o igual a ${field.min}.`;
    } else if (parsed !== null && field.max !== undefined && parsed > field.max) {
      error = `${field.label} debe ser menor o igual a ${field.max}.`;
    } else if (parsed !== null && field.integer && !Number.isInteger(parsed)) {
      error = `${field.label} debe ser un número entero.`;
    }

    values[field.name] = parsed ?? 0;
    if (error) errors[field.name] = error;
  }

  const firstError = Object.values(errors)[0] ?? null;
  return { valid: firstError === null, values, errors, firstError };
}
