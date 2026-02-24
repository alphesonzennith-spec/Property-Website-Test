import type { CPFRates } from '@/lib/mock/regulatoryConfig';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface CPFOptimizerInput {
  cpfOABalance: number;
  cpfSABalance: number;
  currentAge: number;
  retirementAge: number;
  propertyPrice: number;
  loanAmount: number;
  loanTenureYears: number;
  annualInterestRatePct: number;
}

export interface CPFScenarioResult {
  label: string;
  /** CPF used for down-payment in SGD */
  cpfDownpayment: number;
  /** Cash used for down-payment in SGD */
  cashDownpayment: number;
  /** Monthly CPF used for installments in SGD */
  monthlyCPFInstallment: number;
  /** Monthly cash used for installments in SGD */
  monthlyCashInstallment: number;
  /** Total monthly cash outflow (cash installment only) in SGD */
  monthlyCashOutflow: number;
  /** Total interest paid over the full loan tenure in SGD */
  totalInterestPaid: number;
  /** Projected CPF OA balance at retirement in SGD */
  projectedCPFOAAtRetirement: number;
  /** Property equity at retirement (approx. purchase price, ignoring appreciation) */
  propertyEquityAtRetirement: number;
  /** Net wealth = property equity + CPF OA at retirement */
  netWealthAtRetirement: number;
  /** Year-by-year CPF OA balance for the Recharts chart: { age, balance }[] */
  balanceHistory: Array<{ age: number; balance: number }>;
}

export interface CPFOptimizerOutput {
  scenarioA: CPFScenarioResult; // Max CPF
  scenarioB: CPFScenarioResult; // Min CPF (Full Cash)
  scenarioC: CPFScenarioResult; // Optimized Split
  /** Which scenario has the highest net wealth at retirement */
  recommendedScenario: 'A' | 'B' | 'C';
  /** $X saved in total interest vs the other scenarios */
  interestSavedVsMaxCPF: number;
  /** $Y reduction in CPF retirement savings vs Scenario B */
  cpfReducedVsMinCPF: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Standard mortgage monthly installment (PMT formula).
 */
function calcMonthlyInstallment(principal: number, annualRatePct: number, tenureYears: number): number {
  if (principal <= 0) return 0;
  const r = annualRatePct / 100 / 12;
  const n = tenureYears * 12;
  if (r === 0) return principal / n;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

/**
 * Total interest = total repayment - principal
 */
function calcTotalInterest(principal: number, annualRatePct: number, tenureYears: number): number {
  const monthly = calcMonthlyInstallment(principal, annualRatePct, tenureYears);
  return monthly * tenureYears * 12 - principal;
}

/**
 * Project CPF OA balance from currentAge to retirementAge.
 * Withdrawals happen during the loan tenure (monthly CPF installment deducted).
 * After the loan ends, the remaining balance compounds freely.
 *
 * @param startBalance      Starting CPF OA balance in SGD
 * @param oaInterestRate    Annual OA interest rate (decimal, e.g. 0.025)
 * @param currentAge        Current age of buyer
 * @param retirementAge     Target retirement age
 * @param monthlyCPFUsage   Monthly CPF used for loan installments while loan is active
 * @param tenureYears       Loan tenure in years
 */
function projectCPFBalance(
  startBalance: number,
  oaInterestRate: number,
  currentAge: number,
  retirementAge: number,
  monthlyCPFUsage: number,
  tenureYears: number,
): { finalBalance: number; history: Array<{ age: number; balance: number }> } {
  const monthlyRate = oaInterestRate / 12;
  const totalMonths = (retirementAge - currentAge) * 12;
  const loanMonths = Math.min(tenureYears * 12, totalMonths);

  let balance = startBalance;
  const history: Array<{ age: number; balance: number }> = [];

  // Record starting point
  history.push({ age: currentAge, balance: Math.max(0, balance) });

  for (let month = 1; month <= totalMonths; month++) {
    // Monthly interest accrual
    balance = balance * (1 + monthlyRate);
    // Monthly CPF usage for loan installment (only while loan is active)
    if (month <= loanMonths) {
      balance = Math.max(0, balance - monthlyCPFUsage);
    }
    // Record balance at each birthday
    if (month % 12 === 0) {
      const age = currentAge + month / 12;
      history.push({ age, balance: Math.max(0, balance) });
    }
  }

  return { finalBalance: Math.max(0, balance), history };
}

// ── Core Calculator ───────────────────────────────────────────────────────────

/**
 * Calculates all three CPF usage scenarios in a single call.
 * This is the function the page component should call.
 */
export function calculateOptimalCPFSplit(
  input: CPFOptimizerInput,
  rates: CPFRates,
): CPFOptimizerOutput {
  const {
    cpfOABalance,
    currentAge,
    retirementAge,
    propertyPrice,
    loanAmount,
    loanTenureYears,
    annualInterestRatePct,
  } = input;

  const oaInterestRate = rates.oaInterestRate;

  // Downpayment total = purchase price - loan amount
  const downpaymentRequired = propertyPrice - loanAmount;

  // ── Scenario A: Maximum CPF ─────────────────────────────────────────────────
  // Use as much CPF OA as possible for downpayment, then CPF for installments
  const aDownCPF = Math.min(cpfOABalance, downpaymentRequired);
  const aDownCash = downpaymentRequired - aDownCPF;
  const balanceAfterADownpayment = cpfOABalance - aDownCPF;
  const aMonthlyInstallment = calcMonthlyInstallment(loanAmount, annualInterestRatePct, loanTenureYears);
  // Pay installments from CPF first, top up with cash if balance exhausted
  const aMonthlyCPFInstallment = Math.min(balanceAfterADownpayment > 0 ? aMonthlyInstallment : 0, aMonthlyInstallment);
  const aMonthlyCashInstallment = aMonthlyInstallment - aMonthlyCPFInstallment;
  const aTotalInterest = calcTotalInterest(loanAmount, annualInterestRatePct, loanTenureYears);
  const { finalBalance: aFinalBalance, history: aHistory } = projectCPFBalance(
    balanceAfterADownpayment,
    oaInterestRate,
    currentAge,
    retirementAge,
    aMonthlyCPFInstallment,
    loanTenureYears,
  );

  const scenarioA: CPFScenarioResult = {
    label: 'Maximum CPF',
    cpfDownpayment: aDownCPF,
    cashDownpayment: aDownCash,
    monthlyCPFInstallment: aMonthlyCPFInstallment,
    monthlyCashInstallment: aMonthlyCashInstallment,
    monthlyCashOutflow: aMonthlyCashInstallment,
    totalInterestPaid: aTotalInterest,
    projectedCPFOAAtRetirement: aFinalBalance,
    propertyEquityAtRetirement: propertyPrice,
    netWealthAtRetirement: propertyPrice + aFinalBalance,
    balanceHistory: aHistory,
  };

  // ── Scenario B: Minimum CPF (Full Cash) ────────────────────────────────────
  // Pay everything in cash, CPF compounds undisturbed
  const bDownCash = downpaymentRequired;
  const bMonthlyInstallment = calcMonthlyInstallment(loanAmount, annualInterestRatePct, loanTenureYears);
  const bTotalInterest = aTotalInterest; // same loan amount & rate
  const { finalBalance: bFinalBalance, history: bHistory } = projectCPFBalance(
    cpfOABalance,
    oaInterestRate,
    currentAge,
    retirementAge,
    0, // no CPF used for installments
    loanTenureYears,
  );

  const scenarioB: CPFScenarioResult = {
    label: 'Full Cash',
    cpfDownpayment: 0,
    cashDownpayment: bDownCash,
    monthlyCPFInstallment: 0,
    monthlyCashInstallment: bMonthlyInstallment,
    monthlyCashOutflow: bMonthlyInstallment,
    totalInterestPaid: bTotalInterest,
    projectedCPFOAAtRetirement: bFinalBalance,
    propertyEquityAtRetirement: propertyPrice,
    netWealthAtRetirement: propertyPrice + bFinalBalance,
    balanceHistory: bHistory,
  };

  // ── Scenario C: Optimized Split ────────────────────────────────────────────
  // Use CPF for downpayment only; pay installments in cash.
  // Rationale: when the loan interest rate > OA rate, using CPF for downpayment
  // saves more interest than keeping it in OA; but keeping CPF for installments
  // lets it compound while you service with cash.
  // Crossover logic: CPF for downpayment up to 50% of what Scenario A would use.
  const loanRateDecimal = annualInterestRatePct / 100;
  // If the loan rate exceeds OA rate → use CPF for downpayment but cash for installments
  // If OA rate > loan rate → preserve CPF entirely (same as Scenario B)
  let cDownCPF: number;
  let cMonthlyCPFInstallment: number;

  if (loanRateDecimal > oaInterestRate) {
    // Use CPF for downpayment only (not installments); maximises compounding post-purchase
    cDownCPF = Math.min(cpfOABalance, downpaymentRequired);
    cMonthlyCPFInstallment = 0;
  } else {
    // OA rate already competitive — preserve CPF entirely
    cDownCPF = 0;
    cMonthlyCPFInstallment = 0;
  }

  const cDownCash = downpaymentRequired - cDownCPF;
  const cBalanceAfterDownpayment = cpfOABalance - cDownCPF;
  const cMonthlyInstallment = calcMonthlyInstallment(loanAmount, annualInterestRatePct, loanTenureYears);
  const cMonthlyCashInstallment = cMonthlyInstallment - cMonthlyCPFInstallment;
  const cTotalInterest = aTotalInterest; // same loan amount & rate

  const { finalBalance: cFinalBalance, history: cHistory } = projectCPFBalance(
    cBalanceAfterDownpayment,
    oaInterestRate,
    currentAge,
    retirementAge,
    cMonthlyCPFInstallment,
    loanTenureYears,
  );

  const scenarioC: CPFScenarioResult = {
    label: 'Optimized Split',
    cpfDownpayment: cDownCPF,
    cashDownpayment: cDownCash,
    monthlyCPFInstallment: cMonthlyCPFInstallment,
    monthlyCashInstallment: cMonthlyCashInstallment,
    monthlyCashOutflow: cMonthlyCashInstallment,
    totalInterestPaid: cTotalInterest,
    projectedCPFOAAtRetirement: cFinalBalance,
    propertyEquityAtRetirement: propertyPrice,
    netWealthAtRetirement: propertyPrice + cFinalBalance,
    balanceHistory: cHistory,
  };

  // ── Recommendation ─────────────────────────────────────────────────────────
  // Best net wealth at retirement wins
  const netWealths = {
    A: scenarioA.netWealthAtRetirement,
    B: scenarioB.netWealthAtRetirement,
    C: scenarioC.netWealthAtRetirement,
  };
  const recommendedScenario = (Object.keys(netWealths) as Array<'A' | 'B' | 'C'>).reduce((best, key) =>
    netWealths[key as 'A' | 'B' | 'C'] > netWealths[best] ? key as 'A' | 'B' | 'C' : best,
    'C' as 'A' | 'B' | 'C',
  );

  // Comparison metrics (always relative to C vs A for interest, C vs B for CPF)
  const interestSavedVsMaxCPF = scenarioA.totalInterestPaid - scenarioC.totalInterestPaid;
  const cpfReducedVsMinCPF = scenarioB.projectedCPFOAAtRetirement - scenarioC.projectedCPFOAAtRetirement;

  return {
    scenarioA,
    scenarioB,
    scenarioC,
    recommendedScenario,
    interestSavedVsMaxCPF,
    cpfReducedVsMinCPF,
  };
}

// ── Legacy exports for backward compatibility ──────────────────────────────────

export function calculateCPFProjection(
  currentBalance: number,
  monthlyContribution: number,
  yearsUntilAge55: number,
  annualInterestRatePct: number,
): number {
  const monthlyRate = annualInterestRatePct / 100 / 12;
  const months = yearsUntilAge55 * 12;
  const fvOfBalance = currentBalance * Math.pow(1 + monthlyRate, months);
  const fvOfContributions =
    monthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
  return fvOfBalance + fvOfContributions;
}
