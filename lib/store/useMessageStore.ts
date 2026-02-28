import { create } from 'zustand';

interface MessageState {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  activeThreadId: string | null;
  setActiveThread: (id: string | null) => void;
}

export const useMessageStore = create<MessageState>((set) => ({
  isOpen: false,
  setOpen: (open) => set({ isOpen: open }),
  activeThreadId: null,
  setActiveThread: (id) => set({ activeThreadId: id }),
}));
