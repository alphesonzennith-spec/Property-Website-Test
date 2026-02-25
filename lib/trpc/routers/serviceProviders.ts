// lib/trpc/routers/serviceProviders.ts
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure } from '../trpc';
import { mockServiceProviders } from '@/lib/mock';
import { ServiceProviderType } from '@/types';
import { paginationSchema, createPaginatedResponse, getPaginationRange } from './paginationSchema';
import { withMockControl, applyEdgeCases } from '@/lib/mock/mockControls';

export const serviceProvidersRouter = router({

  /** List all service providers, optionally filtered by type. */
  list: publicProcedure
    .input(
      z.object({
        type: z.nativeEnum(ServiceProviderType).optional(),
      }).merge(paginationSchema)
    )
    .query(async ({ input }) => {
      // MOCK: Replace with Supabase query:
      // const { data, count } = await supabase
      //   .from('service_providers')
      //   .select(SERVICE_PROVIDER_LIST_FIELDS, { count: 'exact' })
      //   .eq('type', input.type)
      //   .range(start, end)
      //   .order('rating', { ascending: false })
      return withMockControl('failPropertiesList', () => {
        const filtered = input.type
          ? mockServiceProviders.filter((sp) => sp.type === input.type)
          : mockServiceProviders;

        const { start, end } = getPaginationRange(input.page, input.limit);
        const paginated = filtered.slice(start, end + 1);
        const processedItems = applyEdgeCases(paginated, 'list');

        return createPaginatedResponse(
          processedItems,
          filtered.length,
          input.page,
          input.limit
        );
      });
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
