'use client';

import React from 'react';
import { MessageSquare } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { trpc } from '@/lib/trpc/client';
import { useMessageStore } from '@/lib/store/useMessageStore';
import { MessageThreadList } from '@/components/messages/MessageThreadList';
import { MessageConversation } from '@/components/messages/MessageConversation';

export default function MessagesPage() {
  const { activeThreadId, setActiveThread } = useMessageStore();
  const threadsQuery = trpc.messages.getThreads.useQuery(undefined, { refetchInterval: 30_000 });

  const threads = threadsQuery.data?.data ?? [];
  const totalUnread = threadsQuery.data?.totalUnread ?? 0;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
            {totalUnread > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                {totalUnread} unread message{totalUnread !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          {/* Main panel */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex h-[calc(100vh-220px)] min-h-[500px]">
            {/* Left: Thread list */}
            <div className="w-72 flex-shrink-0 border-r border-gray-100 flex flex-col">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Conversations
                </p>
              </div>
              <div className="flex-1 overflow-y-auto">
                {threads.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
                    <MessageSquare className="w-12 h-12 text-gray-200 mb-4" />
                    <p className="text-sm font-medium text-gray-500">No conversations yet</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Enquire on a property listing to start a conversation
                    </p>
                  </div>
                ) : (
                  <MessageThreadList
                    threads={threads}
                    activeThreadId={activeThreadId}
                    onSelectThread={setActiveThread}
                  />
                )}
              </div>
            </div>

            {/* Right: Conversation */}
            <div className="flex-1 overflow-hidden">
              {activeThreadId ? (
                <MessageConversation threadId={activeThreadId} />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center px-8">
                  <MessageSquare className="w-14 h-14 text-gray-200 mb-4" />
                  <p className="text-base font-medium text-gray-500">
                    {threads.length > 0 ? 'Select a conversation' : 'No messages yet'}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    {threads.length > 0
                      ? 'Choose a thread on the left to read and reply'
                      : 'Your messages with agents and buyers will appear here'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
