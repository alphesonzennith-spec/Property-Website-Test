# Space Realty - Development Notes

## Placeholders for Future Integration

This document tracks features that have placeholder implementations and will need real integration when built.

### AI Natural Language Search Parser

**Location:** `lib/trpc/routers/properties.ts` - `parseNaturalLanguageQuery` procedure

**Current Status:** Mock implementation using simple keyword matching

**What needs integration:**
- Replace mock keyword matching with actual AI/NLP service
- Suggested services: OpenAI GPT-4, Anthropic Claude, or custom NLP model
- Should parse complex queries like "3 bedroom condo near good schools under 2M with parking"
- Extract entities: bedrooms, property type, amenities, price range, location
- Handle Singapore-specific terms (HDB, EC, districts, MRT lines, towns)

**Integration steps:**
1. Set up AI service API credentials
2. Create prompt template for property search query parsing
3. Map AI response to `PropertyFilters` schema
4. Update `extractedTags` to show all understood entities
5. Add error handling for AI service failures

**Files to modify:**
- `lib/trpc/routers/properties.ts` (replace mock logic)
- Add new file: `lib/services/aiSearchParser.ts`

---

### AI Chat Widget

**Location:** Not yet implemented (placeholder for future)

**What it will do:**
- Floating chat widget on search pages
- Help users refine search queries conversationally
- Answer property questions in real-time
- Suggest properties based on conversation

**Integration steps:**
1. Create `components/search/AIChatWidget.tsx`
2. Add tRPC procedure `properties.chatWithAI`
3. Integrate with same AI service as search parser
4. Add to `PropertySearchPage` component

**Design notes:**
- Position: Fixed bottom-right corner
- Expandable/collapsible
- Maintain conversation history in session
- Link to specific properties from chat

---

### Verification Badges (Advanced)

**Location:** `components/properties/PropertyCard.tsx` shows basic verification levels

**Current limitations:**
- Only shows property verification level (Unverified, Owner Verified, Docs Verified, Fully Verified)
- Does not show owner's Singpass verification badge on card
- Does not show agent's CEA license badge

**What needs integration:**
1. Add badge icons to PropertyCard when owner is Singpass verified
2. Add CEA badge for agent listings
3. Create dedicated badge component: `components/properties/VerificationBadges.tsx`

**Data already available:**
- Owner Singpass status: `mockUsers[].singpassVerification.verified`
- Agent CEA status: `mockAgents[].ceaNumber` exists

**Files to modify:**
- `components/properties/PropertyCard.tsx` (add badge display logic)
- Create: `components/properties/VerificationBadges.tsx`

---

### Property Comparison - Enhanced Features

**Location:** `app/compare/page.tsx`

**Current implementation:** Basic side-by-side comparison table

**Future enhancements to add:**
1. **Save comparison:** Allow users to save comparison and share via link
2. **PDF export:** Generate downloadable PDF comparison report
3. **Mortgage calculator integration:** Show payment comparison for each property
4. **Commute time comparison:** Show travel time to user's workplace from each property
5. **Investment analysis:** Show projected ROI, rental yield comparison

**Files to create:**
- `lib/services/comparisonPdf.ts` (PDF generation)
- `components/compare/MortgageComparison.tsx`
- `components/compare/CommuteComparison.tsx`
- `components/compare/InvestmentAnalysis.tsx`

---

## Common Mistakes and Corrections

### Mistake: Forgetting to limit comparison to 3 properties

**Issue:** Users could add unlimited properties to comparison, breaking the UI

**Solution:** `useSearchStore.addToComparison` returns boolean, check before adding:
```typescript
const success = addToComparison(propertyId);
if (!success) {
  alert('Maximum 3 properties');
}
```

**Where it matters:**
- `components/search/ResultsArea.tsx` (checkbox handler)
- Any future "Add to Compare" buttons

---

### Mistake: Not syncing URL params with filter state

**Issue:** Users can't share search links, browser back button doesn't work

**Solution:** Two-way sync in `PropertySearchPage`:
```typescript
// URL -> Store (on mount)
useEffect(() => {
  const urlFilters = parseSearchParams(searchParams);
  setFilters(urlFilters);
}, [searchParams]);

// Store -> URL (on filter change)
useEffect(() => {
  router.replace(filtersToQueryString(filters));
}, [filters]);
```

**Where it matters:**
- `components/search/PropertySearchPage.tsx`

---

### Mistake: Not handling ownerSingpassVerified filter correctly

**Issue:** Filter expects property to have `ownerSingpassVerified` field, but it doesn't - need to join with users table

**Solution:** In `applyFilters`:
```typescript
if (input.ownerSingpassVerified !== undefined) {
  results = results.filter((p) => {
    const owner = mockUsers.find((u) => u.id === p.ownerId);
    return owner ? owner.singpassVerification.verified === input.ownerSingpassVerified : false;
  });
}
```

**Where it matters:**
- `lib/trpc/routers/properties.ts` (applyFilters function)
- Future: When migrating to Supabase, use JOIN query

---

### Mistake: Slider value type mismatch

**Issue:** Shadcn Slider expects `number[]` array, easy to pass single number

**Correct usage:**
```typescript
<Slider
  value={[filters.qualityScoreMin ?? 0]}  // ✅ Array
  onValueChange={(val) => setFilter('qualityScoreMin', val[0])}  // ✅ Extract first element
/>
```

**Incorrect:**
```typescript
<Slider
  value={filters.qualityScoreMin ?? 0}  // ❌ Not an array
  onValueChange={(val) => setFilter('qualityScoreMin', val)}  // ❌ Val is array
/>
```

**Where it matters:**
- `components/search/FilterSidebar.tsx`
- Any component using Slider for range inputs

---

### Mistake: Using empty string values in Select components

**Issue:** Shadcn Select component throws error: "A <Select.Item /> must have a value prop that is not an empty string"

**Why it happens:** The Select component reserves empty string for clearing the selection internally, so you can't use it as a value.

**Incorrect:**
```typescript
<Select value={filters.propertyType ?? ''}>
  <SelectItem value="">Any</SelectItem>  // ❌ Empty string not allowed
  <SelectItem value="HDB">HDB</SelectItem>
</Select>
```

**Correct solution:**
```typescript
<Select
  value={filters.propertyType ?? undefined}
  onValueChange={(val) => setFilter('propertyType', val === 'clear' ? undefined : val)}
>
  <SelectItem value="clear">Any</SelectItem>  // ✅ Use special value
  <SelectItem value="HDB">HDB</SelectItem>
</Select>
```

**Where it matters:**
- `components/search/FilterSidebar.tsx`
- Any component using Select with optional/clearable values
- Always use a special value like `'clear'` or `'none'` instead of empty string

**Additional notes:**
- The placeholder prop on SelectValue will show when value is undefined
- When user selects "Any", set the filter to undefined to clear it
- This also ensures proper hydration without errors

---

### Mistake: Nesting block elements inside <p> tags

**Issue:** React throws hydration error: "In HTML, <div> cannot be a descendant of <p>"

**Why it happens:** The `<p>` tag can only contain inline elements (text, spans, etc.), not block elements like `<div>`.

**Common cause:** Using components that render divs (like Skeleton) inside paragraph tags

**Incorrect:**
```typescript
<p className="text-sm text-gray-600">
  {isLoading ? (
    <Skeleton className="h-4 w-32" />  // ❌ Skeleton renders a <div>
  ) : (
    `${data?.total ?? 0} properties found`
  )}
</p>
```

**Correct solution:**
```typescript
<div className="text-sm text-gray-600">  // ✅ Use div instead of p
  {isLoading ? (
    <Skeleton className="h-4 w-32" />
  ) : (
    `${data?.total ?? 0} properties found`
  )}
</div>
```

**Where it matters:**
- `components/search/ResultsArea.tsx`
- Any component mixing text content with shadcn components (Skeleton, Alert, Card, etc.)
- Use `<div>` with text styling classes instead of `<p>` when children might include block elements

---

### Mistake: Using text badges instead of icon badges on cluttered cards

**Issue:** Property cards with too many text badges become cluttered and hard to scan

**Why it's wrong:** Text badges take up too much space, especially when there are 3+ badges on one card

**Correct solution:**
Use icon-only badges with tooltips:
```typescript
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <div className="w-7 h-7 rounded-full flex items-center justify-center bg-emerald-500">
        <Icon className="w-4 h-4 text-white" />
      </div>
    </TooltipTrigger>
    <TooltipContent><p>Description</p></TooltipContent>
  </Tooltip>
</TooltipProvider>
```

**Where it matters:**
- Property cards with multiple badges
- Any dense UI where space is limited

---

### Mistake: Not providing independent scrolling for filter sidebars

**Issue:** Filter sidebar scrolls with the page, making it hard to access bottom filters without scrolling entire page

**Why it's wrong:** Poor UX - users can't quickly scan all filters, especially on pages with many results

**Correct solution:**
```typescript
<div className="h-full flex flex-col">
  <div className="sticky-header">...</div>
  <div className="flex-1 overflow-y-auto">
    {/* Filters with their own scrollbar */}
  </div>
</div>
```

**Where it matters:**
- Filter sidebars
- Any sidebar with many options
- Navigation menus with long lists

---

### Mistake: Not handling zero values in number input onChange handlers

**Issue:** Using `Number(e.target.value) || undefined` converts 0 to `undefined`

**Why it's wrong:** Users can't filter for properties with 0 bedrooms/bathrooms if that's a valid use case

**Incorrect:**
```typescript
onChange={(e) => setFilter('fieldName', Number(e.target.value) || undefined)}
```

**Correct solution:**
```typescript
onChange={(e) => setFilter('fieldName', e.target.value === '' ? undefined : Number(e.target.value))}
```

**Where it matters:**
- Any number input that accepts 0 as a valid value
- Quantity fields, count fields, score fields

---

## Architecture Decisions

### Why Zustand instead of React Context?

**Reasons:**
1. Simpler API, less boilerplate
2. No provider wrapping needed
3. Better performance (selective re-renders)
4. Easier to persist to localStorage in future
5. DevTools support

**Trade-offs:**
- Another dependency (but very small: ~1KB)
- Team needs to learn Zustand API (but it's simple)

---

### Why client-side filtering instead of server-side?

**Current approach:** Send all filters to tRPC, filter in `applyFilters` function

**Reasons:**
- Simpler to implement with mock data
- Matches future Supabase query pattern
- Filters are complex (need to join users table for Singpass)
- Pagination handled server-side

**Future migration:**
- Replace `applyFilters` logic with Supabase query builder
- Use `ilike` for keyword search, `eq` for exact matches
- Use joins for owner verification filter

---

### Why separate AISearchBar from FilterSidebar?

**Reasons:**
1. Different UX patterns (natural language vs structured filters)
2. AI search should be prominent above results
3. Filters are secondary, can be sidebar/collapsed
4. Allows showing "AI understood" tags separately
5. Future: AI chat widget can update same search bar

**Layout:**
```
+-------------------------+
| AI Search Bar           |
+-------------------------+
| Tags: [3 Bed] [Bedok]   |
+-------------------------+
|          |              |
| Filters  |   Results    |
|          |              |
+----------+--------------+
```

---

## Testing Checklist

### Manual Tests

**AI Search:**
- [ ] Type "3 bedroom condo in Bedok under 2M"
- [ ] Verify tags appear: [3 Bed], [Condo], [Bedok (D16)], [< $2.0M]
- [ ] Verify results list updates
- [ ] Remove a tag, verify results update
- [ ] Type invalid query, verify error handling

**Filters:**
- [ ] Set price range, verify results update
- [ ] Toggle "Owner Direct" source, verify OWNER DIRECT badges
- [ ] Set quality score to 80, verify all results have green dot
- [ ] Toggle Singpass verified, verify filtering works
- [ ] Reset filters, verify all filters clear

**Comparison:**
- [ ] Check "Compare" on 3 properties
- [ ] Verify floating bar appears with thumbnails
- [ ] Try to add 4th property, verify alert "Maximum 3"
- [ ] Remove one property from bar
- [ ] Click "Compare", verify navigation to /compare
- [ ] Verify comparison table shows all details correctly

**URL Sync:**
- [ ] Set filters, copy URL
- [ ] Open URL in new tab, verify filters restored
- [ ] Use browser back button, verify filters update

**Pagination:**
- [ ] Verify "Page 1 of X" displays correctly
- [ ] Click Next, verify page 2 loads
- [ ] Verify Previous button disabled on page 1

**Sorting:**
- [ ] Sort by "Quality Score", verify descending order
- [ ] Sort by "Price: Low to High", verify ascending order
- [ ] Sort by "Newest", verify by createdAt date

---

## Performance Notes

### Current bottlenecks

1. **ComparisonFloatingBar fetches all properties:** Uses `limit: 100` to find properties by ID
   - **Future fix:** Add tRPC procedure `getByIds(ids: string[])`

2. **URL sync runs on every filter change:** Can cause many router.replace() calls
   - **Future fix:** Debounce URL sync by 500ms

3. **Comparison page makes N separate queries:** One per property
   - **Future fix:** Use `getByIds` batch query

---

## Future Enhancements

### Search UX
- [ ] Save search criteria to user profile
- [ ] Email alerts for new matching properties
- [ ] Recently viewed properties section
- [ ] "Properties near this one" on property detail page

### Filters
- [ ] Map view with boundary filtering
- [ ] Commute time filter (enter workplace address)
- [ ] School catchment area filter
- [ ] Custom amenity distance filters

### AI Features
- [ ] Voice search input
- [ ] Image-based search ("Find properties that look like this")
- [ ] Sentiment analysis of property descriptions

### Social Features
- [ ] Share search results with family/friends
- [ ] Collaborative comparison (multiple users can add properties)
- [ ] Agent recommendations based on search criteria

---

## UI/UX Patterns

### Property Card Icon Badge Pattern

**Location:** `components/properties/PropertyCard.tsx`

**Pattern:** Use icon-only badges with tooltips instead of text badges to reduce clutter

**Implementation:**
```typescript
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <div className="w-7 h-7 rounded-full flex items-center justify-center bg-emerald-500">
        <Icon className="w-4 h-4 text-white" />
      </div>
    </TooltipTrigger>
    <TooltipContent>
      <p>Badge Description</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

**Key points:**
- Badge size: 28px × 28px circles (w-7 h-7)
- Icon size: 16px × 16px (w-4 h-4)
- Use single TooltipProvider wrapping all tooltips (not one per tooltip)
- Tooltip shows full description on hover

---

### Filter Sidebar Accordion Pattern

**Location:** `components/search/FilterSidebar.tsx`

**Pattern:** Use accordion for collapsible filter sections with independent scrolling

**Implementation:**
```typescript
<div className="h-full flex flex-col bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
  {/* Sticky Header */}
  <div className="flex items-center justify-between p-4 border-b bg-gray-50/80 backdrop-blur-sm">
    <h2 className="text-base font-bold text-gray-900">Filters</h2>
    <Button variant="ghost" size="sm" onClick={resetFilters} className="h-8 px-3 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
      Reset All
    </Button>
  </div>

  {/* Scrollable Accordion Container */}
  <div className="flex-1 overflow-y-auto">
    <Accordion type="multiple" defaultValue={['price', 'type', 'beds']} className="px-4 py-2">
      <AccordionItem value="price" className="border-b">
        <AccordionTrigger className="text-sm font-semibold py-3 hover:no-underline">
          Price Range
        </AccordionTrigger>
        <AccordionContent className="space-y-3 pb-4">
          {/* Filter inputs */}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  </div>
</div>
```

**Key points:**
- Container: `h-full flex flex-col` (fills parent height)
- Header: Sticky with `bg-gray-50/80 backdrop-blur-sm`
- Scroll wrapper: `flex-1 overflow-y-auto` (independent scrollbar)
- Default open: Most common filters
- AccordionItem: All except last have `border-b`, last has `border-none`
- Trigger: `text-sm font-semibold py-3 hover:no-underline`
- Content: `space-y-3 pb-4`

---

### Uniform Grid Heights Pattern

**Location:** `components/search/ResultsArea.tsx`, `components/properties/PropertyCard.tsx`

**Pattern:** Use flexbox to ensure all cards in a row have the same height

**Implementation:**
```typescript
// In ResultsArea (grid container)
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {data.items.map((property) => (
    <div key={property.id} className="relative flex flex-col">
      <PropertyCard property={property} className="h-full" />
    </div>
  ))}
</div>

// In PropertyCard (card structure)
<Link className="flex flex-col h-full">
  <div className="flex-shrink-0" style={{ aspectRatio: '16/9' }}>
    {/* Image */}
  </div>
  <div className="flex-grow flex flex-col justify-between">
    {/* Content */}
  </div>
</Link>
```

**Key points:**
- Grid wrapper: `flex flex-col` on wrapper div
- PropertyCard: `h-full` className passed as prop
- Card: `flex flex-col h-full` on Link
- Image: `flex-shrink-0` maintains aspect ratio
- Body: `flex-grow` fills remaining space

---

### Calculator Compact Spacing Pattern

**Location:** All calculator pages (`app/resources/calculators/*/page.tsx`)

**Pattern:** Use compact spacing for calculator pages to improve scannability

**Spacing values:**
- Main padding: `py-12` (not py-20)
- H1: `text-3xl mb-3` (not text-4xl mb-4)
- Tab list margin: `mb-6` (not mb-8)
- Section spacing: `space-y-6` (not space-y-8)
- Card stack: `space-y-4` (not space-y-6)
- Card fields: `space-y-3` (not space-y-4)
- Card titles: `text-base` (not text-lg)
- Card headers: Add `pb-3`

**Key points:**
- Consistent spacing creates rhythm
- Tighter spacing improves scannability
- Still maintains readability

---

### Vertical Comparison Layout Pattern

**Location:** `app/compare/page.tsx`

**Pattern:** Use vertical columns for property comparison instead of horizontal table

**Implementation:**
```typescript
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  {properties.map((property) => (
    <Card key={property.id} className="flex flex-col overflow-hidden">
      <div className="aspect-video relative overflow-hidden flex-shrink-0">
        {/* Image */}
      </div>
      <CardHeader className="pb-3">
        {/* Address + Price */}
      </CardHeader>
      <CardContent className="space-y-3 flex-grow overflow-y-auto">
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          {/* Property details */}
        </div>
      </CardContent>
    </Card>
  ))}
</div>
```

**Key points:**
- Grid: `grid-cols-3` for side-by-side
- Card: `flex flex-col` for vertical layout
- Image: `flex-shrink-0` maintains aspect
- Content: `overflow-y-auto` for long details
- Details: 2-column grid for compact display

---

### Calculator Mogul.sg Layout Pattern

**Location:** `/app/resources/calculators/tdsr/page.tsx`, `/app/resources/calculators/msr/page.tsx`

**Pattern:** Horizontal layout matching mogul.sg design - inputs on left, results on right

**Component Structure:**
```tsx
<CalculatorContainer>
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
    {/* Left: Inputs (65%) */}
    <div className="lg:col-span-2 space-y-6">
      <PillToggle /> {/* Single/Joint */}
      <InputRow /> {/* Income fields */}
      <InputRow /> {/* Debt fields */}
    </div>

    {/* Right: Results (35%) */}
    <div className="lg:col-span-1">
      <ResultsPanel results={[...]} />
    </div>
  </div>
</CalculatorContainer>
```

**Key Components:**
- **CalculatorContainer**: White rounded container with padding
- **PillToggle**: Pill-style toggle for Single/Joint selection
- **InputRow**: Horizontal row with label (20%) and inputs (80%)
  - Always shows both Main and Joint inputs
  - Joint inputs disabled in Single mode
- **ResultsPanel**: Gray background panel with result rows

**Layout Details:**
- Desktop (≥1024px): Horizontal 65/35 split
- Mobile (<1024px): Vertical stack (inputs top, results below)
- Spacing: `gap-8` between columns, `space-y-6` between input rows
- Colors: Blue (`blue-600`) for active states and final results
- Typography: `text-sm` for labels, `text-2xl` for highlighted results

**State Management:**
- Use custom hooks (`useTDSRCalculation`, `useMSRCalculation`)
- Hooks encapsulate all calculation logic
- Pages are thin UI layers

**Where it matters:**
- All calculator pages (TDSR, MSR, Stamp Duty, Affordability)
- Any form with results panel layout
- Responsive designs needing side-by-side on desktop, stacked on mobile

---

---

## Singpass/MyInfo Integration Patterns

### NRIC Security (CRITICAL)
- **NEVER** log or store raw NRIC values
- **ALWAYS** hash NRIC with SHA-256 immediately upon receipt
- Use `hashNRIC()` from `lib/singpass/crypto.ts`
- Mark all NRIC handling with `// CRITICAL:` comments

### Mock/Production Switching
- Use `USE_MOCK_SINGPASS=true` for local development
- Mock client returns instant fake data (no external calls)
- Production client uses real Singpass OAuth endpoints
- Switch happens in provider factory (`createSingpassProvider()`)

### OAuth Flow
- PKCE is mandatory (code_challenge/code_verifier)
- State parameter for CSRF protection (NextAuth handles)
- Scope: `openid myinfo-person`
- Token exchange requires code_verifier

### Session Management
- JWT strategy (no DB lookup per request)
- Verification data in `session.user.singpassVerification`
- Badges in `session.user.verificationBadges`
- 30-day expiration

### Route Protection
- Middleware checks `token.singpassVerification.verified`
- Protected routes: `/dashboard/list-property`, `/dashboard/offers`, `/properties/*/contact`
- Redirect to `/verify?callbackUrl=<original>` if not verified

### Comment Markers
- `// SINGPASS_SWAP:` - Mock/production switching points
- `// SUPABASE:` - Database operations (future)
- `// CRITICAL:` - Security-critical code (NRIC, tokens)
