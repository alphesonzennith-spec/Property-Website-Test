// lib/trpc/routers/learning.ts
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { mockLearningModules } from '@/lib/mock';
import { LearningCategory } from '@/types';
import { paginationSchema, createPaginatedResponse, getPaginationRange } from './paginationSchema';
import { withMockControl, applyEdgeCases } from '@/lib/mock/mockControls';

// ── In-memory completion store ────────────────────────────────────────────────
// MOCK: Replace with Supabase query — INSERT INTO user_module_completions (user_id, module_id, completed_at)
// Key format: `${userId}:${moduleId}`
const completions = new Set<string>();

export const learningRouter = router({

  /** List all learning modules, optionally filtered by category. */
  list: publicProcedure
    .input(
      z.object({
        category: z.nativeEnum(LearningCategory).optional(),
      }).merge(paginationSchema)
    )
    .query(async ({ input }) => {
      // MOCK: Replace with Supabase query:
      // const { data, count } = await supabase
      //   .from('learning_modules')
      //   .select(LEARNING_MODULE_LIST_FIELDS, { count: 'exact' })
      //   .eq('category', input.category)
      //   .range(start, end)
      //   .order('order_index', { ascending: true })
      /* SUPABASE:
      const { from, to } = paginationParams(input.page, input.limit);
      let query = supabase
        .from('learning_modules')
        .select(LEARNING_MODULE_LIST_FIELDS, { count: 'exact' })
        .order('order_index', { ascending: true })
        .range(from, to);

      if (input.category) query = query.eq('category', input.category);

      const { data: result, error, count } = await query;
      handleSupabaseError(error);
      */
      return withMockControl('failPropertiesList', () => {
        const filtered = input.category
          ? mockLearningModules.filter((m) => m.category === input.category)
          : mockLearningModules;

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

  /** Fetch a single learning module's full content by ID. */
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      // MOCK: Replace with Supabase query — SELECT * FROM learning_modules WHERE id = $1
      /* SUPABASE:
      const { data: result, error } = await supabase
        .from('learning_modules')
        .select(LEARNING_MODULE_DETAIL_FIELDS)
        .eq('id', input.id)
        .single();

      if (error) throw new TRPCError({ code: 'NOT_FOUND', message: `Learning module ${input.id} not found.` });
      handleSupabaseError(error);
      */
      await new Promise((r) => setTimeout(r, 250));

      const module_ = mockLearningModules.find((m) => m.id === input.id);
      if (!module_) {
        throw new TRPCError({ code: 'NOT_FOUND', message: `Learning module ${input.id} not found.` });
      }
      return module_;
    }),

  /**
   * Mark a module as complete for the authenticated user.
   * Uses protectedProcedure — requires userId in context.
   * SINGPASS: Add Singpass verification check here — only Singpass-verified users earn completion credit.
   */
  markComplete: protectedProcedure
    .input(z.object({ moduleId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // MOCK: Replace with Supabase query — INSERT INTO user_module_completions ON CONFLICT DO NOTHING
      /* SUPABASE:
      const { data: result, error } = await supabase
        .from('user_module_completions')
        .upsert(
          { user_id: ctx.userId, module_id: input.moduleId, completed_at: new Date().toISOString() },
          { onConflict: 'user_id,module_id', ignoreDuplicates: false }
        )
        .select('id, completed_at, created_at')
        .single();

      handleSupabaseError(error);
      const alreadyCompleted = result.created_at !== result.completed_at;
      */
      if (!mockLearningModules.some((m) => m.id === input.moduleId)) {
        throw new TRPCError({ code: 'NOT_FOUND', message: `Learning module ${input.moduleId} not found.` });
      }

      const key = `${ctx.userId}:${input.moduleId}`;
      const alreadyCompleted = completions.has(key);
      completions.add(key);

      return {
        success: true,
        data: {
          moduleId: input.moduleId,
          userId: ctx.userId,
          alreadyCompleted,
          completedAt: new Date().toISOString(),
        },
      };
    }),
});
