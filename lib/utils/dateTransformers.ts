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
