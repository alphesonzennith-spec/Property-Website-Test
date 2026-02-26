// lib/trpc/routers/properties.ts
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure } from '../trpc';
import { mockProperties, mockUsers, mockAgents, mockTransactions } from '@/lib/mock';
import { paginationSchema, createPaginatedResponse, getPaginationRange } from './paginationSchema';
import { withMockControl, applyEdgeCases } from '@/lib/mock/mockControls';
import { normalizeDates, NormalizedDates } from '@/lib/utils/dateTransformers';
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
// SUPABASE: This Map is not needed — views_count is persisted directly on the properties table.
// Atomic increments are handled by the increment_property_views RPC in the incrementViews procedure.
// Delete this entire Map and its initialization when switching to Supabase.
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
  data: NormalizedDates<Property>[];
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
      /* SUPABASE (uncomment when database is connected):
      const { start, end } = getPaginationRange(input.page, input.limit);
      let query = supabase
        .from('properties')
        .select(
          `${PROPERTY_LIST_FIELDS}, property_images(url, is_primary, order_index)`,
          { count: 'exact' }
        );

      // Scalar column filters
      if (input.listingType)            query = query.eq('listing_type', input.listingType);
      if (input.propertyType)           query = query.eq('property_type', input.propertyType);
      if (input.district)               query = query.eq('district', input.district);
      if (input.hdbTown)                query = query.eq('hdb_town', input.hdbTown);
      if (input.hdbRoomType)            query = query.eq('hdb_room_type', input.hdbRoomType);
      if (input.priceMin !== undefined) query = query.gte('price', input.priceMin);
      if (input.priceMax !== undefined) query = query.lte('price', input.priceMax);
      if (input.bedroomsMin !== undefined)  query = query.gte('bedrooms', input.bedroomsMin);
      if (input.bedroomsMax !== undefined)  query = query.lte('bedrooms', input.bedroomsMax);
      if (input.bathroomsMin !== undefined) query = query.gte('bathrooms', input.bathroomsMin);
      if (input.bathroomsMax !== undefined) query = query.lte('bathrooms', input.bathroomsMax);
      if (input.floorAreaMin !== undefined) query = query.gte('floor_area_sqft', input.floorAreaMin);
      if (input.floorAreaMax !== undefined) query = query.lte('floor_area_sqft', input.floorAreaMax);
      if (input.furnishing)             query = query.eq('furnishing', input.furnishing);
      if (input.tenure)                 query = query.eq('tenure', input.tenure);
      if (input.status)                 query = query.eq('status', input.status);
      if (input.verificationLevel)      query = query.eq('verification_level', input.verificationLevel);
      if (input.listingSource)          query = query.eq('listing_source', input.listingSource);
      if (input.featured !== undefined) query = query.eq('featured', input.featured);
      if (input.qualityScoreMin !== undefined)
        query = query.gte('listing_quality_score', input.qualityScoreMin);

      // Keyword: full-text search across address, AI description, and HDB town
      if (input.keyword) {
        query = query.or(
          `address.ilike.%${input.keyword}%,` +
          `ai_generated_description.ilike.%${input.keyword}%,` +
          `hdb_town.ilike.%${input.keyword}%`
        );
      }

      // ownerSingpassVerified: sub-query to get owner IDs with matching verification status
      if (input.ownerSingpassVerified !== undefined) {
        const { data: svRows } = await supabase
          .from('singpass_verifications')
          .select('user_id')
          .eq('verified', input.ownerSingpassVerified);
        const ownerIds = (svRows ?? []).map((r) => r.user_id);
        query = query.in('owner_id', ownerIds);
      }

      // Sort
      switch (input.sortBy) {
        case 'price_asc':     query = query.order('price', { ascending: true }); break;
        case 'price_desc':    query = query.order('price', { ascending: false }); break;
        case 'psf_asc':       query = query.order('psf', { ascending: true, nullsFirst: false }); break;
        case 'psf_desc':      query = query.order('psf', { ascending: false, nullsFirst: false }); break;
        case 'most_viewed':   query = query.order('views_count', { ascending: false }); break;
        case 'quality_score': query = query.order('listing_quality_score', { ascending: false, nullsFirst: false }); break;
        case 'newest':
        default:              query = query.order('created_at', { ascending: false });
      }

      // Paginate (must be last)
      query = query.range(start, end);

      const { data: result, error, count } = await query;
      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
      */
      return withMockControl('failPropertiesList', () => {
        const filtered = applyFilters(mockProperties, input);
        const { items, total, totalPages } = paginate(filtered, input.page, input.limit);

        const processedItems = applyEdgeCases(items, 'list');

        return {
          data: processedItems.map(normalizeDates),
          total,
          page: input.page,
          limit: input.limit,
          totalPages,
        } satisfies PropertySearchResponse;
      });
    }),

  /** Fetch a single property by ID, enriched with agent/owner details. */
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      // MOCK: Replace with Supabase query — SELECT * FROM properties WHERE id = $1
      /* SUPABASE (uncomment when database is connected):
      const { data: result, error } = await supabase
        .from('properties')
        .select(`
          ${PROPERTY_DETAIL_FIELDS},
          property_images(url, is_primary, order_index, type),
          agent:agents!agent_id(
            id,
            cea_number,
            agency_name,
            ratings
          ),
          owner:profiles!owner_id(
            id,
            singpass_verifications(verified)
          )
        `)
        .eq('id', input.id)
        .single();

      if (error) throw new TRPCError({ code: 'NOT_FOUND', message: `Property ${input.id} not found.` });
      */
      return withMockControl('failPropertyDetail', () => {
        const property = mockProperties.find((p) => p.id === input.id);
        if (!property) {
          throw new TRPCError({ code: 'NOT_FOUND', message: `Property ${input.id} not found.` });
        }

        const agent = property.agentId
          ? mockAgents.find((a) => a.id === property.agentId) ?? null
          : null;
        const owner = mockUsers.find((u) => u.id === property.ownerId) ?? null;

        const propertyData = {
          ...property,
          viewsCount: viewCounts.get(property.id) ?? property.viewsCount,
          agentDetails: agent
            ? { id: agent.id, ceaNumber: agent.ceaNumber, agencyName: agent.agencyName, ratings: agent.ratings }
            : null,
          ownerDetails: owner
            ? { id: owner.id, singpassVerified: owner.singpassVerification.verified }
            : null,
        };

        return normalizeDates(applyEdgeCases(propertyData, 'detail'));
      });
    }),

  /** Return the first 8 featured, active properties. */
  getFeatured: publicProcedure
    .query(async () => {
      // MOCK: Replace with Supabase query — SELECT * FROM properties WHERE featured = true AND status = 'Active' LIMIT 8
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
      return withMockControl('failPropertiesList', () => {
        const data = mockProperties
          .filter((p) => p.featured && p.status === PropertyStatus.Active)
          .slice(0, 8);
        return { data: applyEdgeCases(data, 'list').map(normalizeDates) };
      });
    }),

  /** Return up to 4 similar properties by district, type, and price proximity. */
  getSimilar: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        district: z.string().min(1),
        maxPrice: z.number().positive(),
        propertyType: z.nativeEnum(PropertyType),
      })
    )
    .query(async ({ input }) => {
      // MOCK: Replace with Supabase query — SELECT * FROM properties WHERE district = $1 AND property_type = $2 AND price <= $3 AND id != $4 LIMIT 4
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
      return withMockControl('failPropertiesList', () => {
        const data = mockProperties
          .filter(
            (p) =>
              p.id !== input.id &&
              p.district === input.district &&
              p.propertyType === input.propertyType &&
              p.price <= input.maxPrice
          )
          .slice(0, 4);
        return { data: applyEdgeCases(data, 'list').map(normalizeDates) };
      });
    }),

  /** Return all properties listed by a specific owner. */
  getByOwner: publicProcedure
    .input(
      z.object({ ownerId: z.string().uuid() }).merge(paginationSchema)
    )
    .query(async ({ input }) => {
      // MOCK: Replace with Supabase query:
      // const { data, count } = await supabase
      //   .from('properties')
      //   .select(PROPERTY_CARD_FIELDS, { count: 'exact' })
      //   .eq('owner_id', input.ownerId)
      //   .range(start, end)
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
      return withMockControl('failPropertiesList', () => {
        const ownerProperties = mockProperties.filter((p) => p.ownerId === input.ownerId);
        const { start, end } = getPaginationRange(input.page, input.limit);
        const paginatedProperties = ownerProperties.slice(start, end + 1);

        const processedItems = applyEdgeCases(paginatedProperties, 'list');

        return createPaginatedResponse(
          processedItems.map(normalizeDates),
          ownerProperties.length,
          input.page,
          input.limit
        );
      });
    }),

  /** Return verification level and required documents for a listing. */
  getVerificationStatus: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      // MOCK: Replace with Supabase query — SELECT verification_level, ownership_doc_url, legal_doc_urls FROM properties WHERE id = $1
      /* SUPABASE:
      const { data: result, error } = await supabase
        .from('properties')
        .select('id, verification_level, ownership_doc_url, legal_doc_urls')
        .eq('id', input.id)
        .single();

      if (error) throw new TRPCError({ code: 'NOT_FOUND', message: `Property ${input.id} not found.` });
      handleSupabaseError(error);
      */
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
      if (!mockProperties.some((p) => p.id === input.id)) {
        throw new TRPCError({ code: 'NOT_FOUND', message: `Property ${input.id} not found.` });
      }
      const current = viewCounts.get(input.id) ?? 0;
      viewCounts.set(input.id, current + 1);
      return {
        success: true,
        data: { viewsCount: current + 1 },
      };
    }),

  /** Parse natural language query into structured filters (MOCK implementation). */
  parseNaturalLanguageQuery: publicProcedure
    .input(z.object({ query: z.string() }))
    .mutation(async ({ input }) => {
      // AI_SERVICE: Replace with actual AI/NLP service for production
      // MOCK: Artificial delay simulating AI processing
      /* SUPABASE:
      // Replace with call to AI service (e.g., OpenAI function calling or Claude tool use)
      // to parse natural language into structured PropertyFilters.
      // const result = await aiClient.parsePropertyQuery(input.query);
      */
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
        success: true,
        data: { filters, extractedTags },
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
      }).merge(paginationSchema)
    )
    .query(async ({ input }) => {
      /* SUPABASE (uncomment when database is connected):
      const { start, end } = getPaginationRange(input.page, input.limit);

      // Step 1: Resolve anchor district from postal code
      const { data: anchorProp } = await supabase
        .from('properties')
        .select('district, property_type')
        .eq('postal_code', input.postalCode)
        .limit(1)
        .maybeSingle();

      const anchorDistrict = anchorProp?.district ?? 'D18';
      const anchorType = input.propertyType ?? anchorProp?.property_type ?? undefined;

      // Step 2: Collect property IDs in that district (and optionally type) for the JOIN filter
      let propQuery = supabase
        .from('properties')
        .select('id')
        .eq('district', anchorDistrict);
      if (anchorType) propQuery = propQuery.eq('property_type', anchorType);
      const { data: districtProps } = await propQuery;
      const propertyIds = (districtProps ?? []).map((p) => p.id);

      // Step 3: Fetch paginated transactions for those properties
      const { data: result, error, count } = await supabase
        .from('property_transactions')
        .select(
          `id, transaction_date, price, psf,
           property:properties!property_id(
             address, floor_area_sqft, floor_level, unit_number, district, property_type
           )`,
          { count: 'exact' }
        )
        .in('property_id', propertyIds)
        .order('transaction_date', { ascending: false })
        .range(start, end);

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
      */
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
      const allEnriched = rawTransactions
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
        .sort((a, b) => new Date(b!.date).getTime() - new Date(a!.date).getTime());

      // Apply pagination
      const { start, end } = getPaginationRange(input.page, input.limit);
      const paginatedTransactions = allEnriched.slice(start, end + 1);

      return {
        district: anchorDistrict,
        propertyType: anchorType ?? PropertyType.HDB,
        ...createPaginatedResponse(
          paginatedTransactions,
          allEnriched.length,
          input.page,
          input.limit
        ),
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
      /* SUPABASE (uncomment when database is connected):
      // Step 1: Resolve district and property type from postal code
      const { data: anchorProp } = await supabase
        .from('properties')
        .select('district, property_type, floor_area_sqft')
        .eq('postal_code', input.postalCode)
        .limit(1)
        .maybeSingle();

      const district = anchorProp?.district ?? 'D18';
      const propType = input.propertyType ?? anchorProp?.property_type ?? 'HDB';
      const floorArea = input.targetFloorArea ?? anchorProp?.floor_area_sqft ?? 1000;

      // Step 2: Compute median PSF using a Supabase RPC (requires the function below)
      // Create this function in Supabase SQL editor:
      // CREATE OR REPLACE FUNCTION calculate_median_psf(p_district TEXT, p_property_type TEXT)
      // RETURNS NUMERIC LANGUAGE SQL AS $$
      //   SELECT percentile_cont(0.5) WITHIN GROUP (ORDER BY t.psf)
      //   FROM property_transactions t
      //   JOIN properties p ON p.id = t.property_id
      //   WHERE p.district = p_district AND p.property_type = p_property_type AND t.psf > 0;
      // $$;
      const { data: medianRow, error } = await supabase.rpc('calculate_median_psf', {
        p_district: district,
        p_property_type: propType,
      });
      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
      if (!medianRow) throw new TRPCError({ code: 'NOT_FOUND', message: 'Insufficient comparable transactions to estimate value.' });

      // Step 3: Also compute district-wide median for vsDistrictPct context
      const { data: districtMedianRow } = await supabase.rpc('calculate_median_psf', {
        p_district: district,
        p_property_type: null,  // null = all types in district
      });

      const medianPsf: number = medianRow;
      const districtMedianPsf: number = districtMedianRow ?? medianPsf;
      */
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

