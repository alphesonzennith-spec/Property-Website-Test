# Space Realty Backend & Architectural Updates

## Knowledge & Regulation Learning Module
- **`/app/api/ai/explain-regulation/route.ts`**: A newly created API edge function designed to accept a POST request containing a learning module's raw text content and output an AI-simplified explanation of the real estate regulations, streamed back to the client. This handles the 'Explain Like I'm 5' feature in the dynamic learning pages (`/app/learn/[category]/[module-slug]/page.tsx`). Function uses a `ReadableStream` to simulate latency and chunked responses.

## Calculators Hub
- **`/app/calculators/page.tsx`**: Centralizes access to various financial planning tools (M-Value, Stamp Duty, MSR, TDSR, etc.). 

## Components Updated
- **`/components/layout/Navbar/NavMenu.tsx`**: Updated to replace the generic 'RESOURCES' link with a robust Dropdown Menu component. Refactored to ensure independent dropdown triggers for Residential, Commercial, and Resources, and reordered to place Resources after the News link.
- **`/components/learning/*`**: Created interactive client chunks `ModuleContent.tsx`, `ScenarioSimulator.tsx`, and `CommunityQA.tsx`.
- **`/components/home/HeroSearch.tsx`**: Implemented a dual-category selector (Residential/Commercial) and a search redirection function. This function maps selected filters (District, Property Type, Price Range) into URL query parameters and routes the user to the correct sub-page (e.g., `/residential/buy`).
- **`/components/search/PropertySearchPage.tsx`**: Refactored the map view to a 50/50 vertical split. In map mode, it hides the sidebar and renders a specialized horizontal `FloatingFilterBar`.
- **`/components/search/FloatingFilterBar.tsx`**: (NEW) A compact, horizontal filter interface for the map view. Includes quick-select dropdowns and a "More Filters" toggle that opens the full sidebar in a dialog.
- **`/app/insights/AnalyticsTab.tsx`**: Restructured with a KPI summary ribbon, categorized sections (Market Trends, Regional Analysis, etc.), and enhanced visual identification via colored section borders and info tooltips.

## Bug Fixes & Lessons Learned

### Next.js Routing Conflict (Parallel Pages)
- **Issue**: Encountered a "parallel pages" error when using Route Groups `(learn)` and `(calculators)` with `page.tsx` directly inside them.
- **Cause**: Route groups are transparent in the URL structure. Putting a `page.tsx` at the top level of two different route groups caused them both to resolve to the root path (`/`), resulting in a build conflict.
- **Fix**: Replaced route groups with standard folders (`app/learn` and `app/calculators`). Standard folders ensure the path segment is included in the URL (e.g., `/learn`), avoiding root-level conflicts when multiple pages are needed.
- **Rule of Thumb**: Only use Route Groups for layout sharing or logical organization where no URL segment is desired. If the folder name should be part of the URL, use a standard folder.

### Navbar Dropdown Alignment
- **Issue**: Dropdown menus for Residential, Commercial, and Resources were all appearing in a fixed, shared position instead of under their respective buttons.
- **Cause**: The `NavigationMenu` component used a global `NavigationMenuViewport` which centers all dropdowns relative to the entire menu bar by default.
- **Fix**: Disabled the global viewport by setting `viewport={false}` on the `NavigationMenu`. Then, applied relative positioning and horizontal centering (`left-1/2 -translate-x-1/2`) to each `NavigationMenuContent`. This ensures each dropdown is decoupled and vertically aligned with the center of its parent button.

### Navbar Verification UI Refactor
- **Change**: Removed the static "Verified" badge and replaced it with a green ring around the user profile trigger and a dynamic "Verified" badge that appears next to the profile when the menu is open.
- **State Management**: Added `isUserMenuOpen` state using `useState` in `NavActions.tsx` and linked it to the `DropdownMenu`'s `onOpenChange` prop.
- **Logic**: The green border (`ring-2 ring-emerald-500`) is conditionally applied to the trigger based on the user's `isSingpassVerified` status. The "Verified" badge is conditionally rendered based on both `isSingpassVerified` and `isUserMenuOpen`.
- **Absolute Positioning Fix**: To prevent the navbar from shifting when the badge appears, the parent container was set to `relative` and the badge itself was set to `absolute left-full`. This allows the badge to "pop up" to the right of the profile button without affecting the position of neighboring elements like the Dashboard button or Notification bell.
- **Reasoning**: This provides a cleaner primary navigation while maintaining high visibility for trusted users upon interaction, without jarring layout shifts.

## Calculator Bug Fixes & Theme Alignment
- **`/hooks/calculators/useTDSRCalculation.ts`**: Fixed `monthlyMortgageLimit` — was reading `maxLoanAmount.monthlyRepayment` (non-existent field). Corrected to `Math.max(0, effectiveIncome × tdsrLimit − totalDebts)`.
- **`/hooks/calculators/useMSRCalculation.ts`**: Same fix — `monthlyMortgageLimit` now derived as `Math.round(totalIncome × msr.limit)`.
- **`/components/calculators/ResultsPanel.tsx`**: Updated `highlight` text color from `blue-600` to `emerald-600` (affects both TDSR and MSR results panels).
- **`/app/resources/calculators/tdsr/page.tsx`**: Updated breadcrumb from `blue-600` to `emerald-600`.
- **`/app/resources/calculators/msr/page.tsx`**: Updated breadcrumb and input focus rings from `blue-*` to `emerald-*`.

## Stamp Duty Calculator
- **`/app/resources/calculators/stamp-duty/page.tsx`**: Full calculator UI. Collects transaction type (Buy/Sell), purchase status (Single/Joint), residency, property type, properties owned, price, and original purchase date (for SSD). All results update live via `useMemo`. Includes BSD tier breakdown table, ABSD amount, SSD amount, Grand Total panel, What-if Comparison (SC/PR/Foreigner), Share URL, and Ask AI action buttons. Rates footnote is sourced from `regulatoryConfig`, not hardcoded. Styles updated to emerald green to match website theme.
- **`/hooks/calculators/useStampDutyCalculation.ts`**: (NEW) Custom hook encapsulating all stamp duty state and calculations. Fetches `stampDuty` section via `trpc.calculators.getRatesForSection`. Derives `holdingPeriodMonths` from original purchase date for SSD. Handles joint-purchase worst-case residency logic for ABSD. Exports `bsdResult`, `absdResult`, `ssdResult`, `totalStampDuty`, and `whatIfResults` (SC/PR/Foreigner comparison).
- **`/lib/calculations/stampDuty.ts`**: (Existing, unchanged) Core BSD/ABSD/SSD calculation logic.
- **`/lib/mock/regulatoryConfig.ts`**: (Existing) Source of truth for regulatory rates (BSD tiers, ABSD rates, SSD tiers).


## CPF Usage Optimizer
- **`/app/resources/calculators/cpf-optimizer/page.tsx`**: (NEW) CPF Usage Optimizer page. Three scenario cards (Max CPF / Full Cash / Optimized Split) showing monthly cash outflow, total interest paid, projected CPF OA at retirement, and net wealth. Recharts `LineChart` projects CPF OA balance year-by-year to retirement, with `ReferenceLine` for Today and Retirement. Dynamic recommendation box. Disclaimer reads OA/SA rates from fetched `cpfRates` — zero hardcoded rates.
- **`/lib/calculations/cpf.ts`**: (MODIFIED) Full rewrite. `calculateOptimalCPFSplit(input, rates)` returns `{ scenarioA, scenarioB, scenarioC, recommendedScenario, interestSavedVsMaxCPF, cpfReducedVsMinCPF }`. Each scenario computes cash outflow, total interest, CPF OA projection with compound growth + installment deductions, and `balanceHistory[]` for chart. Legacy exports retained.
- **`/hooks/useRegulatoryRates.ts`**: (MODIFIED) Added `useCPFRates()` hook. Updated `useRegulatorySection` type to include `cpfRates`.
- **`/lib/mock/regulatoryConfig.ts`**: (MODIFIED) Added `CPFRatesSchema` and `cpfRates: { oaInterestRate: 0.025, saInterestRate: 0.04, effectiveDate: '2024-01-01', sourceUrl: 'https://www.cpf.gov.sg' }`. Added `CPFRates` type export.
- **`/lib/trpc/routers/calculators.ts`**: (MODIFIED) Extended `getRatesForSection` enum to include `'cpfRates'`.
- **`/components/calculators/CalculatorNav.tsx`**: (MODIFIED) Added `cpf-optimizer` tab with `Coins` icon.
- **`/app/resources/calculators/page.tsx`**: (MODIFIED) Added CPF Usage Optimizer hub card (teal colour scheme).

## Mortgage Calculator
- **`/app/resources/calculators/mortgage/page.tsx`**: (NEW) Full mortgage calculator UI. Inputs: Property Value, Loan Amount (toggle between % of value and fixed SGD — switching recalculates the other field), Loan Tenure slider (5–30 yrs, age-capped via `max(30, 65 − age)`), Interest Rate (component-level constant `DEFAULT_INTEREST_RATE = 3.25` with a comment to update periodically — NOT in regulatory config as rates are market data), and a Month/Year start date picker. Outputs: Monthly Repayment, Total Loan, Total Interest, Total Payment, Interest %. Includes a Recharts `AreaChart` (Remaining Principal vs Cumulative Interest over full tenure), a paginated amortization table (24 rows/page with Jump-to-Year selector), and a Rate Sensitivity panel showing Base Rate ±0.5% scenarios.
- **`/hooks/calculators/useMortgageCalculation.ts`**: (NEW) Custom hook managing all mortgage state and derived computations. Handles bidirectional sync between `loanPercentage` and `loanFixed` when `propertyValue` or input mode changes. Exports: `summary`, `schedule`, `chartData` (yearly buckets for Recharts), and `rateComparison` (three cards at base −0.5%, base, and base +0.5%).
- **`/lib/calculations/mortgage.ts`**: (MODIFIED) Added three new standalone exports: `calculateMonthlyRepayment(principal, annualRate, tenureYears)`, `calculateAmortizationSchedule(...)` (returns entries with `cumulativeInterest`), and `calculateMortgageSummary(...)`. Existing `calculateMortgage(input)` preserved for backward compatibility.
- **`/hooks/useRegulatoryRates.ts`**: (MODIFIED) Now accepts an optional `sectionAlias` parameter (e.g. `'borrowingLimits'` → maps to `'borrowing'` section). When provided, fetches only that section via `getRatesForSection`; when omitted, fetches the full config (backward-compatible).
- **`/components/calculators/CalculatorNav.tsx`**: (MODIFIED) Added Mortgage tab with `Home` icon. Updated `active` prop type to include `'mortgage'`.

## Total Cost of Ownership (TCO) Calculator
- **`/app/resources/calculators/total-cost/page.tsx`**: (NEW) Full TCO calculator page. Inputs: Purchase Price, Property Type (HDB/Condo/Landed), Floor Area (sqft), Usage (Owner-Occupied/Investment), Holding Period (5/10/20 yr toggle), Loan Amount/Rate, Residency Status, Existing Properties, Monthly Rental (investment only). Outputs: One-time costs (BSD, ABSD, Legal, Valuation), Annual recurring (Property Tax, Maintenance, Insurance), Holding-period summary, Investment metrics (Gross/Net Yield, Breakeven Sale Price). Visualizations: `Recharts` stacked `BarChart` (year-by-year, toggle 5/10/20yr) and horizontal composition bar. All regulatory rates are dynamic from config — zero hardcoded values. Estimates labelled with ESTIMATE badge. Footnotes show `effectiveDateOverride`, `sourceUrl`, and CPF SA rate.
- **`/lib/calculations/totalCostOwnership.ts`**: (REWRITTEN) `calculateTotalCostOfOwnership(input, config: TCOConfig)` orchestrates BSD/ABSD via `calculateStampDuty`, property tax from `calculatePropertyTax` tiers, maintenance/insurance midpoint estimates, CPF SA compound opportunity cost, per-year breakdown array for chart, and investment metrics (gross/net yield, breakeven).
- **`/lib/mock/regulatoryConfig.ts`**: (MODIFIED) Added `MaintenanceFeesSchema` + mock data (HDB monthly range $20–$90, condo per-sqft $0.30–$0.60, landed $200/mo). Added `annualValueProxyPct: 0.035`, `effectiveDateOverride`, `sourceUrl` to `propertyTax`. Added `legalFeesEstimateRange` ($2,500–$4,000) and `insuranceAnnualRange` ($500–$1,000) to `misc`. Added `MaintenanceFees` type export.
- **`/types/calculator.ts`**: (MODIFIED) Rewrote `TotalCostOwnershipInput` (added `propertyType`, `floorAreaSqft`, `usage`, `holdingPeriodYears: 5|10|20`, `monthlyRentalIncome?`) and `TotalCostOwnershipOutput` (BSD, ABSD, totals breakdown, `yearlyBreakdown[]` for chart, opportunity cost, investment metrics).
- **`/lib/trpc/routers/calculators.ts`**: (MODIFIED) Added `'maintenanceFees'` to `getRatesForSection` enum.
- **`/components/calculators/CalculatorNav.tsx`**: (MODIFIED) Added `'total-cost'` to `active` type union and "Total Cost" nav button with `ReceiptText` icon.
- **`/app/resources/calculators/page.tsx`**: (MODIFIED) Added Total Cost of Ownership hub card (`ReceiptText` icon, indigo scheme).

## Affordability Calculator
- **`/app/resources/calculators/affordability/page.tsx`**: (REWRITTEN) Full Affordability Planner — the most complex calculator. Inputs grouped into three collapsible sections: **Personal Situation** (Single/Joint toggle, Residency dropdown, Age input, Properties owned pill-toggle), **Financial Position** (Fixed + Variable income for main and joint applicant when joint mode active, CPF OA Balance, Cash on Hand, and four separate monthly debt obligation fields), **Property Variables** (HDB/EC/Condo/Landed pill toggle with dynamic MSR/LTV footnote from config, tenure select with age-cap warning, editable interest rate). Outputs: **Max Property Price** hero card (gradient emerald), **Binding Constraint Banner** (TDSR / MSR / LTV / Cash), **Constraint Analysis panel** with four traffic-light rows (CheckCircle2 / AlertTriangle / XCircle icons, PASS/FAIL/N-A badges — all limits sourced from fetched rates, never hardcoded), **Payment Breakdown table** (OTP cash, Exercise Option CPF/cash, Loan, BSD, ABSD, Total Cash Needed, Total CPF Used), **Budget Composition** stacked horizontal bar chart (Cash/CPF/Loan/Stamp Duties proportions, legend with amounts). **Singpass Autofill**: uses `useAuth()` — detects `isSingpassVerified`, maps `residentialStatus` to `ResidencyStatus` enum, counts `ownsPrivateProperty` + `hdbFlatType`, derives age from `dateOfBirth`, shows "Auto-filled from Singpass profile" badge. **AI property recommendations**: `trpc.properties.list.useQuery` enabled when `maxAffordablePrice > 0`, renders up to 4 property mini-cards. **Explain My Results** button links to `/resources/ai-chat` with pre-filled prompt containing `maxAffordablePrice` and `bindingConstraint`.
- **`/hooks/calculators/useAffordabilityCalculation.ts`**: (NEW) Custom hook managing all Affordability Calculator state. Fetches `borrowingLimits` and `stampDuty` sections via `useRegulatoryRates`. Computes results via `calculateAffordability` inside a `useMemo`. Exports all state setters, computed results, and config-derived labels (`tdsrLimitPct`, `msrLimitPct`, `haircutPct`) so the page never contains hardcoded regulatory numbers. Age-caps the loan tenure to `max(5, 65 - age)`.
- **`/lib/calculations/affordability.ts`**: (REWRITTEN) Three exported functions: `deriveMaxPropertyPrice(maxLoan, ltvConfig, propertyType, outstandingLoans, tenureYears)` — finds the most permissive matching LTV rule and returns `{ maxPrice, ltv, minCashDownPct, applicableRule }`; `calculateDownpaymentSources(price, ltvPct, minCashDownPct, cpfOA, cashOnHand, bsd, absd)` — returns full `DownpaymentBreakdown` (OTP, exercise option, CPF vs cash split); `calculateAffordability(input, config)` — 13-step orchestrator: effective income with haircut, total existing debts, TDSR/MSR max monthly mortgage, back-calculated max loan, LTV → max price, stamp duty (BSD + ABSD), downpayment source split, monthly repayment, TDSR compliance check, per-constraint `ConstraintCheck` objects with traffic-light flags, binding constraint determination, and chart proportion data. Zero hardcoded regulatory numbers — all come from `config`.
- **`/types/calculator.ts`**: (MODIFIED) Expanded `AffordabilityInput` with per-debt fields (`creditCardMinimum`, `carLoan`, `otherHomeLoans`, `otherLoans`), `variableMonthlyIncome`, `jointFixedIncome`, `jointVariableIncome`, `buyerAge`, `applicantMode`, and renamed `cashSavings` → `cashOnHand`. Added three new interfaces: `ConstraintCheck` (per-regulatory-limit result with `isBinding` flag), `DownpaymentBreakdown` (OTP, exercise, loan, BSD, ABSD, cash/CPF totals), `AffordabilityChartData` (proportional amounts for the composition bar). Rewrote `AffordabilityOutput` to return `bindingConstraint`, `constraints`, `downpayment`, `chart`, and `ltvApplied`.
- **`/hooks/useRegulatoryRates.ts`**: (MODIFIED) Extended `SectionAlias` type and `SECTION_ALIAS_MAP` with `'ltv'` and `'hdbEligibility'` aliases (both map to `'borrowing'` section), enabling `useRegulatoryRates('ltv')` and `useRegulatoryRates('hdbEligibility')` as specified in the calculator spec.

## Calculator Hub and Navigation Polish
- **`/app/resources/calculators/page.tsx`**: (MODIFIED) Renamed "M-Value Calculator" to "Property Market Value Calculator" and updated `href` to `/property-value`. Removed the "Progressive Payment" card.
- **`/components/calculators/CalculatorNav.tsx`**: (MODIFIED) Refactored the flex layout to use `w-full` and `flex-1` for buttons, ensuring they span the entire row and align perfectly with the content container below.


### Dashboard Tab Cleanup
- **Change**: Removed the "Interactive Grid" tab from `/app/insights`.
- **Reasoning**: The user preferred a more structured, non-editable data view for the primary analysis tab. The "Map Interface" tab was retained as the geospatial counterpart.

### Lessons Learned: Tool usage & State
- **Artifact Metadata**: When creating artifacts (e.g., `task.md`), the `ArtifactMetadata` field is REQUIRED if `IsArtifact` is true. Omitting it causes an immediate tool error.
- **Zustand Pathing**: Always verify the store path (e.g., `@/lib/store` vs `@/lib/store/useSearchStore`) when importing.
- **Search Redirection**: Using specialized search URLs (e.g., `/residential/buy`) improves SEO and user intent tracking.
- **Hydration & Randomness**: `Math.random()` in components causes hydration mismatches between SSR and CSR. Use `isMounted` checks to defer random mock data generation to the client.
- **React Style Naming**: React strictly enforces camelCase for the `style` prop (e.g., `backgroundColor`). Browser normalization to snake-case in the DOM can lead to confusing "mismatch" warnings if colors or values are unstable.
- **URL Syncing**: When resetting filters, explicitly clear the URL query string using `router.replace` or `window.location.pathname` to ensure the address bar reflects the empty state.
- **Search Redirection**: When carrying over multiple filters from a hero component, use `URLSearchParams` to build the query string cleanly. Mapping specific price range labels (e.g., "Under 500k") to precise `priceMin/priceMax` numeric filters on the results page ensures consistent data fetching.
- **Map View Layout (Refinement)**: Updated split ratio to 40% results / 60% map to give more prominence to geospatial data. Used `w-[40%]` and `w-[60%]` to achieve exact proportions.
- **Grid Layout Switch**: Used `compact` prop in `ResultsArea` to detect map view and switch to a 2-column grid (`md:grid-cols-2`), allowing for "pairs" of properties in the narrower sidebar.
- **Floating Filter Expansion**: Added Tenure, Furnishing, and Verified Only filters to the quick-access bar. Wrapped the bar in a centered container (`mx-auto`) to maintain visual balance within the column.
