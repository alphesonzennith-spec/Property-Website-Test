import { create } from 'zustand';

export type PropertyType = 'All' | 'HDB' | 'Condo' | 'Landed' | 'Commercial';
export type TimePeriod = '3M' | '6M' | '1Y' | '3Y' | '5Y';

interface DashboardState {
    propertyType: PropertyType;
    district: string; // 'All' or 'D01' to 'D28'
    timePeriod: TimePeriod;
    setFilters: (filters: Partial<Pick<DashboardState, 'propertyType' | 'district' | 'timePeriod'>>) => void;
    resetFilters: () => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
    propertyType: 'All',
    district: 'All',
    timePeriod: '1Y',
    setFilters: (filters) => set((state) => ({ ...state, ...filters })),
    resetFilters: () => set({ propertyType: 'All', district: 'All', timePeriod: '1Y' }),
}));
