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

  // Calculate effective income (apply haircut to variable portion)
  const effectiveMonthlyIncome = useMemo(() => {
    if (!borrowingConfig || !('tdsr' in borrowingConfig)) return 0;
    const haircutPct = borrowingConfig.tdsr.variableIncomeHaircutPct;
    return totalFixedIncome + (totalVariableIncome * (1 - haircutPct / 100));
  }, [borrowingConfig, totalFixedIncome, totalVariableIncome]);

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
    if (!borrowingConfig || !('tdsr' in borrowingConfig) || effectiveMonthlyIncome === 0) return null;

    return getMaxLoanAmount(
      effectiveMonthlyIncome,  // Use effective income (after haircut)
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
  }, [borrowingConfig, effectiveMonthlyIncome, totalMonthlyDebts, stressTestRate, loanTenureYears]);

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

        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as 'tdsr' | 'msr')}>
          <TabsList className="mb-8">
            <TabsTrigger value="tdsr">TDSR Calculator</TabsTrigger>
            <TabsTrigger value="msr">
              MSR Calculator
              <Badge variant="outline" className="ml-2 text-xs">For HDB/EC only</Badge>
            </TabsTrigger>
          </TabsList>

          {/* TDSR Tab */}
          <TabsContent value="tdsr" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: Inputs */}
              <div className="space-y-6">
                {/* Applicant Mode Toggle */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Application Type</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup
                      value={applicantMode}
                      onValueChange={(val) => setApplicantMode(val as 'single' | 'joint')}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="single" id="single" />
                        <Label htmlFor="single">Single Applicant</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="joint" id="joint" />
                        <Label htmlFor="joint">Joint Applicants</Label>
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>

                {/* Income Section - Applicant 1 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {applicantMode === 'joint' ? 'Monthly Income (Applicant 1)' : 'Monthly Income'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="fixedIncome">Fixed Monthly Income (S$)</Label>
                      <Input
                        id="fixedIncome"
                        type="number"
                        placeholder="e.g., 8000"
                        value={fixedIncome || ''}
                        onChange={(e) => setFixedIncome(Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="variableIncome">Variable Income (S$/month)</Label>
                      <Input
                        id="variableIncome"
                        type="number"
                        placeholder="e.g., 2000"
                        value={variableIncome || ''}
                        onChange={(e) => setVariableIncome(Number(e.target.value))}
                      />
                      {borrowingConfig && 'tdsr' in borrowingConfig && (
                        <p className="text-xs text-gray-500 mt-1">
                          We apply a {borrowingConfig.tdsr.variableIncomeHaircutPct}% haircut per MAS guidelines — only{' '}
                          {100 - borrowingConfig.tdsr.variableIncomeHaircutPct}% counted
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Joint Applicant Income */}
                {applicantMode === 'joint' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Monthly Income (Applicant 2)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="fixedIncome2">Fixed Monthly Income (S$)</Label>
                        <Input
                          id="fixedIncome2"
                          type="number"
                          placeholder="e.g., 6000"
                          value={fixedIncome2 || ''}
                          onChange={(e) => setFixedIncome2(Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="variableIncome2">Variable Income (S$/month)</Label>
                        <Input
                          id="variableIncome2"
                          type="number"
                          placeholder="e.g., 1000"
                          value={variableIncome2 || ''}
                          onChange={(e) => setVariableIncome2(Number(e.target.value))}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Debt Obligations */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Monthly Debt Obligations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="creditCardDebts">Credit Card Minimum Payments (SGD)</Label>
                      <Input
                        id="creditCardDebts"
                        type="number"
                        placeholder="e.g., 200"
                        value={creditCardDebts || ''}
                        onChange={(e) => setCreditCardDebts(Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="carLoan">Car Loan (SGD)</Label>
                      <Input
                        id="carLoan"
                        type="number"
                        placeholder="e.g., 500"
                        value={carLoan || ''}
                        onChange={(e) => setCarLoan(Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="otherHomeLoans">Other Home Loans (SGD)</Label>
                      <Input
                        id="otherHomeLoans"
                        type="number"
                        placeholder="e.g., 0"
                        value={otherHomeLoans || ''}
                        onChange={(e) => setOtherHomeLoans(Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="otherLoans">Other Loans (SGD)</Label>
                      <Input
                        id="otherLoans"
                        type="number"
                        placeholder="e.g., 0"
                        value={otherLoans || ''}
                        onChange={(e) => setOtherLoans(Number(e.target.value))}
                      />
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-sm font-semibold text-emerald-600">
                        Total monthly obligations: {formatCurrency(totalMonthlyDebts)}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Loan Parameters */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Loan Parameters</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="stressTestRate">Stress Test Rate (%)</Label>
                      <Input
                        id="stressTestRate"
                        type="number"
                        step="0.1"
                        placeholder="e.g., 4.5"
                        value={stressTestRate || ''}
                        onChange={(e) => setStressTestRate(Number(e.target.value))}
                      />
                      {mortgageConfig && 'bankLoan' in mortgageConfig && (
                        <p className="text-xs text-gray-500 mt-1">
                          MAS stress test rate: {mortgageConfig.bankLoan.typicalInterestRangePct.max}%
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="loanTenure">Loan Tenure: {loanTenureYears} years</Label>
                      <Slider
                        id="loanTenure"
                        min={5}
                        max={30}
                        step={1}
                        value={[loanTenureYears]}
                        onValueChange={(val) => setLoanTenureYears(val[0])}
                        className="mt-2"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column: Results */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">TDSR Results</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {tdsrResult ? (
                      <>
                        <div>
                          <p className="text-sm text-gray-500">Effective Monthly Income</p>
                          <p className="text-2xl font-bold">{formatCurrency(effectiveMonthlyIncome)}</p>
                          {borrowingConfig && 'tdsr' in borrowingConfig && (
                            <p className="text-xs text-gray-400">
                              After {borrowingConfig.tdsr.variableIncomeHaircutPct}% haircut on variable income
                            </p>
                          )}
                        </div>

                        {borrowingConfig && 'tdsr' in borrowingConfig && (
                          <div>
                            <p className="text-sm text-gray-500">
                              TDSR Limit ({formatPercentage(borrowingConfig.tdsr.limit)})
                            </p>
                            <p className="text-2xl font-bold">
                              {formatCurrency(effectiveMonthlyIncome * borrowingConfig.tdsr.limit)}
                            </p>
                          </div>
                        )}

                        <div>
                          <p className="text-sm text-gray-500">Current Obligations</p>
                          <p className="text-2xl font-bold">{formatCurrency(totalMonthlyDebts)}</p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-500">Available for Mortgage</p>
                          <p className="text-2xl font-bold text-emerald-600">
                            {formatCurrency(Math.max(0, tdsrResult.remainingCapacitySGD))}
                          </p>
                        </div>

                        <div className="pt-4 border-t">
                          <p className="text-sm text-gray-500">Maximum Loan Amount</p>
                          <p className="text-3xl font-bold text-emerald-600">
                            {maxLoanTDSR ? formatCurrency(maxLoanTDSR.maxLoan) : 'N/A'}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-500">Maximum Property Price (at 75% LTV)</p>
                          <p className="text-2xl font-bold">
                            {maxLoanTDSR ? formatCurrency(maxLoanTDSR.maxLoan / 0.75) : 'N/A'}
                          </p>
                        </div>

                        {/* Traffic Light Indicator */}
                        {trafficLightStatus && (
                          <Alert className={
                            trafficLightStatus.color === 'green' ? 'bg-green-50 border-green-200' :
                            trafficLightStatus.color === 'yellow' ? 'bg-yellow-50 border-yellow-200' :
                            'bg-red-50 border-red-200'
                          }>
                            <AlertTitle className="flex items-center gap-2">
                              <span className="text-2xl">
                                {trafficLightStatus.color === 'green' ? '🟢' : trafficLightStatus.color === 'yellow' ? '🟡' : '🔴'}
                              </span>
                              {trafficLightStatus.label}
                            </AlertTitle>
                            <AlertDescription>
                              Your TDSR ratio: {formatPercentage(tdsrResult.tdsrRatio)}
                            </AlertDescription>
                          </Alert>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-gray-400">Please enter your monthly income to calculate TDSR</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* MSR Tab */}
          <TabsContent value="msr" className="mt-6">
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-gray-400">
                  <p>MSR tab coming next</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        {borrowingConfig && 'tdsr' in borrowingConfig && (
          <div className="mt-12 text-center text-xs text-gray-400">
            Rates effective as of {borrowingConfig.tdsr.description ? 'Jan 2024' : 'current'}
            <br />
            Source: Monetary Authority of Singapore
          </div>
        )}
      </div>
    </main>
  );
}
