'use client';

import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { MessageThread } from '@/types/messages';

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60)  return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

interface MessageThreadListProps {
  threads: Omit<MessageThread, 'messages'>[];
  activeThreadId: string | null;
  onSelectThread: (id: string) => void;
}

export function MessageThreadList({ threads, activeThreadId, onSelectThread }: MessageThreadListProps) {
  if (threads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <p className="text-xs text-gray-400">No conversations yet</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col divide-y divide-gray-100 overflow-y-auto">
      {threads.map((thread) => (
        <button
          key={thread.id}
          type="button"
          onClick={() => onSelectThread(thread.id)}
          className={cn(
            'flex items-start gap-2.5 px-3 py-3 text-left transition-colors hover:bg-gray-50 w-full',
            activeThreadId === thread.id && 'bg-emerald-50 hover:bg-emerald-50'
          )}
        >
          {/* Avatar */}
          <Avatar className="w-9 h-9 flex-shrink-0">
            <AvatarFallback className="text-xs font-medium bg-gray-200 text-gray-600">
              {getInitials(thread.participantName)}
            </AvatarFallback>
          </Avatar>

          {/* Thread info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <p className={cn(
                'text-xs truncate',
                thread.unreadCount > 0 ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'
              )}>
                {thread.participantName}
              </p>
              <span className="text-[10px] text-gray-400 flex-shrink-0">
                {timeAgo(thread.lastMessageAt)}
              </span>
            </div>
            {thread.propertyAddress && (
              <p className="text-[10px] text-emerald-600 truncate leading-tight">
                {thread.propertyAddress}
              </p>
            )}
            <p className={cn(
              'text-[11px] truncate mt-0.5',
              thread.unreadCount > 0 ? 'text-gray-700 font-medium' : 'text-gray-400'
            )}>
              {thread.lastMessage}
            </p>
          </div>

          {/* Unread badge */}
          {thread.unreadCount > 0 && (
            <Badge className="flex-shrink-0 h-4 min-w-4 px-1 text-[10px] bg-blue-500 hover:bg-blue-500 rounded-full">
              {thread.unreadCount}
            </Badge>
          )}
        </button>
      ))}
    </div>
  );
}
