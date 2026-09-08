import { finiteNumber, nonNegative, nonNegativeInteger, safePower } from "./core";

export type CompoundingFrequency = "annual" | "monthly" | "daily";

const PERIODS_PER_YEAR: Record<CompoundingFrequency, number> = {
  annual: 1,
  monthly: 12,
  daily: 365,
};

// Protect the browser from accidental multi-million-iteration simulations.
export const MAX_SIMULATION_MONTHS = 1_200;

function simulationMonths(value: number) {
  return Math.min(nonNegativeInteger(value), MAX_SIMULATION_MONTHS);
}

function annualRate(value: number) {
  // 10,000% still supports stress testing while avoiding overflow from pasted junk.
  return Math.min(nonNegative(value), 10_000);
}

export function calculateCompoundBalance(input: {
  initialInvestment: number;
  monthlyContribution: number;
  years: number;
  annualRatePct: number;
  frequency: CompoundingFrequency;
}) {
  const initialInvestment = nonNegative(input.initialInvestment);
  const monthlyContribution = nonNegative(input.monthlyContribution);
  const months = simulationMonths(nonNegative(input.years) * 12);
  const annualRatePct = annualRate(input.annualRatePct);
  const periodsPerYear = PERIODS_PER_YEAR[input.frequency] ?? PERIODS_PER_YEAR.monthly;
  const ratePerPeriod = annualRatePct / 100 / periodsPerYear;
  const monthlyRate = safePower(1 + ratePerPeriod, periodsPerYear / 12, 1) - 1;
  let balance = initialInvestment;

  for (let month = 0; month < months; month += 1) {
    balance = finiteNumber(balance * (1 + monthlyRate) + monthlyContribution);
  }

  return balance;
}

export function calculateCompoundInterest(input: {
  initialInvestment: number;
  monthlyContribution: number;
  years: number;
  annualRatePct: number;
  frequency: CompoundingFrequency;
}) {
  const annualRatePct = annualRate(input.annualRatePct);
  const conservativeRatePct = Math.max(0, annualRatePct - 5);
  const optimisticRatePct = annualRatePct + 5;
  const months = simulationMonths(nonNegative(input.years) * 12);
  const futureValue = calculateCompoundBalance({ ...input, annualRatePct });
  const totalContributed = nonNegative(input.initialInvestment)
    + nonNegative(input.monthlyContribution) * months;
  const earnedInterest = futureValue - totalContributed;

  return {
    futureValue,
    totalContributed,
    earnedInterest,
    totalReturnPct: totalContributed > 0 ? earnedInterest / totalContributed * 100 : 0,
    months,
    conservativeScenario: calculateCompoundBalance({ ...input, annualRatePct: conservativeRatePct }),
    estimatedScenario: futureValue,
    optimisticScenario: calculateCompoundBalance({ ...input, annualRatePct: optimisticRatePct }),
    conservativeRatePct,
    estimatedRatePct: annualRatePct,
    optimisticRatePct,
  };
}

export type MonthlyContributionSimulation = {
  finalBalance: number;
  totalInvested: number;
  generatedReturn: number;
  totalReturnPct: number;
  contributionsMade: number;
  averageContribution: number;
  lastMonthlyContribution: number;
};

export function simulateMonthlyContributions(input: {
  initialCapital: number;
  monthlyContribution: number;
  months: number;
  annualRatePct: number;
  annualContributionIncreasePct: number;
}): MonthlyContributionSimulation {
  const initialCapital = nonNegative(input.initialCapital);
  const firstContribution = nonNegative(input.monthlyContribution);
  const months = simulationMonths(input.months);
  const annualRatePct = annualRate(input.annualRatePct);
  const annualContributionIncreasePct = annualRate(input.annualContributionIncreasePct);
  const monthlyRate = safePower(1 + annualRatePct / 100, 1 / 12, 1) - 1;
  const annualIncrease = annualContributionIncreasePct / 100;
  let balance = initialCapital;
  let currentContribution = firstContribution;
  let monthlyContributionsTotal = 0;
  let lastMonthlyContribution = 0;

  for (let month = 1; month <= months; month += 1) {
    balance = finiteNumber(balance * (1 + monthlyRate) + currentContribution);
    monthlyContributionsTotal = finiteNumber(monthlyContributionsTotal + currentContribution);
    lastMonthlyContribution = currentContribution;

    if (month % 12 === 0) {
      currentContribution = finiteNumber(currentContribution * (1 + annualIncrease));
    }
  }

  const totalInvested = initialCapital + monthlyContributionsTotal;
  const generatedReturn = balance - totalInvested;

  return {
    finalBalance: balance,
    totalInvested,
    generatedReturn,
    totalReturnPct: totalInvested > 0 ? generatedReturn / totalInvested * 100 : 0,
    contributionsMade: months,
    averageContribution: months > 0 ? monthlyContributionsTotal / months : 0,
    lastMonthlyContribution,
  };
}

export function calculateMonthlyContribution(input: {
  initialCapital: number;
  monthlyContribution: number;
  years: number;
  annualRatePct: number;
  annualContributionIncreasePct: number;
}) {
  const annualRatePct = annualRate(input.annualRatePct);
  const conservativeRatePct = Math.max(0, annualRatePct - 5);
  const optimisticRatePct = annualRatePct + 5;
  const months = simulationMonths(nonNegative(input.years) * 12);
  const simulationInput = {
    initialCapital: input.initialCapital,
    monthlyContribution: input.monthlyContribution,
    months,
    annualContributionIncreasePct: input.annualContributionIncreasePct,
  };
  const estimated = simulateMonthlyContributions({ ...simulationInput, annualRatePct });

  return {
    ...estimated,
    conservativeScenario: simulateMonthlyContributions({
      ...simulationInput,
      annualRatePct: conservativeRatePct,
    }).finalBalance,
    estimatedScenario: estimated.finalBalance,
    optimisticScenario: simulateMonthlyContributions({
      ...simulationInput,
      annualRatePct: optimisticRatePct,
    }).finalBalance,
    conservativeRatePct,
    estimatedRatePct: annualRatePct,
    optimisticRatePct,
  };
}

export function calculateRequiredMonthlySaving(input: {
  target: number;
  initialSavings: number;
  months: number;
  annualRatePct: number;
  annualContributionIncreasePct: number;
}) {
  const target = nonNegative(input.target);
  const initialSavings = nonNegative(input.initialSavings);
  const months = simulationMonths(input.months);

  if (target <= 0 || initialSavings >= target) return 0;
  if (months <= 0) return null;

  const simulate = (monthlyContribution: number) => simulateMonthlyContributions({
    initialCapital: initialSavings,
    monthlyContribution,
    months,
    annualRatePct: input.annualRatePct,
    annualContributionIncreasePct: input.annualContributionIncreasePct,
  });

  if (simulate(0).finalBalance >= target) return 0;

  let low = 0;
  let high = Math.max((target - initialSavings) / months, 1);
  for (let iteration = 0; iteration < 80 && simulate(high).finalBalance < target; iteration += 1) {
    high *= 2;
  }
  for (let iteration = 0; iteration < 100; iteration += 1) {
    const midpoint = (low + high) / 2;
    if (simulate(midpoint).finalBalance >= target) high = midpoint;
    else low = midpoint;
  }
  return finiteNumber(high);
}

export function calculateSavingsGoal(input: {
  target: number;
  initialSavings: number;
  months: number;
  annualRatePct: number;
  annualContributionIncreasePct: number;
}) {
  const target = nonNegative(input.target);
  const initialSavings = nonNegative(input.initialSavings);
  const months = simulationMonths(input.months);
  const requiredMonthlySaving = calculateRequiredMonthlySaving({ ...input, target, initialSavings, months });
  const simulation = simulateMonthlyContributions({
    initialCapital: initialSavings,
    monthlyContribution: requiredMonthlySaving ?? 0,
    months,
    annualRatePct: input.annualRatePct,
    annualContributionIncreasePct: input.annualContributionIncreasePct,
  });
  let status = "Cargá una meta de ahorro";
  if (target > 0 && initialSavings >= target) status = "Ya alcanzaste la meta";
  else if (target > 0 && months <= 0) status = "Necesitás cargar un plazo";
  else if (target > 0 && requiredMonthlySaving !== null) status = "Meta posible con ahorro mensual";

  return {
    requiredMonthlySaving,
    target,
    initialSavings,
    amountRemaining: Math.max(target - initialSavings, 0),
    estimatedFinalValue: simulation.finalBalance,
    totalInvested: simulation.totalInvested,
    monthlyContributionsTotal: simulation.totalInvested - initialSavings,
    generatedReturn: simulation.generatedReturn,
    initialCoveragePct: target > 0 ? initialSavings / target * 100 : 0,
    finalCoveragePct: target > 0 ? simulation.finalBalance / target * 100 : 0,
    lastMonthlyContribution: simulation.lastMonthlyContribution,
    months,
    status,
  };
}

export function calculateInvestmentReturn(input: {
  initialInvestment: number;
  finalValue: number;
  extraCosts: number;
  months: number;
}) {
  const initialInvestment = nonNegative(input.initialInvestment);
  const finalValue = nonNegative(input.finalValue);
  const extraCosts = nonNegative(input.extraCosts);
  const months = nonNegative(input.months);
  const totalInvested = initialInvestment + extraCosts;
  const netProfit = finalValue - totalInvested;
  const totalRoiPct = totalInvested > 0 ? netProfit / totalInvested * 100 : 0;
  const ratio = totalInvested > 0 ? finalValue / totalInvested : 0;
  const monthlyReturnPct = totalInvested > 0 && months > 0
    ? (safePower(ratio, 1 / months) - 1) * 100
    : 0;
  const annualizedReturnPct = totalInvested > 0 && months > 0
    ? (safePower(1 + monthlyReturnPct / 100, 12) - 1) * 100
    : 0;

  return {
    totalInvested,
    netProfit,
    totalRoiPct,
    monthlyReturnPct,
    annualizedReturnPct,
    months,
    status: netProfit > 0 ? "Ganaste plata" : netProfit < 0 ? "Perdiste plata" : "Saliste empatado",
  };
}

export function calculateRealReturn(input: {
  initialAmount: number;
  finalAmount: number;
  inflationPct: number;
  extraCosts: number;
  months: number;
}) {
  const initialAmount = nonNegative(input.initialAmount);
  const finalAmount = nonNegative(input.finalAmount);
  const inflationPct = Math.min(nonNegative(input.inflationPct), 1_000_000);
  const extraCosts = nonNegative(input.extraCosts);
  const months = nonNegative(input.months);
  const totalInvested = initialAmount + extraCosts;
  const nominalProfit = finalAmount - totalInvested;
  const nominalReturnPct = totalInvested > 0 ? nominalProfit / totalInvested * 100 : 0;
  const realReturnDecimal = (1 + nominalReturnPct / 100) / (1 + inflationPct / 100) - 1;
  const realReturnPct = realReturnDecimal * 100;
  const inflationAdjustedFinalAmount = finalAmount / (1 + inflationPct / 100);
  const inflationAdjustedProfit = inflationAdjustedFinalAmount - totalInvested;
  const monthlyRealReturnPct = months > 0 && realReturnDecimal > -1
    ? (safePower(1 + realReturnDecimal, 1 / months) - 1) * 100
    : 0;
  const annualizedRealReturnPct = months > 0 && realReturnDecimal > -1
    ? (safePower(1 + monthlyRealReturnPct / 100, 12) - 1) * 100
    : 0;
  let status = "Cargá los datos para calcular";
  if (totalInvested > 0) {
    status = realReturnPct > 0
      ? "Ganaste poder de compra"
      : realReturnPct < 0
        ? "Perdiste poder de compra"
        : "Empataste contra la inflación";
  }

  return {
    totalInvested,
    nominalProfit,
    nominalReturnPct,
    realReturnPct,
    inflationAdjustedProfit,
    inflationAdjustedFinalAmount,
    inflationPct,
    monthlyRealReturnPct,
    annualizedRealReturnPct,
    months,
    status,
  };
}

export function calculateCapitalRecovery(input: {
  initialInvestment: number;
  monthlyNetProfit: number;
  analysisMonths: number;
}) {
  const initialInvestment = nonNegative(input.initialInvestment);
  const monthlyNetProfit = nonNegative(input.monthlyNetProfit);
  const analysisMonths = nonNegative(input.analysisMonths);
  const accumulatedProfit = monthlyNetProfit * analysisMonths;
  const recoveredCapital = Math.min(accumulatedProfit, initialInvestment);
  const pendingCapital = Math.max(initialInvestment - accumulatedProfit, 0);
  const recoveredPct = initialInvestment > 0 ? recoveredCapital / initialInvestment * 100 : 0;
  const monthsToRecover = monthlyNetProfit > 0 && initialInvestment > 0
    ? initialInvestment / monthlyNetProfit
    : null;
  const recoversWithinPeriod = monthsToRecover !== null && monthsToRecover <= analysisMonths;
  const profitAfterRecovery = Math.max(accumulatedProfit - initialInvestment, 0);
  let status = "Cargá una inversión y una ganancia mensual";
  if (initialInvestment === 0) status = "No hay inversión inicial cargada";
  else if (monthlyNetProfit === 0) status = "No se recupera con ganancia mensual cero";
  else if (recoversWithinPeriod) status = "Recuperás la inversión dentro del período";
  else status = "Todavía falta recuperar capital";

  return {
    monthsToRecover,
    accumulatedProfit,
    recoveredCapital,
    pendingCapital,
    recoveredPct,
    profitAfterRecovery,
    status,
    recoversWithinPeriod,
    analysisMonths,
  };
}

// Thin, typed adapters keep the existing Spanish UI models stable while every
// calculator consumes the same audited formulas above.
export function calculateAporteMensual(input: {
  capitalInicial: number;
  aporteMensual: number;
  anos: number;
  rendimientoAnual: number;
  aumentoAnualAporte: number;
}) {
  const result = calculateMonthlyContribution({
    initialCapital: input.capitalInicial,
    monthlyContribution: input.aporteMensual,
    years: input.anos,
    annualRatePct: input.rendimientoAnual,
    annualContributionIncreasePct: input.aumentoAnualAporte,
  });
  return {
    capitalFinal: result.finalBalance,
    totalInvertido: result.totalInvested,
    gananciaGenerada: result.generatedReturn,
    rendimientoTotal: result.totalReturnPct,
    aportesRealizados: result.contributionsMade,
    aportePromedio: result.averageContribution,
    ultimoAporteMensual: result.lastMonthlyContribution,
    escenarioConservador: result.conservativeScenario,
    escenarioEstimado: result.estimatedScenario,
    escenarioOptimista: result.optimisticScenario,
    tasaConservadora: result.conservativeRatePct,
    tasaEstimada: result.estimatedRatePct,
    tasaOptimista: result.optimisticRatePct,
  };
}

export function calculateInteresCompuesto(input: {
  inversionInicial: number;
  aporteMensual: number;
  anos: number;
  tasaAnual: number;
  frecuencia: CompoundingFrequency;
}) {
  const result = calculateCompoundInterest({
    initialInvestment: input.inversionInicial,
    monthlyContribution: input.aporteMensual,
    years: input.anos,
    annualRatePct: input.tasaAnual,
    frequency: input.frecuencia,
  });
  return {
    valorFuturo: result.futureValue,
    totalAportado: result.totalContributed,
    interesGanado: result.earnedInterest,
    rendimientoTotal: result.totalReturnPct,
    mesesTotales: result.months,
    escenarioConservador: result.conservativeScenario,
    escenarioEstimado: result.estimatedScenario,
    escenarioOptimista: result.optimisticScenario,
    tasaConservadora: result.conservativeRatePct,
    tasaEstimada: result.estimatedRatePct,
    tasaOptimista: result.optimisticRatePct,
  };
}

export function calculateMetaAhorro(input: {
  metaAhorro: number;
  ahorroInicial: number;
  meses: number;
  rendimientoAnual: number;
  aumentoAnualAporte: number;
}) {
  const result = calculateSavingsGoal({
    target: input.metaAhorro,
    initialSavings: input.ahorroInicial,
    months: input.meses,
    annualRatePct: input.rendimientoAnual,
    annualContributionIncreasePct: input.aumentoAnualAporte,
  });
  return {
    ahorroMensualNecesario: result.requiredMonthlySaving,
    metaAhorro: result.target,
    ahorroInicial: result.initialSavings,
    montoFaltaJuntar: result.amountRemaining,
    valorFinalEstimado: result.estimatedFinalValue,
    totalAportado: result.totalInvested,
    aportesMensualesTotales: result.monthlyContributionsTotal,
    rendimientoGenerado: result.generatedReturn,
    porcentajeCubiertoInicial: result.initialCoveragePct,
    porcentajeMetaFinal: result.finalCoveragePct,
    ultimoAporteMensual: result.lastMonthlyContribution,
    meses: result.months,
    estado: result.status,
  };
}

export function calculateRoiInversion(input: {
  inversionInicial: number;
  valorFinal: number;
  costosExtra: number;
  meses: number;
}) {
  const result = calculateInvestmentReturn({
    initialInvestment: input.inversionInicial,
    finalValue: input.valorFinal,
    extraCosts: input.costosExtra,
    months: input.meses,
  });
  return {
    totalInvertidoReal: result.totalInvested,
    gananciaNeta: result.netProfit,
    roiTotal: result.totalRoiPct,
    rendimientoMensual: result.monthlyReturnPct,
    rendimientoAnualizado: result.annualizedReturnPct,
    meses: result.months,
    estado: result.status,
  };
}

export function calculateRendimientoReal(input: {
  montoInicial: number;
  montoFinal: number;
  inflacionPeriodo: number;
  costosExtra: number;
  meses: number;
}) {
  const result = calculateRealReturn({
    initialAmount: input.montoInicial,
    finalAmount: input.montoFinal,
    inflationPct: input.inflacionPeriodo,
    extraCosts: input.costosExtra,
    months: input.meses,
  });
  return {
    totalInvertidoReal: result.totalInvested,
    gananciaNominal: result.nominalProfit,
    rendimientoNominal: result.nominalReturnPct,
    rendimientoReal: result.realReturnPct,
    gananciaRealAjustada: result.inflationAdjustedProfit,
    montoFinalAjustado: result.inflationAdjustedFinalAmount,
    inflacionCargada: result.inflationPct,
    rendimientoMensualReal: result.monthlyRealReturnPct,
    rendimientoAnualizadoReal: result.annualizedRealReturnPct,
    meses: result.months,
    estado: result.status,
  };
}

export function calculateRecuperoCapital(input: {
  inversionInicial: number;
  gananciaMensualNeta: number;
  mesesAnalisis: number;
}) {
  const result = calculateCapitalRecovery({
    initialInvestment: input.inversionInicial,
    monthlyNetProfit: input.gananciaMensualNeta,
    analysisMonths: input.mesesAnalisis,
  });
  return {
    mesesParaRecuperar: result.monthsToRecover,
    gananciaAcumulada: result.accumulatedProfit,
    capitalRecuperado: result.recoveredCapital,
    capitalPendiente: result.pendingCapital,
    porcentajeRecuperado: result.recoveredPct,
    gananciaDespuesDeRecuperar: result.profitAfterRecovery,
    estado: result.status,
    recuperaDentroDelPeriodo: result.recoversWithinPeriod,
    mesesAnalisis: result.analysisMonths,
  };
}
