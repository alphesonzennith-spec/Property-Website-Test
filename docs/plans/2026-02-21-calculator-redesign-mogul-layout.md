# Calculator Redesign: Mogul.sg Layout

**Date:** 2026-02-21
**Status:** Approved
**Approach:** Hybrid - Shared Logic, New UI

## Overview

Redesign the TDSR/MSR calculator pages to match mogul.sg's clean, horizontal layout. This involves splitting the current tabbed page into separate pages, creating reusable components for the mogul.sg layout pattern, and extracting calculation logic into custom hooks.

## Design Decisions

### 1. Page Structure
- **Current:** Single page at `/resources/calculators/tdsr` with TDSR and MSR in tabs
- **New:**
  - `/resources/calculators/tdsr` - TDSR calculator only
  - `/resources/calculators/msr` - MSR calculator only (new page)
  - CalculatorNav buttons navigate between separate pages

### 2. Layout Pattern
- **Desktop:** Horizontal layout - 65% inputs (left) / 35% results (right)
- **Mobile:** Vertical stack - inputs on top, results below
- **Container:** Single white rounded container (no separate cards)
- **Style:** Matches mogul.sg - clean, compact, professional

### 3. Single/Joint Applicant UX
- **Always show both applicant inputs** side-by-side
- **Single mode:** Joint applicant inputs are disabled/grayed out
- **Joint mode:** All inputs are enabled
- **Toggle style:** Pill-style toggle button (blue active, white inactive)

### 4. Results Panel
- **Position:** Right column on desktop, below inputs on mobile
- **Behavior:** Scrolls normally with page (not sticky)
- **Styling:** Light gray background, blue for final values

## Architecture

### File Structure

```
app/resources/calculators/
├── tdsr/
│   └── page.tsx          # New TDSR-only page
├── msr/
│   └── page.tsx          # New MSR-only page (to be created)
├── stamp-duty/
│   └── page.tsx          # Existing
└── affordability/
    └── page.tsx          # Existing

hooks/calculators/
├── useTDSRCalculation.ts    # Extract TDSR logic
└── useMSRCalculation.ts     # Extract MSR logic

components/calculators/
├── CalculatorNav.tsx            # Existing (update to include MSR)
├── CalculatorContainer.tsx      # New: Main wrapper with mogul.sg styling
├── PillToggle.tsx               # New: Single/Joint toggle component
├── InputRow.tsx                 # New: Reusable row layout component
└── ResultsPanel.tsx             # New: Right-side results display
```

## Component Design

### CalculatorContainer
**Purpose:** Main layout wrapper matching mogul.sg aesthetic

**Props:**
- `children: ReactNode` - Input rows and results panel
- `title: string` - Calculator title
- `subtitle?: string` - Optional description

**Layout:**
- White background, rounded corners, subtle border/shadow
- Responsive grid: 1 column mobile, 3 columns desktop
- Left column (inputs): `lg:col-span-2`
- Right column (results): `lg:col-span-1`

**Styling:**
```tsx
<div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
    {/* Left: Inputs */}
    {/* Right: Results */}
  </div>
</div>
```

### PillToggle
**Purpose:** Single/Joint applicant selector matching mogul.sg

**Props:**
- `value: 'single' | 'joint'`
- `onChange: (value: 'single' | 'joint') => void`
- `options: Array<{ value: string, label: string }>`

**Styling:**
- Container: `rounded-full border border-gray-300 p-1 inline-flex`
- Active button: `bg-blue-600 text-white rounded-full px-6 py-2`
- Inactive button: `bg-transparent text-gray-700 px-6 py-2`
- Transition: `transition-all duration-200`

### InputRow
**Purpose:** Reusable horizontal input layout for each field

**Props:**
- `label: string` - Left-aligned label
- `children: ReactNode` - Input fields (Main + Joint)
- `helpText?: string` - Optional helper text below inputs

**Layout:**
- Label: Fixed width 192px (`w-48`), medium font
- Input container: Flex-1, 2-column grid with gap
- Each input: Border, height 44px, "S$" prefix, disabled state

**Styling:**
```tsx
<div className="flex items-start gap-4">
  <label className="w-48 text-sm font-medium text-gray-900 pt-3">
    {label}
  </label>
  <div className="flex-1 grid grid-cols-2 gap-4">
    <Input disabled={isSingle} /> {/* Joint */}
    <Input /> {/* Main */}
  </div>
</div>
```

### ResultsPanel
**Purpose:** Display calculated results on right side

**Props:**
- `results: Array<{ label: string, value: string, highlight?: boolean }>`

**Styling:**
- Background: `bg-gray-50`
- Border: `border border-gray-200 rounded-xl`
- Padding: `p-6`
- Result rows: `space-y-3`
- Highlighted result (final): `text-2xl font-bold text-blue-600`
- Regular results: `text-lg font-semibold text-gray-900`

## Data Flow & State Management

### Custom Hooks

#### useTDSRCalculation
Encapsulates all TDSR calculation logic and state.

**Returns:**
```typescript
{
  // State
  applicantMode: 'single' | 'joint'
  setApplicantMode: (mode: 'single' | 'joint') => void
  fixedIncome: number
  setFixedIncome: (val: number) => void
  variableIncome: number
  setVariableIncome: (val: number) => void
  fixedIncome2: number
  setFixedIncome2: (val: number) => void
  variableIncome2: number
  setVariableIncome2: (val: number) => void
  debts: {
    creditCards: number
    carLoan: number
    otherHomeLoans: number
    otherLoans: number
  }
  setDebts: (debts: Debts) => void
  loanParams: {
    stressTestRate: number
    tenureYears: number
    desiredLoan: number
  }
  setLoanParams: (params: LoanParams) => void

  // Computed values (useMemo)
  totalIncome: number
  effectiveIncome: number  // with variable haircut applied
  totalDebts: number
  tdsrPercentage: number
  maxLoanAmount: number
  monthlyMortgageLimit: number

  // Config & loading
  isLoading: boolean
  error: Error | null
  borrowingConfig: BorrowingConfig | null
}
```

**Implementation Details:**
- Uses `useRegulatorySection('borrowing')` to fetch config
- Uses `useMemo` for calculated values
- Reuses existing `calculateTDSR()` from `lib/calculations/borrowing`
- Applies variable income haircut automatically
- All state updates trigger recalculation

#### useMSRCalculation
Similar structure for MSR calculations.

**Additional fields:**
- `propertyType: PropertyType.HDB | PropertyType.EC`
- `proposedMortgage: number`

### Calculation Flow
1. User changes input → Hook updates state
2. Hook's `useMemo` recalculates results automatically
3. Results flow to ResultsPanel component
4. Single/Joint toggle → disables/enables Joint inputs
5. All calculations use existing battle-tested logic

## UI Layout Details

### Color Palette
- **Primary blue:** `#2563EB` (blue-600) - Active states, final results
- **Background:** `#FFFFFF` (white) - Main container
- **Secondary background:** `#F9FAFB` (gray-50) - Results panel
- **Borders:** `#E5E7EB` (gray-200) - Containers, inputs
- **Text primary:** `#111827` (gray-900) - Labels, values
- **Text secondary:** `#6B7280` (gray-600) - Helper text
- **Disabled:** `#F3F4F6` (gray-100) bg, `#9CA3AF` (gray-400) text

### Typography
- **Page title:** `text-3xl font-bold text-gray-900`
- **Section labels:** `text-sm font-medium text-gray-900`
- **Input labels:** `text-xs text-gray-600`
- **Result labels:** `text-sm text-gray-600`
- **Result values:** `text-lg font-semibold text-gray-900`
- **Final result:** `text-2xl font-bold text-blue-600`

### Spacing Scale
- **Container padding:** `p-8` (32px)
- **Column gap:** `gap-8` (32px)
- **Section spacing:** `space-y-6` (24px)
- **Input row spacing:** `space-y-4` (16px)
- **Input gap:** `gap-4` (16px)
- **Result row spacing:** `space-y-3` (12px)

### Responsive Breakpoints
- **Mobile:** `< 1024px` - Single column, stacked
- **Desktop:** `>= 1024px` - Two columns, horizontal

### Input Styling
- **Height:** `h-11` (44px)
- **Border:** `border-gray-300`
- **Padding:** `px-4`
- **Border radius:** `rounded-lg`
- **Prefix:** "S$" in `text-gray-500`
- **Focus:** `ring-2 ring-blue-500`
- **Disabled:** `bg-gray-50 text-gray-400 cursor-not-allowed`

## Error Handling & Validation

### Input Validation
- Number inputs only: `type="number"`
- Minimum value: `min="0"` (no negatives)
- Maximum values: Reasonable limits (e.g., max="10000000")
- Empty inputs treated as 0
- Real-time calculation updates

### Loading States
- Skeleton UI while fetching regulatory data
- All inputs disabled during load
- Message: "Loading calculator..."

### Error States
- Red alert banner if data fetch fails
- Message: "Unable to load calculator. Please try again."
- Retry button to refetch
- Inputs remain disabled

### User Feedback
- Zero income → Info message: "Please enter income to calculate"
- Invalid MSR property type → Warning message
- All validation is passive, non-intrusive
- No blocking errors - user can always interact

## Testing Strategy

### Pre-Implementation
**Capture baseline test cases:**
- Document current inputs/outputs for 10+ scenarios
- Include edge cases: zero income, high debt, single vs joint
- Save expected values for comparison

### Calculation Verification
**Ensure parity with existing implementation:**
1. Run same test inputs through old and new code
2. Compare all calculated values
3. Any discrepancies = bug in extraction
4. Calculations must match exactly

### Manual Testing Checklist
- [ ] Single/Joint toggle works correctly
- [ ] Joint inputs disabled in Single mode
- [ ] All inputs accept numbers only, reject negatives
- [ ] Calculations update in real-time as user types
- [ ] Results panel shows correct values
- [ ] Desktop horizontal layout displays correctly
- [ ] Mobile vertical stack layout displays correctly
- [ ] Loading state shows when fetching data
- [ ] Error state shows on data fetch failure
- [ ] CalculatorNav links to correct pages
- [ ] MSR page works independently
- [ ] All inputs persist during mode switches

### Visual Regression
**Compare with mogul.sg screenshots:**
- Layout matches (proportions, alignment)
- Spacing matches (compact, no excess whitespace)
- Colors match (blue active, gray inactive)
- Typography matches (sizes, weights)
- Toggle button matches (pill shape, transitions)

### Browser Testing
- Chrome, Firefox, Safari (latest desktop versions)
- Mobile Safari (iOS), Chrome (Android)
- Test responsive breakpoints: 320px, 768px, 1024px, 1440px

### Performance
- Page loads within 500ms
- Calculations update within 100ms
- No console errors or warnings
- No memory leaks on repeated use

## Acceptance Criteria

✅ **Functionality**
- All existing calculations produce identical results
- Single/Joint toggle behaves as specified
- Joint inputs properly disabled in Single mode
- Real-time calculation updates work

✅ **Design**
- Layout matches mogul.sg reference images
- Color palette matches specification
- Typography matches specification
- Spacing matches specification

✅ **User Experience**
- Mobile responsive layout works correctly
- Loading states display properly
- Error states handle gracefully
- Inputs are intuitive and clear

✅ **Code Quality**
- Calculation logic extracted to reusable hooks
- Components are reusable and well-tested
- No console errors or warnings
- TypeScript types are complete

✅ **Pages**
- TDSR page at `/resources/calculators/tdsr` works
- New MSR page at `/resources/calculators/msr` works
- CalculatorNav includes MSR button
- Navigation between calculators works

## Implementation Notes

### Migration Strategy
1. **Phase 1:** Extract calculation hooks
   - Create `useTDSRCalculation` and `useMSRCalculation`
   - Test hooks produce same results as current code
   - No UI changes yet

2. **Phase 2:** Build new UI components
   - Create `CalculatorContainer`, `PillToggle`, `InputRow`, `ResultsPanel`
   - Build components in isolation
   - Test responsive behavior

3. **Phase 3:** Rebuild TDSR page
   - Replace current TDSR tab with new mogul.sg layout
   - Use calculation hooks
   - Test thoroughly

4. **Phase 4:** Create MSR page
   - Build new `/resources/calculators/msr` page
   - Reuse components from TDSR
   - Test MSR calculations

5. **Phase 5:** Update CalculatorNav
   - Add MSR button to navigation
   - Update existing pages to link correctly

6. **Phase 6:** Cleanup
   - Remove old tabbed implementation
   - Update documentation
   - Final testing

### Risk Mitigation
- **Calculation errors:** Verify with baseline test cases before deployment
- **Layout issues:** Test on multiple browsers and devices early
- **State bugs:** Thorough testing of Single/Joint mode switching
- **Breaking changes:** Keep old implementation until new one is fully tested

### Future Enhancements
- Add URL params for sharing calculator state
- Add "Save calculation" feature
- Add print/export functionality
- Add comparison view (multiple scenarios side-by-side)

## References

- Mogul.sg screenshots: `/Problems to fix/image-9.png`, `/Problems to fix/image-10.png`
- Current implementation: `/app/resources/calculators/tdsr/page.tsx`
- Calculation functions: `/lib/calculations/borrowing.ts`
- Regulatory data hook: `/hooks/useRegulatoryRates.ts`
