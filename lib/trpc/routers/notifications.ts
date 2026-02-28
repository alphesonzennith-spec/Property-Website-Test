// lib/trpc/routers/notifications.ts
import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { MOCK_NOTIFICATIONS } from '@/lib/mock/notifications';
import type { Notification } from '@/types/notifications';

// In-memory mutable copy for mock mutations
let mockNotifications: Notification[] = [...MOCK_NOTIFICATIONS];

export const notificationsRouter = router({

  /** Fetch all notifications for the current user. */
  getAll: publicProcedure
    .query(async () => {
      // MOCK: Replace with Supabase query
      // SELECT * FROM notifications WHERE user_id = $currentUser ORDER BY created_at DESC
      await new Promise((r) => setTimeout(r, 150));

      const unreadCount = mockNotifications.filter((n) => !n.isRead).length;
      return { data: mockNotifications, unreadCount };
    }),

  /** Mark a single notification as read. */
  markAsRead: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      // MOCK: Replace with Supabase UPDATE
      // UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $currentUser
      await new Promise((r) => setTimeout(r, 100));

      mockNotifications = mockNotifications.map((n) =>
        n.id === input.id ? { ...n, isRead: true } : n
      );
      return { success: true };
    }),

  /** Mark all notifications as read. */
  markAllAsRead: publicProcedure
    .mutation(async () => {
      // MOCK: Replace with Supabase UPDATE
      // UPDATE notifications SET is_read = true WHERE user_id = $currentUser
      await new Promise((r) => setTimeout(r, 100));

      mockNotifications = mockNotifications.map((n) => ({ ...n, isRead: true }));
      return { success: true };
    }),

  /** Dismiss (delete) a notification. */
  dismiss: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      // MOCK: Replace with Supabase DELETE
      // DELETE FROM notifications WHERE id = $1 AND user_id = $currentUser
      await new Promise((r) => setTimeout(r, 100));

      mockNotifications = mockNotifications.filter((n) => n.id !== input.id);
      return { success: true };
    }),
});
