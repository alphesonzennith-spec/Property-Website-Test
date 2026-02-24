'use client';

import { useState, useMemo, useCallback } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { CalculatorNav } from '@/components/calculators/CalculatorNav';
import { CalculatorContainer } from '@/components/calculators/CalculatorContainer';
import { PillToggle } from '@/components/calculators/PillToggle';
import { trpc } from '@/lib/trpc/client';
import { ResidencyStatus, PropertyType } from '@/types';
import { calculateTotalCostOfOwnership } from '@/lib/calculations/totalCostOwnership';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { Info, AlertCircle, ExternalLink, TrendingUp, TrendingDown } from 'lucide-react';

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number) {
    return '$' + Math.round(n).toLocaleString('en-SG');
}

function fmtPct(n: number) {
    return n.toFixed(2) + '%';
}

function EstimateBadge() {
    return (
        <span className="ml-2 text-xs bg-amber-100 text-amber-700 border border-amber-300 rounded-full px-2 py-0.5 font-medium">
            ESTIMATE
        </span>
    );
}

function RegulatoryBadge() {
    return (
        <span className="ml-2 text-xs bg-blue-100 text-blue-700 border border-blue-300 rounded-full px-2 py-0.5 font-medium">
            REGULATORY
        </span>
    );
}

function NumberInput({
    label,
    id,
    value,
    onChange,
    prefix = 'S$',
    suffix,
    min = 0,
    helpText,
    badge,
}: {
    label: string;
    id: string;
    value: number;
    onChange: (n: number) => void;
    prefix?: string;
    suffix?: string;
    min?: number;
    helpText?: string;
    badge?: React.ReactNode;
}) {
    return (
        <div className="flex items-start gap-4">
            <label htmlFor={id} className="w-52 text-sm font-medium text-gray-900 pt-3 flex-shrink-0">
                {label}
                {badge}
            </label>
            <div className="flex-1">
                <div className="relative max-w-xs">
                    {prefix && (
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">{prefix}</span>
                    )}
                    <input
                        id={id}
                        type="number"
                        min={min}
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))}
                        className={`h-11 ${prefix ? 'pl-9' : 'pl-4'} ${suffix ? 'pr-12' : 'pr-4'} w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none`}
                        placeholder="0"
                    />
                    {suffix && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">{suffix}</span>
                    )}
                </div>
                {helpText && <p className="mt-1 text-xs text-gray-500">{helpText}</p>}
            </div>
        </div>
    );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
    return <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide pt-2 border-t border-gray-100">{children}</h3>;
}

// ── Cost Row ──────────────────────────────────────────────────────────────────

function CostRow({
    label,
    value,
    isEstimate,
    isRegulatory,
    sub,
    highlight,
}: {
    label: string;
    value: string;
    isEstimate?: boolean;
    isRegulatory?: boolean;
    sub?: string;
    highlight?: boolean;
}) {
    return (
        <div className={`flex items-start justify-between py-2.5 ${highlight ? 'bg-indigo-50 -mx-4 px-4 rounded-lg' : ''}`}>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 flex-wrap">
                    <span className={`text-sm ${highlight ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>{label}</span>
                    {isEstimate && <EstimateBadge />}
                    {isRegulatory && <RegulatoryBadge />}
                </div>
                {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
            </div>
            <span className={`text-sm font-semibold ml-4 whitespace-nowrap ${highlight ? 'text-indigo-700 text-base' : 'text-gray-900'}`}>
                {value}
            </span>
        </div>
    );
}

// ── Chart Colors ──────────────────────────────────────────────────────────────

const BAR_COLORS = {
    purchasePrice: '#6366F1',
    stampDuty: '#F59E0B',
    maintenanceFees: '#10B981',
    propertyTax: '#3B82F6',
    insurance: '#8B5CF6',
    mortgageInterest: '#EF4444',
    opportunityCost: '#F97316',
    rentalIncome: '#14B8A6',
};

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function TotalCostPage() {
    const { data: rates, isLoading, error } = trpc.calculators.getRegulatoryRates.useQuery();

    // ── Inputs ────────────────────────────────────────────────────────────────
    const [purchasePrice, setPurchasePrice] = useState(1_200_000);
    const [propertyType, setPropertyType] = useState<PropertyType>(PropertyType.Condo);
    const [floorAreaSqft, setFloorAreaSqft] = useState(900);
    const [usage, setUsage] = useState<'owner-occupied' | 'investment'>('owner-occupied');
    const [loanAmount, setLoanAmount] = useState(900_000);
    const [interestRate, setInterestRate] = useState(3.5);
    const [loanTenure, setLoanTenure] = useState(25);
    const [holdingPeriod, setHoldingPeriod] = useState<5 | 10 | 20>(10);
    const [residencyStatus, setResidencyStatus] = useState<ResidencyStatus>(ResidencyStatus.Singaporean);
    const [existingProperties, setExistingProperties] = useState(0);
    const [monthlyRental, setMonthlyRental] = useState(3_500);

    // ── Calculation ────────────────────────────────────────────────────────────

    const result = useMemo(() => {
        if (!rates) return null;

        try {
            return calculateTotalCostOfOwnership(
                {
                    purchasePrice,
                    propertyType,
                    floorAreaSqft,
                    usage,
                    loanAmount,
                    annualInterestRatePct: interestRate,
                    loanTenureYears: loanTenure,
                    holdingPeriodYears: holdingPeriod,
                    buyerResidencyStatus: residencyStatus,
                    existingPropertiesOwned: existingProperties,
                    monthlyRentalIncome: usage === 'investment' ? monthlyRental : undefined,
                },
                {
                    bsdTiers: rates.stampDuty.bsd.tiers,
                    absdRates: rates.stampDuty.absd.rates,
                    ssdTiers: rates.stampDuty.ssd.tiers,
                    ssdExemptionMonths: rates.stampDuty.ssd.exemptionThresholdMonths,
                    ownerOccupiedTaxTiers: rates.propertyTax.ownerOccupied,
                    nonOwnerOccupiedTaxTiers: rates.propertyTax.nonOwnerOccupied,
                    annualValueProxyPct: rates.propertyTax.annualValueProxyPct,
                    legalFeesEstimateMin: rates.misc.legalFeesEstimateRange.min,
                    legalFeesEstimateMax: rates.misc.legalFeesEstimateRange.max,
                    valuationFeeSGD: rates.misc.valuationFeeSGD,
                    insuranceAnnualMin: rates.misc.insuranceAnnualRange.min,
                    insuranceAnnualMax: rates.misc.insuranceAnnualRange.max,
                    maintenanceFees: rates.maintenanceFees,
                    cpfSaInterestRate: rates.cpfRates.saInterestRate,
                },
            );
        } catch {
            return null;
        }
    }, [
        rates,
        purchasePrice,
        propertyType,
        floorAreaSqft,
        usage,
        loanAmount,
        interestRate,
        loanTenure,
        holdingPeriod,
        residencyStatus,
        existingProperties,
        monthlyRental,
    ]);

    // ── Chart Data ─────────────────────────────────────────────────────────────

    const chartData = useMemo(() => {
        if (!result) return [];

        const lastYear = result.yearlyBreakdown[result.yearlyBreakdown.length - 1];
        if (!lastYear) return [];

        return [
            {
                name: 'Purchase Price',
                color: BAR_COLORS.purchasePrice,
                value: purchasePrice,
            },
            {
                name: 'Stamp Duties',
                color: BAR_COLORS.stampDuty,
                value: result.totalStampDuty,
            },
            {
                name: 'Legal & Valuation',
                color: BAR_COLORS.insurance,
                value: result.legalFeesEstimate + result.valuationFee,
            },
            {
                name: 'Mortgage Interest',
                color: BAR_COLORS.mortgageInterest,
                value: result.totalMortgageInterest,
            },
            {
                name: 'Property Tax',
                color: BAR_COLORS.propertyTax,
                value: result.totalPropertyTax,
            },
            {
                name: 'Maintenance',
                color: BAR_COLORS.maintenanceFees,
                value: result.totalMaintenanceFees,
            },
            {
                name: 'Insurance',
                color: BAR_COLORS.insurance,
                value: result.totalInsurance,
            },
            {
                name: 'Opportunity Cost',
                color: BAR_COLORS.opportunityCost,
                value: result.opportunityCostTotal,
            },
        ];
    }, [result, purchasePrice]);

    const stackedData = useMemo(() => {
        if (!result) return [];

        return result.yearlyBreakdown.map((y) => ({
            year: `Yr ${y.year}`,
            'Mortgage Interest': y.mortgageInterest,
            'Property Tax': y.propertyTax,
            Maintenance: y.maintenanceFees,
            Insurance: y.insurance,
            'Opportunity Cost': y.opportunityCost,
            ...(usage === 'investment' ? { 'Rental Income': -y.rentalIncome } : {}),
        }));
    }, [result, usage]);

    // ── Loading / Error states ─────────────────────────────────────────────────

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

    if (error || !rates) {
        return (
            <main className="min-h-screen bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <Alert variant="destructive">
                        <AlertTitle>Error loading calculator</AlertTitle>
                        <AlertDescription>Unable to load regulatory configuration. Please try again.</AlertDescription>
                    </Alert>
                </div>
            </main>
        );
    }

    const saRate = rates.cpfRates.saInterestRate;
    const proxyPct = rates.propertyTax.annualValueProxyPct;
    const ownerTiers = rates.propertyTax.ownerOccupied;
    const investTiers = rates.propertyTax.nonOwnerOccupied;

    return (
        <main className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

                {/* ── Page Header ─────────────────────────────────────────────── */}
                <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-2">
                    RESOURCES / CALCULATORS / TOTAL COST OF OWNERSHIP
                </p>
                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                    Total Cost of Ownership Calculator
                </h1>
                <CalculatorNav active="total-cost" />
                <p className="text-sm text-gray-600 mb-8">
                    Estimate the full long-term cost of owning a property in Singapore over your intended holding period,
                    including stamp duties, mortgage interest, recurring fees, and opportunity costs.
                </p>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                    {/* ── Left / Inputs ──────────────────────────────────────────── */}
                    <div className="xl:col-span-2 space-y-5">
                        <CalculatorContainer title="Property Details">
                            <div className="space-y-5">
                                <NumberInput
                                    label="Purchase Price"
                                    id="purchasePrice"
                                    value={purchasePrice}
                                    onChange={setPurchasePrice}
                                />

                                {/* Property Type */}
                                <div className="flex items-center gap-4">
                                    <label className="w-52 text-sm font-medium text-gray-900 flex-shrink-0">Property Type</label>
                                    <PillToggle
                                        value={propertyType}
                                        onChange={(v) => setPropertyType(v as PropertyType)}
                                        options={[
                                            { value: PropertyType.HDB, label: 'HDB' },
                                            { value: PropertyType.Condo, label: 'Condo' },
                                            { value: PropertyType.Landed, label: 'Landed' },
                                        ]}
                                    />
                                </div>

                                {/* Floor Area */}
                                {propertyType !== PropertyType.HDB && (
                                    <NumberInput
                                        label="Floor Area"
                                        id="floorArea"
                                        value={floorAreaSqft}
                                        onChange={setFloorAreaSqft}
                                        prefix=""
                                        suffix="sqft"
                                        helpText="Used to estimate condo maintenance fees"
                                    />
                                )}

                                {/* Usage */}
                                <div className="flex items-center gap-4">
                                    <label className="w-52 text-sm font-medium text-gray-900 flex-shrink-0">Usage</label>
                                    <PillToggle
                                        value={usage}
                                        onChange={(v) => setUsage(v as 'owner-occupied' | 'investment')}
                                        options={[
                                            { value: 'owner-occupied', label: 'Owner-Occupied' },
                                            { value: 'investment', label: 'Investment' },
                                        ]}
                                    />
                                </div>

                                {/* Rental — investment only */}
                                {usage === 'investment' && (
                                    <NumberInput
                                        label="Monthly Rental Income"
                                        id="monthlyRental"
                                        value={monthlyRental}
                                        onChange={setMonthlyRental}
                                        helpText="Expected gross rental income per month"
                                    />
                                )}

                                {/* Holding Period */}
                                <div className="flex items-center gap-4">
                                    <label className="w-52 text-sm font-medium text-gray-900 flex-shrink-0">Holding Period</label>
                                    <PillToggle
                                        value={String(holdingPeriod)}
                                        onChange={(v) => setHoldingPeriod(Number(v) as 5 | 10 | 20)}
                                        options={[
                                            { value: '5', label: '5 Years' },
                                            { value: '10', label: '10 Years' },
                                            { value: '20', label: '20 Years' },
                                        ]}
                                    />
                                </div>
                            </div>
                        </CalculatorContainer>

                        <CalculatorContainer title="Buyer Profile">
                            <div className="space-y-5">
                                {/* Residency Status */}
                                <div className="flex items-center gap-4">
                                    <label className="w-52 text-sm font-medium text-gray-900 flex-shrink-0">Residency Status</label>
                                    <PillToggle
                                        value={residencyStatus}
                                        onChange={(v) => setResidencyStatus(v as ResidencyStatus)}
                                        options={[
                                            { value: ResidencyStatus.Singaporean, label: 'SC' },
                                            { value: ResidencyStatus.PR, label: 'PR' },
                                            { value: ResidencyStatus.Foreigner, label: 'Foreigner' },
                                        ]}
                                    />
                                </div>

                                <NumberInput
                                    label="Existing Properties Owned"
                                    id="existingProps"
                                    value={existingProperties}
                                    onChange={setExistingProperties}
                                    prefix=""
                                    helpText="Determines your ABSD rate"
                                />
                            </div>
                        </CalculatorContainer>

                        <CalculatorContainer title="Mortgage Details">
                            <div className="space-y-5">
                                <NumberInput
                                    label="Loan Amount"
                                    id="loanAmount"
                                    value={loanAmount}
                                    onChange={setLoanAmount}
                                />
                                <NumberInput
                                    label="Interest Rate"
                                    id="interestRate"
                                    value={interestRate}
                                    onChange={setInterestRate}
                                    prefix=""
                                    suffix="% p.a."
                                    helpText={`Typical bank rate: ${rates.mortgage.bankLoan.typicalInterestRangePct.min}% – ${rates.mortgage.bankLoan.typicalInterestRangePct.max}% · HDB rate: ${rates.mortgage.hdbLoan.baseInterestRatePct}%`}
                                />
                                <NumberInput
                                    label="Loan Tenure"
                                    id="loanTenure"
                                    value={loanTenure}
                                    onChange={setLoanTenure}
                                    prefix=""
                                    suffix="years"
                                />
                            </div>
                        </CalculatorContainer>
                    </div>

                    {/* ── Right / Results ─────────────────────────────────────────── */}
                    <div className="xl:col-span-1 space-y-5">
                        {result ? (
                            <>
                                {/* One-time Costs */}
                                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                                    <h2 className="text-base font-semibold text-gray-900 mb-3">One-Time Purchase Costs</h2>
                                    <div className="divide-y divide-gray-100">
                                        <CostRow label="Purchase Price" value={fmt(result.purchasePrice)} />
                                        <CostRow
                                            label="Buyer's Stamp Duty (BSD)"
                                            value={fmt(result.bsd)}
                                            isRegulatory
                                            sub={`From ${rates.stampDuty.bsd.tiers[0].rate * 100}% on first $${rates.stampDuty.bsd.tiers[0].maxValue?.toLocaleString()}`}
                                        />
                                        <CostRow
                                            label="Additional BSD (ABSD)"
                                            value={fmt(result.absd)}
                                            isRegulatory
                                            sub={result.absd === 0 ? 'No ABSD for this profile' : 'Based on residency & property count'}
                                        />
                                        <CostRow
                                            label="Legal & Conveyancing Fees"
                                            value={fmt(result.legalFeesEstimate)}
                                            isEstimate
                                            sub={`Est. range: ${fmt(rates.misc.legalFeesEstimateRange.min)} – ${fmt(rates.misc.legalFeesEstimateRange.max)}`}
                                        />
                                        <CostRow
                                            label="Valuation Fee"
                                            value={fmt(result.valuationFee)}
                                            isEstimate
                                        />
                                        <CostRow
                                            label={`Total One-Time Costs`}
                                            value={fmt(result.totalOneTimeCosts)}
                                            highlight
                                        />
                                    </div>
                                </div>

                                {/* Annual Recurring */}
                                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                                    <h2 className="text-base font-semibold text-gray-900 mb-3">Annual Recurring Costs</h2>
                                    <div className="divide-y divide-gray-100">
                                        <CostRow
                                            label="Property Tax"
                                            value={fmt(result.annualPropertyTax)}
                                            isRegulatory
                                            sub={`${usage === 'owner-occupied' ? 'Owner-occupied' : 'Non-owner-occupied'} rates · AV proxy: ${proxyPct * 100}% of price`}
                                        />
                                        <CostRow
                                            label="Maintenance Fees"
                                            value={fmt(result.annualMaintenanceFeesMid)}
                                            isEstimate
                                            sub={rates.maintenanceFees.note}
                                        />
                                        <CostRow
                                            label="Insurance (Home & Fire)"
                                            value={fmt(result.annualInsuranceMid)}
                                            isEstimate
                                            sub={`Est. range: ${fmt(rates.misc.insuranceAnnualRange.min)} – ${fmt(rates.misc.insuranceAnnualRange.max)} / year`}
                                        />
                                    </div>
                                </div>

                                {/* Holding Period Summary */}
                                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                                    <h2 className="text-base font-semibold text-gray-900 mb-1">
                                        {holdingPeriod}-Year Total Cost of Ownership
                                    </h2>
                                    <p className="text-xs text-gray-500 mb-3">All costs over your holding period</p>
                                    <div className="divide-y divide-gray-100">
                                        <CostRow label="Total Stamp Duties" value={fmt(result.totalStampDuty)} />
                                        <CostRow label="Total Mortgage Interest" value={fmt(result.totalMortgageInterest)} />
                                        <CostRow label="Total Property Tax" value={fmt(result.totalPropertyTax)} />
                                        <CostRow label="Total Maintenance" value={fmt(result.totalMaintenanceFees)} isEstimate />
                                        <CostRow label="Total Insurance" value={fmt(result.totalInsurance)} isEstimate />
                                        <CostRow
                                            label={`Opportunity Cost`}
                                            value={fmt(result.opportunityCostTotal)}
                                            isEstimate
                                            sub={`If downpayment (${fmt(purchasePrice - loanAmount)}) invested in CPF SA at ${(saRate * 100).toFixed(1)}%`}
                                        />
                                        <CostRow
                                            label={`Grand Total Cost (${holdingPeriod} yrs)`}
                                            value={fmt(result.grandTotalCost)}
                                            highlight
                                        />
                                    </div>
                                </div>

                                {/* Investment Metrics */}
                                {usage === 'investment' && result.totalRentalIncome !== undefined && (
                                    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                                        <h2 className="text-base font-semibold text-gray-900 mb-3">Investment Metrics</h2>
                                        <div className="divide-y divide-gray-100">
                                            <CostRow
                                                label={`Total Rental Income (${holdingPeriod} yrs)`}
                                                value={fmt(result.totalRentalIncome)}
                                            />
                                            <CostRow
                                                label="Net Cost After Rental"
                                                value={fmt(result.netCostAfterRental ?? 0)}
                                                highlight
                                            />
                                            <CostRow
                                                label="Gross Rental Yield"
                                                value={fmtPct(result.grossRentalYieldPct ?? 0)}
                                                isRegulatory={false}
                                            />
                                            <CostRow
                                                label="Net Rental Yield"
                                                value={fmtPct(result.netRentalYieldPct ?? 0)}
                                                sub="After property tax, maintenance & insurance"
                                            />
                                        </div>
                                        <div className="mt-4 bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                                            <div className="flex items-start gap-2">
                                                {(result.breakevenSalePrice ?? 0) > 0 ? (
                                                    <TrendingUp className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                                                ) : (
                                                    <TrendingDown className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                                )}
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900">Breakeven Sale Price</p>
                                                    <p className="text-2xl font-bold text-indigo-700 mt-0.5">{fmt(Math.max(0, result.breakevenSalePrice ?? 0))}</p>
                                                    <p className="text-xs text-gray-600 mt-1">
                                                        You need to sell above this price to profit after all costs and rental income.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Regulatory Rate Labels */}
                                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-1.5">
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Rate References</h3>
                                    <p className="text-xs text-gray-600">
                                        Property tax (owner-occupied): {ownerTiers[0].ownerOccupiedRate * 100}% on first ${(ownerTiers[0].annualValueMax ?? 0).toLocaleString()} AV
                                    </p>
                                    <p className="text-xs text-gray-600">
                                        Property tax (investment): {investTiers[0].nonOwnerOccupiedRate * 100}% on first ${(investTiers[0].annualValueMax ?? 0).toLocaleString()} AV
                                    </p>
                                    <p className="text-xs text-gray-600">
                                        CPF SA rate: {(saRate * 100).toFixed(1)}% p.a. (used for opportunity cost)
                                    </p>
                                    <p className="text-xs text-gray-600">
                                        AV proxy used: {proxyPct * 100}% of purchase price
                                    </p>
                                    <div className="flex items-center gap-1 mt-2">
                                        <AlertCircle className="w-3.5 h-3.5 text-gray-400" />
                                        <span className="text-xs text-gray-500">
                                            Effective: {rates.propertyTax.effectiveDateOverride}
                                        </span>
                                        <a
                                            href={rates.propertyTax.sourceUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="ml-1 text-xs text-blue-600 hover:underline inline-flex items-center gap-0.5"
                                        >
                                            IRAS source <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center text-gray-500 text-sm">
                                Enter your property details to see the cost breakdown.
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Visualization ───────────────────────────────────────────────── */}
                {result && (
                    <div className="mt-8 space-y-8">

                        {/* Stacked Bar — Year-by-year annual costs */}
                        <CalculatorContainer title={`Annual Cost Breakdown Over ${holdingPeriod} Years`}>
                            <div className="flex gap-2 mb-4 flex-wrap">
                                {([5, 10, 20] as const).map((yr) => (
                                    <button
                                        key={yr}
                                        onClick={() => setHoldingPeriod(yr)}
                                        className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${holdingPeriod === yr
                                            ? 'bg-indigo-600 text-white border-indigo-600'
                                            : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'
                                            }`}
                                    >
                                        {yr} years
                                    </button>
                                ))}
                            </div>
                            <ResponsiveContainer width="100%" height={340}>
                                <BarChart data={stackedData} margin={{ top: 10, right: 20, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                                    <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                                    <YAxis
                                        tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                                        tick={{ fontSize: 12 }}
                                    />
                                    <Tooltip
                                        formatter={(value: number | string | undefined) => [
                                            value !== undefined ? fmt(Math.abs(Number(value))) : '-',
                                            '',
                                        ]}
                                        contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                                    />
                                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                                    <Bar dataKey="Mortgage Interest" stackId="a" fill={BAR_COLORS.mortgageInterest} />
                                    <Bar dataKey="Property Tax" stackId="a" fill={BAR_COLORS.propertyTax} />
                                    <Bar dataKey="Maintenance" stackId="a" fill={BAR_COLORS.maintenanceFees} />
                                    <Bar dataKey="Insurance" stackId="a" fill={BAR_COLORS.insurance} />
                                    <Bar dataKey="Opportunity Cost" stackId="a" fill={BAR_COLORS.opportunityCost} />
                                    {usage === 'investment' && (
                                        <Bar dataKey="Rental Income" stackId="b" fill={BAR_COLORS.rentalIncome} />
                                    )}
                                </BarChart>
                            </ResponsiveContainer>
                        </CalculatorContainer>

                        {/* Horizontal stacked summary bar */}
                        <CalculatorContainer title="Cost Composition">
                            <div className="space-y-3">
                                {chartData.map((item) => {
                                    const pct = (item.value / result.grandTotalCost) * 100;
                                    return (
                                        <div key={item.name} className="flex items-center gap-4">
                                            <div className="w-36 text-sm text-gray-600 text-right flex-shrink-0">{item.name}</div>
                                            <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all duration-500"
                                                    style={{ width: `${Math.max(pct, 1)}%`, backgroundColor: item.color }}
                                                />
                                            </div>
                                            <div className="w-28 text-sm font-medium text-gray-900 flex-shrink-0">
                                                {fmt(item.value)}
                                                <span className="ml-1 text-xs text-gray-500">({pct.toFixed(1)}%)</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CalculatorContainer>
                    </div>
                )}

                {/* ── Disclaimer / Notes ──────────────────────────────────────── */}
                <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-5">
                    <div className="flex gap-3">
                        <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="space-y-1 text-sm text-amber-800">
                            <p className="font-semibold">Estimates & Disclaimers</p>
                            <ul className="list-disc ml-4 space-y-0.5 text-xs">
                                <li>
                                    <strong>ESTIMATE</strong> items (maintenance fees, insurance, legal fees) are illustrative market ranges. Actual costs vary by property, developer, and service provider.
                                </li>
                                <li>
                                    Annual Value (AV) used for property tax is estimated at {rates.propertyTax.annualValueProxyPct * 100}% of purchase price. Actual AV is assessed by IRAS and may differ.
                                </li>
                                <li>
                                    Opportunity cost uses CPF SA rate ({(saRate * 100).toFixed(1)}%) as a benchmark only. Actual investment returns will vary.
                                </li>
                                <li>
                                    This calculator does not constitute financial or tax advice. Consult a licensed adviser before making property decisions.
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
