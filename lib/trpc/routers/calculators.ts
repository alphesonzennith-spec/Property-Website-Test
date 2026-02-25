import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure } from '../trpc';
import {
  mockRegulatoryConfig,
  RegulatoryConfigSchema,
} from '@/lib/mock/regulatoryConfig';
import { withMockControl } from '@/lib/mock/mockControls';

export const calculatorsRouter = router({
  /**
   * Fetch the complete regulatory configuration
   * MOCK: Replace with Supabase query when ready
   * SELECT * FROM regulatory_config
   * WHERE effective_date <= NOW()
   * ORDER BY effective_date DESC
   * LIMIT 1
   */
  getRegulatoryRates: publicProcedure.query(async () => {
    return withMockControl('failRegulatoryRates', async () => {
      try {
        // Validate config at runtime with Zod
        const validated = RegulatoryConfigSchema.parse(mockRegulatoryConfig);

        return validated;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to load regulatory configuration',
          cause: error,
        });
      }
    });
  }),

  /**
   * Fetch specific section of regulatory config (performance optimization)
   * MOCK: Replace with targeted Supabase query
   * SELECT stamp_duty FROM regulatory_config WHERE ...
   */
  getRatesForSection: publicProcedure
    .input(
      z.object({
        section: z.enum(['stampDuty', 'borrowing', 'mortgage', 'cpf', 'propertyTax', 'misc', 'cpfRates', 'maintenanceFees']),
      })
    )
    .query(async ({ input }) => {
      try {
        // Simulate database latency
        await new Promise((r) => setTimeout(r, 250));

        const section = mockRegulatoryConfig[input.section];
        if (!section) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Regulatory section '${input.section}' not found`,
          });
        }

        return section;
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to load regulatory section',
          cause: error,
        });
      }
    }),

  /**
   * Get BSD tiers only (most frequently accessed)
   */
  getBSDTiers: publicProcedure.query(async () => {
    try {
      await new Promise((r) => setTimeout(r, 250));

      const bsdTiers = mockRegulatoryConfig.stampDuty?.bsd?.tiers;
      if (!bsdTiers) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'BSD tiers not available in regulatory configuration',
        });
      }

      return bsdTiers;
    } catch (error) {
      if (error instanceof TRPCError) throw error;

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to load BSD tiers',
        cause: error,
      });
    }
  }),

  /**
   * Get ABSD rates only
   */
  getABSDRates: publicProcedure.query(async () => {
    try {
      await new Promise((r) => setTimeout(r, 250));

      const absdRates = mockRegulatoryConfig.stampDuty?.absd?.rates;
      if (!absdRates) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'ABSD rates not available in regulatory configuration',
        });
      }

      return absdRates;
    } catch (error) {
      if (error instanceof TRPCError) throw error;

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to load ABSD rates',
        cause: error,
      });
    }
  }),
});
