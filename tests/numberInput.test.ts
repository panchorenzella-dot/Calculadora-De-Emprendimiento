import assert from "node:assert/strict";
import test from "node:test";

import {
  formatLocaleNumberInput,
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
