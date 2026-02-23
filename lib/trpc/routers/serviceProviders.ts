// lib/trpc/routers/serviceProviders.ts
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure } from '../trpc';
import { mockServiceProviders } from '@/lib/mock';
import { ServiceProviderType } from '@/types';

export const serviceProvidersRouter = router({

  /** List all service providers, optionally filtered by type. */
  list: publicProcedure
    .input(
      z.object({
        type: z.nativeEnum(ServiceProviderType).optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      // MOCK: Replace with Supabase query — SELECT * FROM service_providers WHERE type = $1
      await new Promise((r) => setTimeout(r, 250));

      if (!input?.type) return mockServiceProviders;
      return mockServiceProviders.filter((sp) => sp.type === input.type);
    }),

  /** Fetch a single service provider's full profile. */
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      // MOCK: Replace with Supabase query — SELECT * FROM service_providers WHERE id = $1
      await new Promise((r) => setTimeout(r, 250));

      const provider = mockServiceProviders.find((sp) => sp.id === input.id);
      if (!provider) {
        throw new TRPCError({ code: 'NOT_FOUND', message: `Service provider ${input.id} not found.` });
      }
      return provider;
    }),
});
