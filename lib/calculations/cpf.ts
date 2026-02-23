import type { CPFOptimizerInput, CPFOptimizerOutput } from '@/types/calculator';

// ── CPF Balance Projection ──────────────────────────────────────────────────

export function calculateCPFProjection(
  currentBalance: number,
  monthlyContribution: number,
  yearsUntilAge55: number,
  annualInterestRatePct: number
): number {
  const monthlyRate = annualInterestRatePct / 100 / 12;
  const months = yearsUntilAge55 * 12;

  // Future value with compound interest + monthly contributions
  // FV = PV(1+r)^n + PMT × [(1+r)^n - 1] / r
  const fvOfBalance = currentBalance * Math.pow(1 + monthlyRate, months);
  const fvOfContributions =
    monthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);

  return fvOfBalance + fvOfContributions;
}

// ── CPF Usage Optimization ──────────────────────────────────────────────────

export function optimizeCPFUsage(
  input: CPFOptimizerInput,
  cpfConfig: { oaInterestRatePct: number }
): CPFOptimizerOutput {
  const yearsUntilAge55 = Math.max(0, 55 - input.buyerAge);
  const cpfInterestRate = input.cpfOAInterestRatePct ?? cpfConfig.oaInterestRatePct;

  // Scenario 1: Use maximum CPF (preserve cash)
  const maxCPFUsage = Math.min(input.cpfOABalance, input.loanAmount);
  const cashInScenario1 = input.loanAmount - maxCPFUsage;

  // Scenario 2: Use minimum CPF (cash-heavy, preserve CPF for retirement)
  const minCPFUsage = 0;
  const cashInScenario2 = input.loanAmount;

  // Scenario 3: Balanced 50/50
  const balancedCPFUsage = Math.min(input.cpfOABalance, input.loanAmount * 0.5);
  const cashInScenario3 = input.loanAmount - balancedCPFUsage;

  // Calculate retirement impact for each scenario
  const scenarios = [
    {
      label: 'Max CPF (preserve cash)',
      cpfUsed: maxCPFUsage,
      cashUsed: cashInScenario1,
      retirementImpact: calculateCPFProjection(
        input.cpfOABalance - maxCPFUsage,
        0, // Assuming no further monthly contributions for simplicity
        yearsUntilAge55,
        cpfInterestRate
      ),
    },
    {
      label: 'Min CPF (preserve CPF)',
      cpfUsed: minCPFUsage,
      cashUsed: cashInScenario2,
      retirementImpact: calculateCPFProjection(
        input.cpfOABalance,
        0,
        yearsUntilAge55,
        cpfInterestRate
      ),
    },
    {
      label: 'Balanced (50/50)',
      cpfUsed: balancedCPFUsage,
      cashUsed: cashInScenario3,
      retirementImpact: calculateCPFProjection(
        input.cpfOABalance - balancedCPFUsage,
        0,
        yearsUntilAge55,
        cpfInterestRate
      ),
    },
  ];

  // Determine best scenario (highest retirement impact + cash flexibility)
  const bestScenario = scenarios.reduce((best, current) =>
    current.retirementImpact > best.retirementImpact ? current : best
  );

  const projectedCPFIfNotUsed = calculateCPFProjection(
    input.cpfOABalance,
    0,
    yearsUntilAge55,
    cpfInterestRate
  );

  return {
    recommendedCPFUsage: bestScenario.cpfUsed,
    recommendedCashUsage: bestScenario.cashUsed,
    projectedCPFAtAge55: bestScenario.retirementImpact,
    projectedCPFAtAge55IfNotUsed: projectedCPFIfNotUsed,
    netRetirementImpactSGD: bestScenario.retirementImpact - projectedCPFIfNotUsed,
    recommendation: `${bestScenario.label}: Use $${bestScenario.cpfUsed.toLocaleString()} from CPF and $${bestScenario.cashUsed.toLocaleString()} in cash.`,
    scenarios,
  };
}
