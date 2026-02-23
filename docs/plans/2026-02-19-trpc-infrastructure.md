# tRPC Infrastructure Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Wire up a complete, type-safe tRPC v11 API layer over mock data for Space Realty's Next.js 16 App Router, covering properties, users, agents, service providers, and learning modules.

**Architecture:** All routers live in `lib/trpc/routers/`. Procedures filter/sort/paginate the in-memory mock arrays, with `// MOCK: Replace with Supabase query` comments marking every data access. Auth stubs use `// SINGPASS: Add Singpass verification check here`. The client-side provider wraps `@tanstack/react-query` v5 already in `app/providers.tsx`.

**Tech Stack:** tRPC v11 (`@trpc/server`, `@trpc/client`, `@trpc/react-query`), Zod v4, React Query v5, Next.js 16 App Router, TypeScript strict mode.

**Critical version notes:**
- tRPC v11 uses `fetchRequestHandler` from `@trpc/server/adapters/fetch` for App Router (NOT `@trpc/next`)
- Zod v4: use `z.nativeEnum(MyEnum)` for TypeScript enums, `z.enum([...])` for string literals
- Context typing: `Awaited<ReturnType<typeof createTRPCContext>>` (not `inferAsyncReturnType`)
- `protectedProcedure` is a stub — it mirrors `publicProcedure` until Singpass sessions are wired

---

## Task 1: Foundation — Context + tRPC Initializer

**Files:**
- Create: `lib/trpc/context.ts`
- Create: `lib/trpc/trpc.ts`

**Step 1: Create `lib/trpc/context.ts`**

```typescript
// lib/trpc/context.ts
import type { NextRequest } from 'next/server';

export type TRPCContext = {
  req: NextRequest;
  /**
   * Populated after Singpass session validation.
   * SINGPASS: Add Singpass verification check here — decode JWT/session,
   * fetch MyInfo, populate userId and singpassVerified.
   */
  userId: string | null;
  singpassVerified: boolean;
};

export async function createTRPCContext(opts: { req: NextRequest }): Promise<TRPCContext> {
  // SINGPASS: Add Singpass verification check here
  // Future: extract session token from cookie, validate, populate userId
  return {
    req: opts.req,
    userId: null,
    singpassVerified: false,
  };
}
```

**Step 2: Create `lib/trpc/trpc.ts`**

```typescript
// lib/trpc/trpc.ts
import { initTRPC, TRPCError } from '@trpc/server';
import type { TRPCContext } from './context';

const t = initTRPC.context<TRPCContext>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

/**
 * Protected procedure stub — enforces that a userId exists in context.
 * SINGPASS: Add Singpass verification check here — also assert singpassVerified === true.
 */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to perform this action.',
    });
  }
  return next({ ctx: { ...ctx, userId: ctx.userId } });
});
```

**Step 3: Verify types compile**
```bash
cd "d:\Antigravity Workspaces\Fifth\space-realty" && npx tsc --noEmit 2>&1
```
Expected: no errors.

---

## Task 2: Next.js App Router Handler

**Files:**
- Create: `app/api/trpc/[trpc]/route.ts`

**Step 1: Create the route handler**

```typescript
// app/api/trpc/[trpc]/route.ts
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import type { NextRequest } from 'next/server';
import { createTRPCContext } from '@/lib/trpc/context';
import { appRouter } from '@/lib/trpc/routers/root';

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: ({ req }) => createTRPCContext({ req }),
    onError:
      process.env.NODE_ENV === 'development'
        ? ({ path, error }) => {
            console.error(`tRPC error on ${path ?? '<unknown>'}:`, error);
          }
        : undefined,
  });

export { handler as GET, handler as POST };
```

**Step 2: Verify types compile**
```bash
cd "d:\Antigravity Workspaces\Fifth\space-realty" && npx tsc --noEmit 2>&1
```
Note: will fail until `routers/root.ts` exists — proceed to Task 8, then return.

---

## Task 3: Properties Router (7 procedures)

**Files:**
- Create: `lib/trpc/routers/properties.ts`

This is the most complex router. Define Zod schemas and the in-memory view-count store at module scope, above the router.

**Step 1: Create `lib/trpc/routers/properties.ts`**

```typescript
// lib/trpc/routers/properties.ts
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure } from '../trpc';
import {
  mockProperties,
  mockUsers,
  mockAgents,
} from '@/lib/mock';
import {
  PropertyType,
  ListingType,
  HDBRoomType,
  Furnishing,
  Tenure,
  PropertyStatus,
  ListingSource,
  VerificationLevel,
  type Property,
} from '@/types';

// ── In-memory view counter ────────────────────────────────────────────────────
// MOCK: Replace with Supabase query — UPDATE properties SET views_count = views_count + 1
const viewCounts = new Map<string, number>(
  mockProperties.map((p) => [p.id, p.viewsCount])
);

// ── Zod Schemas ───────────────────────────────────────────────────────────────

const SortBy = z.enum([
  'newest',
  'price_asc',
  'price_desc',
  'psf_asc',
  'psf_desc',
  'most_viewed',
  'quality_score',
]);

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
  featured:          z.boolean().optional(),
  sortBy:            SortBy.default('newest'),
  page:              z.number().int().min(1).default(1),
  limit:             z.number().int().min(1).max(100).default(20),
});

export type PropertyFilters = z.infer<typeof PropertyFiltersSchema>;

export interface PropertySearchResponse {
  items: Property[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function applyFilters(props: Property[], input: PropertyFilters): Property[] {
  let results = props.map((p) => ({
    ...p,
    viewsCount: viewCounts.get(p.id) ?? p.viewsCount,
  }));

  if (input.keyword) {
    const kw = input.keyword.toLowerCase();
    results = results.filter(
      (p) =>
        p.address.toLowerCase().includes(kw) ||
        p.aiGeneratedDescription?.toLowerCase().includes(kw) ||
        p.hdbTown?.toLowerCase().includes(kw) ||
        p.aiHighlights.some((h) => h.toLowerCase().includes(kw))
    );
  }

  if (input.listingType)       results = results.filter((p) => p.listingType === input.listingType);
  if (input.propertyType)      results = results.filter((p) => p.propertyType === input.propertyType);
  if (input.district)          results = results.filter((p) => p.district === input.district);
  if (input.hdbTown)           results = results.filter((p) => p.hdbTown === input.hdbTown);
  if (input.hdbRoomType)       results = results.filter((p) => p.hdbRoomType === input.hdbRoomType);
  if (input.priceMin !== undefined) results = results.filter((p) => p.price >= input.priceMin!);
  if (input.priceMax !== undefined) results = results.filter((p) => p.price <= input.priceMax!);
  if (input.bedroomsMin !== undefined) results = results.filter((p) => p.bedrooms >= input.bedroomsMin!);
  if (input.bedroomsMax !== undefined) results = results.filter((p) => p.bedrooms <= input.bedroomsMax!);
  if (input.bathroomsMin !== undefined) results = results.filter((p) => p.bathrooms >= input.bathroomsMin!);
  if (input.floorAreaMin !== undefined) results = results.filter((p) => p.floorAreaSqft >= input.floorAreaMin!);
  if (input.floorAreaMax !== undefined) results = results.filter((p) => p.floorAreaSqft <= input.floorAreaMax!);
  if (input.furnishing)        results = results.filter((p) => p.furnishing === input.furnishing);
  if (input.tenure)            results = results.filter((p) => p.tenure === input.tenure);
  if (input.status)            results = results.filter((p) => p.status === input.status);
  if (input.verificationLevel) results = results.filter((p) => p.verificationLevel === input.verificationLevel);
  if (input.listingSource)     results = results.filter((p) => p.listingSource === input.listingSource);
  if (input.featured !== undefined) results = results.filter((p) => p.featured === input.featured);

  switch (input.sortBy) {
    case 'price_asc':     results.sort((a, b) => a.price - b.price); break;
    case 'price_desc':    results.sort((a, b) => b.price - a.price); break;
    case 'psf_asc':       results.sort((a, b) => (a.psf ?? 0) - (b.psf ?? 0)); break;
    case 'psf_desc':      results.sort((a, b) => (b.psf ?? 0) - (a.psf ?? 0)); break;
    case 'most_viewed':   results.sort((a, b) => b.viewsCount - a.viewsCount); break;
    case 'quality_score': results.sort((a, b) => (b.listingQualityScore ?? 0) - (a.listingQualityScore ?? 0)); break;
    case 'newest':
    default:              results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  return results;
}

function paginate<T>(items: T[], page: number, limit: number) {
  const total = items.length;
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;
  return { items: items.slice(offset, offset + limit), total, totalPages };
}

// ── Router ────────────────────────────────────────────────────────────────────

export const propertiesRouter = router({

  /** List properties with full filter, sort, and pagination support. */
  list: publicProcedure
    .input(PropertyFiltersSchema)
    .query(async ({ input }) => {
      // MOCK: Replace with Supabase query — SELECT * FROM properties WHERE ...
      await new Promise((r) => setTimeout(r, 250));

      const filtered = applyFilters(mockProperties, input);
      const { items, total, totalPages } = paginate(filtered, input.page, input.limit);

      return {
        items,
        total,
        page: input.page,
        limit: input.limit,
        totalPages,
      } satisfies PropertySearchResponse;
    }),

  /** Fetch a single property by ID, enriched with agent/owner display names. */
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      // MOCK: Replace with Supabase query — SELECT * FROM properties WHERE id = $1
      await new Promise((r) => setTimeout(r, 250));

      const property = mockProperties.find((p) => p.id === input.id);
      if (!property) {
        throw new TRPCError({ code: 'NOT_FOUND', message: `Property ${input.id} not found.` });
      }

      const agent = property.agentId
        ? mockAgents.find((a) => a.id === property.agentId) ?? null
        : null;
      const owner = mockUsers.find((u) => u.id === property.ownerId) ?? null;

      return {
        ...property,
        viewsCount: viewCounts.get(property.id) ?? property.viewsCount,
        agentDetails: agent
          ? { id: agent.id, ceaNumber: agent.ceaNumber, agencyName: agent.agencyName, ratings: agent.ratings }
          : null,
        ownerDetails: owner
          ? { id: owner.id, singpassVerified: owner.singpassVerification.verified }
          : null,
      };
    }),

  /** Return the first 8 featured, active properties for homepage/hero display. */
  getFeatured: publicProcedure
    .query(async () => {
      // MOCK: Replace with Supabase query — SELECT * FROM properties WHERE featured = true AND status = 'Active' LIMIT 8
      await new Promise((r) => setTimeout(r, 250));

      return mockProperties
        .filter((p) => p.featured && p.status === PropertyStatus.Active)
        .slice(0, 8);
    }),

  /** Return up to 4 similar properties by district, type, and price proximity. */
  getSimilar: publicProcedure
    .input(
      z.object({
        id:           z.string(),
        district:     z.string(),
        maxPrice:     z.number(),
        propertyType: z.nativeEnum(PropertyType),
      })
    )
    .query(async ({ input }) => {
      // MOCK: Replace with Supabase query — SELECT * FROM properties WHERE district = $1 AND property_type = $2 AND price <= $3 AND id != $4 LIMIT 4
      await new Promise((r) => setTimeout(r, 250));

      return mockProperties
        .filter(
          (p) =>
            p.id !== input.id &&
            p.district === input.district &&
            p.propertyType === input.propertyType &&
            p.price <= input.maxPrice * 1.2 // ±20% price band
        )
        .slice(0, 4);
    }),

  /** Return all properties listed by a specific owner (OwnerDirect listings). */
  getByOwner: publicProcedure
    .input(z.object({ ownerId: z.string() }))
    .query(async ({ input }) => {
      // MOCK: Replace with Supabase query — SELECT * FROM properties WHERE owner_id = $1
      await new Promise((r) => setTimeout(r, 250));

      return mockProperties.filter((p) => p.ownerId === input.ownerId);
    }),

  /** Return the verification level and list of required document types for a listing. */
  getVerificationStatus: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      // MOCK: Replace with Supabase query — SELECT verification_level, ownership_doc_url, legal_doc_urls FROM properties WHERE id = $1
      await new Promise((r) => setTimeout(r, 250));

      const property = mockProperties.find((p) => p.id === input.id);
      if (!property) {
        throw new TRPCError({ code: 'NOT_FOUND', message: `Property ${input.id} not found.` });
      }

      const requiredDocs: Record<VerificationLevel, string[]> = {
        [VerificationLevel.Unverified]:        ['Ownership title deed', 'NRIC of owner'],
        [VerificationLevel.OwnershipVerified]: ['Legal docs (SPA or tenancy agreement)'],
        [VerificationLevel.LegalDocsVerified]: ['Final inspection report'],
        [VerificationLevel.FullyVerified]:     [],
      };

      return {
        propertyId: property.id,
        verificationLevel: property.verificationLevel,
        ownershipDocPresent: !!property.ownershipDocUrl,
        legalDocCount: property.legalDocUrls.length,
        requiredDocuments: requiredDocs[property.verificationLevel],
      };
    }),

  /** Increment the view count for a property (fire-and-forget from listing pages). */
  incrementViews: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      // MOCK: Replace with Supabase query — UPDATE properties SET views_count = views_count + 1 WHERE id = $1
      const current = viewCounts.get(input.id) ?? 0;
      viewCounts.set(input.id, current + 1);
      return { viewsCount: current + 1 };
    }),
});
```

**Step 2: Verify types compile** (after root router exists)
```bash
cd "d:\Antigravity Workspaces\Fifth\space-realty" && npx tsc --noEmit 2>&1
```

---

## Task 4: Users Router (4 procedures)

**Files:**
- Create: `lib/trpc/routers/users.ts`

```typescript
// lib/trpc/routers/users.ts
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure } from '../trpc';
import { mockUsers, mockFamilies, mockProperties } from '@/lib/mock';

export const usersRouter = router({

  /** Fetch a user's full profile by ID. */
  getProfile: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      // MOCK: Replace with Supabase query — SELECT * FROM user_profiles WHERE id = $1
      // SINGPASS: Add Singpass verification check here — verify caller is fetching their own profile or is Admin
      await new Promise((r) => setTimeout(r, 250));

      const user = mockUsers.find((u) => u.id === input.userId);
      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND', message: `User ${input.userId} not found.` });
      }
      return user;
    }),

  /** Fetch a family group and all its members' basic details. */
  getFamilyGroup: publicProcedure
    .input(z.object({ familyGroupId: z.string() }))
    .query(async ({ input }) => {
      // MOCK: Replace with Supabase query — SELECT * FROM family_groups WHERE id = $1 with members JOIN
      // SINGPASS: Add Singpass verification check here — verify caller is a member of this family group
      await new Promise((r) => setTimeout(r, 250));

      const family = mockFamilies.find((f) => f.id === input.familyGroupId);
      if (!family) {
        throw new TRPCError({ code: 'NOT_FOUND', message: `Family group ${input.familyGroupId} not found.` });
      }

      // Enrich members with basic user info
      const enrichedMembers = family.members.map((member) => {
        const user = mockUsers.find((u) => u.id === member.userId);
        return {
          ...member,
          displayName: user?.singpassVerification.name ?? 'Unknown',
          singpassVerified: user?.singpassVerification.verified ?? false,
        };
      });

      return { ...family, members: enrichedMembers };
    }),

  /**
   * Return the eligibility dashboard for a user:
   * their own profile + family group eligibility summary if they belong to one.
   */
  getEligibilityDashboard: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      // MOCK: Replace with Supabase query — JOIN user_profiles + family_groups + eligibility_summaries
      // SINGPASS: Add Singpass verification check here — assert singpassVerified before exposing eligibility
      await new Promise((r) => setTimeout(r, 250));

      const user = mockUsers.find((u) => u.id === input.userId);
      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND', message: `User ${input.userId} not found.` });
      }

      const familyGroup = user.familyGroupId
        ? (mockFamilies.find((f) => f.id === user.familyGroupId) ?? null)
        : null;

      return {
        userId: user.id,
        residencyStatus: user.residencyStatus,
        singpassVerified: user.singpassVerification.verified,
        familyGroupId: user.familyGroupId ?? null,
        familyName: familyGroup?.name ?? null,
        eligibilitySummary: familyGroup?.eligibilitySummary ?? null,
      };
    }),

  /** Return all properties owned, renting, or previously transacted by a user. */
  getPortfolio: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      // MOCK: Replace with Supabase query — SELECT * FROM properties WHERE owner_id = $1 UNION transactions lookup
      // SINGPASS: Add Singpass verification check here — verify caller is the portfolio owner or Admin
      await new Promise((r) => setTimeout(r, 250));

      const user = mockUsers.find((u) => u.id === input.userId);
      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND', message: `User ${input.userId} not found.` });
      }

      const owned   = mockProperties.filter((p) => p.ownerId === input.userId);
      const bought  = user.buyHistory.map((tx) => mockProperties.find((p) => p.id === tx.propertyId)).filter(Boolean);
      const sold    = user.sellHistory.map((tx) => mockProperties.find((p) => p.id === tx.propertyId)).filter(Boolean);
      const rented  = user.rentHistory.map((tx) => mockProperties.find((p) => p.id === tx.propertyId)).filter(Boolean);

      return {
        owned,
        bought,
        sold,
        rented,
        buyHistory:  user.buyHistory,
        sellHistory: user.sellHistory,
        rentHistory: user.rentHistory,
      };
    }),
});
```

---

## Task 5: Agents Router (3 procedures)

**Files:**
- Create: `lib/trpc/routers/agents.ts`

```typescript
// lib/trpc/routers/agents.ts
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure } from '../trpc';
import { mockAgents, mockProperties } from '@/lib/mock';

export const agentsRouter = router({

  /** List all agents with their summary stats. */
  list: publicProcedure
    .query(async () => {
      // MOCK: Replace with Supabase query — SELECT * FROM agents ORDER BY ratings_average DESC
      await new Promise((r) => setTimeout(r, 250));
      return mockAgents;
    }),

  /** Fetch a single agent by ID with their active listings. */
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      // MOCK: Replace with Supabase query — SELECT * FROM agents WHERE id = $1; SELECT * FROM properties WHERE agent_id = $1 AND status = 'Active'
      await new Promise((r) => setTimeout(r, 250));

      const agent = mockAgents.find((a) => a.id === input.id);
      if (!agent) {
        throw new TRPCError({ code: 'NOT_FOUND', message: `Agent ${input.id} not found.` });
      }

      const activeListings = mockProperties.filter(
        (p) => p.agentId === input.id && p.status === 'Active'
      );

      return { ...agent, activeListingDetails: activeListings };
    }),

  /**
   * Return all portfolio map transactions for an agent.
   * Each entry includes lat/lng for map pin rendering.
   */
  getPortfolioMap: publicProcedure
    .input(z.object({ agentId: z.string() }))
    .query(async ({ input }) => {
      // MOCK: Replace with Supabase query — SELECT * FROM agent_transactions WHERE agent_id = $1
      await new Promise((r) => setTimeout(r, 250));

      const agent = mockAgents.find((a) => a.id === input.agentId);
      if (!agent) {
        throw new TRPCError({ code: 'NOT_FOUND', message: `Agent ${input.agentId} not found.` });
      }

      return agent.portfolioMapData;
    }),
});
```

---

## Task 6: Service Providers Router (2 procedures)

**Files:**
- Create: `lib/trpc/routers/serviceProviders.ts`

```typescript
// lib/trpc/routers/serviceProviders.ts
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure } from '../trpc';
import { mockServiceProviders } from '@/lib/mock';
import { ServiceProviderType } from '@/types';

export const serviceProvidersRouter = router({

  /** List all service providers, optionally filtered by type. */
  list: publicProcedure
    .input(
      z.object({
        type: z.nativeEnum(ServiceProviderType).optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      // MOCK: Replace with Supabase query — SELECT * FROM service_providers WHERE type = $1
      await new Promise((r) => setTimeout(r, 250));

      if (!input?.type) return mockServiceProviders;
      return mockServiceProviders.filter((sp) => sp.type === input.type);
    }),

  /** Fetch a single service provider's full profile. */
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      // MOCK: Replace with Supabase query — SELECT * FROM service_providers WHERE id = $1
      await new Promise((r) => setTimeout(r, 250));

      const provider = mockServiceProviders.find((sp) => sp.id === input.id);
      if (!provider) {
        throw new TRPCError({ code: 'NOT_FOUND', message: `Service provider ${input.id} not found.` });
      }
      return provider;
    }),
});
```

---

## Task 7: Learning Router (3 procedures + in-memory mutation)

**Files:**
- Create: `lib/trpc/routers/learning.ts`

```typescript
// lib/trpc/routers/learning.ts
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { mockLearningModules } from '@/lib/mock';
import { LearningCategory } from '@/types';

// ── In-memory completion store ────────────────────────────────────────────────
// MOCK: Replace with Supabase query — INSERT INTO user_module_completions (user_id, module_id, completed_at)
// Key format: `${userId}:${moduleId}`
const completions = new Set<string>();

export const learningRouter = router({

  /** List all learning modules, optionally filtered by category. */
  list: publicProcedure
    .input(
      z.object({
        category: z.nativeEnum(LearningCategory).optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      // MOCK: Replace with Supabase query — SELECT * FROM learning_modules WHERE category = $1 ORDER BY completion_count DESC
      await new Promise((r) => setTimeout(r, 250));

      if (!input?.category) return mockLearningModules;
      return mockLearningModules.filter((m) => m.category === input.category);
    }),

  /** Fetch a single learning module's full content by ID. */
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      // MOCK: Replace with Supabase query — SELECT * FROM learning_modules WHERE id = $1
      await new Promise((r) => setTimeout(r, 250));

      const module_ = mockLearningModules.find((m) => m.id === input.id);
      if (!module_) {
        throw new TRPCError({ code: 'NOT_FOUND', message: `Learning module ${input.id} not found.` });
      }
      return module_;
    }),

  /**
   * Mark a module as complete for the authenticated user.
   * Uses protectedProcedure — requires userId in context.
   * SINGPASS: Add Singpass verification check here — only Singpass-verified users earn completion credit.
   */
  markComplete: protectedProcedure
    .input(z.object({ moduleId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // MOCK: Replace with Supabase query — INSERT INTO user_module_completions ON CONFLICT DO NOTHING
      const key = `${ctx.userId}:${input.moduleId}`;
      const alreadyCompleted = completions.has(key);
      completions.add(key);

      return {
        moduleId: input.moduleId,
        userId: ctx.userId,
        alreadyCompleted,
        completedAt: new Date().toISOString(),
      };
    }),
});
```

---

## Task 8: Root Router + AppRouter Export

**Files:**
- Create: `lib/trpc/routers/root.ts`

```typescript
// lib/trpc/routers/root.ts
import { router } from '../trpc';
import { propertiesRouter }    from './properties';
import { usersRouter }         from './users';
import { agentsRouter }        from './agents';
import { serviceProvidersRouter } from './serviceProviders';
import { learningRouter }      from './learning';

export const appRouter = router({
  properties:      propertiesRouter,
  users:           usersRouter,
  agents:          agentsRouter,
  serviceProviders: serviceProvidersRouter,
  learning:        learningRouter,
});

/** Type exported for use by the client-side tRPC hooks. */
export type AppRouter = typeof appRouter;
```

**Step 2: Full type check — all files must now resolve**
```bash
cd "d:\Antigravity Workspaces\Fifth\space-realty" && npx tsc --noEmit 2>&1
```
Expected: 0 errors.

---

## Task 9: Client-Side Provider + Hook Export

**Files:**
- Create: `lib/trpc/client.ts`
- Modify: `app/providers.tsx`

**Step 1: Create `lib/trpc/client.ts`**

```typescript
// lib/trpc/client.ts
import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from './routers/root';

/**
 * tRPC React hooks. Import `trpc` anywhere in client components to access
 * type-safe procedures, e.g. `trpc.properties.list.useQuery(filters)`.
 */
export const trpc = createTRPCReact<AppRouter>();
```

**Step 2: Update `app/providers.tsx`** — merge tRPC provider with existing React Query provider.

Read the file first, then replace it entirely:

```typescript
// app/providers.tsx
'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { httpBatchLink, loggerLink } from '@trpc/client';
import { trpc } from '@/lib/trpc/client';

function getBaseUrl() {
  if (typeof window !== 'undefined') return '';            // browser: relative URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      })
  );

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        loggerLink({
          enabled: (op) =>
            process.env.NODE_ENV === 'development' ||
            (op.direction === 'down' && op.result instanceof Error),
        }),
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </trpc.Provider>
  );
}
```

**Step 3: Final build check**
```bash
cd "d:\Antigravity Workspaces\Fifth\space-realty" && npx tsc --noEmit 2>&1 && echo "TypeScript OK"
```
Expected: `TypeScript OK`

```bash
cd "d:\Antigravity Workspaces\Fifth\space-realty" && npm run build 2>&1 | tail -20
```
Expected: `✓ Compiled successfully`

---

## File Checklist

| File | Purpose |
|---|---|
| `lib/trpc/context.ts` | Request context shape + `createTRPCContext` factory |
| `lib/trpc/trpc.ts` | `initTRPC`, `publicProcedure`, `protectedProcedure` |
| `app/api/trpc/[trpc]/route.ts` | Next.js App Router fetch handler |
| `lib/trpc/routers/properties.ts` | 7 procedures + filter engine + view counter |
| `lib/trpc/routers/users.ts` | 4 procedures — profile, family, eligibility, portfolio |
| `lib/trpc/routers/agents.ts` | 3 procedures — list, detail, portfolio map |
| `lib/trpc/routers/serviceProviders.ts` | 2 procedures — list (filterable), detail |
| `lib/trpc/routers/learning.ts` | 3 procedures — list, detail, markComplete mutation |
| `lib/trpc/routers/root.ts` | Merge all routers, export `AppRouter` type |
| `lib/trpc/client.ts` | `createTRPCReact<AppRouter>()` hook factory |
| `app/providers.tsx` | Updated — merges tRPC + React Query providers |

## Usage Example (after implementation)

```tsx
// In any client component:
import { trpc } from '@/lib/trpc/client';

export function PropertyList() {
  const { data } = trpc.properties.list.useQuery({
    listingType: 'Sale',
    district: 'D15',
    sortBy: 'price_asc',
    page: 1,
    limit: 20,
  });
  return <div>{data?.total} results</div>;
}
```
