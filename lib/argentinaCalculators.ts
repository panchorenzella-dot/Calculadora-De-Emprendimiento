import { nonNegative, nonNegativeInteger, percentage } from "./calculations/core";

export const IVA_RATES = [2.5, 5, 10.5, 21, 27] as const;

export function calculateIvaMonthly(input: {
  sales: Record<string, number>;
  purchases: Record<string, number>;
  previousTechnicalBalance: number;
  withholdings: number;
  perceptions: number;
  paymentsOnAccount: number;
  previousFreeBalance: number;
}) {
  const calculateByRate = (entries: [string, number][]) => Object.fromEntries(
    entries.map(([rate, amount]) => {
      const safeRate = percentage(Number(rate), 100);
      return [rate, nonNegative(amount) * safeRate / 100];
    }),
  );
  const debitByRate = calculateByRate(Object.entries(input.sales));
  const creditByRate = calculateByRate(Object.entries(input.purchases));
  const taxDebit = Object.values(debitByRate).reduce((total, value) => total + value, 0);
  const taxCredit = Object.values(creditByRate).reduce((total, value) => total + value, 0);
  const technicalResult = taxDebit - taxCredit - nonNegative(input.previousTechnicalBalance);
  const determinedTax = Math.max(technicalResult, 0);
  const newTechnicalBalance = Math.max(-technicalResult, 0);
  const freeCredits = nonNegative(input.withholdings) + nonNegative(input.perceptions)
    + nonNegative(input.paymentsOnAccount) + nonNegative(input.previousFreeBalance);
  const finalResult = determinedTax - freeCredits;

  return {
    debitByRate,
    creditByRate,
    taxDebit,
    taxCredit,
    determinedTax,
    newTechnicalBalance,
    freeCredits,
    taxToPay: Math.max(finalResult, 0),
    newFreeBalance: Math.max(-finalResult, 0),
  };
}

export function calculateProductIva(input: {
  amount: number;
  rate: number;
  quantity: number;
  mode: "add" | "extract";
}) {
  const amount = nonNegative(input.amount);
  const rate = percentage(input.rate, 100);
  const factor = 1 + rate / 100;
  const netUnit = input.mode === "add" ? amount : amount / factor;
  const totalUnit = input.mode === "add" ? amount * factor : amount;
  const ivaUnit = totalUnit - netUnit;
  const quantity = nonNegativeInteger(input.quantity);

  return {
    netUnit,
    ivaUnit,
    totalUnit,
    netTotal: netUnit * quantity,
    ivaTotal: ivaUnit * quantity,
    grandTotal: totalUnit * quantity,
  };
}

export function calculateIibb(input: {
  taxableRevenue: number;
  rate: number;
  minimumTax: number;
  withholdings: number;
  perceptions: number;
  bankCollections: number;
  previousBalance: number;
}) {
  const taxableRevenue = nonNegative(input.taxableRevenue);
  const rate = percentage(input.rate, 100);
  const minimumTax = nonNegative(input.minimumTax);
  const calculatedTax = taxableRevenue * rate / 100;
  const determinedTax = taxableRevenue > 0
    ? Math.max(calculatedTax, minimumTax)
    : 0;
  const credits = nonNegative(input.withholdings) + nonNegative(input.perceptions)
    + nonNegative(input.bankCollections) + nonNegative(input.previousBalance);
  const finalResult = determinedTax - credits;

  return {
    calculatedTax,
    determinedTax,
    credits,
    taxToPay: Math.max(finalResult, 0),
    balanceInFavor: Math.max(-finalResult, 0),
    effectiveRate: taxableRevenue > 0 ? determinedTax / taxableRevenue * 100 : 0,
  };
}

export function calculateLaborCost(input: {
  grossSalary: number;
  socialSecurityRate: number;
  healthInsuranceRate: number;
  artRate: number;
  artFixed: number;
  collectiveAgreementRate: number;
  lifeInsurance: number;
  otherCosts: number;
  vacationDays: number;
}) {
  const grossSalary = nonNegative(input.grossSalary);
  const socialSecurityRate = percentage(input.socialSecurityRate, 100);
  const healthInsuranceRate = percentage(input.healthInsuranceRate, 100);
  const artRate = percentage(input.artRate, 100);
  const collectiveAgreementRate = percentage(input.collectiveAgreementRate, 100);
  const artFixed = nonNegative(input.artFixed);
  const lifeInsurance = nonNegative(input.lifeInsurance);
  const otherCosts = nonNegative(input.otherCosts);
  const vacationDays = Math.min(nonNegativeInteger(input.vacationDays), 365);
  const socialSecurity = grossSalary * socialSecurityRate / 100;
  const healthInsurance = grossSalary * healthInsuranceRate / 100;
  const artVariable = grossSalary * artRate / 100;
  const collectiveAgreement = grossSalary * collectiveAgreementRate / 100;
  const monthlyCashCost = grossSalary + socialSecurity + healthInsurance + artVariable
    + artFixed + collectiveAgreement + lifeInsurance + otherCosts;
  const sacProvision = grossSalary / 12;
  const sacCharges = sacProvision * (
    socialSecurityRate + healthInsuranceRate + artRate + collectiveAgreementRate
  ) / 100;
  const vacationPlusProvision = vacationDays > 0
    ? grossSalary * vacationDays * (1 / 25 - 1 / 30) / 12
    : 0;
  const annualizedMonthlyCost = monthlyCashCost + sacProvision + sacCharges + vacationPlusProvision;

  return {
    socialSecurity,
    healthInsurance,
    artVariable,
    collectiveAgreement,
    monthlyCashCost,
    sacProvision,
    sacCharges,
    vacationPlusProvision,
    annualizedMonthlyCost,
    extraOverGross: grossSalary > 0 ? annualizedMonthlyCost - grossSalary : 0,
    extraRate: grossSalary > 0 ? (annualizedMonthlyCost / grossSalary - 1) * 100 : 0,
  };
}
