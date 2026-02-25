// lib/trpc/routers/properties.ts
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure } from '../trpc';
import { mockProperties, mockUsers, mockAgents, mockTransactions } from '@/lib/mock';
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
  keyword: z.string().optional(),
  listingType: z.nativeEnum(ListingType).optional(),
  propertyType: z.nativeEnum(PropertyType).optional(),
  district: z.string().optional(),
  hdbTown: z.string().optional(),
  hdbRoomType: z.nativeEnum(HDBRoomType).optional(),
  priceMin: z.number().optional(),
  priceMax: z.number().optional(),
  bedroomsMin: z.number().int().optional(),
  bedroomsMax: z.number().int().optional(),
  bathroomsMin: z.number().int().optional(),
  bathroomsMax: z.number().int().optional(),
  floorAreaMin: z.number().optional(),
  floorAreaMax: z.number().optional(),
  furnishing: z.nativeEnum(Furnishing).optional(),
  tenure: z.nativeEnum(Tenure).optional(),
  status: z.nativeEnum(PropertyStatus).optional(),
  verificationLevel: z.nativeEnum(VerificationLevel).optional(),
  listingSource: z.nativeEnum(ListingSource).optional(),
  ownerSingpassVerified: z.boolean().optional(),
  qualityScoreMin: z.number().min(0).max(100).optional(),
  featured: z.boolean().optional(),
  sortBy: SortBy.default('newest'),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
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

  if (input.listingType) results = results.filter((p) => p.listingType === input.listingType);
  if (input.propertyType) results = results.filter((p) => p.propertyType === input.propertyType);
  if (input.district) results = results.filter((p) => p.district === input.district);
  if (input.hdbTown) results = results.filter((p) => p.hdbTown === input.hdbTown);
  if (input.hdbRoomType) results = results.filter((p) => p.hdbRoomType === input.hdbRoomType);
  if (input.priceMin !== undefined) results = results.filter((p) => p.price >= input.priceMin!);
  if (input.priceMax !== undefined) results = results.filter((p) => p.price <= input.priceMax!);
  if (input.bedroomsMin !== undefined) results = results.filter((p) => p.bedrooms >= input.bedroomsMin!);
  if (input.bedroomsMax !== undefined) results = results.filter((p) => p.bedrooms <= input.bedroomsMax!);
  if (input.bathroomsMin !== undefined) results = results.filter((p) => p.bathrooms >= input.bathroomsMin!);
  if (input.bathroomsMax !== undefined) results = results.filter((p) => p.bathrooms <= input.bathroomsMax!);
  if (input.floorAreaMin !== undefined) results = results.filter((p) => p.floorAreaSqft >= input.floorAreaMin!);
  if (input.floorAreaMax !== undefined) results = results.filter((p) => p.floorAreaSqft <= input.floorAreaMax!);
  if (input.furnishing) results = results.filter((p) => p.furnishing === input.furnishing);
  if (input.tenure) results = results.filter((p) => p.tenure === input.tenure);
  if (input.status) results = results.filter((p) => p.status === input.status);
  if (input.verificationLevel) results = results.filter((p) => p.verificationLevel === input.verificationLevel);
  if (input.listingSource) results = results.filter((p) => p.listingSource === input.listingSource);
  if (input.featured !== undefined) results = results.filter((p) => p.featured === input.featured);

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

  switch (input.sortBy) {
    case 'price_asc': results.sort((a, b) => a.price - b.price); break;
    case 'price_desc': results.sort((a, b) => b.price - a.price); break;
    case 'psf_asc': results.sort((a, b) => (a.psf ?? 0) - (b.psf ?? 0)); break;
    case 'psf_desc': results.sort((a, b) => (b.psf ?? 0) - (a.psf ?? 0)); break;
    case 'most_viewed': results.sort((a, b) => b.viewsCount - a.viewsCount); break;
    case 'quality_score': results.sort((a, b) => (b.listingQualityScore ?? 0) - (a.listingQualityScore ?? 0)); break;
    case 'newest':
    default: results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
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

  /** Fetch a single property by ID, enriched with agent/owner details. */
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

  /** Return the first 8 featured, active properties. */
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
        id: z.string(),
        district: z.string(),
        maxPrice: z.number(),
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
            p.price <= input.maxPrice
        )
        .slice(0, 4);
    }),

  /** Return all properties listed by a specific owner. */
  getByOwner: publicProcedure
    .input(z.object({ ownerId: z.string() }))
    .query(async ({ input }) => {
      // MOCK: Replace with Supabase query — SELECT * FROM properties WHERE owner_id = $1
      await new Promise((r) => setTimeout(r, 250));

      return mockProperties.filter((p) => p.ownerId === input.ownerId);
    }),

  /** Return verification level and required documents for a listing. */
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
        [VerificationLevel.Unverified]: ['Ownership title deed', 'NRIC of owner'],
        [VerificationLevel.OwnershipVerified]: ['Legal docs (SPA or tenancy agreement)'],
        [VerificationLevel.LegalDocsVerified]: ['Final inspection report'],
        [VerificationLevel.FullyVerified]: [],
      };

      return {
        propertyId: property.id,
        verificationLevel: property.verificationLevel,
        ownershipDocPresent: !!property.ownershipDocUrl,
        legalDocCount: property.legalDocUrls.length,
        requiredDocuments: requiredDocs[property.verificationLevel],
      };
    }),

  /** Increment the view count for a property. */
  incrementViews: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      // MOCK: Replace with Supabase query — UPDATE properties SET views_count = views_count + 1 WHERE id = $1
      if (!mockProperties.some((p) => p.id === input.id)) {
        throw new TRPCError({ code: 'NOT_FOUND', message: `Property ${input.id} not found.` });
      }
      const current = viewCounts.get(input.id) ?? 0;
      viewCounts.set(input.id, current + 1);
      return { viewsCount: current + 1 };
    }),

  /** Parse natural language query into structured filters (MOCK implementation). */
  parseNaturalLanguageQuery: publicProcedure
    .input(z.object({ query: z.string() }))
    .mutation(async ({ input }) => {
      // AI_SERVICE: Replace with actual AI/NLP service for production
      // MOCK: Artificial delay simulating AI processing
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

  /**
   * Get recent comparable transactions near a given postal code.
   * MOCK: Matches transactions via shared district of properties at the same postal code.
   */
  getComparableTransactions: publicProcedure
    .input(
      z.object({
        postalCode: z.string().length(6),
        propertyType: z.nativeEnum(PropertyType).optional(),
      })
    )
    .query(async ({ input }) => {
      await new Promise((r) => setTimeout(r, 300));

      // Find properties matching the postal code or same district.
      const anchorProperties = mockProperties.filter(
        (p) => p.postalCode === input.postalCode
      );
      const anchorDistrict =
        anchorProperties[0]?.district ??
        // Fallback: derive district from matching street block or default to D18
        mockProperties.find((p) => p.postalCode.startsWith(input.postalCode.slice(0, 3)))?.district ??
        'D18';

      const anchorType = input.propertyType ?? anchorProperties[0]?.propertyType;

      // Get all property IDs in the same district (and optionally same type).
      const comparablePropertyIds = mockProperties
        .filter(
          (p) =>
            p.district === anchorDistrict &&
            (anchorType === undefined || p.propertyType === anchorType)
        )
        .map((p) => p.id);

      // Filter transactions matching those properties.
      const rawTransactions = mockTransactions.filter((t) =>
        comparablePropertyIds.includes(t.propertyId)
      );

      // Enrich each transaction with property details.
      const enriched = rawTransactions
        .map((t) => {
          const prop = mockProperties.find((p) => p.id === t.propertyId);
          if (!prop) return null;
          return {
            date: t.transactionDate.toISOString(),
            price: t.price,
            psf: t.psf,
            floorArea: prop.floorAreaSqft,
            floor: prop.floorLevel ?? null,
            unitNumber: prop.unitNumber ?? null,
            address: prop.address,
            propertyId: t.propertyId,
          };
        })
        .filter(Boolean)
        .sort((a, b) => new Date(b!.date).getTime() - new Date(a!.date).getTime())
        .slice(0, 20); // Return at most 20 most recent

      return {
        district: anchorDistrict,
        propertyType: anchorType ?? PropertyType.HDB,
        transactions: enriched,
      };
    }),

  /**
   * Derive an estimated market value range for a property at the given postal code.
   * MOCK: Uses median PSF from comparable transactions and applies ±5% range.
   */
  getPropertyValueEstimate: publicProcedure
    .input(
      z.object({
        postalCode: z.string().length(6),
        propertyType: z.nativeEnum(PropertyType).optional(),
        targetFloorArea: z.number().positive().optional(), // sqft, for psf→price extrapolation
      })
    )
    .query(async ({ input }) => {
      await new Promise((r) => setTimeout(r, 300));

      // Identify district from mock properties.
      const anchorProp = mockProperties.find((p) => p.postalCode === input.postalCode);
      const district = anchorProp?.district ?? 'D18';
      const propType = input.propertyType ?? anchorProp?.propertyType ?? PropertyType.HDB;
      const floorArea = input.targetFloorArea ?? anchorProp?.floorAreaSqft ?? 1000;

      // Gather PSF values from same-district, same-type transactions.
      const districtPropIds = mockProperties
        .filter((p) => p.district === district && p.propertyType === propType)
        .map((p) => p.id);

      const psfValues = mockTransactions
        .filter((t) => districtPropIds.includes(t.propertyId) && t.psf > 0)
        .map((t) => t.psf);

      if (psfValues.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Insufficient comparable transactions to estimate value.',
        });
      }

      // Compute median PSF.
      const sorted = [...psfValues].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      const medianPsf =
        sorted.length % 2 === 0
          ? (sorted[mid - 1] + sorted[mid]) / 2
          : sorted[mid];

      // Estimate price from medianPsf × floorArea with ±5% range.
      const estimatedPrice = medianPsf * floorArea;
      const priceLow = Math.round((estimatedPrice * 0.95) / 1000) * 1000;
      const priceHigh = Math.round((estimatedPrice * 1.05) / 1000) * 1000;
      const psfLow = Math.round(medianPsf * 0.95);
      const psfHigh = Math.round(medianPsf * 1.05);

      // District-wide stats across all types for context.
      const allDistrictPropIds = mockProperties
        .filter((p) => p.district === district)
        .map((p) => p.id);
      const allDistrictPsf = mockTransactions
        .filter((t) => allDistrictPropIds.includes(t.propertyId) && t.psf > 0)
        .map((t) => t.psf);
      const districtSorted = [...allDistrictPsf].sort((a, b) => a - b);
      const districtMid = Math.floor(districtSorted.length / 2);
      const districtMedianPsf =
        districtSorted.length > 0
          ? districtSorted.length % 2 === 0
            ? (districtSorted[districtMid - 1] + districtSorted[districtMid]) / 2
            : districtSorted[districtMid]
          : medianPsf;

      const vsDistrictPct = Math.round(((medianPsf - districtMedianPsf) / districtMedianPsf) * 100);

      return {
        district,
        propertyType: propType,
        floorArea,
        priceLow,
        priceHigh,
        psfLow,
        psfHigh,
        medianPsf: Math.round(medianPsf),
        districtMedianPsf: Math.round(districtMedianPsf),
        vsDistrictPct,
        comparableCount: psfValues.length,
      };
    }),
});

