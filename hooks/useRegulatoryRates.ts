'use client';

import { trpc } from '@/lib/trpc/client';

// Section key aliases for friendly usage pattern
type SectionAlias =
  | 'borrowingLimits'
  | 'stampDuty'
  | 'borrowing'
  | 'mortgage'
  | 'cpf'
  | 'propertyTax'
  | 'misc';

const SECTION_ALIAS_MAP: Record<SectionAlias, 'stampDuty' | 'borrowing' | 'mortgage' | 'cpf' | 'propertyTax' | 'misc'> = {
  borrowingLimits: 'borrowing',
  stampDuty: 'stampDuty',
  borrowing: 'borrowing',
  mortgage: 'mortgage',
  cpf: 'cpf',
  propertyTax: 'propertyTax',
  misc: 'misc',
};

/**
 * Custom hook to fetch and cache regulatory rates.
 * Uses React Query under the hood via tRPC.
 *
 * Stale time: 1 hour (regulatory rates don't change frequently)
 * Cache time: 24 hours (keep in cache even when unused)
 *
 * @param sectionAlias - Optional friendly section key (e.g. 'borrowingLimits').
 *   When provided, fetches only that section for performance.
 *   When omitted, fetches the full regulatory config.
 */
export function useRegulatoryRates(sectionAlias?: SectionAlias) {
  const section = sectionAlias ? SECTION_ALIAS_MAP[sectionAlias] : undefined;

  // Fetch full config when no section is specified
  const fullQuery = trpc.calculators.getRegulatoryRates.useQuery(undefined, {
    enabled: !section,
    staleTime: 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Fetch section-specific config when section is specified
  const sectionQuery = trpc.calculators.getRatesForSection.useQuery(
    { section: section! },
    {
      enabled: !!section,
      staleTime: 60 * 60 * 1000,
      gcTime: 24 * 60 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    }
  );

  return section ? sectionQuery : fullQuery;
}

/**
 * Fetch only a specific section of regulatory config.
 * Use when you only need one section (e.g., stampDuty).
 */
export function useRegulatorySection(
  section: 'stampDuty' | 'borrowing' | 'mortgage' | 'cpf' | 'propertyTax' | 'misc' | 'cpfRates'
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

/**
 * Fetch CPF interest rates (OA and SA) from regulatory config.
 * Used by the CPF Usage Optimizer calculator.
 */
export function useCPFRates() {
  return trpc.calculators.getRatesForSection.useQuery(
    { section: 'cpfRates' },
    {
      staleTime: 60 * 60 * 1000,
      gcTime: 24 * 60 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    }
  );
}
