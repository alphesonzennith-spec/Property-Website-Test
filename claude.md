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
