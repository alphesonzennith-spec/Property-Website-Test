import { z } from 'zod';

/**
 * Standard pagination input schema
 * - page: 1-indexed page number (default: 1)
 * - limit: items per page, max 100 (default: 20)
 */
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

/**
 * Standard paginated response type
 */
export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

/**
 * Helper function to create paginated responses
 * @param items - Array of items for current page
 * @param total - Total count of all items (unpaginated)
 * @param page - Current page number
 * @param limit - Items per page
 * @returns Standardized paginated response object
 */
export function createPaginatedResponse<T>(
  items: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> {
  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Calculate start and end indices for array slicing or database range queries
 * @param page - Current page number (1-indexed)
 * @param limit - Items per page
 * @returns Object with start (0-indexed for arrays) and end (inclusive for Supabase .range())
 */
export function getPaginationRange(page: number, limit: number) {
  const start = (page - 1) * limit;
  const end = start + limit - 1; // Supabase .range() uses inclusive end
  return { start, end };
}
