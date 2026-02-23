'use client';

import { trpc } from '@/lib/trpc/client';

/**
 * Custom hook to fetch and cache regulatory rates.
 * Uses React Query under the hood via tRPC.
 *
 * Stale time: 1 hour (regulatory rates don't change frequently)
 * Cache time: 24 hours (keep in cache even when unused)
 */
export function useRegulatoryRates() {
  return trpc.calculators.getRegulatoryRates.useQuery(undefined, {
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 24 * 60 * 60 * 1000, // 24 hours (formerly cacheTime in React Query v4)
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

/**
 * Fetch only a specific section of regulatory config.
 * Use when you only need one section (e.g., stampDuty).
 */
export function useRegulatorySection(
  section: 'stampDuty' | 'borrowing' | 'mortgage' | 'cpf' | 'propertyTax' | 'misc'
) {
  return trpc.calculators.getRatesForSection.useQuery(
    { section },
    {
      staleTime: 60 * 60 * 1000, // 1 hour
      gcTime: 24 * 60 * 60 * 1000, // 24 hours
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    }
  );
}

/**
 * Optimized hook for BSD tiers only (most frequently used).
 */
export function useBSDTiers() {
  return trpc.calculators.getBSDTiers.useQuery(undefined, {
    staleTime: 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

/**
 * Optimized hook for ABSD rates only.
 */
export function useABSDRates() {
  return trpc.calculators.getABSDRates.useQuery(undefined, {
    staleTime: 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}
