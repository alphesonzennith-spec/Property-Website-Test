// lib/trpc/routers/users.ts
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure } from '../trpc';
import { mockUsers, mockFamilies, mockProperties } from '@/lib/mock';
import { paginationSchema, createPaginatedResponse, getPaginationRange } from './paginationSchema';

export const usersRouter = router({

  /** Fetch a user's full profile by ID. */
  getProfile: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      // MOCK: Replace with Supabase query — SELECT * FROM user_profiles WHERE id = $1
      // SINGPASS: Add Singpass verification check here — verify caller is fetching their own profile or is Admin
      await new Promise((r) => setTimeout(r, 250));

      const user = mockUsers.find((u) => u.id === input.userId);
      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND', message: `User ${input.userId} not found.` });
      }
      return user;
    }),

  /** Fetch a family group and all its members' basic details. */
  getFamilyGroup: publicProcedure
    .input(z.object({ familyGroupId: z.string() }))
    .query(async ({ input }) => {
      // MOCK: Replace with Supabase query — SELECT * FROM family_groups WHERE id = $1 with members JOIN
      // SINGPASS: Add Singpass verification check here — verify caller is a member of this family group
      await new Promise((r) => setTimeout(r, 250));

      const family = mockFamilies.find((f) => f.id === input.familyGroupId);
      if (!family) {
        throw new TRPCError({ code: 'NOT_FOUND', message: `Family group ${input.familyGroupId} not found.` });
      }

      const enrichedMembers = family.members.map((member) => {
        const user = mockUsers.find((u) => u.id === member.userId);
        return {
          ...member,
          displayName: user?.singpassVerification.name ?? 'Unknown',
          singpassVerified: user?.singpassVerification.verified ?? false,
        };
      });

      return { ...family, members: enrichedMembers };
    }),

  /** Return the eligibility dashboard for a user. */
  getEligibilityDashboard: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      // MOCK: Replace with Supabase query — JOIN user_profiles + family_groups + eligibility_summaries
      // SINGPASS: Add Singpass verification check here — assert singpassVerified before exposing eligibility
      await new Promise((r) => setTimeout(r, 250));

      const user = mockUsers.find((u) => u.id === input.userId);
      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND', message: `User ${input.userId} not found.` });
      }

      const familyGroup = user.familyGroupId
        ? (mockFamilies.find((f) => f.id === user.familyGroupId) ?? null)
        : null;

      return {
        userId: user.id,
        residencyStatus: user.residencyStatus,
        singpassVerified: user.singpassVerification.verified,
        familyGroupId: user.familyGroupId ?? null,
        familyName: familyGroup?.name ?? null,
        eligibilitySummary: familyGroup?.eligibilitySummary ?? null,
      };
    }),

  /** Return all properties owned, renting, or previously transacted by a user. */
  getPortfolio: publicProcedure
    .input(
      z.object({ userId: z.string().uuid() }).merge(paginationSchema)
    )
    .query(async ({ input }) => {
      // MOCK: Replace with Supabase query:
      // const { data: owned, count } = await supabase
      //   .from('properties')
      //   .select(PROPERTY_CARD_FIELDS, { count: 'exact' })
      //   .eq('owner_id', input.userId)
      //   .range(start, end)
      // SINGPASS: Add Singpass verification check here — verify caller is the portfolio owner or Admin
      await new Promise((r) => setTimeout(r, 250));

      const user = mockUsers.find((u) => u.id === input.userId);
      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND', message: `User ${input.userId} not found.` });
      }

      // Paginate owned properties (typically the largest list)
      const allOwned = mockProperties.filter((p) => p.ownerId === input.userId);
      const { start, end } = getPaginationRange(input.page, input.limit);
      const paginatedOwned = allOwned.slice(start, end + 1);

      // Transaction histories remain unpaginated (typically small lists for display)
      const bought = user.buyHistory
        .map((tx) => mockProperties.find((p) => p.id === tx.propertyId))
        .filter((p): p is NonNullable<typeof p> => p !== undefined);
      const sold   = user.sellHistory
        .map((tx) => mockProperties.find((p) => p.id === tx.propertyId))
        .filter((p): p is NonNullable<typeof p> => p !== undefined);
      const rented = user.rentHistory
        .map((tx) => mockProperties.find((p) => p.id === tx.propertyId))
        .filter((p): p is NonNullable<typeof p> => p !== undefined);

      return {
        owned: createPaginatedResponse(
          paginatedOwned,
          allOwned.length,
          input.page,
          input.limit
        ),
        bought,
        sold,
        rented,
        buyHistory:  user.buyHistory,
        sellHistory: user.sellHistory,
        rentHistory: user.rentHistory,
      };
    }),
});
