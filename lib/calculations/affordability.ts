import type {
  AffordabilityInput,
  AffordabilityOutput,
  ConstraintCheck,
  DownpaymentBreakdown,
  AffordabilityChartData,
} from '@/types/calculator';
import { calculateMortgage } from './mortgage';
import { calculateTDSR } from './borrowing';
import { calculateStampDuty } from './stampDuty';
import type { LTVRule, RegulatoryConfig } from '@/lib/mock/regulatoryConfig';
import { PropertyType } from '@/types';

// ── Type Aliases (internal) ──────────────────────────────────────────────────

type BorrowingConfig = RegulatoryConfig['borrowing'];
type StampDutySection = RegulatoryConfig['stampDuty'];

// ── Helper: derive max property price from max loan + LTV ───────────────────

/**
 * Given a max loan quantum (limited by TDSR/MSR), find the corresponding
 * max property price using the applicable LTV rule.
 *
 * max_property_price = max_loan / ltv_pct
 */
export function deriveMaxPropertyPrice(
  maxLoan: number,
  ltvConfig: RegulatoryConfig['borrowing']['ltv'],
  propertyType: PropertyType,
  outstandingLoans: number,
  tenureYears: number
): { maxPrice: number; ltv: number; minCashDownPct: number; applicableRule: LTVRule | null } {
  // Find the most permissive matching LTV rule
  const candidates = ltvConfig.rules.filter(
    (r) =>
      r.propertyType === propertyType &&
      r.existingLoans <= outstandingLoans
  );

  // Match by exact tenure first; fall back to any rule
  const rule =
    candidates.find((r) => r.loanTenureYears <= tenureYears) ??
    candidates[0] ??
    null;

  const ltv = rule?.maxLTVPct ?? 75;
  const minCashDownPct = rule?.minCashDownPaymentPct ?? 5;

  const maxPrice = maxLoan / (ltv / 100);

  return { maxPrice, ltv, minCashDownPct, applicableRule: rule };
}

// ── Helper: calculate downpayment source breakdown ───────────────────────────

/**
 * Given a property price and the applicable LTV+downpayment config, work out
 * how much cash and CPF are used, and how much total cash must be on hand.
 *
 * OTP (Option-to-Purchase)  = typically 1–5% cash
 * Exercise of Option        = rest of downpayment, CPF or cash eligible
 */
export function calculateDownpaymentSources(
  propertyPrice: number,
  ltvAppliedPct: number,        // e.g. 75 for 75%
  minCashDownPct: number,       // e.g. 5 for 5%
  cpfOABalance: number,
  cashOnHand: number,
  estimatedBSD: number,
  estimatedABSD: number
): DownpaymentBreakdown {
  const loanAmount = propertyPrice * (ltvAppliedPct / 100);
  const totalDownpayment = propertyPrice - loanAmount;

  // OTP: minimum cash down payment (5% of price or minCashDownPct)
  const optionToPurchase = propertyPrice * (minCashDownPct / 100);

  // Exercise of Option: remaining downpayment after OTP
  const exerciseOption = totalDownpayment - optionToPurchase;

  // CPF can cover exercise option (but limited by available balance)
  const cpfForExercise = Math.min(cpfOABalance, exerciseOption);
  const cashForExercise = exerciseOption - cpfForExercise;

  // CPF cannot be used for OTP or stamp duties
  const totalCashUsed = optionToPurchase + cashForExercise + estimatedBSD + estimatedABSD;
  const totalCPFUsed = cpfForExercise;
  const totalCashNeeded = totalCashUsed; // alias for clarity

  return {
    optionToPurchase,
    exerciseOption,
    totalDownpayment,
    loanAmount,
    bsd: estimatedBSD,
    absd: estimatedABSD,
    totalCashUsed,
    totalCPFUsed,
    totalCashNeeded,
  };
}

// ── Master Affordability Calculation ─────────────────────────────────────────

export function calculateAffordability(
  input: AffordabilityInput,
  config: BorrowingConfig & { stampDuty: StampDutySection }
): AffordabilityOutput {
  // ── Step 1: Compute effective income (with variable haircut) ──────────────
  const haircutFactor = 1 - config.tdsr.variableIncomeHaircutPct / 100;
  const effectiveMainIncome =
    input.grossMonthlyIncome + input.variableMonthlyIncome * haircutFactor;
  const effectiveJointIncome =
    input.applicantMode === 'joint'
      ? input.jointFixedIncome + input.jointVariableIncome * haircutFactor
      : 0;
  const totalEffectiveIncome = effectiveMainIncome + effectiveJointIncome;

  // ── Step 2: Total existing monthly debt obligations ───────────────────────
  const existingDebts =
    input.creditCardMinimum +
    input.carLoan +
    input.otherHomeLoans +
    input.otherLoans;

  // ── Step 3: TDSR max monthly obligation → max monthly mortgage ────────────
  const tdsrCap = config.tdsr.limit; // e.g. 0.55
  const maxMonthlyFromTDSR = totalEffectiveIncome * tdsrCap - existingDebts;

  // ── Step 4: MSR cap (HDB / EC only) ──────────────────────────────────────
  const isMSRApplicable = config.msr.applicablePropertyTypes.includes(
    input.propertyType as PropertyType
  );
  const msrCap = config.msr.limit; // e.g. 0.30
  const maxMonthlyFromMSR = isMSRApplicable
    ? totalEffectiveIncome * msrCap
    : Infinity;

  const maxMonthlyMortgage = Math.min(maxMonthlyFromTDSR, maxMonthlyFromMSR);

  // ── Step 5: Back-calculate max loan from max monthly repayment ────────────
  const monthlyRate = input.annualInterestRatePct / 100 / 12;
  const n = input.preferredTenureYears * 12;
  const maxLoan =
    monthlyRate > 0
      ? (maxMonthlyMortgage * (1 - Math.pow(1 + monthlyRate, -n))) / monthlyRate
      : maxMonthlyMortgage * n;

  // ── Step 6: Derive max property price via LTV ─────────────────────────────
  const { maxPrice, ltv, minCashDownPct } = deriveMaxPropertyPrice(
    maxLoan,
    config.ltv,
    input.propertyType as PropertyType,
    input.existingPropertiesOwned,
    input.preferredTenureYears
  );

  // ── Step 7: Stamp duty on max property price ──────────────────────────────
  const stampDuty = calculateStampDuty(
    {
      purchasePrice: maxPrice,
      buyerResidencyStatus: input.buyerResidencyStatus,
      propertyType: input.propertyType as PropertyType,
      existingPropertiesOwned: input.existingPropertiesOwned,
      isBuyingUnderEntity: false,
    },
    {
      bsdTiers: config.stampDuty.bsd.tiers,
      absdRates: config.stampDuty.absd.rates,
      ssdTiers: config.stampDuty.ssd.tiers,
      ssdExemptionMonths: config.stampDuty.ssd.exemptionThresholdMonths,
    }
  );
  const bsd = stampDuty.bsd;
  const absd = stampDuty.absd.amount;

  // ── Step 8: Downpayment sources ───────────────────────────────────────────
  const dpBreakdown = calculateDownpaymentSources(
    maxPrice,
    ltv,
    minCashDownPct,
    input.cpfOABalance,
    input.cashOnHand,
    bsd,
    absd
  );

  // ── Step 9: Check if cash is sufficient ──────────────────────────────────
  const cashSufficient = input.cashOnHand >= dpBreakdown.totalCashNeeded;

  // ── Step 10: Monthly repayment at max loan amount ─────────────────────────
  const mortgage = calculateMortgage({
    loanAmount: dpBreakdown.loanAmount,
    annualInterestRatePct: input.annualInterestRatePct,
    loanTenureYears: input.preferredTenureYears,
    loanType: 'bank',
  });

  // ── Step 11: Actual TDSR at max loan ──────────────────────────────────────
  const tdsrCheck = calculateTDSR(
    {
      fixedMonthlyIncome: totalEffectiveIncome,
      variableMonthlyIncome: 0, // already haircut-adjusted above
      existingMonthlyDebts: existingDebts,
      proposedMortgageRepayment: mortgage.monthlyRepayment,
    },
    { limit: tdsrCap, variableIncomeHaircutPct: 0 }
  );

  // ── Step 12: Constraint analysis (traffic-light) ──────────────────────────
  const tdsrActual = (existingDebts + mortgage.monthlyRepayment) / totalEffectiveIncome;
  const msrActual = isMSRApplicable
    ? mortgage.monthlyRepayment / totalEffectiveIncome
    : 0;
  const ltvActual = dpBreakdown.loanAmount / maxPrice;
  const cashActual = input.cashOnHand / dpBreakdown.totalCashNeeded;

  const tdsrConstraint: ConstraintCheck = {
    label: 'TDSR',
    ratioActual: tdsrActual,
    limitValue: tdsrCap,
    withinLimit: tdsrActual <= tdsrCap,
    isBinding: false,
  };

  const msrConstraint: ConstraintCheck | null = isMSRApplicable
    ? {
      label: 'MSR',
      ratioActual: msrActual,
      limitValue: msrCap,
      withinLimit: msrActual <= msrCap,
      isBinding: false,
    }
    : null;

  const ltvConstraint: ConstraintCheck = {
    label: 'LTV',
    ratioActual: ltvActual,
    limitValue: ltv / 100,
    withinLimit: ltvActual <= ltv / 100,
    isBinding: false,
  };

  const cashConstraint: ConstraintCheck = {
    label: 'Cash',
    ratioActual: cashActual,
    limitValue: 1,
    withinLimit: cashSufficient,
    isBinding: false,
  };

  // Determine binding constraint
  let bindingConstraint: AffordabilityOutput['bindingConstraint'] = 'TDSR';
  if (isMSRApplicable && maxMonthlyFromMSR < maxMonthlyFromTDSR) {
    bindingConstraint = 'MSR';
  } else if (!cashSufficient) {
    bindingConstraint = 'Cash';
  }

  // Mark as binding
  if (bindingConstraint === 'TDSR') tdsrConstraint.isBinding = true;
  else if (bindingConstraint === 'MSR' && msrConstraint) msrConstraint.isBinding = true;
  else if (bindingConstraint === 'Cash') cashConstraint.isBinding = true;
  else ltvConstraint.isBinding = true;

  // ── Step 13: Chart data ────────────────────────────────────────────────────
  const chart: AffordabilityChartData = {
    cashAmount: dpBreakdown.totalCashUsed,
    cpfAmount: dpBreakdown.totalCPFUsed,
    loanAmount: dpBreakdown.loanAmount,
    stampDutiesAmount: bsd + absd,
    totalAmount: maxPrice + bsd + absd,
  };

  return {
    maxAffordablePrice: maxPrice,
    maxLoanAmount: dpBreakdown.loanAmount,
    estimatedMonthlyRepayment: mortgage.monthlyRepayment,
    bindingConstraint,
    constraints: {
      tdsr: tdsrConstraint,
      msr: msrConstraint,
      ltv: ltvConstraint,
      cash: cashConstraint,
    },
    downpayment: dpBreakdown,
    chart,
    ltvApplied: ltv / 100,
    tdsrAtMaxLoan: tdsrCheck.tdsrRatio,
    withinTDSRLimit: tdsrCheck.withinLimit,
  };
}
