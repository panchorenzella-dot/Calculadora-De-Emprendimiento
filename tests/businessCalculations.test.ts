import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateBreakEven,
  calculateBrokerage,
  calculateBusinessMargin,
  calculateCafeteria,
  calculateDistribuidora,
  calculateHamburgueseria,
  calculateIntermediarios,
  calculateMarkupPricing,
  calculateProduccion,
  calculateReventa,
  calculateRoi,
  calculateUnitEconomics,
} from "../lib/calculations/business";

function closeTo(actual: number, expected: number, tolerance = 1e-8) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} ≠ ${expected}`);
}

test("unit economics returns a consistent monthly model", () => {
  const result = calculateUnitEconomics({
    unitPrice: 100,
    unitCosts: [40, 10],
    unitsPerDay: 10,
    operatingDays: 20,
    fixedCosts: 500,
    investedCapital: 9500,
  });

  assert.deepEqual(
    {
      cost: result.unitCost,
      contribution: result.contributionPerUnit,
      units: result.unitsPerMonth,
      revenue: result.monthlyRevenue,
      variable: result.monthlyVariableCosts,
      gross: result.monthlyGrossProfit,
      net: result.monthlyNetProfit,
    },
    { cost: 50, contribution: 50, units: 200, revenue: 20000, variable: 10000, gross: 10000, net: 9500 },
  );
  closeTo(result.marginPct, 50);
  closeTo(result.markupPct, 100);
  closeTo(result.breakEvenUnits ?? 0, 10);
  closeTo(result.breakEvenUnitsPerDay ?? 0, 0.5);
  closeTo(result.capitalRecoveryMonths ?? 0, 1);
  closeTo(result.monthlyRoiPct ?? 0, 100);
});

test("unit economics avoids NaN and impossible break-even values", () => {
  const result = calculateUnitEconomics({
    unitPrice: Number.NaN,
    unitCosts: [10, Number.POSITIVE_INFINITY, -5],
    unitsPerMonth: -20,
    fixedCosts: 100,
  });
  assert.equal(result.unitCost, 10);
  assert.equal(result.unitsPerMonth, 0);
  assert.equal(result.breakEvenUnits, null);
  assert.ok(Object.values(result).every((value) => value === null || Number.isFinite(value)));
});

test("break-even shares the audited contribution formula", () => {
  const result = calculateBreakEven({ fixedCosts: 1000, unitPrice: 100, unitVariableCost: 60, estimatedUnits: 40 });
  assert.equal(result.contributionPerUnit, 40);
  assert.equal(result.breakEvenUnits, 25);
  assert.equal(result.breakEvenRevenue, 2500);
  assert.equal(result.estimatedProfit, 600);
  assert.equal(result.profitable, true);

  const impossible = calculateBreakEven({ fixedCosts: 1000, unitPrice: 50, unitVariableCost: 60 });
  assert.equal(impossible.profitable, false);
  assert.equal(impossible.breakEvenUnits, 0);
});

test("markup pricing compensates percentage charges", () => {
  const result = calculateMarkupPricing({
    productCost: 100,
    extraUnitCosts: 10,
    monthlyFixedCosts: 100,
    unitsPerMonth: 10,
    targetMarkupPct: 20,
    commissionPct: 5,
    taxPct: 5,
    mode: "from-markup",
  });
  closeTo(result.totalUnitCost, 120);
  closeTo(result.calculatedPrice, 160);
  closeTo(result.chargesPerSale, 16);
  closeTo(result.profitPerUnit, 24);
  closeTo(result.actualMarkupPct, 20);
  closeTo(result.marginPct, 15);
  assert.equal(result.breakEvenUnits, 3);
});

test("ROI and brokerage formulas remain finite", () => {
  const roi = calculateRoi({ initialInvestment: 1000, generatedRevenue: 300, totalCosts: 100, finalValue: 1200 });
  assert.equal(roi.netProfit, 400);
  assert.equal(roi.roiPct, 40);
  assert.equal(roi.grossReturn, 200);

  const brokerage = calculateBrokerage({
    operationValue: 1_000_000,
    commissionPct: 3,
    operationCosts: 5_000,
    operationsPerMonth: 4,
    fixedCosts: 20_000,
    investedCapital: 80_000,
  });
  assert.equal(brokerage.commissionPerOperation, 30_000);
  assert.equal(brokerage.profitPerOperation, 25_000);
  assert.equal(brokerage.monthlyNetProfit, 80_000);
  assert.equal(brokerage.capitalRecoveryMonths, 1);
});

test("business margin excludes included VAT from contribution and break-even", () => {
  const result = calculateBusinessMargin({
    unitsPerDay: 10,
    operatingDays: 2,
    unitPrice: 121,
    costMode: "abs",
    unitCost: 50,
    monthlyFixedCosts: 100,
    initialInvestment: 1000,
    vatMode: "incluido",
  });
  closeTo(result.netUnitPrice, 100);
  closeTo(result.grossRevenue, 2420);
  closeTo(result.netRevenue, 2000);
  closeTo(result.contributionPerUnit, 50);
  closeTo(result.monthlyNetProfit, 900);
  assert.equal(result.breakEvenUnits, 2);
  closeTo(result.paybackMonths ?? 0, 1000 / 900);
  closeTo(result.annualRoiPct ?? 0, 1080);
});

test("business adapters use the same unit-economics engine", () => {
  const cafe = calculateCafeteria({
    costoPedido: 30,
    otrosGastos: 10,
    ticketPromedio: 100,
    clientesPorDia: 5,
    diasAbiertos: 20,
    costosFijos: 1000,
  });
  assert.equal(cafe.costoTotalPedido, 40);
  assert.equal(cafe.gananciaPorPedido, 60);
  assert.equal(cafe.clientesPorMes, 100);
  assert.equal(cafe.gananciaNetaMensual, 5000);

  const hamburgueseria = calculateHamburgueseria({
    costoHamburguesa: 30,
    otrosGastos: 10,
    precioVenta: 100,
    hamburguesasPorDia: 5,
    diasAbiertos: 20,
    costosFijos: 1000,
  });
  assert.equal(hamburgueseria.costoTotalUnitario, 40);
  assert.equal(hamburgueseria.hamburguesasPorMes, 100);
  assert.equal(hamburgueseria.gananciaNetaMensual, 5000);

  const produccion = calculateProduccion({
    costoProduccion: 20,
    packaging: 5,
    otrosGastos: 5,
    precioVenta: 100,
    unidadesPorDia: 5,
    diasProduccion: 20,
    costosFijos: 1000,
  });
  assert.equal(produccion.costoTotalUnitario, 30);
  assert.equal(produccion.unidadesPorMes, 100);
  assert.equal(produccion.gananciaNetaMensual, 6000);

  const distribuidora = calculateDistribuidora({
    costoCompra: 50,
    precioVenta: 100,
    otrosGastos: 10,
    unidadesPorDia: 5,
    diasVenta: 20,
    costosFijos: 1000,
    capitalInvertido: 3000,
  });
  assert.equal(distribuidora.gananciaNetaMensual, 3000);
  assert.equal(distribuidora.recuperoCapital, 1);
  assert.equal(distribuidora.roiMensual, 100);
  assert.equal(distribuidora.markup, 80);

  const reventa = calculateReventa({
    costoCompra: 50,
    precioVenta: 100,
    gastosVenta: 10,
    unidadesVendidasMes: 100,
    costosFijos: 1000,
    capitalInvertido: 3000,
  });
  assert.equal(reventa.gananciaNetaMensual, 3000);
  assert.equal(reventa.recuperoCapital, 1);
  assert.equal(reventa.roiMensual, 100);

  const intermediarios = calculateIntermediarios({
    valorOperacion: 1_000_000,
    porcentajeComision: 3,
    gastosOperacion: 5000,
    operacionesPorMes: 4,
    costosFijos: 20_000,
    capitalInvertido: 80_000,
  });
  assert.equal(intermediarios.comisionPorOperacion, 30_000);
  assert.equal(intermediarios.gananciaNetaMensual, 80_000);
  assert.equal(intermediarios.recuperoCapital, 1);
});
