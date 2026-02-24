'use client';

import { useState, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { CalculatorNav } from '@/components/calculators/CalculatorNav';
import { CalculatorContainer } from '@/components/calculators/CalculatorContainer';
import { useCPFRates } from '@/hooks/useRegulatoryRates';
import { calculateOptimalCPFSplit, type CPFScenarioResult } from '@/lib/calculations/cpf';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ReferenceLine,
    ResponsiveContainer,
} from 'recharts';
import type { CPFRates } from '@/lib/mock/regulatoryConfig';
import { Sparkles, TrendingUp, TrendingDown, Minus } from 'lucide-react';

// ── Number helpers ─────────────────────────────────────────────────────────────
const fmt = (n: number) =>
    '$' + Math.round(n).toLocaleString('en-SG');

// ── Sub-Components ─────────────────────────────────────────────────────────────

function NumberInput({
    id,
    label,
    value,
    onChange,
    prefix = 'S$',
    suffix,
    min = 0,
    max,
    step = 1,
    helpText,
}: {
    id: string;
    label: string;
    value: number | '';
    onChange: (v: number) => void;
    prefix?: string;
    suffix?: string;
    min?: number;
    max?: number;
    step?: number;
    helpText?: string;
}) {
    return (
        <div className="flex items-start gap-4">
            <label htmlFor={id} className="w-52 text-sm font-medium text-gray-900 pt-3 flex-shrink-0">
                {label}
            </label>
            <div className="flex-1 max-w-xs">
                <div className="relative">
                    {prefix && (
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none">
                            {prefix}
                        </span>
                    )}
                    <input
                        id={id}
                        type="number"
                        min={min}
                        max={max}
                        step={step}
                        placeholder="0"
                        value={value}
                        onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))}
                        className={`h-11 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm ${prefix ? 'pl-9' : 'pl-4'} ${suffix ? 'pr-10' : 'pr-4'}`}
                    />
                    {suffix && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none">
                            {suffix}
                        </span>
                    )}
                </div>
                {helpText && <p className="mt-1 text-xs text-gray-500">{helpText}</p>}
            </div>
        </div>
    );
}

function ScenarioCard({
    label,
    letter,
    scenario,
    isRecommended,
    accentColor,
}: {
    label: string;
    letter: string;
    scenario: CPFScenarioResult;
    isRecommended: boolean;
    accentColor: string;
}) {
    const rows: { title: string; value: string; sub?: string }[] = [
        {
            title: 'Monthly Cash Outflow',
            value: fmt(scenario.monthlyCashOutflow),
            sub: scenario.monthlyCPFInstallment > 0
                ? `+ ${fmt(scenario.monthlyCPFInstallment)} CPF/mo`
                : undefined,
        },
        {
            title: 'Total Interest Paid',
            value: fmt(scenario.totalInterestPaid),
        },
        {
            title: 'CPF OA at Retirement',
            value: fmt(scenario.projectedCPFOAAtRetirement),
        },
        {
            title: 'Net Wealth at Retirement',
            value: fmt(scenario.netWealthAtRetirement),
        },
    ];

    return (
        <div
            className={`relative rounded-xl border-2 bg-white p-5 flex flex-col gap-3 ${isRecommended ? 'border-blue-500 shadow-lg shadow-blue-100' : 'border-gray-200'}`}
        >
            {isRecommended && (
                <div className="absolute -top-3 left-4 flex items-center gap-1 bg-blue-600 text-white text-xs font-semibold px-3 py-0.5 rounded-full">
                    <Sparkles className="w-3 h-3" />
                    AI Recommended
                </div>
            )}
            <div className="flex items-center gap-2">
                <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0`}
                    style={{ background: accentColor }}
                >
                    {letter}
                </div>
                <h3 className="font-semibold text-gray-900">Scenario {letter}: {label}</h3>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 mt-1">
                {rows.map((row) => (
                    <div key={row.title}>
                        <p className="text-xs text-gray-500 leading-tight">{row.title}</p>
                        <p className="text-sm font-semibold text-gray-900">{row.value}</p>
                        {row.sub && <p className="text-xs text-blue-600">{row.sub}</p>}
                    </div>
                ))}
            </div>
        </div>
    );
}

// Custom chart tooltip
function ChartTooltip({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ name: string; value: number; color: string }>;
    label?: number;
}) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs">
            <p className="font-semibold text-gray-700 mb-1">Age {label}</p>
            {payload.map((p) => (
                <p key={p.name} style={{ color: p.color }}>
                    {p.name}: {fmt(p.value)}
                </p>
            ))}
        </div>
    );
}

// ── Default values ─────────────────────────────────────────────────────────────

const DEFAULTS = {
    cpfOABalance: 80000,
    cpfSABalance: 20000,
    currentAge: 32,
    retirementAge: 65,
    propertyPrice: 600000,
    loanAmount: 450000,
    loanTenureYears: 25,
    annualInterestRatePct: 3.5,
};

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function CPFOptimizerPage() {
    const { data: cpfRates, isLoading, error } = useCPFRates();

    const [cpfOABalance, setCpfOABalance] = useState(DEFAULTS.cpfOABalance);
    const [cpfSABalance, setCpfSABalance] = useState(DEFAULTS.cpfSABalance);
    const [currentAge, setCurrentAge] = useState(DEFAULTS.currentAge);
    const [retirementAge, setRetirementAge] = useState(DEFAULTS.retirementAge);
    const [propertyPrice, setPropertyPrice] = useState(DEFAULTS.propertyPrice);
    const [loanAmount, setLoanAmount] = useState(DEFAULTS.loanAmount);
    const [loanTenureYears, setLoanTenureYears] = useState(DEFAULTS.loanTenureYears);
    const [annualInterestRatePct, setAnnualInterestRatePct] = useState(DEFAULTS.annualInterestRatePct);

    // Derive results whenever inputs or rates change
    const results = useMemo(() => {
        if (!cpfRates) return null;
        const rates = cpfRates as unknown as CPFRates;
        return calculateOptimalCPFSplit(
            {
                cpfOABalance,
                cpfSABalance,
                currentAge: Math.max(21, currentAge),
                retirementAge: Math.max(currentAge + 1, retirementAge),
                propertyPrice,
                loanAmount: Math.min(loanAmount, propertyPrice),
                loanTenureYears,
                annualInterestRatePct,
            },
            rates,
        );
    }, [cpfRates, cpfOABalance, cpfSABalance, currentAge, retirementAge, propertyPrice, loanAmount, loanTenureYears, annualInterestRatePct]);

    // Build chart data — merge age arrays from all three scenarios
    const chartData = useMemo(() => {
        if (!results) return [];
        const ages = results.scenarioA.balanceHistory.map((p) => p.age);
        return ages.map((age) => {
            const findBalance = (history: typeof results.scenarioA.balanceHistory) =>
                history.find((p) => p.age === age)?.balance ?? 0;
            return {
                age,
                'Scenario A: Max CPF': findBalance(results.scenarioA.balanceHistory),
                'Scenario B: Full Cash': findBalance(results.scenarioB.balanceHistory),
                'Scenario C: Optimized': findBalance(results.scenarioC.balanceHistory),
            };
        });
    }, [results]);

    // ── Loading state ────────────────────────────────────────────────────────────
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

    // ── Error state ──────────────────────────────────────────────────────────────
    if (error) {
        return (
            <main className="min-h-screen bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <Alert variant="destructive">
                        <AlertTitle>Error loading calculator</AlertTitle>
                        <AlertDescription>
                            Unable to load CPF rate configuration. Please try again.
                        </AlertDescription>
                    </Alert>
                </div>
            </main>
        );
    }

    const rates = cpfRates as unknown as CPFRates;
    const recommended = results?.recommendedScenario ?? 'C';

    return (
        <main className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

                {/* Header */}
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">
                    RESOURCES / CALCULATORS / CPF OPTIMIZER
                </p>
                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                    CPF Usage Optimizer
                </h1>
                <CalculatorNav active="cpf-optimizer" />
                <p className="text-sm text-gray-600 mb-8">
                    Compare three CPF usage strategies and find the optimal balance between monthly cash flow and retirement savings.
                </p>

                {/* ── Inputs ── */}
                <CalculatorContainer title="">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                        {/* Left: Inputs */}
                        <div className="lg:col-span-1 space-y-5">
                            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide border-b pb-2">
                                Your Details
                            </h2>
                            <NumberInput id="cpfOA" label="CPF OA Balance" value={cpfOABalance} onChange={setCpfOABalance} />
                            <NumberInput id="cpfSA" label="CPF SA Balance" value={cpfSABalance} onChange={setCpfSABalance}
                                helpText={`Compounds at ${(rates.saInterestRate * 100).toFixed(1)}% p.a. — for reference only`} />
                            <NumberInput id="currentAge" label="Current Age" value={currentAge} onChange={setCurrentAge}
                                prefix="" suffix="yrs" min={21} max={80} />
                            <NumberInput id="retirementAge" label="Retirement Age" value={retirementAge} onChange={setRetirementAge}
                                prefix="" suffix="yrs" min={50} max={100}
                                helpText="Default: 65" />

                            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide border-b pb-2 pt-2">
                                Property & Loan
                            </h2>
                            <NumberInput id="propertyPrice" label="Purchase Price" value={propertyPrice} onChange={setPropertyPrice} />
                            <NumberInput id="loanAmount" label="Loan Amount" value={loanAmount} onChange={setLoanAmount} />
                            <NumberInput id="tenure" label="Loan Tenure" value={loanTenureYears} onChange={setLoanTenureYears}
                                prefix="" suffix="yrs" min={5} max={35} />
                            <NumberInput id="interestRate" label="Interest Rate" value={annualInterestRatePct}
                                onChange={setAnnualInterestRatePct} prefix="" suffix="% p.a." step={0.05} min={0.5} max={10} />
                        </div>

                        {/* Right: Results */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* Scenario Cards */}
                            {results && (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <ScenarioCard
                                            letter="A"
                                            label={results.scenarioA.label}
                                            scenario={results.scenarioA}
                                            isRecommended={recommended === 'A'}
                                            accentColor="#3b82f6"
                                        />
                                        <ScenarioCard
                                            letter="B"
                                            label={results.scenarioB.label}
                                            scenario={results.scenarioB}
                                            isRecommended={recommended === 'B'}
                                            accentColor="#22c55e"
                                        />
                                        <ScenarioCard
                                            letter="C"
                                            label={results.scenarioC.label}
                                            scenario={results.scenarioC}
                                            isRecommended={recommended === 'C'}
                                            accentColor="#8b5cf6"
                                        />
                                    </div>

                                    {/* Recommendation Box */}
                                    <div className="rounded-xl bg-blue-50 border border-blue-200 p-5">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                            <h3 className="font-semibold text-blue-900 text-sm">AI Recommendation</h3>
                                        </div>
                                        <p className="text-sm text-blue-800 leading-relaxed">
                                            Based on your profile, <strong>Scenario {recommended} ({results[`scenario${recommended}`].label})</strong>{' '}
                                            yields the highest net wealth at retirement ({fmt(results[`scenario${recommended}`].netWealthAtRetirement)}).
                                            {results.interestSavedVsMaxCPF > 0 ? (
                                                <> It saves{' '}
                                                    <strong>{fmt(results.interestSavedVsMaxCPF)}</strong> in total interest compared to the
                                                    Maximum CPF strategy,{' '}
                                                </>
                                            ) : (
                                                <> It uses more CPF upfront to reduce monthly cash outflow,{' '}</>
                                            )}
                                            {results.cpfReducedVsMinCPF > 0 ? (
                                                <>while reducing your CPF retirement savings by{' '}
                                                    <strong>{fmt(results.cpfReducedVsMinCPF)}</strong> versus the Full Cash approach.</>
                                            ) : (
                                                <>preserving your CPF balance entirely for retirement.</>
                                            )}
                                        </p>
                                        <div className="mt-3 grid grid-cols-3 gap-3">
                                            {[
                                                {
                                                    icon: <TrendingDown className="w-3.5 h-3.5" />,
                                                    color: 'text-blue-600',
                                                    label: 'Monthly Cash',
                                                    value: fmt(results[`scenario${recommended}`].monthlyCashOutflow),
                                                },
                                                {
                                                    icon: <Minus className="w-3.5 h-3.5" />,
                                                    color: 'text-purple-600',
                                                    label: 'Total Interest',
                                                    value: fmt(results[`scenario${recommended}`].totalInterestPaid),
                                                },
                                                {
                                                    icon: <TrendingUp className="w-3.5 h-3.5" />,
                                                    color: 'text-green-600',
                                                    label: 'Net Wealth',
                                                    value: fmt(results[`scenario${recommended}`].netWealthAtRetirement),
                                                },
                                            ].map((stat) => (
                                                <div key={stat.label} className="bg-white rounded-lg p-3 text-center border border-blue-100">
                                                    <div className={`flex items-center justify-center gap-1 ${stat.color} mb-0.5`}>
                                                        {stat.icon}
                                                        <span className="text-xs font-medium">{stat.label}</span>
                                                    </div>
                                                    <p className="font-bold text-gray-900 text-sm">{stat.value}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Comparison Chart */}
                                    <div className="rounded-xl border border-gray-200 p-5">
                                        <h3 className="font-semibold text-gray-800 text-sm mb-4">
                                            CPF OA Balance Projection to Retirement
                                        </h3>
                                        <ResponsiveContainer width="100%" height={280}>
                                            <LineChart data={chartData} margin={{ top: 4, right: 24, left: 8, bottom: 4 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                                <XAxis
                                                    dataKey="age"
                                                    tick={{ fontSize: 11, fill: '#64748b' }}
                                                    label={{ value: 'Age', position: 'insideBottom', offset: -2, fontSize: 11, fill: '#64748b' }}
                                                />
                                                <YAxis
                                                    tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                                                    tick={{ fontSize: 11, fill: '#64748b' }}
                                                    width={56}
                                                />
                                                <Tooltip content={<ChartTooltip />} />
                                                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                                                {/* Today marker */}
                                                <ReferenceLine
                                                    x={currentAge}
                                                    stroke="#94a3b8"
                                                    strokeDasharray="4 2"
                                                    label={{ value: 'Today', position: 'top', fontSize: 10, fill: '#94a3b8' }}
                                                />
                                                {/* Retirement marker */}
                                                <ReferenceLine
                                                    x={retirementAge}
                                                    stroke="#6366f1"
                                                    strokeDasharray="4 2"
                                                    label={{ value: 'Retirement', position: 'top', fontSize: 10, fill: '#6366f1' }}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="Scenario A: Max CPF"
                                                    stroke="#3b82f6"
                                                    strokeWidth={2}
                                                    dot={false}
                                                    activeDot={{ r: 4 }}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="Scenario B: Full Cash"
                                                    stroke="#22c55e"
                                                    strokeWidth={2}
                                                    dot={false}
                                                    activeDot={{ r: 4 }}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="Scenario C: Optimized"
                                                    stroke="#8b5cf6"
                                                    strokeWidth={2.5}
                                                    dot={false}
                                                    activeDot={{ r: 4 }}
                                                    strokeDasharray={recommended === 'C' ? undefined : '6 3'}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </CalculatorContainer>

                {/* Disclaimer */}
                <p className="mt-6 text-xs text-gray-400 leading-relaxed max-w-4xl">
                    <strong>Disclaimer:</strong> Results are estimates for illustrative purposes only. CPF OA interest rate (
                    {(rates.oaInterestRate * 100).toFixed(1)}% p.a.) and SA rate ({(rates.saInterestRate * 100).toFixed(1)}% p.a.)
                    are sourced from{' '}
                    <a href={rates.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">
                        {rates.sourceUrl}
                    </a>
                    {' '}and subject to change. This calculator does not constitute financial advice. Consult a
                    licensed financial advisor for personalised guidance.
                </p>

            </div>
        </main>
    );
}
