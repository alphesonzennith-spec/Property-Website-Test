// lib/trpc/routers/agents.ts
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure } from '../trpc';
import { mockAgents, mockProperties } from '@/lib/mock';
import { paginationSchema, createPaginatedResponse, getPaginationRange } from './paginationSchema';
import { withMockControl, applyEdgeCases } from '@/lib/mock/mockControls';

export const agentsRouter = router({

  /** List all agents with their summary stats. */
  list: publicProcedure
    .input(paginationSchema)
    .query(async ({ input }) => {
      // MOCK: Replace with Supabase query:
      // const { data, count } = await supabase
      //   .from('agents')
      //   .select(AGENT_LIST_FIELDS, { count: 'exact' })
      //   .range(start, end)
      //   .order('rating', { ascending: false })
      /* SUPABASE:
      const { from, to } = paginationParams(input.page, input.limit);
      const { data: result, error, count } = await supabase
        .from('agents')
        .select(AGENT_LIST_FIELDS, { count: 'exact' })
        .order('rating', { ascending: false })
        .range(from, to);

      handleSupabaseError(error);
      */
      return withMockControl('failPropertiesList', () => {
        const { start, end } = getPaginationRange(input.page, input.limit);
        const paginatedAgents = mockAgents.slice(start, end + 1);
        const processedItems = applyEdgeCases(paginatedAgents, 'list');

        return createPaginatedResponse(
          processedItems,
          mockAgents.length,
          input.page,
          input.limit
        );
      });
    }),

  /** Fetch a single agent by ID with their active listings. */
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      // MOCK: Replace with Supabase query — SELECT * FROM agents WHERE id = $1; SELECT * FROM properties WHERE agent_id = $1 AND status = 'Active'
      /* SUPABASE (uncomment when database is connected):
      // Agents table does not store name/phone/email directly — those live on profiles.
      // Join profiles via profile_id to get contact and display fields.
      const { data: result, error } = await supabase
        .from('agents')
        .select(`
          id,
          cea_number,
          cea_status,
          agency_name,
          agency_license_number,
          specializations,
          years_experience,
          total_transactions,
          active_listings,
          ratings,
          tier,
          profile:profiles!profile_id(
            id,
            email,
            phone,
            verification_badges
          ),
          properties!agent_id(
            ${PROPERTY_CARD_FIELDS},
            property_images(url, is_primary)
          )
        `)
        .eq('id', input.id)
        .eq('properties.status', 'Active')
        .single();

      if (error) throw new TRPCError({ code: 'NOT_FOUND', message: `Agent ${input.id} not found.` });
      */
      await new Promise((r) => setTimeout(r, 250));

      const agent = mockAgents.find((a) => a.id === input.id);
      if (!agent) {
        throw new TRPCError({ code: 'NOT_FOUND', message: `Agent ${input.id} not found.` });
      }

      const activeListings = mockProperties.filter(
        (p) => p.agentId === input.id && p.status === 'Active'
      );

      return { ...agent, activeListingDetails: activeListings };
    }),

  /**
   * Return all portfolio map transactions for an agent.
   * Each entry includes lat/lng for map pin rendering.
   */
  getPortfolioMap: publicProcedure
    .input(z.object({ agentId: z.string() }))
    .query(async ({ input }) => {
      // MOCK: Replace with Supabase query — SELECT * FROM agent_transactions WHERE agent_id = $1
      /* SUPABASE (uncomment when database is connected):
      // No agent_transactions table exists in the schema.
      // Derive portfolio from property_transactions where the transacted property was listed by this agent.
      // First get all property IDs the agent managed, then fetch transactions for those properties.
      const { data: agentProps } = await supabase
        .from('properties')
        .select('id')
        .eq('agent_id', input.agentId);

      const agentPropertyIds = (agentProps ?? []).map((p) => p.id);

      const { data: result, error } = await supabase
        .from('property_transactions')
        .select(`
          id,
          price,
          transaction_date,
          property:properties!property_id(
            latitude,
            longitude,
            address,
            property_type,
            district
          )
        `)
        .in('property_id', agentPropertyIds)
        .order('transaction_date', { ascending: false });

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
      */
      await new Promise((r) => setTimeout(r, 250));

      const agent = mockAgents.find((a) => a.id === input.agentId);
      if (!agent) {
        throw new TRPCError({ code: 'NOT_FOUND', message: `Agent ${input.agentId} not found.` });
      }

      return { data: agent.portfolioMapData };
    }),
});
