import type { TDSRInput, TDSROutput, MSRInput, MSROutput } from '@/types/calculator';
import { PropertyType } from '@/types';

// ── TDSR Calculation ────────────────────────────────────────────────────────

export function calculateTDSR(
  input: TDSRInput,
  tdsrConfig: { limit: number; variableIncomeHaircutPct: number }
): TDSROutput {
  // Apply haircut to variable income only
  const haircutPct = input.variableIncomeHaircutPct ?? tdsrConfig.variableIncomeHaircutPct;
  const effectiveVariableIncome = input.variableMonthlyIncome * (1 - haircutPct / 100);
  const effectiveMonthlyIncome = input.fixedMonthlyIncome + effectiveVariableIncome;

  const totalMonthlyObligations = input.existingMonthlyDebts + input.proposedMortgageRepayment;
  const tdsrRatio = totalMonthlyObligations / effectiveMonthlyIncome;
  const withinLimit = tdsrRatio <= tdsrConfig.limit;
  const remainingCapacitySGD = effectiveMonthlyIncome * tdsrConfig.limit - totalMonthlyObligations;

  return {
    totalMonthlyObligations,
    effectiveMonthlyIncome,
    tdsrRatio,
    tdsrLimit: tdsrConfig.limit,
    withinLimit,
    remainingCapacitySGD: Math.max(0, remainingCapacitySGD),
  };
}

// ── MSR Calculation ─────────────────────────────────────────────────────────

export function calculateMSR(
  input: MSRInput,
  msrConfig: { limit: number }
): MSROutput {
  const msrRatio = input.proposedMortgageRepayment / input.grossMonthlyIncome;
  const withinLimit = msrRatio <= msrConfig.limit;
  const maxAllowedRepaymentSGD = input.grossMonthlyIncome * msrConfig.limit;

  return {
    msrRatio,
    msrLimit: msrConfig.limit,
    withinLimit,
    maxAllowedRepaymentSGD,
  };
}

// ── Max Loan Amount Calculation ────────────────────────────────────────────

export function getMaxLoanAmount(
  grossMonthlyIncome: number,
  existingMonthlyDebts: number,
  propertyType: PropertyType,
  annualInterestRatePct: number,
  loanTenureYears: number,
  config: {
    tdsrLimit: number;
    msrLimit: number;
    msrApplicablePropertyTypes: PropertyType[];
  }
): { maxLoan: number; limitingFactor: 'TDSR' | 'MSR' } {
  // Determine which limit applies
  const msrApplies = config.msrApplicablePropertyTypes.includes(propertyType);

  const monthlyRate = annualInterestRatePct / 100 / 12;
  const numPayments = loanTenureYears * 12;

  // Calculate max monthly repayment based on TDSR
  const maxMonthlyByTDSR = grossMonthlyIncome * config.tdsrLimit - existingMonthlyDebts;

  // Calculate max monthly repayment based on MSR (if applicable)
  const maxMonthlyByMSR = msrApplies ? grossMonthlyIncome * config.msrLimit : Infinity;

  const maxMonthlyRepayment = Math.min(maxMonthlyByTDSR, maxMonthlyByMSR);
  const limitingFactor = maxMonthlyByMSR < maxMonthlyByTDSR ? 'MSR' : 'TDSR';

  // Convert monthly repayment to loan amount using present value of annuity formula
  // P = M × [(1 - (1 + r)^-n) / r]
  const maxLoan =
    maxMonthlyRepayment * ((1 - Math.pow(1 + monthlyRate, -numPayments)) / monthlyRate);

  return { maxLoan, limitingFactor };
}
