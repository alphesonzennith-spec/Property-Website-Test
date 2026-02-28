'use client';

import React from 'react';
import Link from 'next/link';
import { MessageSquare, TrendingDown, CheckCircle, FileText, ShieldCheck, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { trpc } from '@/lib/trpc/client';
import { useNotificationStore } from '@/lib/store/useNotificationStore';
import type { Notification, NotificationType } from '@/types/notifications';

const TYPE_CONFIG: Record<NotificationType, { icon: React.ElementType; color: string; bg: string }> = {
  new_message:         { icon: MessageSquare, color: 'text-blue-600',   bg: 'bg-blue-50' },
  enquiry_reply:       { icon: MessageSquare, color: 'text-violet-600', bg: 'bg-violet-50' },
  price_drop:          { icon: TrendingDown,  color: 'text-rose-600',   bg: 'bg-rose-50' },
  listing_status:      { icon: FileText,      color: 'text-emerald-600',bg: 'bg-emerald-50' },
  verification_update: { icon: ShieldCheck,   color: 'text-amber-600',  bg: 'bg-amber-50' },
};

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60)  return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

interface NotificationItemProps {
  notification: Notification;
  onClose?: () => void;
}

export function NotificationItem({ notification, onClose }: NotificationItemProps) {
  const { localReadIds, markLocalRead } = useNotificationStore();
  const markAsRead = trpc.notifications.markAsRead.useMutation();
  const dismiss = trpc.notifications.dismiss.useMutation();
  const utils = trpc.useUtils();

  const isRead = notification.isRead || localReadIds.has(notification.id);
  const config = TYPE_CONFIG[notification.type];
  const Icon = config.icon;

  const handleClick = () => {
    if (!isRead) {
      markLocalRead(notification.id);
      markAsRead.mutate(
        { id: notification.id },
        { onSuccess: () => utils.notifications.getAll.invalidate() }
      );
    }
    onClose?.();
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dismiss.mutate(
      { id: notification.id },
      { onSuccess: () => utils.notifications.getAll.invalidate() }
    );
  };

  const content = (
    <div
      className={cn(
        'group flex items-start gap-3 px-4 py-3 transition-colors hover:bg-gray-50 relative',
        !isRead && 'bg-blue-50/40'
      )}
    >
      {/* Type Icon */}
      <div className={cn('flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center mt-0.5', config.bg)}>
        <Icon className={cn('w-4 h-4', config.color)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm text-gray-900 leading-snug', !isRead && 'font-semibold')}>
          {notification.title}
        </p>
        <p className="text-xs text-gray-500 mt-0.5 leading-snug line-clamp-2">
          {notification.body}
        </p>
        <p className="text-xs text-gray-400 mt-1">{timeAgo(notification.createdAt)}</p>
      </div>

      {/* Unread dot + dismiss */}
      <div className="flex-shrink-0 flex flex-col items-center gap-2 mt-1">
        {!isRead && (
          <span className="w-2 h-2 rounded-full bg-blue-500" />
        )}
        <button
          type="button"
          onClick={handleDismiss}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-gray-200"
          aria-label="Dismiss notification"
        >
          <X className="w-3 h-3 text-gray-400" />
        </button>
      </div>
    </div>
  );

  if (notification.href) {
    return (
      <Link href={notification.href} onClick={handleClick} className="block">
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={handleClick} className="w-full text-left">
      {content}
    </button>
  );
}
