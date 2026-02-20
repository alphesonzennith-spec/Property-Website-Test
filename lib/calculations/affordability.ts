import type { AffordabilityInput, AffordabilityOutput } from '@/types/calculator';
import { getMaxLoanAmount, calculateTDSR } from './borrowing';
import { calculateMortgage } from './mortgage';
import { calculateStampDuty } from './stampDuty';
import type { BSDTier, ABSDRate, SSDTier, LTVRule } from '@/lib/mock/regulatoryConfig';
import { PropertyType } from '@/types';

// ── Master Affordability Calculation ───────────────────────────────────────

export function calculateAffordability(
  input: AffordabilityInput,
  config: {
    tdsrLimit: number;
    msrLimit: number;
    msrApplicablePropertyTypes: PropertyType[];
    variableIncomeHaircutPct: number;
    ltvRules: LTVRule[];
    bsdTiers: BSDTier[];
    absdRates: ABSDRate[];
    ssdTiers: SSDTier[];
    ssdExemptionMonths: number;
  }
): AffordabilityOutput {
  // Step 1: Determine max loan based on TDSR/MSR
  const { maxLoan, limitingFactor } = getMaxLoanAmount(
    input.grossMonthlyIncome,
    input.existingMonthlyDebts,
    input.propertyType,
    input.annualInterestRatePct,
    input.preferredTenureYears,
    {
      tdsrLimit: config.tdsrLimit,
      msrLimit: config.msrLimit,
      msrApplicablePropertyTypes: config.msrApplicablePropertyTypes,
    }
  );

  // Step 2: Apply LTV cap to determine max property price
  const applicableLTVRule =
    config.ltvRules.find(
      (rule) =>
        rule.propertyType === input.propertyType &&
        rule.loanTenureYears === input.preferredTenureYears &&
        rule.existingLoans === input.existingPropertiesOwned
    ) ??
    config.ltvRules.find(
      (rule) =>
        rule.propertyType === input.propertyType &&
        rule.loanTenureYears <= input.preferredTenureYears
    );

  const ltvCap = applicableLTVRule?.maxLTVPct ?? 75;
  const minCashDownPct = applicableLTVRule?.minCashDownPaymentPct ?? 5;

  // Step 3: Max property price = maxLoan / (LTV% / 100)
  const maxAffordablePrice = maxLoan / (ltvCap / 100);

  // Step 4: Calculate down payment requirements
  const totalDownPayment = maxAffordablePrice * ((100 - ltvCap) / 100);
  const minCashDownPayment = maxAffordablePrice * (minCashDownPct / 100);
  const cpfApplicable = Math.min(input.cpfOABalance, totalDownPayment - minCashDownPayment);

  // Step 5: Calculate stamp duty for max affordable price
  const stampDuty = calculateStampDuty(
    {
      purchasePrice: maxAffordablePrice,
      buyerResidencyStatus: input.buyerResidencyStatus,
      propertyType: input.propertyType,
      existingPropertiesOwned: input.existingPropertiesOwned,
      isBuyingUnderEntity: false,
    },
    config
  );

  // Step 6: Total cash required (min cash down payment + stamp duty)
  const totalCashRequired = minCashDownPayment + stampDuty.totalStampDuty;

  // Step 7: Calculate estimated monthly repayment at max loan
  const mortgage = calculateMortgage({
    loanAmount: maxLoan,
    annualInterestRatePct: input.annualInterestRatePct,
    loanTenureYears: input.preferredTenureYears,
    loanType: 'bank',
  });

  // Step 8: Verify TDSR compliance at max loan
  const tdsrCheck = calculateTDSR(
    {
      fixedMonthlyIncome: input.grossMonthlyIncome,
      variableMonthlyIncome: 0,
      existingMonthlyDebts: input.existingMonthlyDebts,
      proposedMortgageRepayment: mortgage.monthlyRepayment,
    },
    { limit: config.tdsrLimit, variableIncomeHaircutPct: config.variableIncomeHaircutPct }
  );

  return {
    maxAffordablePrice,
    maxLoanAmount: maxLoan,
    minCashDownPayment,
    cpfApplicable,
    estimatedMonthlyRepayment: mortgage.monthlyRepayment,
    estimatedStampDuty: stampDuty.totalStampDuty,
    totalCashRequired,
    tdsrAtMaxLoan: tdsrCheck.tdsrRatio,
    withinTDSRLimit: tdsrCheck.withinLimit,
  };
}
