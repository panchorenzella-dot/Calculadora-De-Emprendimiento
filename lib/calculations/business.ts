import { finiteNumber, nonNegative, safeDivide } from "./core";

export type UnitEconomicsInput = {
  unitPrice: number;
  unitCosts: readonly number[];
  unitsPerMonth?: number;
  unitsPerDay?: number;
  operatingDays?: number;
  fixedCosts?: number;
  investedCapital?: number;
};

export type UnitEconomicsResult = {
  unitCost: number;
  contributionPerUnit: number;
  marginPct: number;
  markupPct: number;
  unitsPerMonth: number;
  monthlyRevenue: number;
  monthlyVariableCosts: number;
  monthlyGrossProfit: number;
  monthlyNetProfit: number;
  breakEvenUnits: number | null;
  breakEvenUnitsPerDay: number | null;
  capitalRecoveryMonths: number | null;
  monthlyRoiPct: number | null;
};

/** Shared unit-economics engine used by product, food and production calculators. */
export function calculateUnitEconomics(input: UnitEconomicsInput): UnitEconomicsResult {
  const unitPrice = nonNegative(input.unitPrice);
  const unitCosts = input.unitCosts.map(nonNegative);
  const unitCost = unitCosts.reduce((total, cost) => total + cost, 0);
  const fixedCosts = nonNegative(input.fixedCosts ?? 0);
  const investedCapital = nonNegative(input.investedCapital ?? 0);
  const operatingDays = nonNegative(input.operatingDays ?? 0);
  const unitsPerMonth = input.unitsPerMonth === undefined
    ? nonNegative(input.unitsPerDay ?? 0) * operatingDays
    : nonNegative(input.unitsPerMonth);
  const contributionPerUnit = finiteNumber(unitPrice - unitCost);
  const marginPct = unitPrice > 0 ? safeDivide(contributionPerUnit, unitPrice) * 100 : 0;
  const markupPct = unitCost > 0 ? safeDivide(contributionPerUnit, unitCost) * 100 : 0;
  const monthlyRevenue = unitPrice * unitsPerMonth;
  const monthlyVariableCosts = unitCost * unitsPerMonth;
  const monthlyGrossProfit = monthlyRevenue - monthlyVariableCosts;
  const monthlyNetProfit = monthlyGrossProfit - fixedCosts;
  const breakEvenUnits = contributionPerUnit > 0 ? fixedCosts / contributionPerUnit : null;
  const breakEvenUnitsPerDay = breakEvenUnits !== null && operatingDays > 0
    ? breakEvenUnits / operatingDays
    : null;
  const capitalRecoveryMonths = investedCapital > 0 && monthlyNetProfit > 0
    ? investedCapital / monthlyNetProfit
    : null;
  const monthlyRoiPct = investedCapital > 0
    ? monthlyNetProfit / investedCapital * 100
    : null;

  return {
    unitCost,
    contributionPerUnit,
    marginPct,
    markupPct,
    unitsPerMonth,
    monthlyRevenue,
    monthlyVariableCosts,
    monthlyGrossProfit,
    monthlyNetProfit,
    breakEvenUnits,
    breakEvenUnitsPerDay,
    capitalRecoveryMonths,
    monthlyRoiPct,
  };
}

export function calculateBreakEven(input: {
  fixedCosts: number;
  unitPrice: number;
  unitVariableCost: number;
  estimatedUnits?: number;
}) {
  const fixedCosts = nonNegative(input.fixedCosts);
  const unitPrice = nonNegative(input.unitPrice);
  const unitVariableCost = nonNegative(input.unitVariableCost);
  const estimatedUnits = nonNegative(input.estimatedUnits ?? 0);
  const contributionPerUnit = unitPrice - unitVariableCost;
  const profitable = contributionPerUnit > 0;
  const breakEvenUnits = profitable ? fixedCosts / contributionPerUnit : 0;

  return {
    fixedCosts,
    unitPrice,
    unitVariableCost,
    estimatedUnits,
    contributionPerUnit,
    contributionMarginPct: unitPrice > 0 ? contributionPerUnit / unitPrice * 100 : 0,
    breakEvenUnits,
    breakEvenRevenue: profitable ? breakEvenUnits * unitPrice : 0,
    estimatedProfit: estimatedUnits > 0 ? estimatedUnits * contributionPerUnit - fixedCosts : 0,
    profitable,
  };
}

export type MarkupPricingInput = {
  productCost: number;
  targetMarkupPct: number;
  salePrice?: number;
  unitsPerMonth?: number;
  extraUnitCosts?: number;
  monthlyFixedCosts?: number;
  commissionPct?: number;
  taxPct?: number;
  mode: "from-markup" | "from-price";
};

export function calculateMarkupPricing(input: MarkupPricingInput) {
  const productCost = nonNegative(input.productCost);
  const unitsPerMonth = nonNegative(input.unitsPerMonth ?? 0);
  const extraUnitCosts = nonNegative(input.extraUnitCosts ?? 0);
  const monthlyFixedCosts = nonNegative(input.monthlyFixedCosts ?? 0);
  const targetMarkupPct = nonNegative(input.targetMarkupPct);
  const chargePct = nonNegative(input.commissionPct ?? 0) + nonNegative(input.taxPct ?? 0);
  const chargeRate = Math.min(chargePct / 100, 0.999999);
  const variableUnitCost = productCost + extraUnitCosts;
  const fixedCostPerUnit = unitsPerMonth > 0 ? monthlyFixedCosts / unitsPerMonth : 0;
  const totalUnitCost = variableUnitCost + fixedCostPerUnit;
  const targetNetRevenue = totalUnitCost * (1 + targetMarkupPct / 100);
  const calculatedPrice = input.mode === "from-markup"
    ? targetNetRevenue / (1 - chargeRate)
    : nonNegative(input.salePrice ?? 0);
  const chargesPerSale = calculatedPrice * chargeRate;
  const profitPerUnit = calculatedPrice - chargesPerSale - totalUnitCost;
  const contributionPerUnit = calculatedPrice - chargesPerSale - variableUnitCost;

  return {
    calculatedPrice,
    variableUnitCost,
    fixedCostPerUnit,
    totalUnitCost,
    chargesPerSale,
    profitPerUnit,
    actualMarkupPct: totalUnitCost > 0 ? profitPerUnit / totalUnitCost * 100 : 0,
    marginPct: calculatedPrice > 0 ? profitPerUnit / calculatedPrice * 100 : 0,
    monthlyCost: variableUnitCost * unitsPerMonth + monthlyFixedCosts,
    monthlyCharges: chargesPerSale * unitsPerMonth,
    monthlyRevenue: calculatedPrice * unitsPerMonth,
    monthlyProfit: profitPerUnit * unitsPerMonth,
    breakEvenUnits: monthlyFixedCosts > 0 && contributionPerUnit > 0
      ? Math.ceil(monthlyFixedCosts / contributionPerUnit)
      : null,
    chargePct,
  };
}

export function calculateRoi(input: {
  initialInvestment: number;
  generatedRevenue: number;
  totalCosts: number;
  finalValue: number;
}) {
  const initialInvestment = nonNegative(input.initialInvestment);
  const generatedRevenue = nonNegative(input.generatedRevenue);
  const totalCosts = nonNegative(input.totalCosts);
  const finalValue = nonNegative(input.finalValue);
  const netProfit = generatedRevenue + finalValue - initialInvestment - totalCosts;

  return {
    netProfit,
    roiPct: initialInvestment > 0 ? netProfit / initialInvestment * 100 : 0,
    grossReturn: finalValue - initialInvestment,
    returnMarginPct: finalValue > 0 ? netProfit / finalValue * 100 : 0,
  };
}

export type BusinessMarginInput = {
  unitsPerDay: number;
  operatingDays: number;
  unitPrice: number;
  costMode: "pct" | "abs";
  costPct?: number;
  unitCost?: number;
  monthlyFixedCosts: number;
  initialInvestment: number;
  vatMode: "incluido" | "no_incluido";
  vatRatePct?: number;
};

/**
 * Complete monthly margin model used by both the API route and its tests.
 * When VAT is included in the displayed price, contribution and break-even
 * are calculated from the net-of-VAT price so tax collected is never treated
 * as business income.
 */
export function calculateBusinessMargin(input: BusinessMarginInput) {
  const unitsPerDay = nonNegative(input.unitsPerDay);
  const operatingDays = Math.min(nonNegative(input.operatingDays), 31);
  const unitPrice = nonNegative(input.unitPrice);
  const monthlyFixedCosts = nonNegative(input.monthlyFixedCosts);
  const initialInvestment = nonNegative(input.initialInvestment);
  const vatRatePct = Math.min(nonNegative(input.vatRatePct ?? 21), 100);
  const vatFactor = 1 + vatRatePct / 100;
  const unitsPerMonth = unitsPerDay * operatingDays;
  const grossUnitPrice = unitPrice;
  const netUnitPrice = input.vatMode === "incluido"
    ? safeDivide(grossUnitPrice, vatFactor)
    : grossUnitPrice;
  const unitCost = input.costMode === "pct"
    ? grossUnitPrice * Math.min(nonNegative(input.costPct ?? 0), 100) / 100
    : nonNegative(input.unitCost ?? 0);
  const grossRevenue = unitsPerMonth * grossUnitPrice;
  const netRevenue = unitsPerMonth * netUnitPrice;
  const monthlyVariableCosts = unitsPerMonth * unitCost;
  const contributionPerUnit = netUnitPrice - unitCost;
  const monthlyGrossProfit = netRevenue - monthlyVariableCosts;
  const monthlyNetProfit = monthlyGrossProfit - monthlyFixedCosts;
  const breakEvenUnits = contributionPerUnit > 0
    ? Math.ceil(monthlyFixedCosts / contributionPerUnit)
    : null;
  const paybackMonths = initialInvestment > 0 && monthlyNetProfit > 0
    ? initialInvestment / monthlyNetProfit
    : null;
  const annualRoiPct = initialInvestment > 0 && monthlyNetProfit > 0
    ? monthlyNetProfit * 12 / initialInvestment * 100
    : null;

  return {
    unitsPerMonth,
    grossRevenue,
    netRevenue,
    grossUnitPrice,
    netUnitPrice,
    unitCost,
    monthlyVariableCosts,
    contributionPerUnit,
    monthlyGrossProfit,
    monthlyNetProfit,
    breakEvenUnits,
    paybackMonths,
    annualRoiPct,
    vatFactor,
  };
}

export function calculateBrokerage(input: {
  operationValue: number;
  commissionPct: number;
  operationCosts: number;
  operationsPerMonth: number;
  fixedCosts: number;
  investedCapital?: number;
}) {
  const operationValue = nonNegative(input.operationValue);
  const commissionPct = nonNegative(input.commissionPct);
  const operationCosts = nonNegative(input.operationCosts);
  const operationsPerMonth = nonNegative(input.operationsPerMonth);
  const fixedCosts = nonNegative(input.fixedCosts);
  const investedCapital = nonNegative(input.investedCapital ?? 0);
  const commissionPerOperation = operationValue * commissionPct / 100;
  const profitPerOperation = commissionPerOperation - operationCosts;
  const monthlyGrossRevenue = commissionPerOperation * operationsPerMonth;
  const monthlyVariableCosts = operationCosts * operationsPerMonth;
  const monthlyNetProfit = monthlyGrossRevenue - monthlyVariableCosts - fixedCosts;

  return {
    commissionPerOperation,
    profitPerOperation,
    monthlyGrossRevenue,
    monthlyVariableCosts,
    monthlyNetProfit,
    breakEvenOperations: profitPerOperation > 0 ? fixedCosts / profitPerOperation : null,
    capitalRecoveryMonths: investedCapital > 0 && monthlyNetProfit > 0
      ? investedCapital / monthlyNetProfit
      : null,
    monthlyRoiPct: investedCapital > 0 ? monthlyNetProfit / investedCapital * 100 : null,
  };
}

export function calculateCafeteria(input: {
  costoPedido: number;
  otrosGastos: number;
  ticketPromedio: number;
  clientesPorDia: number;
  diasAbiertos: number;
  costosFijos: number;
}) {
  const result = calculateUnitEconomics({
    unitPrice: input.ticketPromedio,
    unitCosts: [input.costoPedido, input.otrosGastos],
    unitsPerDay: input.clientesPorDia,
    operatingDays: input.diasAbiertos,
    fixedCosts: input.costosFijos,
  });
  return {
    costoPedido: nonNegative(input.costoPedido),
    costoTotalPedido: result.unitCost,
    gananciaPorPedido: result.contributionPerUnit,
    margenGanancia: result.marginPct,
    clientesPorMes: result.unitsPerMonth,
    ventasMensuales: result.monthlyRevenue,
    costoVariableMensual: result.monthlyVariableCosts,
    gananciaBrutaMensual: result.monthlyGrossProfit,
    gananciaNetaMensual: result.monthlyNetProfit,
    puntoEquilibrioMensual: result.breakEvenUnits,
    puntoEquilibrioDiario: result.breakEvenUnitsPerDay,
  };
}

export function calculateHamburgueseria(input: {
  costoHamburguesa: number;
  otrosGastos: number;
  precioVenta: number;
  hamburguesasPorDia: number;
  diasAbiertos: number;
  costosFijos: number;
}) {
  const result = calculateUnitEconomics({
    unitPrice: input.precioVenta,
    unitCosts: [input.costoHamburguesa, input.otrosGastos],
    unitsPerDay: input.hamburguesasPorDia,
    operatingDays: input.diasAbiertos,
    fixedCosts: input.costosFijos,
  });
  return {
    costoHamburguesa: nonNegative(input.costoHamburguesa),
    costoTotalUnitario: result.unitCost,
    gananciaPorUnidad: result.contributionPerUnit,
    margenGanancia: result.marginPct,
    hamburguesasPorMes: result.unitsPerMonth,
    ventasMensuales: result.monthlyRevenue,
    costoVariableMensual: result.monthlyVariableCosts,
    gananciaBrutaMensual: result.monthlyGrossProfit,
    gananciaNetaMensual: result.monthlyNetProfit,
    puntoEquilibrioMensual: result.breakEvenUnits,
    puntoEquilibrioDiario: result.breakEvenUnitsPerDay,
  };
}

export function calculateProduccion(input: {
  costoProduccion: number;
  packaging: number;
  otrosGastos: number;
  precioVenta: number;
  unidadesPorDia: number;
  diasProduccion: number;
  costosFijos: number;
}) {
  const result = calculateUnitEconomics({
    unitPrice: input.precioVenta,
    unitCosts: [input.costoProduccion, input.packaging, input.otrosGastos],
    unitsPerDay: input.unidadesPorDia,
    operatingDays: input.diasProduccion,
    fixedCosts: input.costosFijos,
  });
  return {
    costoProduccion: nonNegative(input.costoProduccion),
    packaging: nonNegative(input.packaging),
    otrosGastos: nonNegative(input.otrosGastos),
    costoTotalUnitario: result.unitCost,
    gananciaPorUnidad: result.contributionPerUnit,
    margenGanancia: result.marginPct,
    unidadesPorMes: result.unitsPerMonth,
    ventasMensuales: result.monthlyRevenue,
    costoVariableMensual: result.monthlyVariableCosts,
    gananciaBrutaMensual: result.monthlyGrossProfit,
    gananciaNetaMensual: result.monthlyNetProfit,
    puntoEquilibrioMensual: result.breakEvenUnits,
    puntoEquilibrioDiario: result.breakEvenUnitsPerDay,
  };
}

export function calculateDistribuidora(input: {
  costoCompra: number;
  precioVenta: number;
  otrosGastos: number;
  unidadesPorDia: number;
  diasVenta: number;
  costosFijos: number;
  capitalInvertido: number;
}) {
  const result = calculateUnitEconomics({
    unitPrice: input.precioVenta,
    unitCosts: [input.costoCompra, input.otrosGastos],
    unitsPerDay: input.unidadesPorDia,
    operatingDays: input.diasVenta,
    fixedCosts: input.costosFijos,
    investedCapital: input.capitalInvertido,
  });
  return {
    gananciaPorUnidad: result.contributionPerUnit,
    margenGanancia: result.marginPct,
    markup: nonNegative(input.costoCompra) > 0
      ? result.contributionPerUnit / nonNegative(input.costoCompra) * 100
      : 0,
    unidadesPorMes: result.unitsPerMonth,
    ventasMensuales: result.monthlyRevenue,
    costoMercaderiaMensual: nonNegative(input.costoCompra) * result.unitsPerMonth,
    otrosGastosMensuales: nonNegative(input.otrosGastos) * result.unitsPerMonth,
    gananciaBrutaMensual: result.monthlyGrossProfit,
    gananciaNetaMensual: result.monthlyNetProfit,
    puntoEquilibrioMensual: result.breakEvenUnits,
    puntoEquilibrioDiario: result.breakEvenUnitsPerDay,
    recuperoCapital: result.capitalRecoveryMonths,
    roiMensual: result.monthlyRoiPct,
  };
}

export function calculateReventa(input: {
  costoCompra: number;
  precioVenta: number;
  gastosVenta: number;
  unidadesVendidasMes: number;
  costosFijos: number;
  capitalInvertido: number;
}) {
  const result = calculateUnitEconomics({
    unitPrice: input.precioVenta,
    unitCosts: [input.costoCompra, input.gastosVenta],
    unitsPerMonth: input.unidadesVendidasMes,
    fixedCosts: input.costosFijos,
    investedCapital: input.capitalInvertido,
  });
  return {
    gananciaPorUnidad: result.contributionPerUnit,
    margenGanancia: result.marginPct,
    markup: nonNegative(input.costoCompra) > 0
      ? result.contributionPerUnit / nonNegative(input.costoCompra) * 100
      : 0,
    unidadesVendidasMes: result.unitsPerMonth,
    ventasMensuales: result.monthlyRevenue,
    costoCompraMensual: nonNegative(input.costoCompra) * result.unitsPerMonth,
    gastosVariablesMensuales: nonNegative(input.gastosVenta) * result.unitsPerMonth,
    gananciaBrutaMensual: result.monthlyGrossProfit,
    gananciaNetaMensual: result.monthlyNetProfit,
    puntoEquilibrioMensual: result.breakEvenUnits,
    recuperoCapital: result.capitalRecoveryMonths,
    roiMensual: result.monthlyRoiPct,
  };
}

export function calculateIntermediarios(input: {
  valorOperacion: number;
  porcentajeComision: number;
  gastosOperacion: number;
  operacionesPorMes: number;
  costosFijos: number;
  capitalInvertido: number;
}) {
  const result = calculateBrokerage({
    operationValue: input.valorOperacion,
    commissionPct: input.porcentajeComision,
    operationCosts: input.gastosOperacion,
    operationsPerMonth: input.operacionesPorMes,
    fixedCosts: input.costosFijos,
    investedCapital: input.capitalInvertido,
  });
  return {
    comisionPorOperacion: result.commissionPerOperation,
    gananciaPorOperacion: result.profitPerOperation,
    ingresoBrutoMensual: result.monthlyGrossRevenue,
    gastosVariablesMensuales: result.monthlyVariableCosts,
    gananciaNetaMensual: result.monthlyNetProfit,
    puntoEquilibrioMensual: result.breakEvenOperations,
    recuperoCapital: result.capitalRecoveryMonths,
    roiMensual: result.monthlyRoiPct,
  };
}
