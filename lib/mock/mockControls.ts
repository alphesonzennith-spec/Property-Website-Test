/**
 * Mock Controls for Development Testing
 *
 * This module provides toggleable failure/latency simulation for development.
 * Only active when NODE_ENV === 'development'.
 *
 * Use with the MockControlPanel component to test:
 * - Loading states (artificial delays)
 * - Error states (forced failures)
 * - Empty states (empty data)
 * - Edge cases (null images, expired sessions)
 */

import { TRPCError } from '@trpc/server';

export interface MockControls {
  // Latency simulation
  artificialDelay: number;        // Base delay in ms (simulates database latency)
  randomDelayVariance: number;    // Random additional delay 0-N ms

  // Failure simulation
  failPropertiesList: boolean;    // Forces properties.list to throw
  failPropertyDetail: boolean;    // Forces properties.getById to throw
  failRegulatoryRates: boolean;   // Forces getRegulatoryRates to throw
  failAuth: boolean;              // Forces auth to return unauthenticated

  // Data edge cases
  returnEmptyListings: boolean;   // Returns [] for all list queries
  returnNullImages: boolean;      // Sets all property images to []
  returnSlowImages: boolean;      // Simulates slow image loading (2s extra delay)
  simulateExpiredSession: boolean; // Auth returns expired session state
}

/**
 * Global mock control configuration
 * Modify these at runtime using MockControlPanel or programmatically
 */
export const MOCK_CONTROLS: MockControls = {
  // Latency (default: realistic database latency)
  artificialDelay: 250,
  randomDelayVariance: 200,

  // Failures (all off by default)
  failPropertiesList: false,
  failPropertyDetail: false,
  failRegulatoryRates: false,
  failAuth: false,

  // Edge cases (all off by default)
  returnEmptyListings: false,
  returnNullImages: false,
  returnSlowImages: false,
  simulateExpiredSession: false,
};

/**
 * Apply artificial delay based on current MOCK_CONTROLS settings
 * Only delays in development mode
 */
async function applyArtificialDelay(): Promise<void> {
  if (process.env.NODE_ENV !== 'development') return;

  const baseDelay = MOCK_CONTROLS.artificialDelay;
  const variance = Math.random() * MOCK_CONTROLS.randomDelayVariance;
  const totalDelay = baseDelay + variance;

  await new Promise((resolve) => setTimeout(resolve, totalDelay));
}

/**
 * Simulate a failure based on control key
 * Throws TRPCError if the corresponding flag is enabled
 */
function simulateFailure(key: keyof MockControls, errorMessage: string): void {
  if (process.env.NODE_ENV !== 'development') return;
  if (!MOCK_CONTROLS[key]) return;

  throw new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: `[MOCK FAILURE] ${errorMessage}`,
    cause: new Error(`Simulated failure triggered by MOCK_CONTROLS.${key}`),
  });
}

/**
 * Wrap a mock query with resilience controls
 *
 * @param failureKey - The MOCK_CONTROLS key to check for forced failure
 * @param fn - The mock query function to execute
 * @returns Result of fn() after applying delays/failures
 *
 * @example
 * ```typescript
 * return withMockControl('failPropertiesList', () => {
 *   return mockProperties.filter(p => p.district === input.district);
 * });
 * ```
 */
export async function withMockControl<T>(
  failureKey: keyof MockControls,
  fn: () => T | Promise<T>
): Promise<T> {
  // Only apply controls in development
  if (process.env.NODE_ENV !== 'development') {
    return fn();
  }

  // Apply artificial delay
  await applyArtificialDelay();

  // Simulate failure if configured
  const errorMessages: Record<string, string> = {
    failPropertiesList: 'Failed to fetch properties list',
    failPropertyDetail: 'Failed to fetch property details',
    failRegulatoryRates: 'Failed to load regulatory rates',
    failAuth: 'Authentication service unavailable',
  };

  if (failureKey in errorMessages) {
    simulateFailure(failureKey, errorMessages[failureKey]);
  }

  // Execute the actual query
  return fn();
}

/**
 * Reset all mock controls to default state
 */
export function resetMockControls(): void {
  MOCK_CONTROLS.artificialDelay = 250;
  MOCK_CONTROLS.randomDelayVariance = 200;
  MOCK_CONTROLS.failPropertiesList = false;
  MOCK_CONTROLS.failPropertyDetail = false;
  MOCK_CONTROLS.failRegulatoryRates = false;
  MOCK_CONTROLS.failAuth = false;
  MOCK_CONTROLS.returnEmptyListings = false;
  MOCK_CONTROLS.returnNullImages = false;
  MOCK_CONTROLS.returnSlowImages = false;
  MOCK_CONTROLS.simulateExpiredSession = false;
}

/**
 * Apply edge case transformations to data
 * Call this before returning data from mock queries
 */
export function applyEdgeCases<T>(data: T, type: 'list' | 'detail' | 'images'): T {
  if (process.env.NODE_ENV !== 'development') return data;

  // Return empty list
  if (type === 'list' && MOCK_CONTROLS.returnEmptyListings) {
    return [] as T;
  }

  // Strip images from properties
  if (MOCK_CONTROLS.returnNullImages && typeof data === 'object' && data !== null) {
    if (Array.isArray(data)) {
      return data.map((item: any) => {
        if (item && typeof item === 'object' && 'images' in item) {
          return { ...item, images: [] };
        }
        return item;
      }) as T;
    } else if ('images' in data) {
      return { ...data, images: [] } as T;
    }
  }

  return data;
}

/**
 * Get human-readable label for control key
 */
export function getControlLabel(key: keyof MockControls): string {
  const labels: Record<keyof MockControls, string> = {
    artificialDelay: 'Base Delay (ms)',
    randomDelayVariance: 'Random Variance (ms)',
    failPropertiesList: 'Fail: Properties List',
    failPropertyDetail: 'Fail: Property Detail',
    failRegulatoryRates: 'Fail: Regulatory Rates',
    failAuth: 'Fail: Authentication',
    returnEmptyListings: 'Return Empty Lists',
    returnNullImages: 'Return Null Images',
    returnSlowImages: 'Slow Image Loading',
    simulateExpiredSession: 'Expired Session',
  };
  return labels[key];
}
