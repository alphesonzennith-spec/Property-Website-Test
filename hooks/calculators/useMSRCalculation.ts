import { useState, useMemo, useEffect } from 'react';
import { useRegulatorySection } from '@/hooks/useRegulatoryRates';
import { calculateMSR, getMaxLoanAmount } from '@/lib/calculations/borrowing';
import { PropertyType } from '@/types';
import type { MSRInput } from '@/types/calculator';

export function useMSRCalculation() {
  // Fetch regulatory config
  const { data: borrowingConfig, isLoading, error } = useRegulatorySection('borrowing');
  const { data: mortgageConfig } = useRegulatorySection('mortgage');

  // Purchase status (single / joint)
  const [purchaseStatus, setPurchaseStatus] = useState<'single' | 'joint'>('single');

  // Income state — main applicant
  const [fixedIncome, setFixedIncome] = useState<number>(0);
  const [variableIncome, setVariableIncome] = useState<number>(0);

  // Income state — joint applicant (only used when purchaseStatus === 'joint')
  const [fixedIncomeJoint, setFixedIncomeJoint] = useState<number>(0);
  const [variableIncomeJoint, setVariableIncomeJoint] = useState<number>(0);

  // Property type
  const [propertyType, setPropertyType] = useState<PropertyType>(PropertyType.HDB);

  // Loan parameters
  const [stressTestRate, setStressTestRate] = useState<number>(0);
  const [loanTenureYears, setLoanTenureYears] = useState<number>(25);

  // Initialize stress test rate from config
  useEffect(() => {
    if (mortgageConfig && 'bankLoan' in mortgageConfig && mortgageConfig.bankLoan?.typicalInterestRangePct?.max) {
      setStressTestRate(mortgageConfig.bankLoan.typicalInterestRangePct.max);
    }
  }, [mortgageConfig]);

  // Total income — joint adds both applicants' incomes
  const totalIncome = purchaseStatus === 'joint'
    ? fixedIncome + variableIncome + fixedIncomeJoint + variableIncomeJoint
    : fixedIncome + variableIncome;

  // MSR Calculation
  const msrResult = useMemo(() => {
    if (!borrowingConfig || !('msr' in borrowingConfig)) return null;
    if (totalIncome === 0) return null;

    const input: MSRInput = {
      grossMonthlyIncome: totalIncome,
      proposedMortgageRepayment: 0,
    };

    return calculateMSR(input, borrowingConfig.msr);
  }, [borrowingConfig, totalIncome]);

  // MSR percentage
  const msrPercentage = msrResult?.msrRatio ? msrResult.msrRatio * 100 : 0;

  // Max Loan Calculation
  const maxLoanAmount = useMemo(() => {
    if (!borrowingConfig || !('msr' in borrowingConfig) || totalIncome === 0) return null;

    return getMaxLoanAmount(
      totalIncome,
      0, // No existing debts for MSR
      propertyType,
      stressTestRate,
      loanTenureYears,
      {
        tdsrLimit: borrowingConfig.tdsr.limit,
        msrLimit: borrowingConfig.msr.limit,
        msrApplicablePropertyTypes: borrowingConfig.msr.applicablePropertyTypes,
      }
    );
  }, [borrowingConfig, totalIncome, propertyType, stressTestRate, loanTenureYears]);

  // Monthly mortgage limit = MSR-capped max monthly repayment
  // getMaxLoanAmount does NOT return monthlyRepayment — derive directly from income × MSR limit
  const monthlyMortgageLimit = totalIncome > 0 && borrowingConfig && 'msr' in borrowingConfig
    ? Math.round(totalIncome * borrowingConfig.msr.limit)
    : 0;

  // MSR limit from config
  const msrLimit = borrowingConfig && 'msr' in borrowingConfig ? borrowingConfig.msr.limit * 100 : 30;

  return {
    // State
    purchaseStatus,
    setPurchaseStatus,
    fixedIncome,
    setFixedIncome,
    variableIncome,
    setVariableIncome,
    fixedIncomeJoint,
    setFixedIncomeJoint,
    variableIncomeJoint,
    setVariableIncomeJoint,
    propertyType,
    setPropertyType,
    stressTestRate,
    setStressTestRate,
    loanTenureYears,
    setLoanTenureYears,

    // Computed values
    totalIncome,
    msrPercentage,
    msrLimit,
    maxLoanAmount: maxLoanAmount?.maxLoan ?? 0,
    monthlyMortgageLimit,

    // Config & loading
    isLoading,
    error,
    borrowingConfig,
  };
}
