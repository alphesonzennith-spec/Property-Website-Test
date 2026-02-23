# Property Search Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the core property search experience at `/app/(portal)/buy/page.tsx` and `/app/(portal)/rent/page.tsx` with AI-powered natural language search, advanced filters (including Singpass owner verification), property comparison (max 3), and placeholders for future features.

**Architecture:** Client-side search interface using Zustand for global state, tRPC for data fetching, URL synchronization for shareable links. AI search converts natural language to structured filters (mocked backend). Comparison stored in Zustand, comparison page fetches full details. FilterSidebar, ResultsArea, and ComparisonFloatingBar compose the main search layout.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Zustand 5, tRPC 11, shadcn/ui, Tailwind CSS, React Query 5

---

## Task 1: Update Backend - Add ownerSingpassVerified Filter

**Files:**
- Modify: `lib/trpc/routers/properties.ts:36-59`

**Step 1: Add ownerSingpassVerified to PropertyFiltersSchema**

Update `PropertyFiltersSchema` to include the new filter:

```typescript
const PropertyFiltersSchema = z.object({
  keyword:           z.string().optional(),
  listingType:       z.nativeEnum(ListingType).optional(),
  propertyType:      z.nativeEnum(PropertyType).optional(),
  district:          z.string().optional(),
  hdbTown:           z.string().optional(),
  hdbRoomType:       z.nativeEnum(HDBRoomType).optional(),
  priceMin:          z.number().optional(),
  priceMax:          z.number().optional(),
  bedroomsMin:       z.number().int().optional(),
  bedroomsMax:       z.number().int().optional(),
  bathroomsMin:      z.number().int().optional(),
  floorAreaMin:      z.number().optional(),
  floorAreaMax:      z.number().optional(),
  furnishing:        z.nativeEnum(Furnishing).optional(),
  tenure:            z.nativeEnum(Tenure).optional(),
  status:            z.nativeEnum(PropertyStatus).optional(),
  verificationLevel: z.nativeEnum(VerificationLevel).optional(),
  listingSource:     z.nativeEnum(ListingSource).optional(),
  ownerSingpassVerified: z.boolean().optional(), // NEW
  qualityScoreMin:   z.number().min(0).max(100).optional(), // NEW
  featured:          z.boolean().optional(),
  sortBy:            SortBy.default('newest'),
  page:              z.number().int().min(1).default(1),
  limit:             z.number().int().min(1).max(100).default(20),
});
```

**Step 2: Update applyFilters function to handle new filters**

Add filtering logic after line 107 (after `if (input.featured !== undefined)`):

```typescript
// Filter by owner Singpass verification status
if (input.ownerSingpassVerified !== undefined) {
  results = results.filter((p) => {
    const owner = mockUsers.find((u) => u.id === p.ownerId);
    return owner ? owner.singpassVerification.verified === input.ownerSingpassVerified : false;
  });
}

// Filter by listing quality score minimum
if (input.qualityScoreMin !== undefined) {
  results = results.filter((p) =>
    (p.listingQualityScore ?? 0) >= input.qualityScoreMin!
  );
}
```

**Step 3: Import mockUsers at the top of properties.ts**

Update imports on line 5:

```typescript
import { mockProperties, mockUsers, mockAgents } from '@/lib/mock';
```

**Step 4: Run dev server to verify no TypeScript errors**

```bash
npm run dev
```

Expected: Server starts successfully, no TypeScript errors

**Step 5: Commit**

```bash
git add lib/trpc/routers/properties.ts
git commit -m "feat(search): add ownerSingpassVerified and qualityScoreMin filters"
```

---

## Task 2: Add AI Search Parser Procedure (Mock)

**Files:**
- Modify: `lib/trpc/routers/properties.ts:268` (end of file, before closing brace)

**Step 1: Add parseNaturalLanguageQuery procedure**

Add new procedure at the end of `propertiesRouter` (before the closing `})`):

```typescript
  /** Parse natural language query into structured filters (MOCK implementation). */
  parseNaturalLanguageQuery: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ input }) => {
      // MOCK: Replace with actual AI/NLP service when ready
      // TODO: Document in claude.md - integrate with AI service for production
      await new Promise((r) => setTimeout(r, 250));

      const query = input.query.toLowerCase();
      const filters: Partial<PropertyFilters> = {};
      const extractedTags: string[] = [];

      // Extract bedroom count
      const bedroomMatch = query.match(/(\d+)\s*(?:bed|bedroom)/i);
      if (bedroomMatch) {
        filters.bedroomsMin = parseInt(bedroomMatch[1], 10);
        extractedTags.push(`${bedroomMatch[1]} Bed`);
      }

      // Extract property type
      if (query.includes('hdb')) {
        filters.propertyType = PropertyType.HDB;
        extractedTags.push('HDB');
      } else if (query.includes('condo')) {
        filters.propertyType = PropertyType.Condo;
        extractedTags.push('Condo');
      } else if (query.includes('landed')) {
        filters.propertyType = PropertyType.Landed;
        extractedTags.push('Landed');
      }

      // Extract district/town (simple keyword matching)
      if (query.includes('bedok')) {
        filters.district = 'D16';
        extractedTags.push('Bedok (D16)');
      } else if (query.includes('tampines')) {
        filters.district = 'D18';
        extractedTags.push('Tampines (D18)');
      } else if (query.includes('punggol')) {
        filters.district = 'D19';
        extractedTags.push('Punggol (D19)');
      } else if (query.includes('orchard')) {
        filters.district = 'D09';
        extractedTags.push('Orchard (D09)');
      }

      // Extract price range
      const priceMatch = query.match(/(?:under|below|<)\s*\$?(\d+(?:\.\d+)?)\s*([mk]?)/i);
      if (priceMatch) {
        let price = parseFloat(priceMatch[1]);
        if (priceMatch[2].toLowerCase() === 'm') price *= 1000000;
        if (priceMatch[2].toLowerCase() === 'k') price *= 1000;
        filters.priceMax = price;
        extractedTags.push(`< $${(price / 1000000).toFixed(1)}M`);
      }

      return {
        filters,
        extractedTags,
      };
    }),
```

**Step 2: Update PropertyFilters type export**

Verify the export is already present (it is, on line 61). No change needed.

**Step 3: Run dev server**

```bash
npm run dev
```

Expected: No errors, tRPC endpoint builds successfully

**Step 4: Commit**

```bash
git add lib/trpc/routers/properties.ts
git commit -m "feat(search): add AI natural language query parser (mocked)"
```

---

## Task 3: Create Zustand Search Store

**Files:**
- Create: `lib/store/useSearchStore.ts`

**Step 1: Create the Zustand store file**

```typescript
import { create } from 'zustand';
import type { PropertyFilters } from '@/lib/trpc/routers/properties';

interface SearchState {
  // Search filters
  filters: Partial<PropertyFilters>;

  // Comparison list (max 3 property IDs)
  comparisonList: string[];

  // AI search tags
  aiTags: string[];

  // Actions
  setFilter: (key: keyof PropertyFilters, value: any) => void;
  setFilters: (filters: Partial<PropertyFilters>) => void;
  resetFilters: () => void;

  addToComparison: (propertyId: string) => boolean;
  removeFromComparison: (propertyId: string) => void;
  clearComparison: () => void;

  setAiTags: (tags: string[]) => void;
  removeAiTag: (tag: string) => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  filters: {},
  comparisonList: [],
  aiTags: [],

  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    })),

  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),

  resetFilters: () =>
    set({ filters: {}, aiTags: [] }),

  addToComparison: (propertyId) => {
    let success = false;
    set((state) => {
      // Max 3 properties in comparison
      if (state.comparisonList.length >= 3) {
        success = false;
        return state;
      }
      // Don't add duplicates
      if (state.comparisonList.includes(propertyId)) {
        success = false;
        return state;
      }
      success = true;
      return {
        comparisonList: [...state.comparisonList, propertyId],
      };
    });
    return success;
  },

  removeFromComparison: (propertyId) =>
    set((state) => ({
      comparisonList: state.comparisonList.filter((id) => id !== propertyId),
    })),

  clearComparison: () =>
    set({ comparisonList: [] }),

  setAiTags: (tags) =>
    set({ aiTags: tags }),

  removeAiTag: (tag) =>
    set((state) => ({
      aiTags: state.aiTags.filter((t) => t !== tag),
    })),
}));
```

**Step 2: Create barrel export for stores**

Create `lib/store/index.ts`:

```typescript
export * from './useSearchStore';
```

**Step 3: Verify TypeScript compilation**

```bash
npm run dev
```

Expected: No errors

**Step 4: Commit**

```bash
git add lib/store/useSearchStore.ts lib/store/index.ts
git commit -m "feat(search): add Zustand store for search state and comparison"
```

---

## Task 4: Create AISearchBar Component

**Files:**
- Create: `components/search/AISearchBar.tsx`

**Step 1: Create the AISearchBar component**

```typescript
'use client';

import React, { useState } from 'react';
import { Search, X, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/trpc/client';
import { useSearchStore } from '@/lib/store';

export function AISearchBar() {
  const [query, setQuery] = useState('');
  const { setFilters, aiTags, setAiTags, removeAiTag } = useSearchStore();

  const parseQuery = trpc.properties.parseNaturalLanguageQuery.useMutation({
    onSuccess: (data) => {
      setFilters(data.filters);
      setAiTags(data.extractedTags);
    },
  });

  const handleSearch = () => {
    if (query.trim()) {
      parseQuery.mutate({ query: query.trim() });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleRemoveTag = (tag: string) => {
    removeAiTag(tag);
    // TODO: Update filters when tag removed (future enhancement)
  };

  return (
    <div className="w-full space-y-3">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Try: '3 bedroom condo in Bedok under 2M'"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-32 h-12 text-base"
        />
        <Button
          onClick={handleSearch}
          disabled={parseQuery.isPending || !query.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 gap-2"
          size="sm"
        >
          <Sparkles className="w-4 h-4" />
          AI Search
        </Button>
      </div>

      {/* AI Understanding Tags */}
      {aiTags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-500 font-medium">AI understood:</span>
          {aiTags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="gap-1 pl-2 pr-1 py-1"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="hover:bg-gray-300 rounded-full p-0.5 transition-colors"
                aria-label={`Remove ${tag} filter`}
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {parseQuery.isError && (
        <p className="text-xs text-red-600">
          Failed to parse query. Please try again.
        </p>
      )}
    </div>
  );
}
```

**Step 2: Run dev server**

```bash
npm run dev
```

Expected: No errors, component builds successfully

**Step 3: Commit**

```bash
git add components/search/AISearchBar.tsx
git commit -m "feat(search): add AI search bar with tag chips"
```

---

## Task 5: Create FilterSidebar Component

**Files:**
- Create: `components/search/FilterSidebar.tsx`

**Step 1: Create the FilterSidebar component**

```typescript
'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useSearchStore } from '@/lib/store';
import {
  PropertyType,
  HDBRoomType,
  Furnishing,
  Tenure,
  VerificationLevel,
  ListingSource,
} from '@/types';

export function FilterSidebar() {
  const { filters, setFilter, resetFilters } = useSearchStore();

  return (
    <div className="w-full h-full overflow-y-auto space-y-4 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between sticky top-0 bg-white z-10 pb-2">
        <h2 className="text-lg font-bold text-gray-900">Filters</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={resetFilters}
          className="text-xs"
        >
          Reset All
        </Button>
      </div>

      <Separator />

      {/* Price Range */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Price Range (SGD)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label htmlFor="priceMin" className="text-xs">Min</Label>
            <Input
              id="priceMin"
              type="number"
              placeholder="0"
              min="0"
              max="50000000"
              value={filters.priceMin ?? ''}
              onChange={(e) => setFilter('priceMin', Number(e.target.value) || undefined)}
            />
          </div>
          <div>
            <Label htmlFor="priceMax" className="text-xs">Max</Label>
            <Input
              id="priceMax"
              type="number"
              placeholder="No limit"
              min="0"
              max="50000000"
              value={filters.priceMax ?? ''}
              onChange={(e) => setFilter('priceMax', Number(e.target.value) || undefined)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Property Type */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Property Type</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={filters.propertyType ?? ''}
            onValueChange={(val) => setFilter('propertyType', val || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any</SelectItem>
              <SelectItem value={PropertyType.HDB}>HDB</SelectItem>
              <SelectItem value={PropertyType.Condo}>Condo</SelectItem>
              <SelectItem value={PropertyType.Landed}>Landed</SelectItem>
              <SelectItem value={PropertyType.EC}>Executive Condo</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Bedrooms */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Bedrooms</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label htmlFor="bedroomsMin" className="text-xs">Min</Label>
            <Input
              id="bedroomsMin"
              type="number"
              placeholder="0"
              min="0"
              max="10"
              value={filters.bedroomsMin ?? ''}
              onChange={(e) => setFilter('bedroomsMin', Number(e.target.value) || undefined)}
            />
          </div>
          <div>
            <Label htmlFor="bedroomsMax" className="text-xs">Max</Label>
            <Input
              id="bedroomsMax"
              type="number"
              placeholder="No limit"
              min="0"
              max="10"
              value={filters.bedroomsMax ?? ''}
              onChange={(e) => setFilter('bedroomsMax', Number(e.target.value) || undefined)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Bathrooms */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Bathrooms (Min)</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            type="number"
            placeholder="0"
            min="0"
            max="10"
            value={filters.bathroomsMin ?? ''}
            onChange={(e) => setFilter('bathroomsMin', Number(e.target.value) || undefined)}
          />
        </CardContent>
      </Card>

      {/* Floor Area */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Floor Area (sqft)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label htmlFor="floorAreaMin" className="text-xs">Min</Label>
            <Input
              id="floorAreaMin"
              type="number"
              placeholder="0"
              min="0"
              max="50000"
              value={filters.floorAreaMin ?? ''}
              onChange={(e) => setFilter('floorAreaMin', Number(e.target.value) || undefined)}
            />
          </div>
          <div>
            <Label htmlFor="floorAreaMax" className="text-xs">Max</Label>
            <Input
              id="floorAreaMax"
              type="number"
              placeholder="No limit"
              min="0"
              max="50000"
              value={filters.floorAreaMax ?? ''}
              onChange={(e) => setFilter('floorAreaMax', Number(e.target.value) || undefined)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Furnishing */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Furnishing</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={filters.furnishing ?? ''}
            onValueChange={(val) => setFilter('furnishing', val || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any</SelectItem>
              <SelectItem value={Furnishing.Unfurnished}>Unfurnished</SelectItem>
              <SelectItem value={Furnishing.PartialFurnished}>Partially Furnished</SelectItem>
              <SelectItem value={Furnishing.FullyFurnished}>Fully Furnished</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Tenure */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Tenure</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={filters.tenure ?? ''}
            onValueChange={(val) => setFilter('tenure', val || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any</SelectItem>
              <SelectItem value={Tenure.Freehold}>Freehold</SelectItem>
              <SelectItem value={Tenure.Leasehold99}>99-year Leasehold</SelectItem>
              <SelectItem value={Tenure.Leasehold999}>999-year Leasehold</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Separator />

      {/* Verification Level */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Verification Level</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={filters.verificationLevel ?? ''}
            onValueChange={(val) => setFilter('verificationLevel', val || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any</SelectItem>
              <SelectItem value={VerificationLevel.FullyVerified}>Fully Verified</SelectItem>
              <SelectItem value={VerificationLevel.LegalDocsVerified}>Docs Verified</SelectItem>
              <SelectItem value={VerificationLevel.OwnershipVerified}>Owner Verified</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Listing Source */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Listing Source</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={filters.listingSource ?? ''}
            onValueChange={(val) => setFilter('listingSource', val || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any</SelectItem>
              <SelectItem value={ListingSource.OwnerDirect}>Owner Direct</SelectItem>
              <SelectItem value={ListingSource.Agent}>Agent Listed</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Quality Score Slider */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">
            Listing Quality Score: {filters.qualityScoreMin ?? 0}+
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Slider
            min={0}
            max={100}
            step={5}
            value={[filters.qualityScoreMin ?? 0]}
            onValueChange={(val) => setFilter('qualityScoreMin', val[0])}
            className="mt-2"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>0</span>
            <span>50</span>
            <span>100</span>
          </div>
        </CardContent>
      </Card>

      {/* Singpass Verified Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Owner Singpass Verified</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label htmlFor="singpass-toggle" className="text-sm text-gray-600">
              Show only Singpass-verified owners
            </Label>
            <Switch
              id="singpass-toggle"
              checked={filters.ownerSingpassVerified ?? false}
              onCheckedChange={(checked) => setFilter('ownerSingpassVerified', checked || undefined)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

**Step 2: Run dev server**

```bash
npm run dev
```

Expected: No errors

**Step 3: Commit**

```bash
git add components/search/FilterSidebar.tsx
git commit -m "feat(search): add comprehensive filter sidebar with all filters"
```

---

## Task 6: Create ResultsArea Component

**Files:**
- Create: `components/search/ResultsArea.tsx`

**Step 1: Create the ResultsArea component**

```typescript
'use client';

import React, { useState } from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { PropertyCard } from '@/components/properties/PropertyCard';
import { useSearchStore } from '@/lib/store';
import { trpc } from '@/lib/trpc/client';
import { AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

interface ResultsAreaProps {
  listingType: 'Sale' | 'Rent';
}

export function ResultsArea({ listingType }: ResultsAreaProps) {
  const { filters, comparisonList, addToComparison, removeFromComparison } = useSearchStore();
  const [sortBy, setSortBy] = useState<string>('quality_score');
  const [page, setPage] = useState(1);

  // Fetch properties with filters
  const { data, isLoading, error } = trpc.properties.list.useQuery({
    ...filters,
    listingType,
    sortBy: sortBy as any,
    page,
    limit: 20,
  });

  const handleCompareToggle = (propertyId: string, checked: boolean) => {
    if (checked) {
      const success = addToComparison(propertyId);
      if (!success) {
        alert('You can only compare up to 3 properties at a time.');
      }
    } else {
      removeFromComparison(propertyId);
    }
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error loading properties</AlertTitle>
        <AlertDescription>
          Failed to load property listings. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Sort Options */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {isLoading ? (
            <Skeleton className="h-4 w-32" />
          ) : (
            `${data?.total ?? 0} properties found`
          )}
        </p>
        <div className="flex items-center gap-2">
          <label htmlFor="sort-select" className="text-sm text-gray-600">
            Sort by:
          </label>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger id="sort-select" className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="quality_score">Quality Score</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price_asc">Price: Low to High</SelectItem>
              <SelectItem value="price_desc">Price: High to Low</SelectItem>
              <SelectItem value="psf_asc">PSF: Low to High</SelectItem>
              <SelectItem value="psf_desc">PSF: High to Low</SelectItem>
              <SelectItem value="most_viewed">Most Viewed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-96 w-full rounded-xl" />
          ))}
        </div>
      ) : data && data.items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.items.map((property) => (
            <div key={property.id} className="relative">
              {/* Compare Checkbox */}
              <div className="absolute top-4 right-4 z-10">
                <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-sm flex items-center gap-2">
                  <Checkbox
                    id={`compare-${property.id}`}
                    checked={comparisonList.includes(property.id)}
                    onCheckedChange={(checked) => handleCompareToggle(property.id, checked as boolean)}
                  />
                  <label
                    htmlFor={`compare-${property.id}`}
                    className="text-xs font-medium text-gray-700 cursor-pointer"
                  >
                    Compare
                  </label>
                </div>
              </div>
              <PropertyCard property={property} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No properties found matching your criteria.</p>
          <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or search query.</p>
        </div>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {page} of {data.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
            disabled={page === data.totalPages}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
```

**Step 2: Run dev server**

```bash
npm run dev
```

Expected: No errors

**Step 3: Commit**

```bash
git add components/search/ResultsArea.tsx
git commit -m "feat(search): add results area with sorting and pagination"
```

---

## Task 7: Create ComparisonFloatingBar Component

**Files:**
- Create: `components/search/ComparisonFloatingBar.tsx`

**Step 1: Create the ComparisonFloatingBar component**

```typescript
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSearchStore } from '@/lib/store';
import { trpc } from '@/lib/trpc/client';

export function ComparisonFloatingBar() {
  const router = useRouter();
  const { comparisonList, removeFromComparison, clearComparison } = useSearchStore();

  // Fetch basic property details for thumbnails
  const propertiesQuery = trpc.properties.list.useQuery(
    { limit: 100 },
    { enabled: comparisonList.length > 0 }
  );

  const comparedProperties = comparisonList
    .map((id) => propertiesQuery.data?.items.find((p) => p.id === id))
    .filter(Boolean);

  const handleCompare = () => {
    const ids = comparisonList.join(',');
    router.push(`/compare?ids=${ids}`);
  };

  if (comparisonList.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-emerald-500 shadow-2xl z-50 animate-in slide-in-from-bottom">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Property Thumbnails */}
          <div className="flex items-center gap-3 flex-1 overflow-x-auto">
            <p className="text-sm font-semibold text-gray-700 whitespace-nowrap">
              Comparing {comparisonList.length}/3
            </p>
            {comparedProperties.map((property) => {
              if (!property) return null;
              const primaryImage = property.images.find((img) => img.isPrimary) ?? property.images[0];

              return (
                <div key={property.id} className="relative flex-shrink-0">
                  <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-gray-200">
                    {primaryImage ? (
                      <Image
                        src={primaryImage.url}
                        alt={property.address}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFromComparison(property.id)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    aria-label={`Remove ${property.address} from comparison`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={clearComparison}
            >
              Clear All
            </Button>
            <Button
              onClick={handleCompare}
              disabled={comparisonList.length < 2}
              className="gap-2"
            >
              Compare Properties
              <Badge variant="secondary" className="ml-1">
                {comparisonList.length}
              </Badge>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Run dev server**

```bash
npm run dev
```

Expected: No errors

**Step 3: Commit**

```bash
git add components/search/ComparisonFloatingBar.tsx
git commit -m "feat(search): add floating comparison bar with thumbnails"
```

---

## Task 8: Create PropertySearchPage Container Component

**Files:**
- Create: `components/search/PropertySearchPage.tsx`

**Step 1: Create the main container component**

```typescript
'use client';

import React, { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AISearchBar } from './AISearchBar';
import { FilterSidebar } from './FilterSidebar';
import { ResultsArea } from './ResultsArea';
import { ComparisonFloatingBar } from './ComparisonFloatingBar';
import { useSearchStore } from '@/lib/store';
import { ListingType } from '@/types';

interface PropertySearchPageProps {
  listingType: ListingType;
}

export function PropertySearchPage({ listingType }: PropertySearchPageProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { filters, setFilters } = useSearchStore();

  // Sync URL params to store on mount
  useEffect(() => {
    const urlFilters: any = {};

    // Parse URL search params
    if (searchParams.get('priceMin')) urlFilters.priceMin = Number(searchParams.get('priceMin'));
    if (searchParams.get('priceMax')) urlFilters.priceMax = Number(searchParams.get('priceMax'));
    if (searchParams.get('bedroomsMin')) urlFilters.bedroomsMin = Number(searchParams.get('bedroomsMin'));
    if (searchParams.get('district')) urlFilters.district = searchParams.get('district');
    if (searchParams.get('propertyType')) urlFilters.propertyType = searchParams.get('propertyType');

    if (Object.keys(urlFilters).length > 0) {
      setFilters(urlFilters);
    }
  }, [searchParams, setFilters]);

  // Sync store filters to URL (debounced would be better in production)
  useEffect(() => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, String(value));
      }
    });

    const newUrl = params.toString() ? `?${params.toString()}` : '';
    if (newUrl !== `?${searchParams.toString()}`) {
      router.replace(newUrl, { scroll: false });
    }
  }, [filters, router, searchParams]);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest mb-2">
            PROPERTY SEARCH / {listingType.toUpperCase()}
          </p>
          <h1 className="text-4xl font-extrabold text-[#1E293B] mb-4">
            {listingType === ListingType.Sale ? 'Properties for Sale' : 'Properties for Rent'}
          </h1>
          <p className="text-gray-500 mb-6">
            Find verified listings with AI-powered search and advanced filters
          </p>

          {/* AI Search Bar */}
          <AISearchBar />
        </div>

        {/* Main Layout: Sidebar + Results */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left: Filter Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-6">
              <FilterSidebar />
            </div>
          </aside>

          {/* Right: Results Area */}
          <section className="lg:col-span-3">
            <ResultsArea listingType={listingType} />
          </section>
        </div>
      </div>

      {/* Floating Comparison Bar */}
      <ComparisonFloatingBar />
    </main>
  );
}
```

**Step 2: Run dev server**

```bash
npm run dev
```

Expected: No errors

**Step 3: Commit**

```bash
git add components/search/PropertySearchPage.tsx
git commit -m "feat(search): add main search page container with URL sync"
```

---

## Task 9: Create Buy and Rent Page Routes

**Files:**
- Create: `app/(portal)/buy/page.tsx`
- Create: `app/(portal)/rent/page.tsx`

**Step 1: Create the buy page**

```typescript
import { PropertySearchPage } from '@/components/search/PropertySearchPage';
import { ListingType } from '@/types';

export const metadata = {
  title: 'Properties for Sale | Space Realty',
  description: 'Search verified property listings for sale in Singapore with AI-powered search',
};

export default function BuyPage() {
  return <PropertySearchPage listingType={ListingType.Sale} />;
}
```

**Step 2: Create the rent page**

```typescript
import { PropertySearchPage } from '@/components/search/PropertySearchPage';
import { ListingType } from '@/types';

export const metadata = {
  title: 'Properties for Rent | Space Realty',
  description: 'Search verified property listings for rent in Singapore with AI-powered search',
};

export default function RentPage() {
  return <PropertySearchPage listingType={ListingType.Rent} />;
}
```

**Step 3: Run dev server and visit pages**

```bash
npm run dev
```

Visit:
- http://localhost:3000/(portal)/buy
- http://localhost:3000/(portal)/rent

Expected: Both pages load successfully with the search interface

**Step 4: Commit**

```bash
git add app/(portal)/buy/page.tsx app/(portal)/rent/page.tsx
git commit -m "feat(search): add buy and rent search page routes"
```

---

## Task 10: Create Property Comparison Page

**Files:**
- Create: `app/compare/page.tsx`

**Step 1: Create the comparison page**

```typescript
'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { trpc } from '@/lib/trpc/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowLeft, MapPin, Bed, Bath, Ruler } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

function ComparisonContent() {
  const searchParams = useSearchParams();
  const ids = searchParams.get('ids')?.split(',') ?? [];

  // Fetch all properties for comparison
  const queries = ids.map((id) =>
    trpc.properties.getById.useQuery({ id }, { enabled: !!id })
  );

  const isLoading = queries.some((q) => q.isLoading);
  const hasError = queries.some((q) => q.isError);
  const properties = queries.map((q) => q.data).filter(Boolean);

  if (ids.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No properties selected for comparison.</p>
        <Link href="/(portal)/buy">
          <Button className="mt-4">Go to Search</Button>
        </Link>
      </div>
    );
  }

  if (hasError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error loading properties</AlertTitle>
        <AlertDescription>
          One or more properties could not be loaded. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {ids.map((id) => (
          <Skeleton key={id} className="h-96 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Property Images Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {properties.map((property) => {
          const primaryImage = property.images.find((img) => img.isPrimary) ?? property.images[0];

          return (
            <Card key={property.id}>
              <div className="aspect-video relative overflow-hidden rounded-t-xl">
                {primaryImage ? (
                  <Image
                    src={primaryImage.url}
                    alt={property.address}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200" />
                )}
              </div>
              <CardHeader>
                <CardTitle className="text-lg">{property.address}</CardTitle>
                <p className="text-2xl font-extrabold text-emerald-600">
                  ${property.price.toLocaleString()}
                </p>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {/* Comparison Table */}
      <Card>
        <CardContent className="p-0">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4 bg-gray-50 font-semibold">Feature</th>
                {properties.map((property) => (
                  <th key={property.id} className="text-left p-4 bg-gray-50">
                    Property {properties.indexOf(property) + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-4 font-medium">Price</td>
                {properties.map((p) => (
                  <td key={p.id} className="p-4">${p.price.toLocaleString()}</td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="p-4 font-medium">PSF</td>
                {properties.map((p) => (
                  <td key={p.id} className="p-4">${p.psf?.toLocaleString() ?? 'N/A'}</td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="p-4 font-medium">Property Type</td>
                {properties.map((p) => (
                  <td key={p.id} className="p-4">{p.propertyType}</td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="p-4 font-medium">Bedrooms</td>
                {properties.map((p) => (
                  <td key={p.id} className="p-4">{p.bedrooms}</td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="p-4 font-medium">Bathrooms</td>
                {properties.map((p) => (
                  <td key={p.id} className="p-4">{p.bathrooms}</td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="p-4 font-medium">Floor Area</td>
                {properties.map((p) => (
                  <td key={p.id} className="p-4">{p.floorAreaSqft.toLocaleString()} sqft</td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="p-4 font-medium">Tenure</td>
                {properties.map((p) => (
                  <td key={p.id} className="p-4">{p.tenure}</td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="p-4 font-medium">Furnishing</td>
                {properties.map((p) => (
                  <td key={p.id} className="p-4">{p.furnishing}</td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="p-4 font-medium">District</td>
                {properties.map((p) => (
                  <td key={p.id} className="p-4">{p.district}</td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="p-4 font-medium">Verification Level</td>
                {properties.map((p) => (
                  <td key={p.id} className="p-4">{p.verificationLevel}</td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="p-4 font-medium">Quality Score</td>
                {properties.map((p) => (
                  <td key={p.id} className="p-4">
                    {p.listingQualityScore ?? 'N/A'}/100
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-medium">Listing Source</td>
                {properties.map((p) => (
                  <td key={p.id} className="p-4">{p.listingSource}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ComparePage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link href="/(portal)/buy">
            <Button variant="ghost" size="sm" className="gap-2 mb-4">
              <ArrowLeft className="w-4 h-4" />
              Back to Search
            </Button>
          </Link>
          <h1 className="text-4xl font-extrabold text-[#1E293B]">
            Property Comparison
          </h1>
          <p className="text-gray-500 mt-2">
            Compare up to 3 properties side by side
          </p>
        </div>

        <Suspense fallback={<Skeleton className="h-96 w-full" />}>
          <ComparisonContent />
        </Suspense>
      </div>
    </main>
  );
}
```

**Step 2: Run dev server**

```bash
npm run dev
```

Expected: Comparison page loads at http://localhost:3000/compare?ids=prop-001,prop-002

**Step 3: Commit**

```bash
git add app/compare/page.tsx
git commit -m "feat(search): add property comparison page with side-by-side view"
```

---

## Task 11: Create claude.md Documentation File

**Files:**
- Create: `claude.md`

**Step 1: Create the documentation file**

```markdown
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
```

**Step 2: Commit**

```bash
git add claude.md
git commit -m "docs: add development notes with placeholders and common mistakes"
```

---

## Task 12: Add Barrel Exports for Components

**Files:**
- Create: `components/search/index.ts`

**Step 1: Create barrel export**

```typescript
export * from './AISearchBar';
export * from './FilterSidebar';
export * from './ResultsArea';
export * from './ComparisonFloatingBar';
export * from './PropertySearchPage';
```

**Step 2: Commit**

```bash
git add components/search/index.ts
git commit -m "refactor(search): add barrel exports for search components"
```

---

## Task 13: Manual Verification

**Step 1: Test AI Search**

Visit http://localhost:3000/(portal)/buy

1. Type: "3 bedroom condo in Bedok under 2M"
2. Click "AI Search"
3. Verify tags appear: [3 Bed], [Condo], [Bedok (D16)], [< $2.0M]
4. Verify results update to show matching properties
5. Click X on a tag, verify it disappears

**Step 2: Test Filters**

1. Open filter sidebar
2. Set "Owner Direct" listing source
3. Verify all results show "OWNER DIRECT" badge
4. Set Quality Score slider to 80
5. Verify all results have green quality dot
6. Toggle "Owner Singpass Verified" switch
7. Verify results filter (may show 0 if no mock data matches)

**Step 3: Test Comparison**

1. Check "Compare" on 3 different properties
2. Verify floating bar appears at bottom
3. Verify thumbnails show in bar
4. Try to add 4th property - should show alert
5. Click "Compare Properties" button
6. Verify navigation to /compare page
7. Verify comparison table shows all details correctly

**Step 4: Test URL Sync**

1. Set some filters (price range, bedrooms, property type)
2. Copy the URL from browser
3. Open URL in new tab
4. Verify filters are restored

**Step 5: Test Pagination and Sorting**

1. Set filters to get 20+ results
2. Verify pagination appears
3. Click Next page
4. Change sort to "Price: Low to High"
5. Verify results re-order

**Expected:** All tests pass

---

## Task 14: Final Build Verification

**Step 1: Run production build**

```bash
npm run build
```

**Expected:** Build succeeds with no TypeScript errors

**Step 2: Start production server**

```bash
npm start
```

**Expected:** Server starts, visit pages and verify they work

**Step 3: Final commit**

```bash
git add .
git commit -m "feat(search): complete property search page implementation"
```

---

## Summary

**Implemented:**
- ✅ AI natural language search (mocked keyword matching)
- ✅ Advanced filter sidebar with 12+ filter types
- ✅ Owner Singpass verification filter
- ✅ Listing quality score filter
- ✅ Property comparison (max 3)
- ✅ Floating comparison bar with thumbnails
- ✅ Comparison page with side-by-side table
- ✅ URL synchronization for shareable searches
- ✅ Sort options (7 different sorts)
- ✅ Pagination support
- ✅ Results area with PropertyCard grid
- ✅ Zustand store for global search state
- ✅ Buy and Rent page routes
- ✅ Documentation in claude.md for future integration

**Placeholders documented:**
- AI search parser (replace with real AI service)
- AI chat widget (not yet implemented)
- Advanced verification badges on cards
- Enhanced comparison features (PDF export, mortgage calc, etc.)

**Files created:** 14
**Files modified:** 1
**Total tasks:** 14
