// lib/trpc/routers/learning.ts
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { mockLearningModules } from '@/lib/mock';
import { LearningCategory } from '@/types';

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
      }).optional()
    )
    .query(async ({ input }) => {
      // MOCK: Replace with Supabase query — SELECT * FROM learning_modules WHERE category = $1 ORDER BY completion_count DESC
      await new Promise((r) => setTimeout(r, 250));

      if (!input?.category) return mockLearningModules;
      return mockLearningModules.filter((m) => m.category === input.category);
    }),

  /** Fetch a single learning module's full content by ID. */
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      // MOCK: Replace with Supabase query — SELECT * FROM learning_modules WHERE id = $1
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
      if (!mockLearningModules.some((m) => m.id === input.moduleId)) {
        throw new TRPCError({ code: 'NOT_FOUND', message: `Learning module ${input.moduleId} not found.` });
      }

      const key = `${ctx.userId}:${input.moduleId}`;
      const alreadyCompleted = completions.has(key);
      completions.add(key);

      return {
        moduleId: input.moduleId,
        userId: ctx.userId,
        alreadyCompleted,
        completedAt: new Date().toISOString(),
      };
    }),
});
