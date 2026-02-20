import { create } from 'zustand';
import type { PropertyFilters } from '@/lib/trpc/routers/properties';

interface SearchState {
  // Search filters
  filters: Partial<PropertyFilters>;

  // Comparison list (max 3 property IDs)
  comparisonList: string[];

  // AI search tags
  aiTags: string[];

  // Actions
  setFilter: (key: keyof PropertyFilters, value: any) => void;
  setFilters: (filters: Partial<PropertyFilters>) => void;
  resetFilters: () => void;

  addToComparison: (propertyId: string) => boolean;
  removeFromComparison: (propertyId: string) => void;
  clearComparison: () => void;

  setAiTags: (tags: string[]) => void;
  removeAiTag: (tag: string) => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  filters: {},
  comparisonList: [],
  aiTags: [],

  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    })),

  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),

  resetFilters: () =>
    set({ filters: {}, aiTags: [] }),

  addToComparison: (propertyId) => {
    let success = false;
    set((state) => {
      // Max 3 properties in comparison
      if (state.comparisonList.length >= 3) {
        success = false;
        return state;
      }
      // Don't add duplicates
      if (state.comparisonList.includes(propertyId)) {
        success = false;
        return state;
      }
      success = true;
      return {
        comparisonList: [...state.comparisonList, propertyId],
      };
    });
    return success;
  },

  removeFromComparison: (propertyId) =>
    set((state) => ({
      comparisonList: state.comparisonList.filter((id) => id !== propertyId),
    })),

  clearComparison: () =>
    set({ comparisonList: [] }),

  setAiTags: (tags) =>
    set({ aiTags: tags }),

  removeAiTag: (tag) =>
    set((state) => ({
      aiTags: state.aiTags.filter((t) => t !== tag),
    })),
}));
