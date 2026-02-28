// lib/trpc/routers/messages.ts
import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { MOCK_THREADS, CURRENT_USER_ID_EXPORT as CURRENT_USER_ID } from '@/lib/mock/messages';
import type { MessageThread, Message } from '@/types/messages';

// In-memory mutable copy for mock mutations
let mockThreads: MessageThread[] = [...MOCK_THREADS].map((t) => ({
  ...t,
  messages: [...t.messages],
}));

export const messagesRouter = router({

  /** Fetch all message threads for the current user. */
  getThreads: publicProcedure
    .query(async () => {
      // MOCK: Replace with Supabase query
      // SELECT * FROM message_threads WHERE participant_ids @> ARRAY[$currentUser] ORDER BY last_message_at DESC
      await new Promise((r) => setTimeout(r, 150));

      const totalUnread = mockThreads.reduce((sum, t) => sum + t.unreadCount, 0);
      // Return threads without full message history for the list view
      const threads = mockThreads.map(({ messages: _, ...t }) => t);
      return { data: threads, totalUnread };
    }),

  /** Fetch a single thread with full message history. */
  getThread: publicProcedure
    .input(z.object({ threadId: z.string() }))
    .query(async ({ input }) => {
      // MOCK: Replace with Supabase query
      // SELECT * FROM messages WHERE thread_id = $1 ORDER BY created_at ASC
      await new Promise((r) => setTimeout(r, 100));

      const thread = mockThreads.find((t) => t.id === input.threadId);
      if (!thread) return null;
      return thread;
    }),

  /** Send a message in a thread. */
  sendMessage: publicProcedure
    .input(z.object({ threadId: z.string(), body: z.string().min(1).max(2000) }))
    .mutation(async ({ input }) => {
      // MOCK: Replace with Supabase INSERT
      // INSERT INTO messages (thread_id, sender_id, body) VALUES ($1, $currentUser, $2)
      await new Promise((r) => setTimeout(r, 100));

      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        threadId: input.threadId,
        senderId: CURRENT_USER_ID,
        senderName: 'You',
        body: input.body,
        createdAt: new Date(),
        isRead: true,
      };

      mockThreads = mockThreads.map((t) => {
        if (t.id !== input.threadId) return t;
        return {
          ...t,
          messages: [...t.messages, newMessage],
          lastMessage: input.body,
          lastMessageAt: newMessage.createdAt,
        };
      });

      return { data: newMessage };
    }),

  /** Mark all messages in a thread as read (zeros unread count). */
  markThreadRead: publicProcedure
    .input(z.object({ threadId: z.string() }))
    .mutation(async ({ input }) => {
      // MOCK: Replace with Supabase UPDATE
      // UPDATE messages SET is_read = true WHERE thread_id = $1 AND sender_id != $currentUser
      await new Promise((r) => setTimeout(r, 100));

      mockThreads = mockThreads.map((t) => {
        if (t.id !== input.threadId) return t;
        return {
          ...t,
          unreadCount: 0,
          messages: t.messages.map((m) => ({ ...m, isRead: true })),
        };
      });

      return { success: true };
    }),
});
