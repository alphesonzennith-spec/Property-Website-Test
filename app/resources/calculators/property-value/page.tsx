'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
} from 'recharts';
import { MapPin, Search, AlertTriangle, ArrowRightIcon, Building2, TrendingUp, TrendingDown } from 'lucide-react';
import { CalculatorNav } from '@/components/calculators/CalculatorNav';
import { CalculatorContainer } from '@/components/calculators/CalculatorContainer';
import { trpc } from '@/lib/trpc/client';
import { PropertyType } from '@/types';

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtPrice(n: number) {
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
    if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
    return `$${n.toLocaleString('en-SG')}`;
}

function fmtFull(n: number) {
    return `S$${Math.round(n).toLocaleString('en-SG')}`;
}

function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-SG', {
        year: 'numeric', month: 'short', day: 'numeric',
    });
}

// District name mapping
const DISTRICT_NAMES: Record<string, string> = {
    D01: 'Raffles Place / Marina', D02: 'Chinatown / Tanjong Pagar',
    D03: 'Alexandra / Commonwealth', D04: 'Harbourfront / Telok Blangah',
    D05: 'Buona Vista / West Coast', D06: 'City Hall / Clarke Quay',
    D07: 'Beach Road / Bugis', D08: 'Farrer Park / Serangoon Rd',
    D09: 'Orchard / River Valley', D10: 'Bukit Timah / Holland',
    D11: 'Newton / Novena', D12: 'Balestier / Toa Payoh',
    D13: 'Macpherson / Potong Pasir', D14: 'Geylang / Paya Lebar',
    D15: 'East Coast / Katong', D16: 'Bedok / Upper East Coast',
    D17: 'Loyang / Changi', D18: 'Tampines / Pasir Ris',
    D19: 'Hougang / Punggol / Sengkang', D20: 'Ang Mo Kio / Bishan',
    D21: 'Clementi / Upper Bukit Timah', D22: 'Jurong / Boon Lay',
    D23: 'Bukit Batok / Bukit Panjang', D24: 'Choa Chu Kang / Yew Tee',
    D25: 'Kranji / Woodlands', D26: 'Upper Thomson / Mandai',
    D27: 'Sembawang / Yishun', D28: 'Seletar / Yio Chu Kang',
};

// ── Custom Tooltip for BarChart ───────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ value: number; payload: { count: number } }>;
    label?: string;
}) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg text-xs">
            <p className="font-semibold text-gray-700 mb-1">{label}</p>
            <p className="text-emerald-700">Median: <strong>{fmtPrice(payload[0].value)}</strong></p>
            <p className="text-gray-500">{payload[0].payload.count} transaction{payload[0].payload.count !== 1 ? 's' : ''}</p>
        </div>
    );
}

// ── Main Page Component ───────────────────────────────────────────────────────

interface OneMapResult {
    buildingName: string;
    address: string;
    postalCode: string;
    latitude: number;
    longitude: number;
}

export default function PropertyValuePage() {
    const [postalInput, setPostalInput] = useState('');
    const [unitInput, setUnitInput] = useState('');
    const [propertyType, setPropertyType] = useState<PropertyType>(PropertyType.HDB);
    const [submittedPostal, setSubmittedPostal] = useState('');
    const [addressResult, setAddressResult] = useState<OneMapResult | null>(null);
    const [addressError, setAddressError] = useState('');
    const [lookupLoading, setLookupLoading] = useState(false);

    // ── tRPC queries (enabled only once postal confirmed) ──────────────────────
    const { data: comparables, isLoading: compsLoading } =
        trpc.properties.getComparableTransactions.useQuery(
            { postalCode: submittedPostal, propertyType },
            { enabled: submittedPostal.length === 6 }
        );

    const { data: estimate, isLoading: estimateLoading } =
        trpc.properties.getPropertyValueEstimate.useQuery(
            { postalCode: submittedPostal, propertyType },
            { enabled: submittedPostal.length === 6 }
        );

    const isLoading = compsLoading || estimateLoading;

    // ── OneMap address lookup ──────────────────────────────────────────────────
    const handleLookup = async () => {
        const postal = postalInput.trim().replace(/\s/g, '');
        if (postal.length !== 6 || !/^\d+$/.test(postal)) {
            setAddressError('Please enter a valid 6-digit Singapore postal code.');
            return;
        }
        setLookupLoading(true);
        setAddressError('');
        try {
            const res = await fetch(`/api/onemaps/lookup?postal=${postal}`);
            const data = await res.json();
            if (!res.ok) {
                setAddressError(data.error ?? 'Address not found.');
                setLookupLoading(false);
                return;
            }
            setAddressResult(data as OneMapResult);
            setSubmittedPostal(postal);
        } catch {
            setAddressError('Network error — please try again.');
        }
        setLookupLoading(false);
    };

    // ── Derived unit floor (from # notation) ──────────────────────────────────
    const searchedFloor = useMemo(() => {
        if (!unitInput) return null;
        const match = unitInput.match(/#(\d+)/);
        return match ? parseInt(match[1], 10) : null;
    }, [unitInput]);

    // ── 12-month chart data ────────────────────────────────────────────────────
    const chartData = useMemo(() => {
        if (!comparables?.items.length) return [];

        const now = new Date();
        const months: Array<{ key: string; label: string; prices: number[]; count: number }> = [];

        for (let i = 11; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const label = d.toLocaleDateString('en-SG', { month: 'short', year: '2-digit' });
            months.push({ key, label, prices: [], count: 0 });
        }

        for (const tx of comparables.items) {
            const d = new Date(tx!.date);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const slot = months.find((m) => m.key === key);
            if (slot) { slot.prices.push(tx!.price); slot.count++; }
        }

        return months.map((m) => {
            const sorted = [...m.prices].sort((a, b) => a - b);
            const mid = Math.floor(sorted.length / 2);
            const median = sorted.length === 0
                ? 0
                : sorted.length % 2 === 0
                    ? (sorted[mid - 1] + sorted[mid]) / 2
                    : sorted[mid];
            return { label: m.label, median: Math.round(median), count: m.count };
        });
    }, [comparables]);

    const trendMedian = useMemo(() => {
        const withData = chartData.filter((d) => d.median > 0);
        if (!withData.length) return 0;
        return Math.round(withData.reduce((s, d) => s + d.median, 0) / withData.length);
    }, [chartData]);

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <main className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

                {/* Header */}
                <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-2">
                    RESOURCES / CALCULATORS / PROPERTY VALUE
                </p>
                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                    Property Market Value Lookup
                </h1>
                <CalculatorNav active="property-value" />
                <p className="text-sm text-gray-600 mb-2">
                    Get an estimated market value range based on comparable recent transactions in the same development or district.
                </p>
                {/* Prominent disclaimer */}
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 mb-8 max-w-2xl">
                    <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    <p className="text-xs text-amber-800 font-medium">
                        ESTIMATE ONLY — Based on comparable transactions. Not an official or certified property valuation.
                    </p>
                </div>

                <CalculatorContainer title="">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* ── LEFT: Inputs & Results ──────────────────────────────────── */}
                        <div className="lg:col-span-2 space-y-8">

                            {/* Search Inputs */}
                            <div className="space-y-4">
                                {/* Property Type */}
                                <div className="flex items-center gap-4">
                                    <label className="w-44 text-sm font-medium text-gray-900 flex-shrink-0">
                                        Property Type
                                    </label>
                                    <div className="flex gap-2 flex-wrap">
                                        {([PropertyType.HDB, PropertyType.Condo, PropertyType.Landed, PropertyType.EC] as const).map((t) => (
                                            <button
                                                key={t}
                                                onClick={() => setPropertyType(t)}
                                                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${propertyType === t
                                                    ? 'bg-emerald-600 text-white border-emerald-600'
                                                    : 'bg-white text-gray-700 border-gray-300 hover:border-emerald-400'
                                                    }`}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Postal Code */}
                                <div className="flex items-start gap-4">
                                    <label className="w-44 text-sm font-medium text-gray-900 pt-3 flex-shrink-0">
                                        Postal Code
                                    </label>
                                    <div className="flex-1 space-y-2">
                                        <div className="flex gap-2">
                                            <div className="relative flex-1 max-w-xs">
                                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    id="postal-code-input"
                                                    type="text"
                                                    inputMode="numeric"
                                                    maxLength={6}
                                                    placeholder="e.g. 521123"
                                                    value={postalInput}
                                                    onChange={(e) => {
                                                        setPostalInput(e.target.value.replace(/\D/g, '').slice(0, 6));
                                                        setAddressResult(null);
                                                        setSubmittedPostal('');
                                                    }}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
                                                    className="h-11 pl-9 pr-4 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm"
                                                />
                                            </div>
                                            <button
                                                id="lookup-button"
                                                onClick={handleLookup}
                                                disabled={lookupLoading || postalInput.length !== 6}
                                                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <Search className="w-4 h-4" />
                                                {lookupLoading ? 'Looking up…' : 'Look Up'}
                                            </button>
                                        </div>
                                        {addressError && (
                                            <p className="text-xs text-red-600">{addressError}</p>
                                        )}
                                        {addressResult && (
                                            <p className="text-xs text-emerald-700 font-medium">
                                                ✓ Showing results for: <span className="font-semibold">{addressResult.address}</span>
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Unit Number (optional) */}
                                <div className="flex items-start gap-4">
                                    <label className="w-44 text-sm font-medium text-gray-900 pt-3 flex-shrink-0">
                                        Unit Number
                                        <span className="ml-1 text-xs text-gray-400 font-normal">(optional)</span>
                                    </label>
                                    <div className="relative max-w-xs">
                                        <input
                                            id="unit-number-input"
                                            type="text"
                                            placeholder="#08-45"
                                            value={unitInput}
                                            onChange={(e) => setUnitInput(e.target.value)}
                                            className="h-11 px-4 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-400 self-center">
                                        Improves floor-level accuracy
                                    </p>
                                </div>
                            </div>

                            {/* ── Loading Skeleton ──────────────────────────────────────── */}
                            {submittedPostal && isLoading && (
                                <div className="space-y-4 animate-pulse">
                                    <div className="h-32 rounded-xl bg-gray-100" />
                                    <div className="h-64 rounded-xl bg-gray-100" />
                                    <div className="h-48 rounded-xl bg-gray-100" />
                                </div>
                            )}

                            {/* ── Estimate Section ──────────────────────────────────────── */}
                            {estimate && !isLoading && (
                                <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-6 text-white">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <p className="text-sm font-semibold text-emerald-200 uppercase tracking-wide mb-1">
                                                Estimated Market Value
                                            </p>
                                            <h2 className="text-4xl font-extrabold tracking-tight">
                                                {fmtFull(estimate.priceLow)} – {fmtFull(estimate.priceHigh)}
                                            </h2>
                                            <p className="text-emerald-200 text-sm mt-1">
                                                ${estimate.psfLow.toLocaleString()} – ${estimate.psfHigh.toLocaleString()} psf
                                            </p>
                                        </div>
                                        <span className="inline-flex items-center gap-1.5 bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm">
                                            <Building2 className="w-3.5 h-3.5" />
                                            Based on {estimate.comparableCount} transaction{estimate.comparableCount !== 1 ? 's' : ''}
                                        </span>
                                    </div>

                                    <div className="bg-white/10 rounded-xl p-3">
                                        <p className="text-xs text-emerald-100 font-semibold uppercase tracking-wide mb-1.5">
                                            Floor Area Context ({estimate.floorArea.toLocaleString()} sqft)
                                        </p>
                                        <p className="text-xs text-emerald-100">
                                            Valuation assumes a <strong>{estimate.floorArea.toLocaleString()} sqft</strong> unit.
                                            Median comparable PSF: <strong>${estimate.medianPsf.toLocaleString()}/sqft</strong>.
                                            Range is ±5% from median.
                                        </p>
                                    </div>

                                    {/* ESTIMATE ONLY label */}
                                    <p className="mt-4 text-center text-xs bg-amber-400/30 text-amber-100 font-bold tracking-widest py-1.5 rounded-lg">
                                        ESTIMATE ONLY — NOT AN OFFICIAL VALUATION
                                    </p>
                                </div>
                            )}

                            {/* ── 12-Month Price History Chart ──────────────────────────── */}
                            {comparables?.items.length && !isLoading && (
                                <div>
                                    <h3 className="text-base font-semibold text-gray-800 mb-4">
                                        12-Month Price History
                                    </h3>
                                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                        <ResponsiveContainer width="100%" height={240}>
                                            <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                                <XAxis
                                                    dataKey="label"
                                                    tick={{ fontSize: 11, fill: '#9CA3AF' }}
                                                    axisLine={false}
                                                    tickLine={false}
                                                />
                                                <YAxis
                                                    tickFormatter={(v) => fmtPrice(v)}
                                                    tick={{ fontSize: 11, fill: '#9CA3AF' }}
                                                    axisLine={false}
                                                    tickLine={false}
                                                    width={68}
                                                />
                                                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(16,185,129,0.08)' }} />
                                                {trendMedian > 0 && (
                                                    <ReferenceLine
                                                        y={trendMedian}
                                                        stroke="#10B981"
                                                        strokeDasharray="4 4"
                                                        strokeWidth={1.5}
                                                        label={{ value: 'Avg', position: 'right', fontSize: 10, fill: '#10B981' }}
                                                    />
                                                )}
                                                <Bar
                                                    dataKey="median"
                                                    fill="#10B981"
                                                    radius={[4, 4, 0, 0]}
                                                    maxBarSize={40}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                        <p className="text-xs text-gray-400 text-center mt-2">
                                            Median transaction price per month — hover bars for details
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* ── Comparable Transactions Table ─────────────────────────── */}
                            {comparables?.items.length && !isLoading && (
                                <div>
                                    <h3 className="text-base font-semibold text-gray-800 mb-4">
                                        Comparable Transactions
                                    </h3>
                                    <div className="overflow-x-auto rounded-xl border border-gray-200">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50 border-b border-gray-200">
                                                <tr>
                                                    {['Date', 'Floor', 'Floor Area', 'Price', 'PSF', 'vs Your Unit'].map((h) => (
                                                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                                                            {h}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {comparables.items.map((tx, i) => {
                                                    const isMyFloor = searchedFloor !== null && tx!.floor !== null && tx!.floor === searchedFloor;
                                                    return (
                                                        <tr
                                                            key={`${tx!.propertyId}-${i}`}
                                                            className={`transition-colors ${isMyFloor ? 'bg-emerald-50 border-l-2 border-l-emerald-400' : 'hover:bg-gray-50'}`}
                                                        >
                                                            <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{fmtDate(tx!.date)}</td>
                                                            <td className="px-4 py-3 text-gray-700">{tx!.floor ? `Floor ${tx!.floor}` : '—'}</td>
                                                            <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{tx!.floorArea.toLocaleString()} sqft</td>
                                                            <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{fmtFull(tx!.price)}</td>
                                                            <td className="px-4 py-3 text-gray-700 whitespace-nowrap">${tx!.psf.toLocaleString()}/sqft</td>
                                                            <td className="px-4 py-3">
                                                                {isMyFloor ? (
                                                                    <span className="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                                                                        ★ Same floor
                                                                    </span>
                                                                ) : '—'}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-2">
                                        Sorted by most recent. {searchedFloor ? `Rows highlighted with ★ are on Floor ${searchedFloor} — the same floor as the searched unit.` : 'Enter a unit number above to highlight same-floor transactions.'}
                                    </p>
                                </div>
                            )}

                            {/* Empty State */}
                            {!submittedPostal && (
                                <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">
                                    <MapPin className="w-10 h-10 mb-3 opacity-40" />
                                    <p className="font-medium text-gray-500">Enter a postal code to get started</p>
                                    <p className="text-xs mt-1">Try: 521123 (Tampines), 640055 (Jurong West), 460012 (Bedok)</p>
                                </div>
                            )}
                        </div>

                        {/* ── RIGHT: District Context Panel ──────────────────────────── */}
                        <div className="lg:col-span-1 space-y-4">

                            {/* District Context Card */}
                            {estimate && !isLoading && (
                                <>
                                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                                            District Context
                                        </p>
                                        <div className="flex items-start gap-2 mb-3">
                                            <MapPin className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-semibold text-gray-800">
                                                    {estimate.district}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {DISTRICT_NAMES[estimate.district] ?? 'Singapore'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-2.5">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">District median PSF</span>
                                                <span className="font-medium text-gray-900">
                                                    ${estimate.districtMedianPsf.toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Your est. PSF</span>
                                                <span className="font-medium text-gray-900">
                                                    ${estimate.medianPsf.toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm border-t border-gray-200 pt-2 mt-2">
                                                <span className="text-gray-500">vs District Median</span>
                                                <span className={`font-bold flex items-center gap-1 ${estimate.vsDistrictPct >= 0 ? 'text-emerald-600' : 'text-red-500'
                                                    }`}>
                                                    {estimate.vsDistrictPct >= 0
                                                        ? <TrendingUp className="w-3.5 h-3.5" />
                                                        : <TrendingDown className="w-3.5 h-3.5" />
                                                    }
                                                    {estimate.vsDistrictPct >= 0 ? '+' : ''}{estimate.vsDistrictPct}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* PSF Estimate Summary Card */}
                                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
                                        <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-3">
                                            Valuation Summary
                                        </p>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">PSF Range</span>
                                                <span className="font-medium text-gray-900">
                                                    ${estimate.psfLow.toLocaleString()} – ${estimate.psfHigh.toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Floor Area</span>
                                                <span className="font-medium text-gray-900">
                                                    {estimate.floorArea.toLocaleString()} sqft
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Data Points</span>
                                                <span className="font-medium text-gray-900">
                                                    {estimate.comparableCount} transactions
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Calls to Action */}
                            {estimate && !isLoading && (
                                <div className="space-y-2">
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                                        Next Steps
                                    </p>
                                    <Link
                                        href={`/insights?district=${estimate.district}`}
                                        className="flex items-center justify-between w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-emerald-400 hover:text-emerald-700 transition-colors group"
                                    >
                                        <span>Get Full District Analysis</span>
                                        <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                    </Link>
                                    <Link
                                        href={`/list-property?postal=${submittedPostal}`}
                                        className="flex items-center justify-between w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-emerald-400 hover:text-emerald-700 transition-colors group"
                                    >
                                        <span>List This Property</span>
                                        <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                    </Link>
                                    <Link
                                        href={`/resources/calculators/stamp-duty?price=${estimate.priceHigh}`}
                                        className="flex items-center justify-between w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-emerald-400 hover:text-emerald-700 transition-colors group"
                                    >
                                        <span>Calculate Stamp Duty</span>
                                        <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                    </Link>
                                </div>
                            )}

                            {/* Placeholder card when no results yet */}
                            {!submittedPostal && (
                                <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-5">
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">District Context</p>
                                    <p className="text-sm text-gray-400">District comparison will appear after lookup.</p>
                                </div>
                            )}

                            {/* Data source disclaimer */}
                            <p className="text-xs text-gray-400 leading-relaxed pt-1">
                                Estimates are based on mock comparable transaction data for illustration only.{' '}
                                Live integration will use URA and HDB public datasets.{' '}
                                <span className="font-semibold">Not an official valuation.</span>
                            </p>
                        </div>
                    </div>
                </CalculatorContainer>
            </div>
        </main>
    );
}
