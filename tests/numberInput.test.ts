import assert from "node:assert/strict";
import test from "node:test";

import {
  formatLocaleNumberInput,
  formatLocaleNumberInputChange,
  parseLocaleNumber,
  parseOptionalLocaleNumber,
  validateNumericFields,
} from "../lib/numberInput";

test("parseLocaleNumber understands Argentine and international separators", () => {
  assert.equal(parseLocaleNumber("1.234,56"), 1234.56);
  assert.equal(parseLocaleNumber("1,234.56"), 1234.56);
  assert.equal(parseLocaleNumber("1250,5"), 1250.5);
  assert.equal(parseLocaleNumber("1.234"), 1234);
  assert.equal(parseLocaleNumber("0,125"), 0.125);
  assert.equal(parseLocaleNumber("$ 2.500,75"), 2500.75);
});

test("parseLocaleNumber preserves negatives and rejects non-finite numbers", () => {
  assert.equal(parseLocaleNumber("-1.250,50"), -1250.5);
  assert.equal(parseLocaleNumber("(1.250,50)"), -1250.5);
  assert.equal(parseLocaleNumber(Number.POSITIVE_INFINITY, 7), 7);
  assert.equal(parseLocaleNumber("", 3), 3);
  assert.equal(parseOptionalLocaleNumber(""), null);
  assert.equal(parseOptionalLocaleNumber("sin dato"), null);
});

test("formatLocaleNumberInput formats while keeping decimal and negative intent", () => {
  assert.equal(formatLocaleNumberInput("1234,"), "1.234,");
  assert.equal(formatLocaleNumberInput("1234.5"), "1.234,5");
  assert.equal(formatLocaleNumberInput("-1234,56"), "-1.234,56");
  assert.equal(formatLocaleNumberInput("12,3456", { maxDecimals: 2 }), "12,34");
  assert.equal(formatLocaleNumberInput(""), "");
});

test("formatLocaleNumberInputChange keeps long integers stable while typing", () => {
  let value = "";
  const displays: string[] = [];

  for (const digit of "4000000") {
    const nextValue = `${value}${digit}`;
    value = formatLocaleNumberInputChange(value, nextValue, {}, "insertText");
    displays.push(value);
  }

  assert.deepEqual(displays, [
    "4",
    "40",
    "400",
    "4.000",
    "40.000",
    "400.000",
    "4.000.000",
  ]);
  assert.equal(parseLocaleNumber(value), 4_000_000);
});

test("formatLocaleNumberInputChange handles deletion, decimals and pasted notation", () => {
  assert.equal(
    formatLocaleNumberInputChange("4.000", "4.00", {}, "deleteContentBackward"),
    "400",
  );
  assert.equal(
    formatLocaleNumberInputChange("4.000", "4.000,5", {}, "insertText"),
    "4.000,5",
  );
  assert.equal(
    formatLocaleNumberInputChange("4.000", "1234.56", {}, "insertFromPaste"),
    "1.234,56",
  );
});

test("validateNumericFields reports required, negative, range and integer errors", () => {
  const result = validateNumericFields([
    { name: "empty", label: "Precio", value: "", required: true, min: 0 },
    { name: "negative", label: "Costo", value: "-10", min: 0 },
    { name: "large", label: "Tasa", value: "101", max: 100 },
    { name: "decimal", label: "Unidades", value: "2,5", integer: true },
    { name: "valid", label: "Importe", value: "1.234,50", min: 0 },
  ]);

  assert.equal(result.valid, false);
  assert.match(result.errors.empty, /Ingresá precio/i);
  assert.match(result.errors.negative, /no puede ser negativo/i);
  assert.match(result.errors.large, /menor o igual a 100/i);
  assert.match(result.errors.decimal, /entero/i);
  assert.equal(result.values.valid, 1234.5);
});

test("validateNumericFields accepts four-digit and multi-million amounts", () => {
  const result = validateNumericFields([
    { name: "fourDigits", label: "Sueldo bruto", value: "4.000", required: true, min: 0 },
    { name: "millions", label: "Sueldo bruto", value: "4.000.000", required: true, min: 0 },
  ]);

  assert.equal(result.valid, true);
  assert.equal(result.values.fourDigits, 4_000);
  assert.equal(result.values.millions, 4_000_000);
});
