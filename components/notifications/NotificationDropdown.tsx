'use client';

import React from 'react';
import { Bell } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { trpc } from '@/lib/trpc/client';
import { useNotificationStore } from '@/lib/store/useNotificationStore';
import { NotificationItem } from './NotificationItem';
import { cn } from '@/lib/utils';

export function NotificationDropdown() {
  const { isOpen, setOpen, markAllLocalRead } = useNotificationStore();
  const notifQuery = trpc.notifications.getAll.useQuery(undefined, { refetchInterval: 30_000 });
  const markAllRead = trpc.notifications.markAllAsRead.useMutation();
  const utils = trpc.useUtils();

  const notifications = notifQuery.data?.data ?? [];
  const unreadCount = notifQuery.data?.unreadCount ?? 0;

  const handleMarkAllRead = () => {
    const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n.id);
    markAllLocalRead(unreadIds);
    markAllRead.mutate(undefined, {
      onSuccess: () => utils.notifications.getAll.invalidate(),
    });
  };

  return (
    <Popover open={isOpen} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white leading-none">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-[360px] p-0 shadow-xl border border-gray-200 rounded-xl overflow-hidden"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">
            Notifications{unreadCount > 0 && ` (${unreadCount})`}
          </h3>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
            >
              Mark all read
            </button>
          )}
        </div>

        {/* Notification list */}
        <ScrollArea className="max-h-[420px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <Bell className="w-10 h-10 text-gray-200 mb-3" />
              <p className="text-sm font-medium text-gray-500">You&apos;re all caught up</p>
              <p className="text-xs text-gray-400 mt-1">No new notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onClose={() => setOpen(false)}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className={cn('border-t border-gray-100 px-4 py-2.5')}>
            <button
              type="button"
              className="w-full text-center text-xs text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
              onClick={() => setOpen(false)}
            >
              View all notifications →
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
