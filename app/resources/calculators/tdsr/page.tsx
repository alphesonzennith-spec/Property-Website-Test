'use client';

import React, { useState, useMemo } from 'react';
import { useRegulatorySection } from '@/hooks/useRegulatoryRates';
import { calculateTDSR, calculateMSR, getMaxLoanAmount } from '@/lib/calculations/borrowing';
import { PropertyType } from '@/types';
import type { TDSRInput, MSRInput } from '@/types/calculator';

// shadcn/ui components
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

export default function TdsrMsrCalculatorPage() {
  // Fetch borrowing config from regulatory rates
  const { data: borrowingConfig, isLoading, error, refetch } = useRegulatorySection('borrowing');
  // Fetch mortgage config for stress test rate
  const { data: mortgageConfig } = useRegulatorySection('mortgage');

  // Tab state
  const [activeTab, setActiveTab] = useState<'tdsr' | 'msr'>('tdsr');

  // TDSR state
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
  const [desiredLoanAmount, setDesiredLoanAmount] = useState<number>(0);

  // MSR state
  const [msrIncome, setMsrIncome] = useState<number>(0);
  const [msrPropertyType, setMsrPropertyType] = useState<PropertyType>(PropertyType.HDB);
  const [msrProposedMortgage, setMsrProposedMortgage] = useState<number>(0);

  // Initialize stress test rate from config
  React.useEffect(() => {
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

  // Calculate total monthly debts
  const totalMonthlyDebts = creditCardDebts + carLoan + otherHomeLoans + otherLoans;

  // TDSR Calculation
  const tdsrResult = useMemo(() => {
    if (!borrowingConfig || !('tdsr' in borrowingConfig)) return null;

    const grossMonthlyIncome = totalFixedIncome + totalVariableIncome;
    if (grossMonthlyIncome === 0) return null;

    const input: TDSRInput = {
      fixedMonthlyIncome: totalFixedIncome,
      variableMonthlyIncome: totalVariableIncome,
      existingMonthlyDebts: totalMonthlyDebts,
      proposedMortgageRepayment: 0,
    };

    return calculateTDSR(input, borrowingConfig.tdsr);
  }, [borrowingConfig, totalFixedIncome, totalVariableIncome, totalMonthlyDebts]);

  // Max Loan Calculation (TDSR)
  const maxLoanTDSR = useMemo(() => {
    if (!borrowingConfig || !('tdsr' in borrowingConfig) || !tdsrResult) return null;

    const grossMonthlyIncome = totalFixedIncome + totalVariableIncome;
    if (grossMonthlyIncome === 0) return null;

    return getMaxLoanAmount(
      grossMonthlyIncome,
      totalMonthlyDebts,
      PropertyType.Condo, // Default for TDSR
      stressTestRate,
      loanTenureYears,
      {
        tdsrLimit: borrowingConfig.tdsr.limit,
        msrLimit: borrowingConfig.msr.limit,
        msrApplicablePropertyTypes: borrowingConfig.msr.applicablePropertyTypes,
      }
    );
  }, [borrowingConfig, totalFixedIncome, totalVariableIncome, totalMonthlyDebts, stressTestRate, loanTenureYears, tdsrResult]);

  // MSR Calculation
  const msrResult = useMemo(() => {
    if (!borrowingConfig || !('msr' in borrowingConfig) || msrIncome === 0) return null;

    const input: MSRInput = {
      grossMonthlyIncome: msrIncome,
      proposedMortgageRepayment: msrProposedMortgage,
    };

    return calculateMSR(input, borrowingConfig.msr);
  }, [borrowingConfig, msrIncome, msrProposedMortgage]);

  // Max Loan Calculation (MSR)
  const maxLoanMSR = useMemo(() => {
    if (!borrowingConfig || !('tdsr' in borrowingConfig) || msrIncome === 0) return null;

    return getMaxLoanAmount(
      msrIncome,
      0, // No existing debts considered for MSR
      msrPropertyType,
      stressTestRate,
      loanTenureYears,
      {
        tdsrLimit: borrowingConfig.tdsr.limit,
        msrLimit: borrowingConfig.msr.limit,
        msrApplicablePropertyTypes: borrowingConfig.msr.applicablePropertyTypes,
      }
    );
  }, [borrowingConfig, msrIncome, msrPropertyType, stressTestRate, loanTenureYears]);

  // Traffic light status for TDSR
  const trafficLightStatus = useMemo(() => {
    if (!tdsrResult) return null;

    const ratio = tdsrResult.tdsrRatio;
    if (ratio < 0.40) return { color: 'green', label: 'Comfortable - Well within TDSR limit' };
    if (ratio < 0.55) return { color: 'yellow', label: 'Approaching limit - Consider reducing obligations' };
    return { color: 'red', label: 'Exceeds TDSR - Loan will be rejected' };
  }, [tdsrResult]);

  // Number formatter
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-SG', {
      style: 'currency',
      currency: 'SGD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return (value * 100).toFixed(1) + '%';
  };

  // Loading state
  if (isLoading) {
    return (
      <main className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-12 w-96 mb-8" />
          <Skeleton className="h-96 w-full" />
        </div>
      </main>
    );
  }

  // Error state
  if (error || !borrowingConfig) {
    return (
      <main className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <Alert variant="destructive">
            <AlertTitle>Unable to load regulatory rates</AlertTitle>
            <AlertDescription>
              Please try refreshing the page. If the problem persists, contact support.
            </AlertDescription>
            <Button onClick={() => refetch()} className="mt-4">Retry</Button>
          </Alert>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest mb-3">
          CALCULATORS / TDSR
        </p>
        <h1 className="text-4xl font-extrabold text-[#1E293B] mb-4">
          TDSR & MSR Calculator
        </h1>
        <p className="text-gray-500 mb-8">
          Calculate your Total Debt Servicing Ratio and Mortgage Servicing Ratio
        </p>

        {/* Tab structure will go here */}
        <div className="text-center text-gray-400 py-20">
          Config loaded successfully. Tabs coming next.
        </div>
      </div>
    </main>
  );
}
