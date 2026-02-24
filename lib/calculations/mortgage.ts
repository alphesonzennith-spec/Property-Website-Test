import type { MortgageInput, MortgageOutput, AmortizationEntry } from '@/types/calculator';

// ── Mortgage Calculation with Full Amortization Schedule ───────────────────

export function calculateMortgage(input: MortgageInput): MortgageOutput {
  const monthlyRate = input.annualInterestRatePct / 100 / 12;
  const numPayments = input.loanTenureYears * 12;

  // Monthly payment formula: M = P × [r(1 + r)^n] / [(1 + r)^n - 1]
  const monthlyRepayment =
    (input.loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) /
    (Math.pow(1 + monthlyRate, numPayments) - 1);

  // Generate full amortization schedule
  const amortizationSchedule: AmortizationEntry[] = [];
  let remainingBalance = input.loanAmount;
  let totalInterestPaid = 0;

  for (let month = 1; month <= numPayments; month++) {
    const interestComponent = remainingBalance * monthlyRate;
    const principalComponent = monthlyRepayment - interestComponent;
    remainingBalance -= principalComponent;
    totalInterestPaid += interestComponent;

    amortizationSchedule.push({
      month,
      payment: monthlyRepayment,
      principalComponent,
      interestComponent,
      remainingBalance: Math.max(0, remainingBalance), // Avoid negative due to floating point
    });
  }

  const totalRepayment = monthlyRepayment * numPayments;

  return {
    monthlyRepayment,
    totalRepayment,
    totalInterestPaid,
    effectiveInterestRatePct: (totalInterestPaid / input.loanAmount) * 100 / input.loanTenureYears,
    amortizationSchedule,
  };
}

// ── Standalone Convenience Functions ────────────────────────────────────────
// Used by `useMortgageCalculation` hook and the Mortgage Calculator page.

/**
 * Calculate monthly mortgage repayment.
 * Formula: M = P × [r(1+r)^n] / [(1+r)^n - 1]
 */
export function calculateMonthlyRepayment(
  principal: number,
  annualRate: number,
  tenureYears: number
): number {
  if (principal <= 0 || annualRate <= 0 || tenureYears <= 0) return 0;
  const monthlyRate = annualRate / 100 / 12;
  const n = tenureYears * 12;
  return (principal * (monthlyRate * Math.pow(1 + monthlyRate, n))) /
    (Math.pow(1 + monthlyRate, n) - 1);
}

/**
 * Generate a full month-by-month amortization schedule.
 * Each entry includes payment, principal, interest, remaining balance,
 * and cumulative interest paid so far.
 */
export function calculateAmortizationSchedule(
  principal: number,
  annualRate: number,
  tenureYears: number
): (AmortizationEntry & { cumulativeInterest: number })[] {
  if (principal <= 0 || annualRate <= 0 || tenureYears <= 0) return [];

  const monthlyRate = annualRate / 100 / 12;
  const n = tenureYears * 12;
  const payment = calculateMonthlyRepayment(principal, annualRate, tenureYears);
  const schedule: (AmortizationEntry & { cumulativeInterest: number })[] = [];
  let balance = principal;
  let cumulativeInterest = 0;

  for (let month = 1; month <= n; month++) {
    const interestComponent = balance * monthlyRate;
    const principalComponent = payment - interestComponent;
    balance -= principalComponent;
    cumulativeInterest += interestComponent;

    schedule.push({
      month,
      payment,
      principalComponent,
      interestComponent,
      remainingBalance: Math.max(0, balance),
      cumulativeInterest,
    });
  }

  return schedule;
}

/**
 * Calculate a full mortgage summary including start date context.
 */
export function calculateMortgageSummary(
  principal: number,
  annualRate: number,
  tenureYears: number,
  startDate: Date
): {
  monthlyRepayment: number;
  totalLoanAmount: number;
  totalInterestPaid: number;
  totalPayment: number;
  interestPercentage: number;
  endDate: Date;
  schedule: (AmortizationEntry & { cumulativeInterest: number; date: Date })[];
} {
  const monthlyRepayment = calculateMonthlyRepayment(principal, annualRate, tenureYears);
  const schedule = calculateAmortizationSchedule(principal, annualRate, tenureYears);
  const totalPayment = monthlyRepayment * tenureYears * 12;
  const totalInterestPaid = totalPayment - principal;
  const interestPercentage = totalPayment > 0 ? (totalInterestPaid / totalPayment) * 100 : 0;

  // Attach calendar dates to each schedule entry
  const scheduledWithDates = schedule.map((entry) => {
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + entry.month - 1);
    return { ...entry, date };
  });

  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + tenureYears * 12);

  return {
    monthlyRepayment,
    totalLoanAmount: principal,
    totalInterestPaid,
    totalPayment,
    interestPercentage,
    endDate,
    schedule: scheduledWithDates,
  };
}
