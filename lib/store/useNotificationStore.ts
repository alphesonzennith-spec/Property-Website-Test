import { create } from 'zustand';

interface NotificationState {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  localReadIds: Set<string>;
  markLocalRead: (id: string) => void;
  markAllLocalRead: (ids: string[]) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  isOpen: false,
  setOpen: (open) => set({ isOpen: open }),
  localReadIds: new Set(),
  markLocalRead: (id) =>
    set((state) => ({
      localReadIds: new Set([...state.localReadIds, id]),
    })),
  markAllLocalRead: (ids) =>
    set((state) => ({
      localReadIds: new Set([...state.localReadIds, ...ids]),
    })),
}));
