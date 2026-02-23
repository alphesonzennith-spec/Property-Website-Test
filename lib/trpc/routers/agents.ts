// lib/trpc/routers/agents.ts
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure } from '../trpc';
import { mockAgents, mockProperties } from '@/lib/mock';

export const agentsRouter = router({

  /** List all agents with their summary stats. */
  list: publicProcedure
    .query(async () => {
      // MOCK: Replace with Supabase query — SELECT * FROM agents ORDER BY ratings_average DESC
      await new Promise((r) => setTimeout(r, 250));
      return mockAgents;
    }),

  /** Fetch a single agent by ID with their active listings. */
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      // MOCK: Replace with Supabase query — SELECT * FROM agents WHERE id = $1; SELECT * FROM properties WHERE agent_id = $1 AND status = 'Active'
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
      await new Promise((r) => setTimeout(r, 250));

      const agent = mockAgents.find((a) => a.id === input.agentId);
      if (!agent) {
        throw new TRPCError({ code: 'NOT_FOUND', message: `Agent ${input.agentId} not found.` });
      }

      return agent.portfolioMapData;
    }),
});
