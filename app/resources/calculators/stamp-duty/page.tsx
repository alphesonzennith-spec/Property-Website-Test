'use client';

import { useState, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { CalculatorNav } from '@/components/calculators/CalculatorNav';
import { CalculatorContainer } from '@/components/calculators/CalculatorContainer';
import { PillToggle } from '@/components/calculators/PillToggle';
import { useStampDutyCalculation } from '@/hooks/calculators/useStampDutyCalculation';
import { ResidencyStatus, PropertyType } from '@/types';

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return `S$${Math.round(n).toLocaleString('en-SG')}`;
}

function fmtRate(r: number) {
  return `${(r * 100).toFixed(0)}%`;
}

// ── Price Input ───────────────────────────────────────────────────────────────

function PriceInput({
  value,
  onChange,
  label = 'Purchase / Selling Price',
}: {
  value: number;
  onChange: (v: number) => void;
  label?: string;
}) {
  const [raw, setRaw] = useState(value ? value.toLocaleString('en-SG') : '');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const stripped = e.target.value.replace(/[^0-9]/g, '');
    const num = stripped ? parseInt(stripped, 10) : 0;
    setRaw(stripped ? num.toLocaleString('en-SG') : '');
    onChange(num);
  };

  return (
    <div className="flex items-center gap-4">
      <label className="w-48 text-sm font-medium text-gray-900 flex-shrink-0">{label}</label>
      <div className="relative flex-1 max-w-xs">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">S$</span>
        <input
          type="text"
          inputMode="numeric"
          placeholder="0"
          value={raw}
          onChange={handleChange}
          className="h-11 pl-9 pr-4 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm"
        />
      </div>
    </div>
  );
}

// ── BSD Tier Table ────────────────────────────────────────────────────────────

function BSDTable({
  breakdown,
  total,
}: {
  breakdown: Array<{ tier: string; rate: number; amount: number }>;
  total: number;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left px-4 py-2 font-semibold text-gray-700">Price Tier</th>
            <th className="text-right px-4 py-2 font-semibold text-gray-700">Rate</th>
            <th className="text-right px-4 py-2 font-semibold text-gray-700">Tax</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {breakdown.map((row, i) => (
            <tr key={i} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-2 text-gray-700">{row.tier}</td>
              <td className="px-4 py-2 text-right text-gray-700">{fmtRate(row.rate)}</td>
              <td className="px-4 py-2 text-right text-gray-700">{fmt(row.amount)}</td>
            </tr>
          ))}
          {breakdown.length === 0 && (
            <tr>
              <td colSpan={3} className="px-4 py-3 text-center text-gray-400 text-xs">
                Enter a price to see breakdown
              </td>
            </tr>
          )}
        </tbody>
        {breakdown.length > 0 && (
          <tfoot className="bg-emerald-50 border-t-2 border-emerald-200">
            <tr>
              <td className="px-4 py-2 font-bold text-emerald-900">Total BSD</td>
              <td />
              <td className="px-4 py-2 text-right font-bold text-emerald-900">{fmt(total)}</td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function StampDutyCalculatorPage() {
  const {
    transactionType, setTransactionType,
    purchaseStatus, setPurchaseStatus,
    residencyStatus, setResidencyStatus,
    secondBuyerResidency, setSecondBuyerResidency,
    existingPropertiesOwned, setExistingPropertiesOwned,
    purchasePrice, setPurchasePrice,
    originalPurchaseDate, setOriginalPurchaseDate,
    propertyType, setPropertyType,
    bsdResult,
    absdResult,
    ssdResult,
    holdingPeriodMonths,
    totalStampDuty,
    whatIfResults,
    isLoading,
    error,
    stampDutyConfig,
  } = useStampDutyCalculation();

  const [showWhatIf, setShowWhatIf] = useState(false);

  // Effective date from config (type guard via 'effectiveDate' check)
  const effectiveDate: string | null = useMemo(() => {
    if (!stampDutyConfig) return null;
    const cfg = stampDutyConfig as Record<string, unknown>;
    return typeof cfg.effectiveDate === 'string' ? cfg.effectiveDate : null;
  }, [stampDutyConfig]);

  const sourceUrl = 'https://www.iras.gov.sg/taxes/stamp-duty';

  // ── Loading ───────────────────────────────────────────────────────────
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

  // ── Error ─────────────────────────────────────────────────────────────
  if (error) {
    return (
      <main className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Alert variant="destructive">
            <AlertTitle>Error loading calculator</AlertTitle>
            <AlertDescription>
              Unable to load stamp duty rates. Please try again.
            </AlertDescription>
          </Alert>
        </div>
      </main>
    );
  }

  const isSell = transactionType === 'sell';
  const isJoint = purchaseStatus === 'joint';
  const hasPrice = purchasePrice > 0;

  // ── Share URL ─────────────────────────────────────────────────────────
  const handleShare = () => {
    const params = new URLSearchParams({
      type: transactionType,
      status: purchaseStatus,
      residency: residencyStatus,
      properties: String(existingPropertiesOwned),
      price: String(purchasePrice),
      propType: propertyType,
      ...(isSell && originalPurchaseDate ? { purchaseDate: originalPurchaseDate } : {}),
    });
    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    navigator.clipboard.writeText(url).catch(() => { });
  };

  // ── AI Explain ────────────────────────────────────────────────────────
  const handleAskAI = () => {
    const message = [
      `I'm calculating stamp duty for a ${residencyStatus} ${isSell ? 'seller' : 'buyer'} of a ${propertyType} property at ${fmt(purchasePrice)}.`,
      `Currently owns ${existingPropertiesOwned} propert${existingPropertiesOwned === 1 ? 'y' : 'ies'}.`,
      `BSD: ${fmt(bsdResult.amount)}.`,
      `ABSD: ${fmt(absdResult.amount)} (${fmtRate(absdResult.applicableRate)}) — ${absdResult.rationale}.`,
      isSell && !ssdResult.isExempt ? `SSD: ${fmt(ssdResult.amount)} (held ${holdingPeriodMonths} months).` : '',
      `Total stamp duty: ${fmt(totalStampDuty)}.`,
      `Can you explain why each component applies and any ways to plan around them?`,
    ]
      .filter(Boolean)
      .join(' ');

    window.dispatchEvent(new CustomEvent('open-ai-chat', { detail: { message } }));
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-2">
          RESOURCES / CALCULATORS / STAMP DUTY
        </p>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Stamp Duty Calculator</h1>
        <CalculatorNav active="stamp-duty" />
        <p className="text-sm text-gray-600 mb-8">
          Calculate BSD, ABSD, and SSD based on Singapore IRAS regulatory rates. Results update live.
        </p>

        {/* Calculator Container */}
        <CalculatorContainer title="">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* ── Left: Inputs ────────────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-6">

              {/* Transaction Type */}
              <div className="flex items-center gap-4">
                <label className="w-48 text-sm font-medium text-gray-900 flex-shrink-0">
                  Transaction Type
                </label>
                <PillToggle
                  value={transactionType}
                  onChange={(v) => setTransactionType(v as 'buy' | 'sell')}
                  options={[
                    { value: 'buy', label: 'Buy' },
                    { value: 'sell', label: 'Sell' },
                  ]}
                />
              </div>

              {/* Purchase Status */}
              <div className="flex items-center gap-4">
                <label className="w-48 text-sm font-medium text-gray-900 flex-shrink-0">
                  Purchase Status
                </label>
                <PillToggle
                  value={purchaseStatus}
                  onChange={(v) => setPurchaseStatus(v as 'single' | 'joint')}
                  options={[
                    { value: 'single', label: 'Single' },
                    { value: 'joint', label: 'Joint Purchase' },
                  ]}
                />
              </div>

              {/* My Residency */}
              <div className="flex items-center gap-4">
                <label className="w-48 text-sm font-medium text-gray-900 flex-shrink-0">
                  My Residency
                </label>
                <PillToggle
                  value={residencyStatus}
                  onChange={(v) => setResidencyStatus(v as ResidencyStatus)}
                  options={[
                    { value: ResidencyStatus.Singaporean, label: 'Singaporean' },
                    { value: ResidencyStatus.PR, label: 'PR' },
                    { value: ResidencyStatus.Foreigner, label: 'Foreigner' },
                  ]}
                />
              </div>

              {/* Second Buyer Residency (Joint only) */}
              {isJoint && (
                <div className="flex items-center gap-4 pl-0 border-l-4 border-emerald-100 ml-0">
                  <label className="w-48 text-sm font-medium text-gray-500 flex-shrink-0 pl-3">
                    2nd Buyer Residency
                  </label>
                  <PillToggle
                    value={secondBuyerResidency}
                    onChange={(v) => setSecondBuyerResidency(v as ResidencyStatus)}
                    options={[
                      { value: ResidencyStatus.Singaporean, label: 'Singaporean' },
                      { value: ResidencyStatus.PR, label: 'PR' },
                      { value: ResidencyStatus.Foreigner, label: 'Foreigner' },
                    ]}
                  />
                </div>
              )}

              {/* Property Type */}
              <div className="flex items-center gap-4">
                <label className="w-48 text-sm font-medium text-gray-900 flex-shrink-0">
                  Property Type
                </label>
                <PillToggle
                  value={propertyType}
                  onChange={(v) => setPropertyType(v as PropertyType)}
                  options={[
                    { value: PropertyType.HDB, label: 'HDB' },
                    { value: PropertyType.Condo, label: 'Condo' },
                    { value: PropertyType.EC, label: 'EC' },
                    { value: PropertyType.Landed, label: 'Landed' },
                  ]}
                />
              </div>

              {/* Existing Properties Owned */}
              <div className="flex items-center gap-4">
                <label className="w-48 text-sm font-medium text-gray-900 flex-shrink-0">
                  Properties I Currently Own
                </label>
                <PillToggle
                  value={String(existingPropertiesOwned)}
                  onChange={(v) => setExistingPropertiesOwned(Number(v))}
                  options={[
                    { value: '0', label: '0' },
                    { value: '1', label: '1' },
                    { value: '2', label: '2' },
                    { value: '3', label: '3+' },
                  ]}
                />
              </div>

              {/* Price */}
              <PriceInput
                label={isSell ? 'Selling Price' : 'Purchase Price'}
                value={purchasePrice}
                onChange={setPurchasePrice}
              />

              {/* Original Purchase Date (Sell only) */}
              {isSell && (
                <div className="flex items-center gap-4">
                  <label className="w-48 text-sm font-medium text-gray-900 flex-shrink-0">
                    Date of Original Purchase
                  </label>
                  <input
                    type="date"
                    value={originalPurchaseDate}
                    onChange={(e) => setOriginalPurchaseDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="h-11 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                  />
                </div>
              )}

              {/* What-if Comparison Toggle */}
              <div className="pt-2 border-t border-gray-100">
                <button
                  onClick={() => setShowWhatIf((p) => !p)}
                  className="flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-emerald-300 text-xs">
                    {showWhatIf ? '−' : '+'}
                  </span>
                  What-if Comparison (SC / PR / Foreigner)
                </button>
              </div>
            </div>

            {/* ── Right: Results Panel ─────────────────────────────────── */}
            <div className="lg:col-span-1 space-y-4">

              {/* Section 1 — BSD */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Buyer&apos;s Stamp Duty (BSD)
                </p>
                <BSDTable
                  breakdown={bsdResult.breakdown}
                  total={bsdResult.amount}
                />
              </div>

              {/* Section 2 — ABSD */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Additional BSD (ABSD)
                </p>
                {absdResult.applicableRate === 0 ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold bg-green-100 text-green-700 px-2.5 py-1 rounded-full">
                    ✓ No ABSD Applicable
                  </span>
                ) : (
                  <>
                    <p className="text-3xl font-bold text-gray-900">{fmt(absdResult.amount)}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Rate applied: <strong>{fmtRate(absdResult.applicableRate)}</strong>
                      {absdResult.rationale ? ` — ${absdResult.rationale}` : ''}
                    </p>
                  </>
                )}
              </div>

              {/* Section 3 — SSD (only if Sell) */}
              {isSell && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Seller&apos;s Stamp Duty (SSD)
                  </p>
                  {ssdResult.isExempt ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">
                      No SSD Applicable (held &gt; 3 years)
                    </span>
                  ) : (
                    <>
                      <p className="text-3xl font-bold text-gray-900">{fmt(ssdResult.amount)}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Rate: <strong>{fmtRate(ssdResult.rate)}</strong> — sold within{' '}
                        {holdingPeriodMonths !== undefined
                          ? `${holdingPeriodMonths} month${holdingPeriodMonths !== 1 ? 's' : ''} of purchase`
                          : '3 years of purchase'}
                        . SSD applies when property is sold within 3 years.
                      </p>
                    </>
                  )}
                </div>
              )}

              {/* Section 4 — Total Summary */}
              <div className="bg-emerald-600 rounded-xl p-5 text-white">
                <p className="text-xs font-semibold text-emerald-200 uppercase tracking-wide mb-1">
                  Grand Total
                </p>
                <p className="text-4xl font-extrabold">{fmt(totalStampDuty)}</p>
                <div className="mt-3 space-y-1 text-sm text-emerald-100">
                  <div className="flex justify-between">
                    <span>BSD</span>
                    <span>{fmt(bsdResult.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ABSD</span>
                    <span>{fmt(absdResult.amount)}</span>
                  </div>
                  {isSell && (
                    <div className="flex justify-between">
                      <span>SSD</span>
                      <span>{fmt(ssdResult.amount)}</span>
                    </div>
                  )}
                </div>
                {hasPrice && !isSell && (
                  <p className="mt-3 text-xs text-emerald-200 border-t border-emerald-500 pt-3">
                    📅 BSD of {fmt(bsdResult.amount)} is due within 14 days of signing the OTP / S&amp;P.
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleAskAI}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
                >
                  <span>✦</span> Ask AI
                </button>
                <button
                  onClick={handleShare}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
                >
                  <span>🔗</span> Share
                </button>
              </div>
            </div>
          </div>

          {/* ── What-if Comparison Section ───────────────────────────── */}
          {showWhatIf && whatIfResults && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">
                What-if Comparison — at {fmt(purchasePrice) || 'your price'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {whatIfResults.map((col) => (
                  <div
                    key={col.key}
                    className={`rounded-xl border p-4 ${col.key === 'SC' && residencyStatus === ResidencyStatus.Singaporean
                      ? 'border-emerald-300 bg-emerald-50'
                      : col.key === 'PR' && residencyStatus === ResidencyStatus.PR
                        ? 'border-emerald-300 bg-emerald-50'
                        : col.key === 'FR' && residencyStatus === ResidencyStatus.Foreigner
                          ? 'border-emerald-300 bg-emerald-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                  >
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      {col.label}
                    </p>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">BSD</span>
                        <span className="font-medium">{fmt(col.bsd)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">ABSD ({fmtRate(col.absdRate)})</span>
                        <span className="font-medium">{fmt(col.absd)}</span>
                      </div>
                      <div className="flex justify-between border-t border-gray-200 pt-1.5 mt-1">
                        <span className="font-semibold text-gray-800">Total</span>
                        <span className="font-bold text-emerald-700">{fmt(col.total)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CalculatorContainer>

        {/* ── Rates Source Footnote ──────────────────────────────────── */}
        <p className="mt-4 text-xs text-gray-400">
          BSD rates effective{' '}
          {effectiveDate
            ? new Date(effectiveDate).toLocaleDateString('en-SG', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })
            : 'January 2024'}
          . Source:{' '}
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-600"
          >
            IRAS Stamp Duty
          </a>
          . For illustration only — consult a professional for formal advice.
        </p>
      </div>
    </main>
  );
}
