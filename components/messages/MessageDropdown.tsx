'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, MessageSquare } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc/client';
import { useMessageStore } from '@/lib/store/useMessageStore';
import { MessageThreadList } from './MessageThreadList';
import { MessageConversation } from './MessageConversation';

export function MessageDropdown() {
  const { isOpen, setOpen, activeThreadId, setActiveThread } = useMessageStore();
  const threadsQuery = trpc.messages.getThreads.useQuery(undefined, { refetchInterval: 30_000 });

  const threads = threadsQuery.data?.data ?? [];
  const totalUnread = threadsQuery.data?.totalUnread ?? 0;

  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    if (!open) setActiveThread(null);
  };

  const handleSelectThread = (id: string) => {
    setActiveThread(id);
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          aria-label={`Messages${totalUnread > 0 ? ` (${totalUnread} unread)` : ''}`}
        >
          <MessageSquare className="h-5 w-5" />
          {totalUnread > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white leading-none">
              {totalUnread > 9 ? '9+' : totalUnread}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-[640px] p-0 shadow-xl border border-gray-200 rounded-xl overflow-hidden"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">
            Messages{totalUnread > 0 && ` (${totalUnread} unread)`}
          </h3>
          <Link
            href="/messages"
            onClick={() => setOpen(false)}
            className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
          >
            Open full page
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Body: two-column layout */}
        <div className="flex h-[420px]">
          {/* Left: Thread List */}
          <div className="w-[220px] flex-shrink-0 border-r border-gray-100 overflow-y-auto">
            {threads.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4 py-8">
                <MessageSquare className="w-10 h-10 text-gray-200 mb-3" />
                <p className="text-sm font-medium text-gray-500">No messages yet</p>
                <p className="text-xs text-gray-400 mt-1">
                  Enquire on a listing to start a conversation
                </p>
              </div>
            ) : (
              <MessageThreadList
                threads={threads}
                activeThreadId={activeThreadId}
                onSelectThread={handleSelectThread}
              />
            )}
          </div>

          {/* Right: Conversation */}
          <div className="flex-1 overflow-hidden">
            {activeThreadId ? (
              <MessageConversation threadId={activeThreadId} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center px-6">
                <MessageSquare className="w-10 h-10 text-gray-200 mb-3" />
                <p className="text-sm text-gray-400">
                  {threads.length > 0
                    ? 'Select a conversation to read and reply'
                    : 'Your messages will appear here'}
                </p>
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
