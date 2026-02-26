// lib/trpc/routers/users.ts
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure } from '../trpc';
import { mockUsers, mockFamilies, mockProperties } from '@/lib/mock';
import { paginationSchema, createPaginatedResponse, getPaginationRange } from './paginationSchema';
import { withMockControl, applyEdgeCases } from '@/lib/mock/mockControls';
import { normalizeDates } from '@/lib/utils/dateTransformers';

export const usersRouter = router({

  /** Fetch a user's full profile by ID. */
  getProfile: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      // MOCK: Replace with Supabase query — SELECT * FROM user_profiles WHERE id = $1
      // SINGPASS: Add Singpass verification check here — verify caller is fetching their own profile or is Admin
      /* SUPABASE (uncomment when database is connected):
      // profiles extends auth.users — it is the correct table (not user_profiles)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, phone, role, residency_status, preferences, verification_badges, created_at, updated_at')
        .eq('id', input.userId)
        .single();

      if (profileError) throw new TRPCError({ code: 'NOT_FOUND', message: `User ${input.userId} not found.` });

      // Fetch Singpass verification row separately (may not exist for unverified users)
      const { data: verification } = await supabase
        .from('singpass_verifications')
        .select('verified, verified_at, verification_method, name, nationality, date_of_birth, home_address')
        .eq('user_id', input.userId)
        .maybeSingle();

      const result = { ...profile, singpassVerification: verification ?? null };
      */
      await new Promise((r) => setTimeout(r, 250));

      const user = mockUsers.find((u) => u.id === input.userId);
      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND', message: `User ${input.userId} not found.` });
      }
      return normalizeDates(user);
    }),

  /** Fetch a family group and all its members' basic details. */
  getFamilyGroup: publicProcedure
    .input(z.object({ familyGroupId: z.string() }))
    .query(async ({ input }) => {
      // MOCK: Replace with Supabase query — SELECT * FROM family_groups WHERE id = $1 with members JOIN
      // SINGPASS: Add Singpass verification check here — verify caller is a member of this family group
      /* SUPABASE (uncomment when database is connected):
      // family_members is the correct junction table (not family_group_members)
      // Member display name and singpass status live in profiles + singpass_verifications
      const { data: result, error } = await supabase
        .from('family_groups')
        .select(`
          id,
          name,
          eligibility_summary,
          head_user_id,
          members:family_members(
            id,
            user_id,
            role,
            relationship,
            added_at,
            profile:profiles!user_id(
              email,
              singpass_verifications(verified, name)
            )
          )
        `)
        .eq('id', input.familyGroupId)
        .single();

      if (error) throw new TRPCError({ code: 'NOT_FOUND', message: `Family group ${input.familyGroupId} not found.` });
      */
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

      return normalizeDates({ ...family, members: enrichedMembers });
    }),

  /** Return the eligibility dashboard for a user. */
  getEligibilityDashboard: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      // MOCK: Replace with Supabase query — JOIN user_profiles + family_groups + eligibility_summaries
      // SINGPASS: Add Singpass verification check here — assert singpassVerified before exposing eligibility
      /* SUPABASE (uncomment when database is connected):
      // profiles has residency_status. singpass_verifications has verified.
      // Family membership is via family_members or family_groups.head_user_id — no direct FK on profiles.
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, residency_status')
        .eq('id', input.userId)
        .single();

      if (error) throw new TRPCError({ code: 'NOT_FOUND', message: `User ${input.userId} not found.` });

      const { data: verification } = await supabase
        .from('singpass_verifications')
        .select('verified')
        .eq('user_id', input.userId)
        .maybeSingle();

      // Find family group where user is a member
      const { data: membership } = await supabase
        .from('family_members')
        .select('family_group_id, family_groups!inner(id, name, eligibility_summary)')
        .eq('user_id', input.userId)
        .limit(1)
        .maybeSingle();

      // Also check if user is head of a family group (no family_members row for head)
      const { data: headGroup } = !membership
        ? await supabase
            .from('family_groups')
            .select('id, name, eligibility_summary')
            .eq('head_user_id', input.userId)
            .limit(1)
            .maybeSingle()
        : { data: null };

      const familyGroup = membership?.family_groups ?? headGroup ?? null;
      */
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
      /* SUPABASE (uncomment when database is connected):
      const { start, end } = getPaginationRange(input.page, input.limit);

      // Owned properties (paginated — potentially the largest list)
      const { data: ownedData, error: ownedError, count: ownedCount } = await supabase
        .from('properties')
        .select(`${PROPERTY_CARD_FIELDS}, property_images(url, is_primary)`, { count: 'exact' })
        .eq('owner_id', input.userId)
        .order('created_at', { ascending: false })
        .range(start, end);

      if (ownedError) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: ownedError.message });

      // Bought: transactions where user is buyer
      const { data: boughtTx, error: boughtError } = await supabase
        .from('property_transactions')
        .select(`
          id, transaction_date, price, psf,
          property:properties!property_id(${PROPERTY_CARD_FIELDS}, property_images(url, is_primary))
        `)
        .eq('buyer_id', input.userId)
        .order('transaction_date', { ascending: false });

      if (boughtError) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: boughtError.message });

      // Sold: transactions where user is seller
      const { data: soldTx, error: soldError } = await supabase
        .from('property_transactions')
        .select(`
          id, transaction_date, price, psf,
          property:properties!property_id(${PROPERTY_CARD_FIELDS}, property_images(url, is_primary))
        `)
        .eq('seller_id', input.userId)
        .order('transaction_date', { ascending: false });

      if (soldError) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: soldError.message });

      // Note: Rent history is not tracked in the current schema (no rented_by_id FK).
      // A user_saved_properties table exists but tracks saves, not active tenancies.
      // Add a tenancies table if rent history tracking is required.
      */
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

      return normalizeDates({
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
      });
    }),
});
