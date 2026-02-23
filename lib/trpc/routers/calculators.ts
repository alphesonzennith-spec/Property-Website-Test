import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import {
  mockRegulatoryConfig,
  RegulatoryConfigSchema,
} from '@/lib/mock/regulatoryConfig';

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
    // Simulate database latency
    await new Promise((r) => setTimeout(r, 250));

    // Validate config at runtime with Zod
    const validated = RegulatoryConfigSchema.parse(mockRegulatoryConfig);

    return validated;
  }),

  /**
   * Fetch specific section of regulatory config (performance optimization)
   * MOCK: Replace with targeted Supabase query
   * SELECT stamp_duty FROM regulatory_config WHERE ...
   */
  getRatesForSection: publicProcedure
    .input(
      z.object({
        section: z.enum(['stampDuty', 'borrowing', 'mortgage', 'cpf', 'propertyTax', 'misc']),
      })
    )
    .query(async ({ input }) => {
      // Simulate database latency
      await new Promise((r) => setTimeout(r, 250));

      return mockRegulatoryConfig[input.section];
    }),

  /**
   * Get BSD tiers only (most frequently accessed)
   */
  getBSDTiers: publicProcedure.query(async () => {
    await new Promise((r) => setTimeout(r, 250));
    return mockRegulatoryConfig.stampDuty.bsd.tiers;
  }),

  /**
   * Get ABSD rates only
   */
  getABSDRates: publicProcedure.query(async () => {
    await new Promise((r) => setTimeout(r, 250));
    return mockRegulatoryConfig.stampDuty.absd.rates;
  }),
});
