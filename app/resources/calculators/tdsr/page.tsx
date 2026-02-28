'use client';

import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CalculatorNav } from '@/components/calculators/CalculatorNav';
import { CalculatorContainer } from '@/components/calculators/CalculatorContainer';
import { PillToggle } from '@/components/calculators/PillToggle';
import { InputRow } from '@/components/calculators/InputRow';
import { ResultsPanel } from '@/components/calculators/ResultsPanel';
import { useTDSRCalculation } from '@/hooks/calculators/useTDSRCalculation';

export default function TDSRCalculatorPage() {
  const {
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
    otherLoans2,
    setOtherLoans2,

    // Computed
    totalIncome,
    totalDebts,
    tdsrPercentage,
    tdsrLimit,
    monthlyMortgageLimit,

    // Config
    isLoading,
    error,
    haircutPercentage,
  } = useTDSRCalculation();

  const isSingle = applicantMode === 'single';

  // Loading state
  if (isLoading) {
    return (
      <main className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Skeleton className="h-6 w-64 mb-3" />
          <Skeleton className="h-10 w-96 mb-6" />
          <Skeleton className="h-[600px] w-full" />
        </div>
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <main className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Alert variant="destructive">
            <AlertTitle>Error loading calculator</AlertTitle>
            <AlertDescription>
              Unable to load calculator configuration. Please try again.
            </AlertDescription>
          </Alert>
        </div>
      </main>
    );
  }

  // Results for panel
  const results = [
    {
      label: `${tdsrLimit}% TDSR limit:`,
      value: `$${totalIncome.toLocaleString()}`,
    },
    {
      label: 'Total debt obligations:',
      value: `$${totalDebts.toLocaleString()}`,
    },
    {
      label: 'Monthly mortgage limit:',
      value: `$${monthlyMortgageLimit.toLocaleString()}`,
      highlight: true,
    },
  ];

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-2">
          RESOURCES / CALCULATORS / TDSR
        </p>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Total Debt Servicing Ratio (TDSR) Calculator
        </h1>
        <CalculatorNav active="tdsr" />
        <p className="text-sm text-gray-600 mb-8">
          This is only applicable to HDB flats and Executive Condominiums (ECs).
        </p>

        {/* Calculator Container */}
        <CalculatorContainer title="">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Inputs */}
            <div className="lg:col-span-2 space-y-6">
              {/* Application Status */}
              <div className="flex items-center gap-4">
                <label className="w-48 text-sm font-medium text-gray-900 flex-shrink-0">
                  Application Status
                </label>
                <PillToggle
                  value={applicantMode}
                  onChange={(val) => setApplicantMode(val as 'single' | 'joint')}
                  options={[
                    { value: 'single', label: 'Single' },
                    { value: 'joint', label: 'Joint' },
                  ]}
                />
              </div>

              {/* Fixed Income */}
              <InputRow
                label="Fixed income"
                mainValue={fixedIncome || ''}
                jointValue={fixedIncome2 || ''}
                onMainChange={setFixedIncome}
                onJointChange={setFixedIncome2}
                jointDisabled={isSingle}
              />

              {/* Variable Income */}
              <InputRow
                label="Variable income"
                mainValue={variableIncome || ''}
                jointValue={variableIncome2 || ''}
                onMainChange={setVariableIncome}
                onJointChange={setVariableIncome2}
                jointDisabled={isSingle}
                helpText={`We apply a ${haircutPercentage}% haircut per MAS guidelines — only ${100 - haircutPercentage}% counted`}
              />

              {/* Monthly Loans & Debts */}
              <InputRow
                label="Monthly loans & debts"
                mainValue={creditCardDebts + carLoan + otherHomeLoans + otherLoans || ''}
                jointValue={otherLoans2 || ''}
                onMainChange={(val) => {
                  setCreditCardDebts(val);
                  setCarLoan(0);
                  setOtherHomeLoans(0);
                  setOtherLoans(0);
                }}
                onJointChange={(val) => setOtherLoans2(val)}
                jointDisabled={isSingle}
              />
            </div>

            {/* Right Column: Results */}
            <div className="lg:col-span-1">
              <Suspense fallback={<Skeleton className="w-full h-48 rounded-xl" />}>
                <ResultsPanel title="Results" results={results} />
              </Suspense>
              {totalIncome === 0 && (
                <p className="text-xs text-gray-400 mt-3 text-center">
                  Enter your income above to see your TDSR results.
                </p>
              )}
            </div>
          </div>
        </CalculatorContainer>
      </div>
    </main>
  );
}
