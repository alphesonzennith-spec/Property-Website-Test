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
