# API Response Standardization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Standardize response shapes across all tRPC routers, add ISO date normalization, add SUPABASE comment blocks, and create Supabase helper utilities.

**Architecture:** All list procedures return `{ data, total, page, limit, totalPages }`. All getById procedures return `T` directly or throw `TRPCError NOT_FOUND`. All mutations return `{ success: boolean, data: T }`. All delete mutations return `{ success: boolean, id: string }`. A shared `supabaseHelpers.ts` provides utilities for the Supabase migration.

**Tech Stack:** tRPC v11, Zod, TypeScript, @supabase/supabase-js (type references only — no Supabase client yet), Next.js 15 App Router.

---

## AUDIT FINDINGS

### Response Shape Violations

| Procedure | Current Shape | Required Shape | Fix |
|-----------|--------------|----------------|-----|
| All 5 list procedures | `{ items, total, page, limit, totalPages }` | `{ data, total, page, limit, totalPages }` | Rename `items` → `data` in PaginatedResponse |
| `properties.getFeatured` | `Property[]` (raw array) | `{ data: Property[] }` | Wrap in object |
| `properties.getSimilar` | `Property[]` (raw array) | `{ data: Property[] }` | Wrap in object |
| `agents.getPortfolioMap` | raw array | `{ data: T[] }` | Wrap in object |
| `properties.incrementViews` | `{ viewsCount }` | `{ success, data }` | Wrap mutation result |
| `properties.parseNaturalLanguageQuery` | `{ filters, extractedTags }` | `{ success, data }` | Wrap mutation result |
| `learning.markComplete` | `{ moduleId, userId, ... }` | `{ success, data }` | Wrap mutation result |
| `properties.getComparableTransactions` | spreads PaginatedResponse (uses `items`) | uses `data` | Fixed by Task 1 change |

### Date Fields Requiring ISO Normalization

| Procedure | Date Fields |
|-----------|------------|
| `properties.list` | `Property.createdAt`, `Property.updatedAt` |
| `properties.getById` | `Property.createdAt`, `Property.updatedAt` |
| `properties.getFeatured` | `Property.createdAt`, `Property.updatedAt` |
| `properties.getSimilar` | `Property.createdAt`, `Property.updatedAt` |
| `properties.getByOwner` | `Property.createdAt`, `Property.updatedAt` |
| `users.getProfile` | `User.singpassVerification.verifiedAt` |
| `users.getFamilyGroup` | any date fields in FamilyGroup members |

### MOCK Comments Missing SUPABASE Block

All procedures in all 6 routers — every `// MOCK:` line needs a `/* SUPABASE: ... */` block added below the mock logic.

---

## Task 1 — Rename `items` → `data` in PaginatedResponse

**Files:**
- Modify: `lib/trpc/routers/paginationSchema.ts`
- Modify: `lib/trpc/routers/properties.ts` (list, getByOwner, getComparableTransactions)
- Modify: `lib/trpc/routers/agents.ts` (list)
- Modify: `lib/trpc/routers/users.ts` (getPortfolio)
- Modify: `lib/trpc/routers/learning.ts` (list)
- Modify: `lib/trpc/routers/serviceProviders.ts` (list)
- Check: all frontend components consuming `.items` from any list procedure

**Why:** The spec requires `{ data: T[], total, page, limit }`. The current `PaginatedResponse` type uses `items`. This is a type-level breaking change — update the type and all usages atomically.

**Step 1: Update PaginatedResponse type and createPaginatedResponse**

In `lib/trpc/routers/paginationSchema.ts`, change:

```typescript
// BEFORE
export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export function createPaginatedResponse<T>(
  items: T[],
  ...
): PaginatedResponse<T> {
  return {
    items,       // ← rename to data
    ...
  };
}
```

```typescript
// AFTER
export type PaginatedResponse<T> = {
  data: T[];           // ← renamed from items
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export function createPaginatedResponse<T>(
  data: T[],           // ← parameter renamed for clarity
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> {
  return {
    data,              // ← renamed from items
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
```

**Step 2: Update properties.list**

In `lib/trpc/routers/properties.ts`, update `PropertySearchResponse`:
```typescript
// BEFORE
export interface PropertySearchResponse {
  items: Property[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// AFTER
export interface PropertySearchResponse {
  data: Property[];    // ← renamed from items
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

And the list procedure body:
```typescript
// BEFORE
return {
  items: processedItems,
  total: processedItems.length,  // BUG: should use filtered total, not item count
  page: input.page,
  limit: input.limit,
  totalPages,
} satisfies PropertySearchResponse;

// AFTER
return {
  data: processedItems,
  total,                        // ← use pre-pagination total
  page: input.page,
  limit: input.limit,
  totalPages,
} satisfies PropertySearchResponse;
```

**Step 3: Update properties.getByOwner**

```typescript
// BEFORE
return createPaginatedResponse(processedItems, ownerProperties.length, ...);

// AFTER — no code change needed here; createPaginatedResponse will now return { data } instead of { items }
// The call site stays the same — the shape changes in the type definition.
```

**Step 4: Update properties.getComparableTransactions**

The `...createPaginatedResponse(...)` spread currently puts `items` into the outer object.
After the rename it will put `data` — no code change needed, just verify the TypeScript compiles.

**Step 5: Update users.getPortfolio**

```typescript
// BEFORE
return {
  owned: createPaginatedResponse(paginatedOwned, ...),  // returns { items, ... }
  bought, sold, rented, buyHistory, sellHistory, rentHistory
};

// AFTER — no code change; createPaginatedResponse return shape updates automatically
```

**Step 6: Find all frontend consumers of `.items`**

Run this search to find components that need updating:
```bash
grep -rn "\.items" space-realty/components/ space-realty/app/ --include="*.tsx" --include="*.ts"
grep -rn "\.items" space-realty/hooks/ --include="*.ts"
```

For each match that is reading from a tRPC list procedure:
```typescript
// BEFORE
const properties = data?.items ?? [];

// AFTER
const properties = data?.data ?? [];
```

**Step 7: Verify TypeScript compiles**

```bash
cd space-realty && npx tsc --noEmit
```
Expected: 0 errors.

**Step 8: Commit**
```bash
git add lib/trpc/routers/paginationSchema.ts lib/trpc/routers/properties.ts \
        lib/trpc/routers/agents.ts lib/trpc/routers/users.ts \
        lib/trpc/routers/learning.ts lib/trpc/routers/serviceProviders.ts
# + any modified component files
git commit -m "refactor(api): rename PaginatedResponse.items → data for standardization"
```

---

## Task 2 — Wrap non-paginated list returns and fix mutations

**Files:**
- Modify: `lib/trpc/routers/properties.ts`
- Modify: `lib/trpc/routers/agents.ts`
- Modify: `lib/trpc/routers/learning.ts`

### 2a: properties.getFeatured → `{ data: Property[] }`

```typescript
// BEFORE
return mockProperties
  .filter((p) => p.featured && p.status === PropertyStatus.Active)
  .slice(0, 8);

// AFTER
return withMockControl('failPropertiesList', () => {
  const data = mockProperties
    .filter((p) => p.featured && p.status === PropertyStatus.Active)
    .slice(0, 8);
  return { data: applyEdgeCases(data, 'list') };
});
```

### 2b: properties.getSimilar → `{ data: Property[] }`

```typescript
// BEFORE
return mockProperties
  .filter((p) => p.id !== input.id && p.district === input.district && ...)
  .slice(0, 4);

// AFTER
return withMockControl('failPropertyDetail', () => {
  const data = mockProperties
    .filter((p) => p.id !== input.id && p.district === input.district && ...)
    .slice(0, 4);
  return { data };
});
```

### 2c: agents.getPortfolioMap → `{ data: T[] }`

```typescript
// BEFORE
return agent.portfolioMapData;

// AFTER
return { data: agent.portfolioMapData };
```

### 2d: properties.incrementViews → `{ success: boolean, data: { viewsCount } }`

```typescript
// BEFORE
return { viewsCount: current + 1 };

// AFTER
return {
  success: true,
  data: { viewsCount: current + 1 },
};
```

### 2e: properties.parseNaturalLanguageQuery → `{ success: boolean, data: T }`

```typescript
// BEFORE
return { filters, extractedTags };

// AFTER
return {
  success: true,
  data: { filters, extractedTags },
};
```

### 2f: learning.markComplete → `{ success: boolean, data: T }`

```typescript
// BEFORE
return {
  moduleId: input.moduleId,
  userId: ctx.userId,
  alreadyCompleted,
  completedAt: new Date().toISOString(),
};

// AFTER
return {
  success: true,
  data: {
    moduleId: input.moduleId,
    userId: ctx.userId,
    alreadyCompleted,
    completedAt: new Date().toISOString(),
  },
};
```

**Step 7: Check consumers for any of these procedures**

```bash
grep -rn "incrementViews\|parseNaturalLanguageQuery\|markComplete\|getFeatured\|getSimilar\|getPortfolioMap" \
  space-realty/components/ space-realty/app/ space-realty/hooks/ --include="*.tsx" --include="*.ts"
```

For each match, update the consumer to handle the new wrapped shape:
```typescript
// incrementViews
const { success, data } = await trpc.properties.incrementViews.mutate({ id });

// getFeatured
const featured = result?.data ?? [];

// getSimilar
const similar = result?.data ?? [];
```

**Step 8: TypeScript compile check**
```bash
npx tsc --noEmit
```

**Step 9: Commit**
```bash
git commit -m "refactor(api): standardize mutation and non-paginated list response shapes"
```

---

## Task 3 — Add ISO Date Normalization Transformer

**Files:**
- Create: `lib/utils/dateTransformers.ts`
- Modify: `lib/trpc/routers/properties.ts`
- Modify: `lib/trpc/routers/users.ts`

### 3a: Create date transformer utility

Create `lib/utils/dateTransformers.ts`:

```typescript
/**
 * Date Transformers for tRPC Response Normalization
 *
 * Converts JavaScript Date objects to ISO 8601 strings to match
 * Supabase's response format. Apply to any mock procedure that
 * returns objects with Date fields before Supabase migration.
 */

/**
 * Recursively converts all Date instances in an object to ISO strings.
 * Handles nested objects, arrays, and primitive values.
 *
 * @param obj - Any value (object, array, Date, primitive)
 * @returns The same structure with Date → string conversion
 */
export function normalizeDates<T>(obj: T): NormalizedDates<T> {
  if (obj instanceof Date) {
    return obj.toISOString() as NormalizedDates<T>;
  }

  if (Array.isArray(obj)) {
    return obj.map(normalizeDates) as NormalizedDates<T>;
  }

  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([key, val]) => [key, normalizeDates(val)])
    ) as NormalizedDates<T>;
  }

  return obj as NormalizedDates<T>;
}

/**
 * Utility type: recursively replaces Date with string
 */
export type NormalizedDates<T> =
  T extends Date ? string :
  T extends Array<infer U> ? Array<NormalizedDates<U>> :
  T extends object ? { [K in keyof T]: NormalizedDates<T[K]> } :
  T;
```

### 3b: Apply to properties.getById

In `lib/trpc/routers/properties.ts`:

```typescript
import { normalizeDates } from '@/lib/utils/dateTransformers';

// In getById:
return withMockControl('failPropertyDetail', () => {
  // ... existing logic ...
  return normalizeDates(applyEdgeCases(propertyData, 'detail'));
});
```

### 3c: Apply to properties.list

```typescript
// In list:
return withMockControl('failPropertiesList', () => {
  const filtered = applyFilters(mockProperties, input);
  const { items: rawItems, total, totalPages } = paginate(filtered, input.page, input.limit);
  const processedItems = applyEdgeCases(rawItems, 'list');

  return {
    data: processedItems.map(normalizeDates),  // ← normalize dates in each item
    total,
    page: input.page,
    limit: input.limit,
    totalPages,
  } satisfies PropertySearchResponse;
});
```

**Note:** Apply `normalizeDates` to any procedure that returns Property objects (getFeatured, getSimilar, getByOwner) and User objects (users.getProfile, users.getFamilyGroup).

### 3d: Apply to users.getProfile

```typescript
import { normalizeDates } from '@/lib/utils/dateTransformers';

getProfile: publicProcedure
  .input(z.object({ userId: z.string() }))
  .query(async ({ input }) => {
    // ... existing logic ...
    return normalizeDates(user);
  }),
```

### 3e: Apply to users.getFamilyGroup

```typescript
getFamilyGroup: publicProcedure
  .input(z.object({ familyGroupId: z.string() }))
  .query(async ({ input }) => {
    // ... existing logic ...
    return normalizeDates({ ...family, members: enrichedMembers });
  }),
```

**Step 6: TypeScript compile check**
```bash
npx tsc --noEmit
```

**Step 7: Commit**
```bash
git add lib/utils/dateTransformers.ts lib/trpc/routers/properties.ts lib/trpc/routers/users.ts
git commit -m "feat(api): add ISO date normalization transformer for Supabase compatibility"
```

---

## Task 4 — Standardize SUPABASE Comment Blocks

**Files:**
- Modify: `lib/trpc/routers/properties.ts`
- Modify: `lib/trpc/routers/agents.ts`
- Modify: `lib/trpc/routers/users.ts`
- Modify: `lib/trpc/routers/learning.ts`
- Modify: `lib/trpc/routers/serviceProviders.ts`
- Modify: `lib/trpc/routers/calculators.ts`

**Pattern to apply to every `// MOCK:` line:**

```typescript
// MOCK: [description]
const result = mockXxx.filter(...)

/* SUPABASE:
const { data: result, error, count } = await supabase
  .from('table_name')
  .select('field1, field2, relation(*)', { count: 'exact' })
  .eq('column', value)
  .order('created_at', { ascending: false })
  .range(offset, offset + limit - 1)

if (error) throw new TRPCError({
  code: 'INTERNAL_SERVER_ERROR',
  message: error.message
})
*/
```

**4a: properties.ts — list**

```typescript
// MOCK: Replace with Supabase query for full-text property search with filters
return withMockControl('failPropertiesList', () => {
  const filtered = applyFilters(mockProperties, input);
  const { items: rawItems, total, totalPages } = paginate(filtered, input.page, input.limit);
  const processedItems = applyEdgeCases(rawItems, 'list');

  /* SUPABASE:
  const { from, to } = paginationParams(input.page, input.limit);
  let query = supabase
    .from('properties')
    .select(PROPERTY_LIST_FIELDS, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (input.propertyType) query = query.eq('property_type', input.propertyType);
  if (input.district) query = query.eq('district', input.district);
  if (input.priceMin) query = query.gte('price', input.priceMin);
  if (input.priceMax) query = query.lte('price', input.priceMax);
  if (input.bedroomsMin) query = query.gte('bedrooms', input.bedroomsMin);
  if (input.keyword) query = query.ilike('address', `%${input.keyword}%`);

  const { data: result, error, count } = await query;
  handleSupabaseError(error);
  */
  ...
```

**4b: properties.ts — getById**

```typescript
// MOCK: Replace with Supabase query — single property with agent/owner join

/* SUPABASE:
const { data: result, error } = await supabase
  .from('properties')
  .select(`${PROPERTY_DETAIL_FIELDS}, agents(id, cea_number, agency_name, ratings), users!owner_id(id, singpass_verified)`)
  .eq('id', input.id)
  .single();

if (error) throw new TRPCError({ code: 'NOT_FOUND', message: `Property ${input.id} not found.` });
handleSupabaseError(error);
*/
```

**4c: properties.ts — getByOwner**

```typescript
// MOCK: Replace with Supabase query — properties filtered by owner_id

/* SUPABASE:
const { from, to } = paginationParams(input.page, input.limit);
const { data: result, error, count } = await supabase
  .from('properties')
  .select(PROPERTY_CARD_FIELDS, { count: 'exact' })
  .eq('owner_id', input.ownerId)
  .order('created_at', { ascending: false })
  .range(from, to);

handleSupabaseError(error);
*/
```

**4d: properties.ts — getFeatured**

```typescript
// MOCK: Replace with Supabase query — featured active properties

/* SUPABASE:
const { data: result, error } = await supabase
  .from('properties')
  .select(PROPERTY_CARD_FIELDS)
  .eq('featured', true)
  .eq('status', 'Active')
  .order('created_at', { ascending: false })
  .limit(8);

handleSupabaseError(error);
*/
```

**4e: properties.ts — getSimilar**

```typescript
// MOCK: Replace with Supabase query — similar properties by district, type, price

/* SUPABASE:
const { data: result, error } = await supabase
  .from('properties')
  .select(PROPERTY_CARD_FIELDS)
  .eq('district', input.district)
  .eq('property_type', input.propertyType)
  .lte('price', input.maxPrice)
  .neq('id', input.id)
  .order('price', { ascending: false })
  .limit(4);

handleSupabaseError(error);
*/
```

**4f: properties.ts — getVerificationStatus**

```typescript
// MOCK: Replace with Supabase query — verification fields only

/* SUPABASE:
const { data: result, error } = await supabase
  .from('properties')
  .select('id, verification_level, ownership_doc_url, legal_doc_urls')
  .eq('id', input.id)
  .single();

if (error) throw new TRPCError({ code: 'NOT_FOUND', message: `Property ${input.id} not found.` });
handleSupabaseError(error);
*/
```

**4g: properties.ts — incrementViews**

```typescript
// MOCK: Replace with Supabase atomic increment

/* SUPABASE:
const { data: result, error } = await supabase.rpc('increment_property_views', {
  property_id: input.id
});

handleSupabaseError(error);
// Note: Create Supabase function:
// CREATE FUNCTION increment_property_views(property_id uuid)
// RETURNS int AS $$
//   UPDATE properties SET views_count = views_count + 1 WHERE id = property_id
//   RETURNING views_count;
// $$ LANGUAGE sql;
*/
```

**4h: properties.ts — getComparableTransactions**

```typescript
// MOCK: Replace with Supabase query — transactions joined with property details

/* SUPABASE:
const { from, to } = paginationParams(input.page, input.limit);
const { data: result, error, count } = await supabase
  .from('transactions')
  .select(`${TRANSACTION_HISTORY_FIELDS}, properties!inner(address, floor_area_sqft, floor_level, unit_number, district, property_type)`, { count: 'exact' })
  .eq('properties.district', anchorDistrict)
  .order('transaction_date', { ascending: false })
  .range(from, to);

handleSupabaseError(error);
*/
```

**4i: properties.ts — getPropertyValueEstimate**

```typescript
// MOCK: Replace with Supabase aggregate query — median PSF calculation

/* SUPABASE:
const { data: result, error } = await supabase.rpc('calculate_median_psf', {
  p_district: district,
  p_property_type: propType
});

handleSupabaseError(error);
// Note: Create Supabase function for percentile_cont aggregate:
// SELECT percentile_cont(0.5) WITHIN GROUP (ORDER BY psf) as median_psf
// FROM transactions JOIN properties ON ...
// WHERE district = p_district AND property_type = p_property_type
*/
```

**4j: agents.ts — list**

```typescript
// MOCK: Replace with Supabase query — paginated agent list

/* SUPABASE:
const { from, to } = paginationParams(input.page, input.limit);
const { data: result, error, count } = await supabase
  .from('agents')
  .select(AGENT_LIST_FIELDS, { count: 'exact' })
  .order('rating', { ascending: false })
  .range(from, to);

handleSupabaseError(error);
*/
```

**4k: agents.ts — getById**

```typescript
// MOCK: Replace with Supabase query — agent with active listings

/* SUPABASE:
const { data: result, error } = await supabase
  .from('agents')
  .select(`${AGENT_PROFILE_FIELDS}, properties!inner(${PROPERTY_CARD_FIELDS})`)
  .eq('id', input.id)
  .eq('properties.status', 'Active')
  .single();

if (error) throw new TRPCError({ code: 'NOT_FOUND', message: `Agent ${input.id} not found.` });
handleSupabaseError(error);
*/
```

**4l: agents.ts — getPortfolioMap**

```typescript
// MOCK: Replace with Supabase query — agent transactions with coordinates

/* SUPABASE:
const { data: result, error } = await supabase
  .from('agent_transactions')
  .select('id, price, transaction_date, properties!inner(latitude, longitude, address, property_type, district)')
  .eq('agent_id', input.agentId)
  .order('transaction_date', { ascending: false });

handleSupabaseError(error);
*/
```

**4m: users.ts — getProfile**

```typescript
// MOCK: Replace with Supabase query — user profile by ID

/* SUPABASE:
const { data: result, error } = await supabase
  .from('user_profiles')
  .select(USER_PROFILE_FIELDS)
  .eq('id', input.userId)
  .single();

if (error) throw new TRPCError({ code: 'NOT_FOUND', message: `User ${input.userId} not found.` });
handleSupabaseError(error);
*/
```

**4n: users.ts — getFamilyGroup**

```typescript
// MOCK: Replace with Supabase query — family group with members

/* SUPABASE:
const { data: result, error } = await supabase
  .from('family_groups')
  .select('id, name, eligibility_summary, members:family_group_members(user_id, role, users!inner(id, name, singpass_verified))')
  .eq('id', input.familyGroupId)
  .single();

if (error) throw new TRPCError({ code: 'NOT_FOUND', message: `Family group ${input.familyGroupId} not found.` });
handleSupabaseError(error);
*/
```

**4o: users.ts — getEligibilityDashboard**

```typescript
// MOCK: Replace with Supabase query — user + family group eligibility join

/* SUPABASE:
const { data: result, error } = await supabase
  .from('user_profiles')
  .select('id, residency_status, singpass_verified, family_group_id, family_groups(name, eligibility_summary)')
  .eq('id', input.userId)
  .single();

if (error) throw new TRPCError({ code: 'NOT_FOUND', message: `User ${input.userId} not found.` });
handleSupabaseError(error);
*/
```

**4p: users.ts — getPortfolio**

```typescript
// MOCK: Replace with Supabase query — user portfolio (owned + transaction history)

/* SUPABASE:
const { from, to } = paginationParams(input.page, input.limit);
const { data: ownedData, error: ownedError, count: ownedCount } = await supabase
  .from('properties')
  .select(PROPERTY_CARD_FIELDS, { count: 'exact' })
  .eq('owner_id', input.userId)
  .order('created_at', { ascending: false })
  .range(from, to);

handleSupabaseError(ownedError);

const { data: transactions, error: txError } = await supabase
  .from('user_transactions')
  .select(`${TRANSACTION_DETAIL_FIELDS}, properties!inner(${PROPERTY_CARD_FIELDS})`)
  .eq('user_id', input.userId)
  .order('transaction_date', { ascending: false });

handleSupabaseError(txError);
*/
```

**4q: learning.ts — list**

```typescript
// MOCK: Replace with Supabase query — learning modules with optional category filter

/* SUPABASE:
const { from, to } = paginationParams(input.page, input.limit);
let query = supabase
  .from('learning_modules')
  .select(LEARNING_MODULE_LIST_FIELDS, { count: 'exact' })
  .order('order_index', { ascending: true })
  .range(from, to);

if (input.category) query = query.eq('category', input.category);

const { data: result, error, count } = await query;
handleSupabaseError(error);
*/
```

**4r: learning.ts — getById**

```typescript
// MOCK: Replace with Supabase query — full module content by ID

/* SUPABASE:
const { data: result, error } = await supabase
  .from('learning_modules')
  .select(LEARNING_MODULE_DETAIL_FIELDS)
  .eq('id', input.id)
  .single();

if (error) throw new TRPCError({ code: 'NOT_FOUND', message: `Learning module ${input.id} not found.` });
handleSupabaseError(error);
*/
```

**4s: learning.ts — markComplete**

```typescript
// MOCK: Replace with Supabase upsert — idempotent completion record

/* SUPABASE:
const { data: result, error } = await supabase
  .from('user_module_completions')
  .upsert(
    { user_id: ctx.userId, module_id: input.moduleId, completed_at: new Date().toISOString() },
    { onConflict: 'user_id,module_id', ignoreDuplicates: false }
  )
  .select('id, completed_at, created_at')
  .single();

handleSupabaseError(error);
const alreadyCompleted = result.created_at !== result.completed_at;
*/
```

**4t: serviceProviders.ts — list**

```typescript
// MOCK: Replace with Supabase query — service providers with optional type filter

/* SUPABASE:
const { from, to } = paginationParams(input.page, input.limit);
let query = supabase
  .from('service_providers')
  .select(SERVICE_PROVIDER_LIST_FIELDS, { count: 'exact' })
  .order('rating', { ascending: false })
  .range(from, to);

if (input.type) query = query.eq('type', input.type);

const { data: result, error, count } = await query;
handleSupabaseError(error);
*/
```

**4u: serviceProviders.ts — getById**

```typescript
// MOCK: Replace with Supabase query — full provider profile by ID

/* SUPABASE:
const { data: result, error } = await supabase
  .from('service_providers')
  .select(SERVICE_PROVIDER_DETAIL_FIELDS)
  .eq('id', input.id)
  .single();

if (error) throw new TRPCError({ code: 'NOT_FOUND', message: `Service provider ${input.id} not found.` });
handleSupabaseError(error);
*/
```

**4v: calculators.ts — getRegulatoryRates**

```typescript
// MOCK: Replace with Supabase query — latest regulatory configuration

/* SUPABASE:
const { data: result, error } = await supabase
  .from('regulatory_config')
  .select('*')
  .order('effective_date', { ascending: false })
  .limit(1)
  .single();

handleSupabaseError(error);
const validated = RegulatoryConfigSchema.parse(result);
*/
```

**4w: calculators.ts — getRatesForSection**

```typescript
// MOCK: Replace with targeted Supabase column select

/* SUPABASE:
const columnMap: Record<string, string> = {
  stampDuty: 'stamp_duty',
  borrowing: 'borrowing',
  mortgage: 'mortgage',
  cpf: 'cpf',
  propertyTax: 'property_tax',
  misc: 'misc',
  cpfRates: 'cpf_rates',
  maintenanceFees: 'maintenance_fees',
};

const column = columnMap[input.section];
const { data: result, error } = await supabase
  .from('regulatory_config')
  .select(column)
  .order('effective_date', { ascending: false })
  .limit(1)
  .single();

handleSupabaseError(error);
*/
```

**Step (after all 4t–4w): Commit**
```bash
git add lib/trpc/routers/
git commit -m "docs(api): add standardized SUPABASE comment blocks to all mock procedures"
```

---

## Task 5 — Create `/lib/utils/supabaseHelpers.ts`

**Files:**
- Create: `lib/utils/supabaseHelpers.ts`
- Modify: `lib/trpc/routers/properties.ts` (import buildSearchQuery)

**Step 1: Create the helpers file**

```typescript
/**
 * Supabase Integration Helpers
 *
 * Utilities for every Supabase integration:
 * - Error handling with TRPCError mapping
 * - Pagination parameter conversion
 * - Snake_case → camelCase transformation
 * - Property search query builder
 *
 * Usage: Import specific helpers in each router file.
 * These are no-ops in mock mode — safe to import now.
 */

import { TRPCError } from '@trpc/server';
import type { PostgrestError } from '@supabase/supabase-js';
import type { PropertyFilters } from '@/lib/trpc/routers/properties';

// ── Error Handling ─────────────────────────────────────────────────────────────

/**
 * Maps Supabase PostgrestError codes to appropriate TRPCErrors.
 * Call after every Supabase query to ensure consistent error handling.
 *
 * @param error - The error from Supabase response (null if no error)
 * @throws TRPCError with appropriate code
 *
 * @example
 * const { data, error } = await supabase.from('properties').select('*').single();
 * handleSupabaseError(error);  // throws if error is non-null
 */
export function handleSupabaseError(error: PostgrestError | null): void {
  if (!error) return;

  // PGRST116: "The result contains 0 rows" — single() returned nothing
  if (error.code === 'PGRST116') {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: error.message,
      cause: error,
    });
  }

  // 23505: Unique constraint violation
  if (error.code === '23505') {
    throw new TRPCError({
      code: 'CONFLICT',
      message: 'Record already exists.',
      cause: error,
    });
  }

  // 23503: Foreign key violation
  if (error.code === '23503') {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Referenced record does not exist.',
      cause: error,
    });
  }

  // 42501: Row level security violation / permission denied
  if (error.code === '42501') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Permission denied.',
      cause: error,
    });
  }

  // Default: unknown server error
  throw new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: error.message,
    cause: error,
  });
}

// ── Pagination ─────────────────────────────────────────────────────────────────

/**
 * Converts 1-indexed page/limit to Supabase range() params.
 * Supabase range() uses 0-indexed from/to (inclusive).
 *
 * @param page - Current page number (1-indexed)
 * @param limit - Items per page
 * @returns { from, to } for use in supabase.range(from, to)
 *
 * @example
 * const { from, to } = paginationParams(2, 20);
 * // from = 20, to = 39  (page 2, 20 per page)
 * supabase.from('properties').select('*').range(from, to);
 */
export function paginationParams(page: number, limit: number): { from: number; to: number } {
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  return { from, to };
}

// ── Case Conversion ────────────────────────────────────────────────────────────

/**
 * Recursively converts snake_case keys to camelCase.
 * Use when Supabase returns snake_case column names that need to match
 * TypeScript camelCase interfaces.
 *
 * @param obj - Object with snake_case keys (or array of such objects)
 * @returns New object with camelCase keys
 *
 * @example
 * const row = { owner_id: '123', listing_type: 'Sale' };
 * const typed = snakeToCamel<Property>(row);
 * // { ownerId: '123', listingType: 'Sale' }
 *
 * @note Supabase can be configured with a global camelCase transform using
 * the `db: { schema: 'public' }` option in `createClient`. Prefer that
 * approach over per-call transformation where possible.
 */
export function snakeToCamel<T>(obj: Record<string, unknown>): T {
  if (Array.isArray(obj)) {
    return obj.map((item) =>
      typeof item === 'object' && item !== null
        ? snakeToCamel(item as Record<string, unknown>)
        : item
    ) as T;
  }

  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      key.replace(/_([a-z])/g, (_, char: string) => char.toUpperCase()),
      value !== null && typeof value === 'object' && !Array.isArray(value)
        ? snakeToCamel(value as Record<string, unknown>)
        : Array.isArray(value)
          ? (value as unknown[]).map((item) =>
              typeof item === 'object' && item !== null
                ? snakeToCamel(item as Record<string, unknown>)
                : item
            )
          : value,
    ])
  ) as T;
}

// ── Property Search Query Builder ──────────────────────────────────────────────

/**
 * Builds a Supabase query chain for the property search filter API.
 * Encapsulates all filter → Supabase column mappings in one place.
 *
 * IMPORTANT: This function accepts `any` typed query because Supabase's
 * chained query builder is not easily typed without the full client instance.
 * Type the result at the call site.
 *
 * @param query - A Supabase select query (already pointing to 'properties' table)
 * @param filters - PropertyFilters from the tRPC input
 * @returns The same query builder with all non-null filters applied
 *
 * @example
 * let query = supabase.from('properties').select(PROPERTY_LIST_FIELDS, { count: 'exact' });
 * query = buildSearchQuery(query, input);
 * const { data, error, count } = await query.range(from, to);
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildSearchQuery(query: any, filters: PropertyFilters): any {
  // Text search: address, description, highlights
  if (filters.keyword) {
    query = query.or(
      `address.ilike.%${filters.keyword}%,ai_generated_description.ilike.%${filters.keyword}%`
    );
  }

  // Enum filters
  if (filters.listingType)    query = query.eq('listing_type', filters.listingType);
  if (filters.propertyType)   query = query.eq('property_type', filters.propertyType);
  if (filters.hdbRoomType)    query = query.eq('hdb_room_type', filters.hdbRoomType);
  if (filters.furnishing)     query = query.eq('furnishing', filters.furnishing);
  if (filters.tenure)         query = query.eq('tenure', filters.tenure);
  if (filters.status)         query = query.eq('status', filters.status);
  if (filters.verificationLevel) query = query.eq('verification_level', filters.verificationLevel);
  if (filters.listingSource)  query = query.eq('listing_source', filters.listingSource);
  if (filters.district)       query = query.eq('district', filters.district);
  if (filters.hdbTown)        query = query.eq('hdb_town', filters.hdbTown);

  // Boolean filters
  if (filters.featured !== undefined)
    query = query.eq('featured', filters.featured);
  if (filters.ownerSingpassVerified !== undefined)
    // Note: Requires JOIN — use a Postgres function or subquery in production
    query = query.eq('owner_singpass_verified', filters.ownerSingpassVerified);

  // Range filters
  if (filters.priceMin !== undefined)    query = query.gte('price', filters.priceMin);
  if (filters.priceMax !== undefined)    query = query.lte('price', filters.priceMax);
  if (filters.bedroomsMin !== undefined) query = query.gte('bedrooms', filters.bedroomsMin);
  if (filters.bedroomsMax !== undefined) query = query.lte('bedrooms', filters.bedroomsMax);
  if (filters.bathroomsMin !== undefined) query = query.gte('bathrooms', filters.bathroomsMin);
  if (filters.bathroomsMax !== undefined) query = query.lte('bathrooms', filters.bathroomsMax);
  if (filters.floorAreaMin !== undefined) query = query.gte('floor_area_sqft', filters.floorAreaMin);
  if (filters.floorAreaMax !== undefined) query = query.lte('floor_area_sqft', filters.floorAreaMax);
  if (filters.qualityScoreMin !== undefined)
    query = query.gte('listing_quality_score', filters.qualityScoreMin);

  // Sort
  const sortMap: Record<string, { column: string; ascending: boolean }> = {
    newest:        { column: 'created_at',           ascending: false },
    price_asc:     { column: 'price',                ascending: true  },
    price_desc:    { column: 'price',                ascending: false },
    psf_asc:       { column: 'psf',                  ascending: true  },
    psf_desc:      { column: 'psf',                  ascending: false },
    most_viewed:   { column: 'views_count',           ascending: false },
    quality_score: { column: 'listing_quality_score', ascending: false },
  };

  const sort = sortMap[filters.sortBy ?? 'newest'];
  query = query.order(sort.column, { ascending: sort.ascending });

  return query;
}
```

**Step 2: TypeScript compile check**
```bash
npx tsc --noEmit
```
Expected: 0 errors (PostgrestError import is type-only so no runtime dependency needed yet).

**Step 3: Commit**
```bash
git add lib/utils/supabaseHelpers.ts
git commit -m "feat(utils): add supabaseHelpers with error handling, pagination, camelCase, and query builder"
```

---

## Task 6 — Update CLAUDE.md

**File:** `space-realty/claude.md`

Add the following section documenting the response shape contract:

```markdown
## API Response Shape Contract

All tRPC procedures follow these shapes. Deviating from these will break frontend consumers.

### List Procedures
```typescript
{
  data: T[];        // ← the array (NOT 'items')
  total: number;    // total count (unpaginated)
  page: number;
  limit: number;
  totalPages: number;
}
```

### getById Procedures
```typescript
T  // return the item directly, or throw TRPCError NOT_FOUND
```

### Create/Update Mutations
```typescript
{ success: boolean; data: T }
```

### Delete Mutations
```typescript
{ success: boolean; id: string }
```

### Specialized Queries (getVerificationStatus, getEligibilityDashboard, etc.)
```typescript
{ data: T }  // always wrap in { data } for consistency
```

### Date Normalization
Always call `normalizeDates()` from `lib/utils/dateTransformers.ts` before returning any mock object containing `Date` fields.

### SUPABASE Comments
Every `// MOCK:` line must be followed by a `/* SUPABASE: ... */` block with the exact swap query. See `lib/utils/supabaseHelpers.ts` for `handleSupabaseError`, `paginationParams`, `buildSearchQuery`.
```

**Step: Commit**
```bash
git add claude.md
git commit -m "docs(claude.md): document API response shape contract and date normalization rules"
```

---

## Task Order Summary

1. **Task 1** — `items` → `data` in PaginatedResponse (type + all routers + consumers)
2. **Task 2** — Wrap remaining non-standard procedures (getFeatured, getSimilar, mutations)
3. **Task 3** — Create dateTransformers.ts and apply normalizeDates to date-bearing procedures
4. **Task 4** — Add SUPABASE comment blocks to all MOCK comments
5. **Task 5** — Create supabaseHelpers.ts
6. **Task 6** — Update claude.md with the contract

**Commit after each task.** Do not batch tasks into a single commit.
