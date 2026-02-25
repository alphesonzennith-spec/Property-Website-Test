'use client';

import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { CalculatorNav } from '@/components/calculators/CalculatorNav';
import { CalculatorContainer } from '@/components/calculators/CalculatorContainer';
import { PillToggle } from '@/components/calculators/PillToggle';
import { useAffordabilityCalculation } from '@/hooks/calculators/useAffordabilityCalculation';
import { useAuth } from '@/lib/hooks/useAuth';
import { trpc } from '@/lib/trpc/client';
import { PropertyType, ResidencyStatus } from '@/types';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  BadgeCheck,
  Info,
} from 'lucide-react';

// ── Helpers ────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  Math.round(n).toLocaleString('en-SG');

function CurrencyInput({
  id,
  label,
  value,
  onChange,
  disabled = false,
  helpText,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
  helpText?: string;
}) {
  return (
    <div className={disabled ? 'opacity-40 pointer-events-none' : ''}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium select-none">S$</span>
        <input
          id={id}
          type="number"
          min="0"
          placeholder="0"
          value={value || ''}
          onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))}
          disabled={disabled}
          className="h-11 pl-9 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none px-4 text-sm transition-colors"
        />
      </div>
      {helpText && (
        <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
          <Info className="w-3 h-3 flex-shrink-0" />{helpText}
        </p>
      )}
    </div>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-widest mb-4 pb-2 border-b border-emerald-100">
      {children}
    </h3>
  );
}

function TrafficDot({ pass, binding }: { pass: boolean; binding: boolean }) {
  if (binding && !pass) return <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />;
  if (!pass) return <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />;
  return <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />;
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function AffordabilityCalculatorPage() {
  const auth = useAuth();

  const {
    applicantMode, setApplicantMode,
    residency, setResidency,
    age, setAge,
    propertiesOwned, setPropertiesOwned,
    fixedIncome, setFixedIncome,
    variableIncome, setVariableIncome,
    cpfOABalance, setCpfOABalance,
    cashOnHand, setCashOnHand,
    creditCardMin, setCreditCardMin,
    carLoan, setCarLoan,
    otherHomeLoans, setOtherHomeLoans,
    otherLoans, setOtherLoans,
    jointFixedIncome, setJointFixedIncome,
    jointVariableIncome, setJointVariableIncome,
    propertyType, setPropertyType,
    tenure, setTenure,
    effectiveTenure,
    interestRate, setInterestRate,
    results,
    tdsrLimitPct,
    msrLimitPct,
    haircutPct,
    borrowingConfig,
    isLoading,
    error,
  } = useAffordabilityCalculation();

  // ── Singpass Auto-fill ──────────────────────────────────────────────────
  const [autoFilled, setAutoFilled] = useState(false);
  useEffect(() => {
    if (auth.isSingpassVerified && !autoFilled) {
      // Map MyInfo residentialStatus → ResidencyStatus enum
      if (auth.residentialStatus === 'CITIZEN') setResidency(ResidencyStatus.Singaporean);
      else if (auth.residentialStatus === 'PR') setResidency(ResidencyStatus.PR);
      else if (auth.residentialStatus === 'FOREIGNER') setResidency(ResidencyStatus.Foreigner);

      // Count properties from MyInfo flags
      let count = 0;
      if (auth.ownsPrivateProperty) count++;
      if (auth.hdbFlatType) count++;
      setPropertiesOwned(count);

      // Derive age from dateOfBirth
      if (auth.dateOfBirth) {
        const dob = new Date(auth.dateOfBirth);
        const now = new Date();
        const derivedAge = now.getFullYear() - dob.getFullYear();
        setAge(derivedAge);
      }

      setAutoFilled(true);
    }
  }, [auth.isSingpassVerified]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Matched properties (AI integration) ────────────────────────────────
  const matchedProperties = trpc.properties.list.useQuery(
    { priceMax: results?.maxAffordablePrice ?? 0, limit: 4, sortBy: 'quality_score' },
    { enabled: !!results && results.maxAffordablePrice > 0 }
  );

  // ── Loading / Error states ──────────────────────────────────────────────
  if (isLoading) {
    return (
      <main className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Skeleton className="h-6 w-64 mb-3" />
          <Skeleton className="h-10 w-[480px] mb-6" />
          <Skeleton className="h-[700px] w-full" />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Alert variant="destructive">
            <AlertTitle>Error loading calculator</AlertTitle>
            <AlertDescription>Unable to load regulatory rates. Please refresh and try again.</AlertDescription>
          </Alert>
        </div>
      </main>
    );
  }

  const isJoint = applicantMode === 'joint';
  const isHdbOrEc = propertyType === PropertyType.HDB || propertyType === PropertyType.EC;

  // LTV note from config (no hardcoded numbers)
  const ltvNote = (() => {
    if (!borrowingConfig) return null;
    const rule = borrowingConfig.ltv.rules.find(
      (r) => r.propertyType === propertyType && r.existingLoans <= propertiesOwned
    );
    return rule
      ? `LTV up to ${rule.maxLTVPct}% — min ${rule.minCashDownPaymentPct}% cash downpayment`
      : null;
  })();

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-2">
          RESOURCES / CALCULATORS / AFFORDABILITY
        </p>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Affordability Planner
        </h1>
        <CalculatorNav active="affordability" />
        <p className="text-sm text-gray-600 mb-8">
          Reverse-engineer your budget — find out the maximum property price that fits your income, savings, and regulatory limits.
        </p>

        {/* Singpass autofill badge */}
        {autoFilled && (
          <div className="flex items-center gap-2 mb-6 px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl w-fit text-sm text-emerald-700 font-medium">
            <BadgeCheck className="w-4 h-4" />
            Auto-filled from Singpass profile
          </div>
        )}

        {/* Main Calculator Grid */}
        <CalculatorContainer title="">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
            {/* ── Left Column: Inputs ────────────────────────────────────── */}
            <div className="xl:col-span-2 space-y-8">

              {/* ── Section 1: Personal Situation ─── */}
              <div>
                <SectionHeader>Personal Situation</SectionHeader>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Application Status */}
                  <div className="sm:col-span-2 flex items-center gap-4">
                    <label className="w-44 text-sm font-medium text-gray-700 flex-shrink-0">Application Status</label>
                    <PillToggle
                      value={applicantMode}
                      onChange={(v) => setApplicantMode(v as 'single' | 'joint')}
                      options={[{ value: 'single', label: 'Single' }, { value: 'joint', label: 'Joint' }]}
                    />
                  </div>

                  {/* Residency */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">My Residency</label>
                    <select
                      value={residency}
                      onChange={(e) => setResidency(e.target.value as ResidencyStatus)}
                      className="h-11 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none px-3 text-sm bg-white"
                    >
                      <option value={ResidencyStatus.Singaporean}>Singaporean Citizen</option>
                      <option value={ResidencyStatus.PR}>Permanent Resident (PR)</option>
                      <option value={ResidencyStatus.Foreigner}>Foreigner</option>
                    </select>
                  </div>

                  {/* Age */}
                  <div>
                    <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                      Age (affects max tenure)
                    </label>
                    <input
                      id="age"
                      type="number"
                      min="18"
                      max="75"
                      value={age || ''}
                      onChange={(e) => setAge(Number(e.target.value))}
                      className="h-11 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none px-4 text-sm"
                    />
                  </div>

                  {/* Properties Owned */}
                  <div className="sm:col-span-2 flex items-center gap-4">
                    <label className="w-44 text-sm font-medium text-gray-700 flex-shrink-0">Properties Currently Owned</label>
                    <PillToggle
                      value={String(propertiesOwned)}
                      onChange={(v) => setPropertiesOwned(Number(v))}
                      options={[
                        { value: '0', label: '0' },
                        { value: '1', label: '1' },
                        { value: '2', label: '2' },
                        { value: '3', label: '3+' },
                      ]}
                    />
                  </div>
                </div>
              </div>

              {/* ── Section 2: Financial Position ─── */}
              <div>
                <SectionHeader>Financial Position</SectionHeader>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <CurrencyInput
                    id="fixed-income"
                    label="Fixed Monthly Income"
                    value={fixedIncome}
                    onChange={setFixedIncome}
                  />
                  <CurrencyInput
                    id="variable-income"
                    label="Variable Monthly Income"
                    value={variableIncome}
                    onChange={setVariableIncome}
                    helpText={`${haircutPct}% haircut applied per MAS`}
                  />

                  {/* Joint income — shown only when joint */}
                  {isJoint && (
                    <>
                      <CurrencyInput
                        id="joint-fixed-income"
                        label="Joint Applicant Fixed Income"
                        value={jointFixedIncome}
                        onChange={setJointFixedIncome}
                      />
                      <CurrencyInput
                        id="joint-variable-income"
                        label="Joint Applicant Variable Income"
                        value={jointVariableIncome}
                        onChange={setJointVariableIncome}
                        helpText={`${haircutPct}% haircut applied per MAS`}
                      />
                    </>
                  )}

                  <CurrencyInput id="cpf" label="CPF OA Balance" value={cpfOABalance} onChange={setCpfOABalance} />
                  <CurrencyInput id="cash" label="Cash on Hand" value={cashOnHand} onChange={setCashOnHand} />

                  <div className="sm:col-span-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Monthly Debt Obligations</p>
                    <div className="grid grid-cols-2 gap-4">
                      <CurrencyInput id="cc" label="Credit Card Min." value={creditCardMin} onChange={setCreditCardMin} />
                      <CurrencyInput id="car" label="Car Loan" value={carLoan} onChange={setCarLoan} />
                      <CurrencyInput id="home-loans" label="Other Home Loans" value={otherHomeLoans} onChange={setOtherHomeLoans} />
                      <CurrencyInput id="other-loans" label="Other Loans" value={otherLoans} onChange={setOtherLoans} />
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Section 3: Property Variables ─── */}
              <div>
                <SectionHeader>Property Variables</SectionHeader>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Property Type */}
                  <div className="sm:col-span-2 flex items-start gap-4">
                    <label className="w-44 text-sm font-medium text-gray-700 flex-shrink-0 pt-2">Property Type</label>
                    <div className="flex-1">
                      <PillToggle
                        value={propertyType}
                        onChange={(v) => setPropertyType(v as PropertyType)}
                        options={[
                          { value: PropertyType.HDB, label: 'HDB' },
                          { value: PropertyType.EC, label: 'EC' },
                          { value: PropertyType.Condo, label: 'Condo' },
                          { value: PropertyType.Landed, label: 'Landed' },
                        ]}
                      />
                      {isHdbOrEc && msrLimitPct !== null && (
                        <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                          <Info className="w-3 h-3 flex-shrink-0" />
                          MSR limit of {msrLimitPct}% applies to HDB / EC purchases
                        </p>
                      )}
                      {ltvNote && (
                        <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                          <Info className="w-3 h-3 flex-shrink-0" />{ltvNote}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Preferred Tenure */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preferred Loan Tenure
                    </label>
                    <select
                      value={tenure}
                      onChange={(e) => setTenure(Number(e.target.value))}
                      className="h-11 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none px-3 text-sm bg-white"
                    >
                      {[10, 15, 20, 25, 30].map((yr) => (
                        <option key={yr} value={yr}>{yr} years</option>
                      ))}
                    </select>
                    {effectiveTenure < tenure && (
                      <p className="text-xs text-amber-600 mt-1">
                        Capped at {effectiveTenure} years due to age (max loan age = 65)
                      </p>
                    )}
                  </div>

                  {/* Interest Rate */}
                  <div>
                    <label htmlFor="rate" className="block text-sm font-medium text-gray-700 mb-1">
                      Annual Interest Rate (%)
                    </label>
                    <input
                      id="rate"
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="15"
                      value={interestRate}
                      onChange={(e) => setInterestRate(Number(e.target.value))}
                      className="h-11 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none px-4 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ── Right Column: Results ──────────────────────────────────── */}
            <div className="xl:col-span-1 space-y-5">
              {!results ? (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-gray-400">
                  <p className="text-sm font-medium">Enter your income and savings to see results</p>
                </div>
              ) : (
                <>
                  {/* Main Result Card */}
                  <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 p-6 text-white shadow-xl">
                    <p className="text-xs font-semibold uppercase tracking-widest opacity-75 mb-1">Maximum Property Price</p>
                    <p className="text-4xl font-extrabold tracking-tight mb-1">
                      ${fmt(results.maxAffordablePrice)}
                    </p>
                    <p className="text-sm opacity-80">
                      Est. repayment: <span className="font-bold text-white">${fmt(results.estimatedMonthlyRepayment)}/mo</span>{' '}
                      at {interestRate}% for {effectiveTenure} yrs
                    </p>
                  </div>

                  {/* Binding Constraint Banner */}
                  <div className={`rounded-xl px-4 py-3 flex items-center gap-3 text-sm font-semibold
                    ${results.bindingConstraint === 'Cash' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-amber-50 text-amber-800 border border-amber-200'}`}>
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    Your limit is set by: <span className="font-extrabold">{results.bindingConstraint}</span>
                  </div>

                  {/* Constraint Analysis */}
                  <div className="rounded-2xl border border-gray-200 bg-white shadow-sm divide-y divide-gray-100 overflow-hidden">
                    <div className="px-4 py-3 bg-gray-50">
                      <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Constraint Analysis</p>
                    </div>

                    {/* TDSR */}
                    <div className="px-4 py-3 flex items-center gap-3">
                      <TrafficDot pass={results.constraints.tdsr.withinLimit} binding={results.constraints.tdsr.isBinding} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800">TDSR Check</p>
                        <p className="text-xs text-gray-500">
                          Your ratio: <span className="font-bold">{(results.constraints.tdsr.ratioActual * 100).toFixed(1)}%</span>
                          {' '}— limit: {tdsrLimitPct ?? ''}%
                        </p>
                      </div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${results.constraints.tdsr.withinLimit ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                        {results.constraints.tdsr.withinLimit ? 'PASS' : 'FAIL'}
                      </span>
                    </div>

                    {/* MSR (HDB/EC only) */}
                    {results.constraints.msr ? (
                      <div className="px-4 py-3 flex items-center gap-3">
                        <TrafficDot pass={results.constraints.msr.withinLimit} binding={results.constraints.msr.isBinding} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800">MSR Check</p>
                          <p className="text-xs text-gray-500">
                            Your ratio: <span className="font-bold">{(results.constraints.msr.ratioActual * 100).toFixed(1)}%</span>
                            {' '}— limit: {msrLimitPct ?? ''}%
                          </p>
                        </div>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${results.constraints.msr.withinLimit ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                          {results.constraints.msr.withinLimit ? 'PASS' : 'FAIL'}
                        </span>
                      </div>
                    ) : (
                      <div className="px-4 py-3 flex items-center gap-3 opacity-40">
                        <CheckCircle2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-400">MSR Check</p>
                          <p className="text-xs text-gray-400">Not applicable for {propertyType}</p>
                        </div>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">N/A</span>
                      </div>
                    )}

                    {/* LTV */}
                    <div className="px-4 py-3 flex items-center gap-3">
                      <TrafficDot pass={results.constraints.ltv.withinLimit} binding={results.constraints.ltv.isBinding} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800">LTV Check</p>
                        <p className="text-xs text-gray-500">
                          Max loan: <span className="font-bold">{(results.ltvApplied * 100).toFixed(0)}%</span> of property value
                        </p>
                      </div>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">PASS</span>
                    </div>

                    {/* Cash */}
                    <div className="px-4 py-3 flex items-center gap-3">
                      <TrafficDot pass={results.constraints.cash.withinLimit} binding={results.constraints.cash.isBinding} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800">Cash / CPF Check</p>
                        <p className="text-xs text-gray-500">
                          Need: <span className="font-bold">${fmt(results.downpayment.totalCashNeeded)}</span>
                          {' '}— Have: ${fmt(cashOnHand)}
                        </p>
                      </div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${results.constraints.cash.withinLimit ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                        {results.constraints.cash.withinLimit ? 'PASS' : 'FAIL'}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </CalculatorContainer>

        {/* ── Results Detail (only shown when there are results) ────────── */}
        {results && (
          <>
            {/* Payment Breakdown + Chart */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">

              {/* Payment Breakdown Table */}
              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                  <p className="text-sm font-bold text-gray-800">Payment Breakdown</p>
                  <p className="text-xs text-gray-500">at max affordable price of ${fmt(results.maxAffordablePrice)}</p>
                </div>
                <table className="w-full text-sm">
                  <tbody>
                    {[
                      { label: 'Option to Purchase (min cash)', sub: 'Cash required', value: results.downpayment.optionToPurchase, accent: false },
                      { label: 'Exercise Option (balance downpayment)', sub: 'CPF or Cash eligible', value: results.downpayment.exerciseOption, accent: false },
                      { label: 'Loan Amount', sub: `${(results.ltvApplied * 100).toFixed(0)}% LTV`, value: results.downpayment.loanAmount, accent: false },
                      { label: 'Estimated BSD', sub: 'Buyer\'s Stamp Duty', value: results.downpayment.bsd, accent: false },
                      ...(results.downpayment.absd > 0
                        ? [{ label: 'Estimated ABSD', sub: 'Additional Buyer\'s Stamp Duty', value: results.downpayment.absd, accent: false }]
                        : []),
                      { label: 'Total Cash Needed', sub: 'OTP + cash downpayment + stamp duties', value: results.downpayment.totalCashNeeded, accent: true },
                      { label: 'Total CPF Used', sub: 'From CPF OA balance', value: results.downpayment.totalCPFUsed, accent: false },
                    ].map((row, i) => (
                      <tr key={i} className={`border-b border-gray-100 last:border-0 ${row.accent ? 'bg-emerald-50' : 'hover:bg-gray-50'}`}>
                        <td className="px-5 py-3">
                          <p className={`font-medium ${row.accent ? 'text-emerald-800' : 'text-gray-700'}`}>{row.label}</p>
                          <p className="text-xs text-gray-400">{row.sub}</p>
                        </td>
                        <td className={`px-5 py-3 text-right tabular-nums font-bold ${row.accent ? 'text-emerald-700' : 'text-gray-800'}`}>
                          ${fmt(row.value)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Composition Bar Chart */}
              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
                <p className="text-sm font-bold text-gray-800 mb-1">Budget Composition</p>
                <p className="text-xs text-gray-500 mb-6">How your purchase price is funded</p>

                {(() => {
                  const { cashAmount, cpfAmount, loanAmount, stampDutiesAmount, totalAmount } = results.chart;
                  const pct = (v: number) => totalAmount > 0 ? ((v / totalAmount) * 100).toFixed(1) : '0';
                  const bars = [
                    { label: 'Cash', value: cashAmount, pct: Number(pct(cashAmount)), color: 'bg-blue-500' },
                    { label: 'CPF OA', value: cpfAmount, pct: Number(pct(cpfAmount)), color: 'bg-purple-500' },
                    { label: 'Loan', value: loanAmount, pct: Number(pct(loanAmount)), color: 'bg-emerald-500' },
                    { label: 'Stamp Duties', value: stampDutiesAmount, pct: Number(pct(stampDutiesAmount)), color: 'bg-amber-500' },
                  ].filter((b) => b.value > 0);

                  return (
                    <>
                      {/* Stacked horizontal bar */}
                      <div className="flex h-10 rounded-xl overflow-hidden mb-6 shadow-inner">
                        {bars.map((b) => (
                          <div
                            key={b.label}
                            className={`${b.color} transition-all duration-500 flex items-center justify-center`}
                            style={{ width: `${b.pct}%` }}
                            title={`${b.label}: $${fmt(b.value)} (${b.pct}%)`}
                          />
                        ))}
                      </div>

                      {/* Legend */}
                      <div className="space-y-2.5">
                        {bars.map((b) => (
                          <div key={b.label} className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-3 h-3 rounded-full ${b.color} flex-shrink-0`} />
                              <span className="text-sm text-gray-600">{b.label}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-bold text-gray-800">${fmt(b.value)}</span>
                              <span className="text-xs text-gray-400 ml-1.5">({b.pct}%)</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* AI Property Recommendations */}
            <div className="mt-10">
              <div className="flex items-center gap-2 mb-5">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <h2 className="text-lg font-bold text-gray-800">
                  Matching Properties within Your Budget
                </h2>
                <span className="text-sm text-gray-400">
                  Based on your budget of ${fmt(results.maxAffordablePrice)}
                </span>
              </div>

              {matchedProperties.isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-52 rounded-2xl" />)}
                </div>
              ) : matchedProperties.data?.data && matchedProperties.data.data.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {matchedProperties.data.data.slice(0, 4).map((prop) => (
                    <a
                      key={prop.id}
                      href={`/properties/${prop.id}`}
                      className="block rounded-2xl border border-gray-200 bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-200 overflow-hidden group"
                    >
                      <div className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-xs font-medium">{prop.propertyType}</span>
                      </div>
                      <div className="p-4">
                        <p className="text-base font-bold text-gray-800 group-hover:text-emerald-700 transition-colors">
                          ${fmt(prop.price)}
                        </p>
                        <p className="text-xs text-gray-500 truncate mt-0.5">{prop.address}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {prop.bedrooms}BR · {prop.floorAreaSqft?.toLocaleString()} sqft
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No matching properties found within this price range.</p>
              )}
            </div>

            {/* Explain My Results Button */}
            <div className="mt-8 flex">
              <a
                href={`/resources/ai-chat?prompt=${encodeURIComponent(
                  `My affordability calculation shows I can buy up to $${fmt(results.maxAffordablePrice)}. My binding constraint is ${results.bindingConstraint}. Explain what this means and what my next steps should be.`
                )}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 transition-colors shadow"
              >
                <Sparkles className="w-4 h-4" />
                Explain My Results
              </a>
            </div>

            {/* Regulatory Footnotes */}
            {borrowingConfig && (
              <div className="mt-10 border-t border-gray-100 pt-6 text-xs text-gray-400 space-y-1">
                <p>
                  * TDSR and MSR limits sourced from MAS borrowing guidelines. LTV rules sourced from MAS property financing limits.
                </p>
                <p>
                  * All calculations are estimates for planning purposes only. Actual eligibility is subject to bank assessment.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
