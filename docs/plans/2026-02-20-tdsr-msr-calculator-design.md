# TDSR & MSR Calculator - Design Document

**Date**: 2026-02-20
**Status**: Approved
**Location**: `/app/resources/calculators/tdsr/page.tsx`

---

## Overview

Build a dual-calculator page that allows users to calculate their Total Debt Servicing Ratio (TDSR) and Mortgage Servicing Ratio (MSR) using real-time Singapore regulatory rates fetched from the centralized configuration system. The calculator provides instant feedback on borrowing capacity and maximum property affordability.

### Key Requirements

- **Two tabs**: TDSR (default) and MSR (HDB/EC only)
- **Dynamic rates**: All percentages and limits pulled from regulatory config (zero hardcoding)
- **Real-time calculations**: Instant results using `useMemo` as inputs change
- **Traffic light indicators**: Visual feedback on debt ratio health (green/yellow/red)
- **Shared purchasing power box**: Shows max property price across both tabs
- **Joint applicant support**: TDSR tab allows single or joint applications
- **Responsive design**: Works on desktop, tablet, and mobile

---

## Architecture & Implementation Approach

### Chosen Approach: Single-Page Monolithic Component

**Rationale**: Matches existing codebase patterns (all placeholder pages are single-file components), provides fast iteration, and keeps all logic in one place for a relatively straightforward calculator.

**Trade-offs Accepted**: Larger file size (~400-500 lines), but still manageable and easier to maintain than multiple component files for this single-purpose page.

### File Structure

```
app/resources/calculators/tdsr/page.tsx (~400-500 lines)
```

### Component Architecture

- **Single client component** (`'use client'`)
- **shadcn/ui Tabs** component for TDSR ↔ MSR switching
- **Tab 1 (TDSR)**: Full TDSR calculator with joint applicant support
- **Tab 2 (MSR)**: Simplified MSR calculator for HDB/EC properties only
- **Shared section**: Purchasing Power Box appears at bottom of both tabs

### State Management

All state managed with React `useState`:

- **Rates**: Fetched via `useRegulatorySection('borrowing')` from regulatory config
- **Form inputs**: Individual `useState` for each input field
  - TDSR: `fixedIncome`, `variableIncome`, `creditCardDebts`, `carLoan`, `otherHomeLoans`, `otherLoans`, `stressTestRate`, `loanTenureYears`, `desiredLoanAmount`
  - MSR: `grossMonthlyIncome`, `propertyType`, `proposedMortgageRepayment`
- **Active tab**: `useState<'tdsr' | 'msr'>('tdsr')`
- **Applicant mode**: `useState<'single' | 'joint'>('single')` (TDSR only)

### Real-Time Calculation Strategy

Use `useMemo` to compute outputs whenever inputs change:

```typescript
const tdsrResult = useMemo(() => {
  if (!borrowingConfig) return null;

  const input: TDSRInput = {
    grossMonthlyIncome: fixedIncome + variableIncome,
    existingMonthlyDebts: creditCardDebts + carLoan + otherHomeLoans + otherLoans,
    proposedMortgageRepayment: monthlyRepayment,
    hasVariableIncome: variableIncome > 0,
  };

  return calculateTDSR(input, borrowingConfig.tdsr);
}, [fixedIncome, variableIncome, creditCardDebts, carLoan, otherHomeLoans, otherLoans, monthlyRepayment, borrowingConfig]);
```

Separate memos for:
- TDSR calculations
- MSR calculations
- Purchasing power (max loan → max property price via LTV)
- Traffic light status (green <40%, yellow 40-54%, red ≥55%)

---

## Data Flow & Calculation Logic

### Data Fetching

```typescript
const { data: borrowingConfig, isLoading, error, refetch } = useRegulatorySection('borrowing');

// borrowingConfig structure:
{
  tdsr: {
    limit: 0.55,
    variableIncomeHaircutPct: 30,
    description: "..."
  },
  msr: {
    limit: 0.30,
    applicablePropertyTypes: [PropertyType.HDB, PropertyType.EC],
    description: "..."
  },
  ltv: {
    rules: [...],
    description: "..."
  }
}
```

### Dynamic Labels (No Hardcoding Rule)

**Critical**: All percentages and rates displayed in labels/text must pull from `borrowingConfig`:

- TDSR limit label: `"Your TDSR limit ({(borrowingConfig.tdsr.limit * 100)}%)"`
- MSR limit label: `"MSR limit ({(borrowingConfig.msr.limit * 100)}%)"`
- Variable income haircut: `"We apply a {borrowingConfig.tdsr.variableIncomeHaircutPct}% haircut per MAS guidelines — only {100-haircut}% counted"`

### Calculation Functions

**TDSR Calculation**:
```typescript
const tdsrResult = useMemo(() => {
  if (!borrowingConfig) return null;

  return calculateTDSR(
    {
      grossMonthlyIncome: fixedIncome + variableIncome,
      existingMonthlyDebts: totalDebts,
      proposedMortgageRepayment: monthlyRepayment,
      hasVariableIncome: variableIncome > 0,
    },
    borrowingConfig.tdsr
  );
}, [fixedIncome, variableIncome, totalDebts, monthlyRepayment, borrowingConfig]);
```

**MSR Calculation**:
```typescript
const msrResult = useMemo(() => {
  if (!borrowingConfig) return null;

  return calculateMSR(
    {
      grossMonthlyIncome,
      proposedMortgageRepayment,
    },
    borrowingConfig.msr
  );
}, [grossMonthlyIncome, proposedMortgageRepayment, borrowingConfig]);
```

**Max Loan Calculation**:
```typescript
const maxLoanResult = useMemo(() => {
  if (!borrowingConfig) return null;

  return getMaxLoanAmount(
    grossMonthlyIncome,
    existingMonthlyDebts,
    propertyType,
    stressTestRate,
    loanTenureYears,
    {
      tdsrLimit: borrowingConfig.tdsr.limit,
      msrLimit: borrowingConfig.msr.limit,
      msrApplicablePropertyTypes: borrowingConfig.msr.applicablePropertyTypes,
    }
  );
}, [grossMonthlyIncome, existingMonthlyDebts, propertyType, stressTestRate, loanTenureYears, borrowingConfig]);
```

### Loading & Error States

- **Loading**: Show skeleton loaders while `isLoading === true`
- **Error**: Display error alert with retry button if config fetch fails
- **No config**: Disable calculator inputs until config loads successfully

---

## UI/UX Design & Layout

### Page Header

```
CALCULATORS / TDSR
TDSR & MSR Calculator
Calculate your Total Debt Servicing Ratio and Mortgage Servicing Ratio
```

### Tab Navigation

Use shadcn/ui Tabs component:
- **Tab 1**: "TDSR" (default active)
- **Tab 2**: "MSR" with badge "For HDB/EC only"

### TDSR Tab Layout

**1. Status Toggle** (Top section)
- Radio group: `Single` | `Joint`
- If Joint: duplicate income fields for Applicant 2

**2. Income Section** (Card component)
- **Fixed Monthly Income (SGD)** - Number input with thousand separators
- **Variable Monthly Income (SGD)** - Number input
  - Helper text: *"We apply a {config.tdsr.variableIncomeHaircutPct}% haircut per MAS guidelines — only {100-haircut}% counted"*

**3. Debt Obligations Section** (Card component)
- Credit Card Minimum Payments (SGD)
- Car Loan (SGD)
- Other Home Loans (SGD)
- Other Loans (SGD)
- **Running total banner**: `Total monthly obligations: $X,XXX` (bold, emerald color, auto-calculated)

**4. Loan Parameters Section** (Card component)
- **Stress Test Rate (%)** - Input pre-filled from `borrowingConfig`, editable
  - Helper note: *"MAS stress test rate: {config.stressTestRate}%"*
- **Loan Tenure** - Slider (5-30 years) with current value display
- **Desired Loan Amount (optional)** - Input
  - Helper text: *"Leave blank to calculate maximum"*

**5. Results Section** (Large card, right side on desktop / below on mobile)

Display format:
```
Effective Monthly Income: $X,XXX
  ↳ $X,XXX fixed + $Y,YYY variable (after haircut)

TDSR Limit ({config.tdsr.limit*100}%): $X,XXX/month
Current Obligations: $X,XXX/month
Available for Mortgage: $X,XXX/month

Maximum Loan You Qualify For: $X,XXX,XXX
Maximum Property Price (at {LTV}% LTV): $X,XXX,XXX
```

**6. Traffic Light Indicator** (Visual badge/alert)

- 🟢 **Green** (ratio <40%): "Comfortable - Well within TDSR limit"
- 🟡 **Yellow** (ratio 40-54%): "Approaching limit - Consider reducing obligations"
- 🔴 **Red** (ratio ≥55%): "Exceeds TDSR - Loan will be rejected"

### MSR Tab Layout

**1. Inputs Section** (Single card)
- Gross Monthly Income (SGD)
- Property Type: Radio group `HDB` | `EC`
- Proposed Monthly Mortgage (SGD)

**2. Results Section** (Card)
```
MSR Limit ({config.msr.limit*100}%): $X,XXX/month
Maximum Monthly HDB Mortgage Allowed: $X,XXX
Maximum HDB Loan: $X,XXX,XXX
```

**3. Comparison Callout** (Alert/Banner component, info style)
```
For private property (TDSR), your limit would be $Y/month
HDB's MSR rule limits you to $X/month — $Z less
```

### Shared Purchasing Power Box

(Appears at bottom of both tabs, highlighted card with emerald border)

**Title**: "Your Maximum Purchasing Power"

**Content**:
```
Max Loan Amount: $X,XXX,XXX
Estimated Down Payment (25%): $XXX,XXX
────────────────────────────────
Maximum Property Price: $X,XXX,XXX

Based on current LTV of {config.ltv}%
```

### Footer Note

Small gray text at bottom:
```
Rates effective as of {config.effectiveDate}
Source: Monetary Authority of Singapore
```

### Styling Consistency

Match existing placeholder pages:
- White background: `bg-white`
- Emerald accent: `text-emerald-600`, `border-emerald-500`
- Max width container: `max-w-7xl mx-auto`
- Padding: `px-4 sm:px-6 lg:px-8 py-20`
- Use shadcn/ui component defaults for cards, inputs, buttons

### Responsive Breakpoints

- **Desktop** (≥768px): Two-column grid (inputs left, results right)
- **Tablet** (640-767px): Single column, results below inputs
- **Mobile** (<640px): Single column, compact spacing, full-width inputs

---

## Error Handling & Edge Cases

### Loading States

- **Initial load**: Show skeleton loaders matching card layouts while `isLoading === true`
- **Calculation updates**: Results update instantly via `useMemo` (no spinner needed)
- Use shadcn/ui `<Skeleton />` component

### Error States

**1. Config Fetch Failure**
```typescript
if (error) {
  return (
    <Alert variant="destructive">
      <AlertTitle>Unable to load regulatory rates</AlertTitle>
      <AlertDescription>
        Please try refreshing the page. If the problem persists, contact support.
      </AlertDescription>
      <Button onClick={() => refetch()}>Retry</Button>
    </Alert>
  );
}
```

**2. Invalid Input Handling**
- All number inputs validate on blur
- `type="number"` with `min={0}` attribute (no negative values)
- Show inline error messages for invalid inputs

**3. Division by Zero Protection**
```typescript
const tdsrRatio = effectiveMonthlyIncome > 0
  ? totalMonthlyObligations / effectiveMonthlyIncome
  : 0;
```

### Edge Cases

**1. Zero Income**
- Display: "Please enter your monthly income to calculate TDSR"
- Disable results section, show placeholder

**2. Proposed Mortgage = 0**
- Still calculate max loan capacity
- Show: "Enter a proposed mortgage amount to see if it's within your limit"

**3. TDSR > 100%**
- Traffic light: Red
- Message: "Your obligations exceed your income. Loan will not be approved."

**4. MSR for Non-HDB/EC Properties**
- Show info banner: "MSR only applies to HDB and EC properties. For private properties, use the TDSR tab."

**5. Joint Application with Unequal Incomes**
- Sum both applicants' incomes (fixed + variable separately)
- Apply haircut to combined variable income
- Show breakdown: "Applicant 1: $X | Applicant 2: $Y | Combined: $Z"

### Input Validation Rules

- Monthly income: 0 to 1,000,000 (SGD)
- Monthly debts: 0 to 500,000 (SGD)
- Loan tenure: 5 to 30 years (enforced by slider)
- Stress test rate: 1% to 15% (reasonable bounds)

### Number Formatting Standards

- **Currency**: Use `Intl.NumberFormat('en-SG', { style: 'currency', currency: 'SGD' })`
- **Percentages**: Use `.toFixed(1)` for ratios (e.g., "42.3%")
- **Whole dollars**: No decimals in input fields (remove cents)

---

## Technical Implementation Notes

### Import Structure

```typescript
'use client';

import { useState, useMemo } from 'react';
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
```

### Key Dependencies

- **Regulatory rates**: `useRegulatorySection('borrowing')` hook
- **Calculation functions**: `lib/calculations/borrowing.ts`
- **Type definitions**: `types/calculator.ts` (TDSRInput, TDSROutput, MSRInput, MSROutput)
- **UI components**: shadcn/ui (Tabs, Card, Input, Slider, Alert, Badge)

### Performance Considerations

- **Memoization**: All calculations wrapped in `useMemo` with proper dependencies
- **Debouncing**: Not needed - calculations are fast enough for real-time updates
- **React Query caching**: Regulatory config cached for 1 hour (handled by hook)

---

## Testing Checklist

### Functional Tests

- [ ] TDSR calculation produces correct ratio for sample inputs
- [ ] MSR calculation produces correct ratio for HDB/EC properties
- [ ] Max loan amount matches expected value based on TDSR/MSR limits
- [ ] Traffic light indicator shows correct color for each ratio range
- [ ] Joint applicant mode correctly sums incomes and applies haircut
- [ ] Variable income haircut applies correctly (e.g., 30% haircut = 70% counted)

### Integration Tests

- [ ] Regulatory config loads successfully from tRPC
- [ ] Dynamic labels display correct percentages from config
- [ ] Changing config values updates all displayed rates
- [ ] Error state displays when config fetch fails
- [ ] Retry button successfully refetches config

### UI/UX Tests

- [ ] Tab switching works smoothly
- [ ] Form inputs accept valid numbers and reject invalid input
- [ ] Running totals update instantly as debt fields change
- [ ] Slider updates tenure value in real-time
- [ ] Results section updates without lag (<100ms)
- [ ] Loading skeletons display during initial load
- [ ] Responsive layout works on mobile, tablet, desktop
- [ ] Number formatting displays correctly (thousand separators, $ symbol)

### Edge Case Tests

- [ ] Zero income shows appropriate message
- [ ] TDSR > 100% displays red traffic light and warning
- [ ] Division by zero doesn't crash (returns 0)
- [ ] Negative numbers rejected in inputs
- [ ] Very large numbers (>$10M) handled gracefully

---

## Implementation Status

**Status**: ✅ Complete
**Implementation Date**: 2026-02-20
**Implementation Plan**: `docs/plans/2026-02-20-tdsr-msr-calculator.md`

### Completed Features

- ✅ TDSR calculator with single/joint applicant modes
- ✅ MSR calculator for HDB/EC properties
- ✅ Dynamic regulatory rate fetching via tRPC
- ✅ Real-time calculations with useMemo
- ✅ Traffic light indicators (green/yellow/red)
- ✅ Purchasing power box (max property price)
- ✅ Responsive design (desktop/tablet/mobile)
- ✅ Error handling and loading states
- ✅ Number formatting (SGD currency, percentages)
- ✅ TDSR vs MSR comparison callout

### Verification

All items from the Testing Checklist have been verified:
- Functional tests: ✅ PASS
- Integration tests: ✅ PASS
- UI/UX tests: ✅ PASS
- Edge case tests: ✅ PASS
- Production build: ✅ PASS

---

## Future Enhancements

1. **Save Calculation**: Allow users to save results to profile
2. **PDF Export**: Generate downloadable report with breakdown
3. **Comparison Mode**: Compare multiple scenarios side-by-side
4. **Rate History**: Show how limits have changed over time
5. **Smart Recommendations**: Suggest optimal debt reduction strategies
6. **Integration with Affordability Calculator**: Link to full affordability analysis

---

## Approval & Sign-off

**Design Approved By**: User
**Date**: 2026-02-20
**Next Step**: Implementation via writing-plans skill

---

## Appendix: Regulatory Config Structure

For reference, the borrowing section structure:

```typescript
{
  borrowing: {
    tdsr: {
      limit: 0.55,                    // 55%
      variableIncomeHaircutPct: 30,   // 30% haircut
      description: "Total Debt Servicing Ratio (TDSR) framework..."
    },
    msr: {
      limit: 0.30,                    // 30%
      applicablePropertyTypes: [PropertyType.HDB, PropertyType.EC],
      description: "Mortgage Servicing Ratio (MSR) framework..."
    },
    ltv: {
      rules: [
        {
          loanType: 'HDB',
          propertyType: PropertyType.HDB,
          loanTenureYears: 25,
          existingLoans: 0,
          maxLTVPct: 85,
          minCashDownPaymentPct: 5
        },
        // ... more LTV rules
      ],
      description: "Loan-to-Value (LTV) limits..."
    }
  }
}
```
