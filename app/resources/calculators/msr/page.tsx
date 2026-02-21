'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CalculatorNav } from '@/components/calculators/CalculatorNav';
import { CalculatorContainer } from '@/components/calculators/CalculatorContainer';
import { PillToggle } from '@/components/calculators/PillToggle';
import { InputRow } from '@/components/calculators/InputRow';
import { ResultsPanel } from '@/components/calculators/ResultsPanel';
import { useMSRCalculation } from '@/hooks/calculators/useMSRCalculation';
import { PropertyType } from '@/types';

export default function MSRCalculatorPage() {
  const {
    // State
    fixedIncome,
    setFixedIncome,
    variableIncome,
    setVariableIncome,
    propertyType,
    setPropertyType,

    // Computed
    totalIncome,
    msrPercentage,
    msrLimit,
    monthlyMortgageLimit,

    // Config
    isLoading,
    error,
  } = useMSRCalculation();

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
      label: 'Total monthly income:',
      value: `$${totalIncome.toLocaleString()}`,
    },
    {
      label: `${msrLimit}% MSR limit:`,
      value: `$${(totalIncome * (msrLimit / 100)).toLocaleString()}`,
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
        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">
          CALCULATORS / MSR
        </p>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Mortgage Servicing Ratio (MSR) Calculator
        </h1>
        <CalculatorNav active="msr" />
        <p className="text-sm text-gray-600 mb-8">
          This is only applicable to HDB flats and Executive Condominiums (ECs).
        </p>

        {/* Calculator Container */}
        <CalculatorContainer title="">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Inputs */}
            <div className="lg:col-span-2 space-y-6">
              {/* Property Type Selection */}
              <div className="flex items-start gap-4">
                <label className="w-48 text-sm font-medium text-gray-900 pt-3 flex-shrink-0">
                  Property Type
                </label>
                <RadioGroup
                  value={propertyType}
                  onValueChange={(val) => setPropertyType(val as PropertyType)}
                  className="flex-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={PropertyType.HDB} id="hdb" />
                    <Label htmlFor="hdb" className="text-sm font-normal cursor-pointer">
                      HDB Flat
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={PropertyType.EC} id="ec" />
                    <Label htmlFor="ec" className="text-sm font-normal cursor-pointer">
                      Executive Condominium (EC)
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Fixed Income - Single applicant only for MSR */}
              <div className="flex items-start gap-4">
                <label className="w-48 text-sm font-medium text-gray-900 pt-3 flex-shrink-0">
                  Fixed income
                </label>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fixedIncome-main" className="text-xs text-gray-600 mb-1 block">
                      Main applicant
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                        S$
                      </span>
                      <input
                        id="fixedIncome-main"
                        type="number"
                        min="0"
                        max="10000000"
                        placeholder="0"
                        value={fixedIncome || ''}
                        onChange={(e) => setFixedIncome(e.target.value === '' ? 0 : Number(e.target.value))}
                        className="h-11 pl-9 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 px-4"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="fixedIncome-joint" className="text-xs text-gray-600 mb-1 block">
                      Joint applicant
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                        S$
                      </span>
                      <input
                        id="fixedIncome-joint"
                        type="number"
                        disabled
                        placeholder="0"
                        value="0"
                        className="h-11 pl-9 w-full rounded-lg border border-gray-300 px-4 bg-gray-50 text-gray-400 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Variable Income */}
              <div className="flex items-start gap-4">
                <label className="w-48 text-sm font-medium text-gray-900 pt-3 flex-shrink-0">
                  Variable income
                </label>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="variableIncome-main" className="text-xs text-gray-600 mb-1 block">
                      Main applicant
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                        S$
                      </span>
                      <input
                        id="variableIncome-main"
                        type="number"
                        min="0"
                        max="10000000"
                        placeholder="0"
                        value={variableIncome || ''}
                        onChange={(e) => setVariableIncome(e.target.value === '' ? 0 : Number(e.target.value))}
                        className="h-11 pl-9 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 px-4"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="variableIncome-joint" className="text-xs text-gray-600 mb-1 block">
                      Joint applicant
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                        S$
                      </span>
                      <input
                        id="variableIncome-joint"
                        type="number"
                        disabled
                        placeholder="0"
                        value="0"
                        className="h-11 pl-9 w-full rounded-lg border border-gray-300 px-4 bg-gray-50 text-gray-400 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Results */}
            <div className="lg:col-span-1">
              <ResultsPanel title="Results" results={results} />
            </div>
          </div>
        </CalculatorContainer>
      </div>
    </main>
  );
}
