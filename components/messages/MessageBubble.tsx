'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { Message } from '@/types/messages';

const CURRENT_USER_ID = 'user-current';

function timeLabel(date: Date): string {
  const d = new Date(date);
  return d.toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit', hour12: true });
}

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isOwn = message.senderId === CURRENT_USER_ID;

  return (
    <div className={cn('flex flex-col gap-0.5 mb-2', isOwn ? 'items-end' : 'items-start')}>
      {!isOwn && (
        <span className="text-[11px] text-gray-400 px-1">{message.senderName}</span>
      )}
      <div
        className={cn(
          'max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed',
          isOwn
            ? 'bg-emerald-600 text-white rounded-br-sm'
            : 'bg-gray-100 text-gray-900 rounded-bl-sm'
        )}
      >
        {message.body}
      </div>
      <span className="text-[10px] text-gray-400 px-1">{timeLabel(message.createdAt)}</span>
    </div>
  );
}
