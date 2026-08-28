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
  const debitByRate = Object.fromEntries(
    Object.entries(input.sales).map(([rate, amount]) => [rate, amount * Number(rate) / 100]),
  );
  const creditByRate = Object.fromEntries(
    Object.entries(input.purchases).map(([rate, amount]) => [rate, amount * Number(rate) / 100]),
  );
  const taxDebit = Object.values(debitByRate).reduce((total, value) => total + value, 0);
  const taxCredit = Object.values(creditByRate).reduce((total, value) => total + value, 0);
  const technicalResult = taxDebit - taxCredit - input.previousTechnicalBalance;
  const determinedTax = Math.max(technicalResult, 0);
  const newTechnicalBalance = Math.max(-technicalResult, 0);
  const freeCredits = input.withholdings + input.perceptions + input.paymentsOnAccount + input.previousFreeBalance;
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
  const factor = 1 + input.rate / 100;
  const netUnit = input.mode === "add" ? input.amount : factor > 0 ? input.amount / factor : input.amount;
  const totalUnit = input.mode === "add" ? input.amount * factor : input.amount;
  const ivaUnit = totalUnit - netUnit;
  const quantity = Math.max(0, input.quantity);

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
  const calculatedTax = input.taxableRevenue * input.rate / 100;
  const determinedTax = input.taxableRevenue > 0
    ? Math.max(calculatedTax, input.minimumTax)
    : 0;
  const credits = input.withholdings + input.perceptions + input.bankCollections + input.previousBalance;
  const finalResult = determinedTax - credits;

  return {
    calculatedTax,
    determinedTax,
    credits,
    taxToPay: Math.max(finalResult, 0),
    balanceInFavor: Math.max(-finalResult, 0),
    effectiveRate: input.taxableRevenue > 0 ? determinedTax / input.taxableRevenue * 100 : 0,
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
  const socialSecurity = input.grossSalary * input.socialSecurityRate / 100;
  const healthInsurance = input.grossSalary * input.healthInsuranceRate / 100;
  const artVariable = input.grossSalary * input.artRate / 100;
  const collectiveAgreement = input.grossSalary * input.collectiveAgreementRate / 100;
  const monthlyCashCost = input.grossSalary + socialSecurity + healthInsurance + artVariable
    + input.artFixed + collectiveAgreement + input.lifeInsurance + input.otherCosts;
  const sacProvision = input.grossSalary / 12;
  const sacCharges = sacProvision * (
    input.socialSecurityRate + input.healthInsuranceRate + input.artRate + input.collectiveAgreementRate
  ) / 100;
  const vacationPlusProvision = input.vacationDays > 0
    ? input.grossSalary * input.vacationDays * (1 / 25 - 1 / 30) / 12
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
    extraOverGross: input.grossSalary > 0 ? annualizedMonthlyCost - input.grossSalary : 0,
    extraRate: input.grossSalary > 0 ? (annualizedMonthlyCost / input.grossSalary - 1) * 100 : 0,
  };
}
