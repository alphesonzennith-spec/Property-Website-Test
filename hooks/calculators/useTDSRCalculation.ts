import { useState, useMemo, useEffect } from 'react';
import { useRegulatorySection } from '@/hooks/useRegulatoryRates';
import { calculateTDSR, getMaxLoanAmount } from '@/lib/calculations/borrowing';
import { PropertyType } from '@/types';
import type { TDSRInput } from '@/types/calculator';

export function useTDSRCalculation() {
  // Fetch regulatory config
  const { data: borrowingConfig, isLoading, error } = useRegulatorySection('borrowing');
  const { data: mortgageConfig } = useRegulatorySection('mortgage');

  // Applicant mode
  const [applicantMode, setApplicantMode] = useState<'single' | 'joint'>('single');

  // Income state
  const [fixedIncome, setFixedIncome] = useState<number>(0);
  const [variableIncome, setVariableIncome] = useState<number>(0);
  const [fixedIncome2, setFixedIncome2] = useState<number>(0);
  const [variableIncome2, setVariableIncome2] = useState<number>(0);

  // Debt state
  const [creditCardDebts, setCreditCardDebts] = useState<number>(0);
  const [carLoan, setCarLoan] = useState<number>(0);
  const [otherHomeLoans, setOtherHomeLoans] = useState<number>(0);
  const [otherLoans, setOtherLoans] = useState<number>(0);

  // Loan parameters
  const [stressTestRate, setStressTestRate] = useState<number>(0);
  const [loanTenureYears, setLoanTenureYears] = useState<number>(25);

  // Initialize stress test rate from config
  useEffect(() => {
    if (mortgageConfig && 'bankLoan' in mortgageConfig && mortgageConfig.bankLoan?.typicalInterestRangePct?.max) {
      setStressTestRate(mortgageConfig.bankLoan.typicalInterestRangePct.max);
    }
  }, [mortgageConfig]);

  // Calculate total incomes (single or joint)
  const totalFixedIncome = applicantMode === 'joint'
    ? fixedIncome + fixedIncome2
    : fixedIncome;

  const totalVariableIncome = applicantMode === 'joint'
    ? variableIncome + variableIncome2
    : variableIncome;

  // Total income
  const totalIncome = totalFixedIncome + totalVariableIncome;

  // Calculate total monthly debts
  const totalDebts = creditCardDebts + carLoan + otherHomeLoans + otherLoans;

  // Calculate effective income (apply haircut to variable portion)
  const effectiveIncome = useMemo(() => {
    if (!borrowingConfig || !('tdsr' in borrowingConfig)) return 0;
    const haircutPct = borrowingConfig.tdsr.variableIncomeHaircutPct;
    return totalFixedIncome + (totalVariableIncome * (1 - haircutPct / 100));
  }, [borrowingConfig, totalFixedIncome, totalVariableIncome]);

  // TDSR Calculation
  const tdsrResult = useMemo(() => {
    if (!borrowingConfig || !('tdsr' in borrowingConfig)) return null;
    if (totalIncome === 0) return null;

    const input: TDSRInput = {
      fixedMonthlyIncome: totalFixedIncome,
      variableMonthlyIncome: totalVariableIncome,
      existingMonthlyDebts: totalDebts,
      proposedMortgageRepayment: 0,
    };

    return calculateTDSR(input, borrowingConfig.tdsr);
  }, [borrowingConfig, totalFixedIncome, totalVariableIncome, totalDebts, totalIncome]);

  // TDSR percentage
  const tdsrPercentage = tdsrResult?.tdsrRatio ? tdsrResult.tdsrRatio * 100 : 0;

  // Max Loan Calculation
  const maxLoanAmount = useMemo(() => {
    if (!borrowingConfig || !('tdsr' in borrowingConfig) || effectiveIncome === 0) return null;

    return getMaxLoanAmount(
      effectiveIncome,
      totalDebts,
      PropertyType.Condo,
      stressTestRate,
      loanTenureYears,
      {
        tdsrLimit: borrowingConfig.tdsr.limit,
        msrLimit: borrowingConfig.msr.limit,
        msrApplicablePropertyTypes: borrowingConfig.msr.applicablePropertyTypes,
      }
    );
  }, [borrowingConfig, effectiveIncome, totalDebts, stressTestRate, loanTenureYears]);

  // Monthly mortgage limit
  const monthlyMortgageLimit = maxLoanAmount?.monthlyRepayment ?? 0;

  // TDSR limit from config
  const tdsrLimit = borrowingConfig && 'tdsr' in borrowingConfig ? borrowingConfig.tdsr.limit * 100 : 55;

  return {
    // State
    applicantMode,
    setApplicantMode,
    fixedIncome,
    setFixedIncome,
    variableIncome,
    setVariableIncome,
    fixedIncome2,
    setFixedIncome2,
    variableIncome2,
    setVariableIncome2,
    creditCardDebts,
    setCreditCardDebts,
    carLoan,
    setCarLoan,
    otherHomeLoans,
    setOtherHomeLoans,
    otherLoans,
    setOtherLoans,
    stressTestRate,
    setStressTestRate,
    loanTenureYears,
    setLoanTenureYears,

    // Computed values
    totalIncome,
    effectiveIncome,
    totalDebts,
    tdsrPercentage,
    tdsrLimit,
    maxLoanAmount: maxLoanAmount?.loanAmount ?? 0,
    monthlyMortgageLimit,

    // Config & loading
    isLoading,
    error,
    borrowingConfig,
    haircutPercentage: borrowingConfig && 'tdsr' in borrowingConfig ? borrowingConfig.tdsr.variableIncomeHaircutPct : 30,
  };
}
