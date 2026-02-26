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
    /* SUPABASE (uncomment when database is connected):
    // regulatory_config stores one row per section_key (not one row for all config).
    // Fetch all current rows and reassemble into the RegulatoryConfig shape.
    const { data: rows, error } = await supabase
      .from('regulatory_config')
      .select('section_key, config_data');

    if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });

    const byKey = Object.fromEntries((rows ?? []).map((r) => [r.section_key, r.config_data]));

    // Map section_key rows → RegulatoryConfig shape (must match seed data in SupabaseSchema.md)
    const config = {
      stampDuty: {
        bsd:  byKey['stamp_duty_bsd'],
        absd: byKey['stamp_duty_absd'],
        ssd:  byKey['stamp_duty_ssd'],
      },
      borrowing: {
        tdsr: byKey['borrowing_tdsr'],
        msr:  byKey['borrowing_msr'],
        ltv:  byKey['borrowing_ltv'],
      },
      mortgage: {
        hdbLoan:  byKey['mortgage_hdb_loan'],
        bankLoan: byKey['mortgage_bank_loan'],
      },
      cpf: {
        oa: byKey['cpf_oa'],
        sa: byKey['cpf_sa'],
      },
      propertyTax:     byKey['property_tax'],
      maintenanceFees: byKey['maintenance_fees'],
      misc:            byKey['misc'],
      cpfRates:        byKey['cpf_rates'],
    };

    const validated = RegulatoryConfigSchema.parse(config);
    */
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
      /* SUPABASE (uncomment when database is connected):
      // regulatory_config uses row-per-section_key, not per-column.
      // Map the app section name to the relevant section_key(s) in the database.
      const sectionKeyMap: Record<string, string[]> = {
        stampDuty:        ['stamp_duty_bsd', 'stamp_duty_absd', 'stamp_duty_ssd'],
        borrowing:        ['borrowing_tdsr', 'borrowing_msr', 'borrowing_ltv'],
        mortgage:         ['mortgage_hdb_loan', 'mortgage_bank_loan'],
        cpf:              ['cpf_oa', 'cpf_sa'],
        propertyTax:      ['property_tax'],
        maintenanceFees:  ['maintenance_fees'],
        misc:             ['misc'],
        cpfRates:         ['cpf_rates'],
      };

      const keys = sectionKeyMap[input.section];
      if (!keys) throw new TRPCError({ code: 'NOT_FOUND', message: `Regulatory section '${input.section}' not found` });

      const { data: rows, error } = await supabase
        .from('regulatory_config')
        .select('section_key, config_data')
        .in('section_key', keys);

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });

      // For multi-key sections, reassemble into the expected nested shape
      const byKey = Object.fromEntries((rows ?? []).map((r) => [r.section_key, r.config_data]));
      const sectionAssemblers: Record<string, unknown> = {
        stampDuty:       { bsd: byKey['stamp_duty_bsd'], absd: byKey['stamp_duty_absd'], ssd: byKey['stamp_duty_ssd'] },
        borrowing:       { tdsr: byKey['borrowing_tdsr'], msr: byKey['borrowing_msr'], ltv: byKey['borrowing_ltv'] },
        mortgage:        { hdbLoan: byKey['mortgage_hdb_loan'], bankLoan: byKey['mortgage_bank_loan'] },
        cpf:             { oa: byKey['cpf_oa'], sa: byKey['cpf_sa'] },
        propertyTax:     byKey['property_tax'],
        maintenanceFees: byKey['maintenance_fees'],
        misc:            byKey['misc'],
        cpfRates:        byKey['cpf_rates'],
      };
      const result = sectionAssemblers[input.section];
      */
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
   * MOCK: Replace with targeted Supabase query
   */
  getBSDTiers: publicProcedure.query(async () => {
    /* SUPABASE (uncomment when database is connected):
    // Fetch the stamp_duty_bsd row and extract tiers from config_data JSONB.
    // Note: Supabase JS client does not support -> JSONB operators in .select().
    // Fetch the full config_data and access tiers in JS instead.
    const { data: row, error } = await supabase
      .from('regulatory_config')
      .select('config_data')
      .eq('section_key', 'stamp_duty_bsd')
      .single();

    if (error) throw new TRPCError({ code: 'NOT_FOUND', message: 'BSD config not found' });
    const bsdTiers = (row.config_data as { tiers?: unknown[] })?.tiers;
    if (!bsdTiers) throw new TRPCError({ code: 'NOT_FOUND', message: 'BSD tiers not available in regulatory configuration' });
    */
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
   * MOCK: Replace with targeted Supabase query
   */
  getABSDRates: publicProcedure.query(async () => {
    /* SUPABASE (uncomment when database is connected):
    // Fetch the stamp_duty_absd row and extract rates from config_data JSONB.
    // Note: Supabase JS client does not support -> JSONB operators in .select().
    // Fetch the full config_data and access rates in JS instead.
    const { data: row, error } = await supabase
      .from('regulatory_config')
      .select('config_data')
      .eq('section_key', 'stamp_duty_absd')
      .single();

    if (error) throw new TRPCError({ code: 'NOT_FOUND', message: 'ABSD config not found' });
    const absdRates = (row.config_data as { rates?: unknown[] })?.rates;
    if (!absdRates) throw new TRPCError({ code: 'NOT_FOUND', message: 'ABSD rates not available in regulatory configuration' });
    */
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
