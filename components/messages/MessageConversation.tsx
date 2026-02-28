'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { trpc } from '@/lib/trpc/client';
import { MessageBubble } from './MessageBubble';

interface MessageConversationProps {
  threadId: string;
}

export function MessageConversation({ threadId }: MessageConversationProps) {
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const utils = trpc.useUtils();

  const threadQuery = trpc.messages.getThread.useQuery({ threadId });
  const markRead = trpc.messages.markThreadRead.useMutation();
  const sendMessage = trpc.messages.sendMessage.useMutation({
    onSuccess: () => {
      utils.messages.getThread.invalidate({ threadId });
      utils.messages.getThreads.invalidate();
    },
  });

  const thread = threadQuery.data;

  // Mark thread read on open
  useEffect(() => {
    if (thread && thread.unreadCount > 0) {
      markRead.mutate(
        { threadId },
        { onSuccess: () => utils.messages.getThreads.invalidate() }
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId]);

  // Auto-scroll to bottom within the chat container — avoids scrollIntoView()
  // which scrolls the entire page instead of just the chat panel.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [thread?.messages]);

  const handleSend = () => {
    const body = draft.trim();
    if (!body) return;
    setDraft('');
    sendMessage.mutate({ threadId, body });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!thread) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-gray-400">
        Loading…
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Thread header */}
      <div className="px-4 py-2.5 border-b border-gray-100 flex-shrink-0">
        <p className="text-sm font-semibold text-gray-900">{thread.participantName}</p>
        {thread.propertyAddress && (
          <p className="text-xs text-emerald-600">{thread.propertyAddress}</p>
        )}
      </div>

      {/* Messages — plain overflow div so scrollTop is scoped to this panel only */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3">
        {thread.messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-t border-gray-100 flex-shrink-0">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message…"
          className="flex-1 h-8 text-sm"
          disabled={sendMessage.isPending}
        />
        <Button
          size="icon"
          className="h-8 w-8 flex-shrink-0 bg-emerald-600 hover:bg-emerald-700"
          onClick={handleSend}
          disabled={!draft.trim() || sendMessage.isPending}
          aria-label="Send message"
        >
          <Send className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
