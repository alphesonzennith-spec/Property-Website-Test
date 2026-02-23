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
