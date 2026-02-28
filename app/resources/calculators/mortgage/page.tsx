'use client';

import { useState, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { CalculatorNav } from '@/components/calculators/CalculatorNav';
import { CalculatorContainer } from '@/components/calculators/CalculatorContainer';
import { PillToggle } from '@/components/calculators/PillToggle';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import { useMortgageCalculation, DEFAULT_INTEREST_RATE } from '@/hooks/calculators/useMortgageCalculation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ROWS_PER_PAGE = 24;

// ── Formatting helpers ──────────────────────────────────────────────────────
function formatSGD(value: number) {
    return `S$${Math.round(value).toLocaleString('en-SG')}`;
}

function formatSGDFull(value: number) {
    return new Intl.NumberFormat('en-SG', {
        style: 'currency',
        currency: 'SGD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(Math.round(value));
}

// ── Custom Recharts Tooltip ─────────────────────────────────────────────────
function AmortizationTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg text-sm">
            <p className="font-semibold text-gray-900 mb-1">Year {label}</p>
            {payload.map((p: any) => (
                <p key={p.name} style={{ color: p.color }} className="flex gap-2 justify-between">
                    <span>{p.name}:</span>
                    <span className="font-medium">{formatSGD(p.value)}</span>
                </p>
            ))}
        </div>
    );
}

// ── Month/Year Picker ────────────────────────────────────────────────────────
function MonthYearPicker({
    value,
    onChange,
}: {
    value: Date;
    onChange: (d: Date) => void;
}) {
    const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 31 }, (_, i) => currentYear + i);

    return (
        <div className="flex gap-2">
            <select
                className="h-11 flex-1 rounded-lg border border-gray-300 px-3 text-sm focus:ring-2 focus:ring-emerald-500 bg-white"
                value={value.getMonth()}
                onChange={(e) => {
                    const d = new Date(value);
                    d.setMonth(Number(e.target.value));
                    onChange(d);
                }}
            >
                {months.map((m, i) => (
                    <option key={m} value={i}>{m}</option>
                ))}
            </select>
            <select
                className="h-11 flex-1 rounded-lg border border-gray-300 px-3 text-sm focus:ring-2 focus:ring-emerald-500 bg-white"
                value={value.getFullYear()}
                onChange={(e) => {
                    const d = new Date(value);
                    d.setFullYear(Number(e.target.value));
                    onChange(d);
                }}
            >
                {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                ))}
            </select>
        </div>
    );
}

// ── Results Stat Card ────────────────────────────────────────────────────────
function StatCard({
    label,
    value,
    highlight = false,
    sub,
}: {
    label: string;
    value: string;
    highlight?: boolean;
    sub?: string;
}) {
    return (
        <div
            className={`rounded-xl p-4 ${highlight
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-50 border border-gray-200'}`}
        >
            <p className={`text-xs font-medium mb-1 ${highlight ? 'text-emerald-100' : 'text-gray-500'}`}>
                {label}
            </p>
            <p className={`text-xl font-bold ${highlight ? 'text-white' : 'text-gray-900'}`}>
                {value}
            </p>
            {sub && (
                <p className={`text-xs mt-1 ${highlight ? 'text-emerald-200' : 'text-gray-400'}`}>{sub}</p>
            )}
        </div>
    );
}

// ── Rate Comparison Card ─────────────────────────────────────────────────────
function RateCard({
    label,
    rate,
    monthlyRepayment,
    totalInterest,
    isCurrent,
}: {
    label: string;
    rate: number;
    monthlyRepayment: number;
    totalInterest: number;
    isCurrent: boolean;
}) {
    return (
        <div
            className={`rounded-xl p-4 border ${isCurrent
                ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200'
                : 'border-gray-200 bg-white'}`}
        >
            <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
                {isCurrent && (
                    <span className="text-xs bg-emerald-100 text-emerald-700 font-semibold px-2 py-0.5 rounded-full">
                        Current
                    </span>
                )}
            </div>
            <p className="text-2xl font-bold text-gray-900">{rate.toFixed(2)}%</p>
            <div className="mt-3 space-y-1">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Monthly</span>
                    <span className="font-semibold text-gray-900">{formatSGD(monthlyRepayment)}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Total Interest</span>
                    <span className="font-semibold text-gray-600">{formatSGD(totalInterest)}</span>
                </div>
            </div>
        </div>
    );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function MortgageCalculatorPage() {
    const {
        propertyValue,
        setPropertyValue,
        loanInputMode,
        setLoanInputMode,
        loanPercentage,
        setLoanPercentage,
        loanFixed,
        setLoanFixed,
        loanAmount,
        tenureYears,
        setTenureYears,
        interestRate,
        setInterestRate,
        startDate,
        setStartDate,
        borrowerAge,
        setBorrowerAge,
        maxTenure,
        summary,
        schedule,
        chartData,
        rateComparison,
    } = useMortgageCalculation();

    const [tablePage, setTablePage] = useState(0);
    const [jumpYear, setJumpYear] = useState<string>('');

    const totalTablePages = Math.ceil(schedule.length / ROWS_PER_PAGE);
    const tableRows = schedule.slice(tablePage * ROWS_PER_PAGE, (tablePage + 1) * ROWS_PER_PAGE);

    function handleJumpYear(yearStr: string) {
        setJumpYear(yearStr);
        const year = parseInt(yearStr, 10);
        if (!isNaN(year) && year >= 1 && year <= tenureYears) {
            const targetMonthIdx = (year - 1) * 12;
            const page = Math.floor(targetMonthIdx / ROWS_PER_PAGE);
            setTablePage(Math.min(page, totalTablePages - 1));
        }
    }

    return (
        <main className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

                {/* Header */}
                <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-2">
                    RESOURCES / CALCULATORS / MORTGAGE
                </p>
                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                    Mortgage Repayment Calculator
                </h1>
                <CalculatorNav active="mortgage" />
                <p className="text-sm text-gray-600 mb-8">
                    Estimate your monthly repayment, total interest paid, and view the full amortization breakdown.
                </p>

                {/* ── Inputs + Outputs ─────────────────────────────────────────── */}
                <CalculatorContainer title="">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Left: Inputs */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* Property Value */}
                            <div className="flex items-center gap-4">
                                <label className="w-48 text-sm font-medium text-gray-900 flex-shrink-0">
                                    Property Value (SGD)
                                </label>
                                <div className="relative flex-1">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">S$</span>
                                    <input
                                        id="property-value"
                                        type="number"
                                        min="0"
                                        placeholder="1,000,000"
                                        value={propertyValue || ''}
                                        onChange={(e) => setPropertyValue(e.target.value === '' ? 0 : Number(e.target.value))}
                                        className="h-11 pl-9 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 px-4 text-sm"
                                    />
                                </div>
                            </div>

                            {/* Loan Amount Toggle */}
                            <div className="flex items-start gap-4">
                                <label className="w-48 text-sm font-medium text-gray-900 flex-shrink-0 pt-1">
                                    Loan Amount
                                </label>
                                <div className="flex-1 space-y-2">
                                    {/* Mode toggle */}
                                    <PillToggle
                                        value={loanInputMode}
                                        onChange={(val) => setLoanInputMode(val as 'percentage' | 'fixed')}
                                        options={[
                                            { value: 'percentage', label: '% of Value' },
                                            { value: 'fixed', label: 'Fixed Amount' },
                                        ]}
                                    />
                                    {/* Input field */}
                                    {loanInputMode === 'percentage' ? (
                                        <div className="flex items-center gap-3">
                                            <div className="relative flex-1">
                                                <input
                                                    id="loan-pct"
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    step="0.5"
                                                    value={loanPercentage}
                                                    onChange={(e) => setLoanPercentage(Number(e.target.value))}
                                                    className="h-11 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 px-4 pr-8 text-sm"
                                                />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                                            </div>
                                            <span className="text-sm text-gray-500">
                                                = {formatSGD(loanFixed || loanAmount)}
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3">
                                            <div className="relative flex-1">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">S$</span>
                                                <input
                                                    id="loan-fixed"
                                                    type="number"
                                                    min="0"
                                                    value={loanFixed || ''}
                                                    onChange={(e) => setLoanFixed(e.target.value === '' ? 0 : Number(e.target.value))}
                                                    className="h-11 pl-9 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 px-4 text-sm"
                                                />
                                            </div>
                                            <span className="text-sm text-gray-500 whitespace-nowrap">
                                                = {propertyValue > 0 ? loanPercentage.toFixed(1) : '—'}%
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Loan Tenure Slider */}
                            <div className="flex items-start gap-4">
                                <label className="w-48 text-sm font-medium text-gray-900 flex-shrink-0 pt-1">
                                    Loan Tenure
                                </label>
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-3">
                                        <input
                                            id="tenure-slider"
                                            type="range"
                                            min="5"
                                            max={maxTenure}
                                            step="1"
                                            value={tenureYears}
                                            onChange={(e) => setTenureYears(Number(e.target.value))}
                                            className="flex-1 h-2 rounded-full accent-emerald-600"
                                        />
                                        <span className="text-sm font-semibold text-gray-900 w-20 text-right">
                                            {tenureYears} years
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-400">
                                        <span>5 yrs</span>
                                        <span>{maxTenure} yrs</span>
                                    </div>
                                    {/* Age input for max tenure note */}
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span>Borrower age (optional):</span>
                                        <input
                                            type="number"
                                            min="21"
                                            max="65"
                                            placeholder="e.g. 35"
                                            value={borrowerAge ?? ''}
                                            onChange={(e) => setBorrowerAge(e.target.value === '' ? null : Number(e.target.value))}
                                            className="w-20 h-7 rounded border border-gray-300 px-2 text-xs"
                                        />
                                        {borrowerAge !== null && (
                                            <span className="text-emerald-600 font-medium">
                                                Max tenure: min(30, 65 − {borrowerAge}) = {maxTenure} yrs
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Interest Rate */}
                            <div className="flex items-center gap-4">
                                <div className="w-48 flex-shrink-0">
                                    <label className="text-sm font-medium text-gray-900 block">Interest Rate</label>
                                    <p className="text-xs text-gray-400 mt-0.5">Updated periodically</p>
                                </div>
                                <div className="relative flex-1">
                                    <input
                                        id="interest-rate"
                                        type="number"
                                        min="0.01"
                                        max="20"
                                        step="0.05"
                                        value={interestRate}
                                        onChange={(e) => setInterestRate(Number(e.target.value))}
                                        className="h-11 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 px-4 pr-8 text-sm"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">% p.a.</span>
                                </div>
                            </div>

                            {/* Loan Start Date */}
                            <div className="flex items-center gap-4">
                                <label className="w-48 text-sm font-medium text-gray-900 flex-shrink-0">
                                    Loan Start Date
                                </label>
                                <div className="flex-1">
                                    <MonthYearPicker value={startDate} onChange={setStartDate} />
                                </div>
                            </div>
                        </div>

                        {/* Right: Summary Outputs */}
                        <div className="lg:col-span-1 space-y-3">
                            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-1">
                                Summary
                            </h3>
                            <Suspense fallback={<Skeleton className="w-full h-48 rounded-xl" />}>
                                <StatCard
                                    label="Monthly Repayment"
                                    value={summary ? formatSGDFull(summary.monthlyRepayment) : '—'}
                                    highlight
                                    sub={summary ? `Over ${tenureYears} years` : undefined}
                                />
                                <StatCard
                                    label="Total Loan Amount"
                                    value={summary ? formatSGDFull(summary.totalLoanAmount) : '—'}
                                />
                                <StatCard
                                    label="Total Interest Paid"
                                    value={summary ? formatSGDFull(summary.totalInterestPaid) : '—'}
                                />
                                <StatCard
                                    label="Total Payment"
                                    value={summary ? formatSGDFull(summary.totalPayment) : '—'}
                                    sub={summary ? `Loan + Interest` : undefined}
                                />
                                <StatCard
                                    label="Interest as % of Total"
                                    value={summary ? `${summary.interestPercentage.toFixed(1)}%` : '—'}
                                />
                            </Suspense>
                        </div>
                    </div>
                </CalculatorContainer>

                {/* Empty prompt when no property value entered */}
                {chartData.length === 0 && (
                    <div className="mt-8 rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-12 text-center">
                        <p className="text-sm font-medium text-gray-500">Enter a property value above to see your amortization schedule.</p>
                    </div>
                )}

                {/* ── Amortization Chart ────────────────────────────────────────── */}
                {chartData.length > 0 && (
                    <div className="mt-8">
                        <CalculatorContainer title="">
                            <h2 className="text-lg font-semibold text-gray-900 mb-5">
                                Amortization Overview
                            </h2>
                            <ResponsiveContainer width="100%" height={320}>
                                <AreaChart
                                    data={chartData}
                                    margin={{ top: 4, right: 24, left: 24, bottom: 0 }}
                                >
                                    <defs>
                                        <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.04} />
                                        </linearGradient>
                                        <linearGradient id="interestGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#f97316" stopOpacity={0.04} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis
                                        dataKey="year"
                                        tick={{ fontSize: 12, fill: '#6b7280' }}
                                        label={{ value: 'Year', position: 'insideBottom', offset: -2, fontSize: 12, fill: '#9ca3af' }}
                                        tickFormatter={(v) => `Y${v}`}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 11, fill: '#6b7280' }}
                                        tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                                        width={60}
                                    />
                                    <Tooltip content={<AmortizationTooltip />} />
                                    <Legend
                                        wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
                                        formatter={(value) => <span className="text-gray-600">{value}</span>}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="balance"
                                        name="Remaining Principal"
                                        stroke="#10b981"
                                        strokeWidth={2}
                                        fill="url(#balanceGrad)"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="cumulativeInterest"
                                        name="Cumulative Interest"
                                        stroke="#f97316"
                                        strokeWidth={2}
                                        fill="url(#interestGrad)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CalculatorContainer>
                    </div>
                )}

                {/* ── Amortization Table ────────────────────────────────────────── */}
                {schedule.length > 0 && (
                    <div className="mt-6">
                        <CalculatorContainer title="">
                            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Amortization Schedule
                                </h2>
                                <div className="flex items-center gap-3 text-sm">
                                    <label className="text-gray-500">Jump to year:</label>
                                    <select
                                        value={jumpYear}
                                        onChange={(e) => handleJumpYear(e.target.value)}
                                        className="h-8 rounded-lg border border-gray-300 px-2 text-sm bg-white"
                                    >
                                        <option value="">— Select —</option>
                                        {Array.from({ length: tenureYears }, (_, i) => i + 1).map((y) => (
                                            <option key={y} value={y}>Year {y}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="overflow-x-auto rounded-lg border border-gray-200">
                                <table className="min-w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-200">
                                            {['Month', 'Payment', 'Principal', 'Interest', 'Balance', 'Cumulative Interest'].map((col) => (
                                                <th
                                                    key={col}
                                                    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide"
                                                >
                                                    {col}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {tableRows.map((row, idx) => {
                                            const isYearStart = row.month % 12 === 1;
                                            return (
                                                <tr
                                                    key={row.month}
                                                    className={`${isYearStart ? 'bg-emerald-50/40' : idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-emerald-50/60 transition-colors`}
                                                >
                                                    <td className="px-4 py-2.5 text-gray-600 whitespace-nowrap">
                                                        {isYearStart && (
                                                            <span className="text-xs font-semibold text-emerald-600 mr-1">
                                                                Y{Math.ceil(row.month / 12)}
                                                            </span>
                                                        )}
                                                        {row.month}
                                                    </td>
                                                    <td className="px-4 py-2.5 font-medium text-gray-900">{formatSGD(row.payment)}</td>
                                                    <td className="px-4 py-2.5 text-emerald-700">{formatSGD(row.principalComponent)}</td>
                                                    <td className="px-4 py-2.5 text-orange-600">{formatSGD(row.interestComponent)}</td>
                                                    <td className="px-4 py-2.5 text-gray-700">{formatSGD(row.remainingBalance)}</td>
                                                    <td className="px-4 py-2.5 text-gray-500">{formatSGD(row.cumulativeInterest)}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
                                <span>
                                    Showing months {tablePage * ROWS_PER_PAGE + 1}–{Math.min((tablePage + 1) * ROWS_PER_PAGE, schedule.length)} of {schedule.length}
                                </span>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setTablePage((p) => Math.max(0, p - 1))}
                                        disabled={tablePage === 0}
                                        className="gap-1"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        Prev
                                    </Button>
                                    <span className="px-2 font-medium text-gray-700">
                                        {tablePage + 1} / {totalTablePages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setTablePage((p) => Math.min(totalTablePages - 1, p + 1))}
                                        disabled={tablePage >= totalTablePages - 1}
                                        className="gap-1"
                                    >
                                        Next
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </CalculatorContainer>
                    </div>
                )}

                {/* ── Rate Sensitivity Panel ─────────────────────────────────────── */}
                {rateComparison.length > 0 && (
                    <div className="mt-6">
                        <CalculatorContainer title="">
                            <div className="mb-5">
                                <h2 className="text-lg font-semibold text-gray-900">Rate Sensitivity</h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    See how your repayment changes if rates shift by 0.5%.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {rateComparison.map((card, i) => (
                                    <RateCard
                                        key={card.label}
                                        label={card.label}
                                        rate={card.rate}
                                        monthlyRepayment={card.monthlyRepayment}
                                        totalInterest={card.totalInterest}
                                        isCurrent={i === 1}
                                    />
                                ))}
                            </div>
                            <p className="text-xs text-gray-400 mt-4">
                                * Calculations assume a fixed interest rate for the full loan tenure.
                                Actual rates may be floating and subject to change.
                            </p>
                        </CalculatorContainer>
                    </div>
                )}

            </div>
        </main>
    );
}
