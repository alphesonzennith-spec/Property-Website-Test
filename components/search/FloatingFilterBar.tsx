'use client';

import React, { useState } from 'react';
import { ChevronDown, X, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FilterSidebar } from './FilterSidebar';
import { useSearchStore } from '@/lib/store';

// --- Quick filter options ---
const PRICE_OPTIONS = [
    { label: 'Any', min: undefined, max: undefined },
    { label: 'Under S$500K', min: 0, max: 500000 },
    { label: 'S$500K – S$1M', min: 500000, max: 1000000 },
    { label: 'S$1M – S$2M', min: 1000000, max: 2000000 },
    { label: 'S$2M – S$5M', min: 2000000, max: 5000000 },
    { label: 'S$5M+', min: 5000000, max: undefined },
];

const PROPERTY_TYPE_OPTIONS = [
    { label: 'Any', value: undefined },
    { label: 'HDB', value: 'hdb' },
    { label: 'Condo', value: 'condo' },
    { label: 'Landed', value: 'landed' },
    { label: 'Executive Condo', value: 'ec' },
    { label: 'Commercial', value: 'commercial' },
];

const BEDROOM_OPTIONS = [
    { label: 'Any', value: undefined },
    { label: '1+', value: 1 },
    { label: '2+', value: 2 },
    { label: '3+', value: 3 },
    { label: '4+', value: 4 },
    { label: '5+', value: 5 },
];

const BATHROOM_OPTIONS = [
    { label: 'Any', value: undefined },
    { label: '1+', value: 1 },
    { label: '2+', value: 2 },
    { label: '3+', value: 3 },
    { label: '4+', value: 4 },
];

const TENURE_OPTIONS = [
    { label: 'Any', value: undefined },
    { label: 'Freehold', value: 'Freehold' },
    { label: '99-year Lease', value: 'Leasehold99' },
    { label: '999-year Lease', value: 'Leasehold999' },
];

const FURNISHING_OPTIONS = [
    { label: 'Any', value: undefined },
    { label: 'Unfurnished', value: 'Unfurnished' },
    { label: 'Partial', value: 'PartialFurnished' },
    { label: 'Fully Furnished', value: 'FullyFurnished' },
];

// --- Reusable single-select popover ---
interface QuickFilterProps {
    label: string;
    displayValue: string;
    isActive: boolean;
    children: React.ReactNode;
}

function QuickFilter({ label, displayValue, isActive, children }: QuickFilterProps) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all shrink-0 ${isActive
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                        }`}
                >
                    <span>{isActive ? displayValue : label}</span>
                    <ChevronDown className="w-3.5 h-3.5 opacity-60 shrink-0" />
                </button>
            </PopoverTrigger>
            <PopoverContent className="p-2 w-44" align="start">
                {children}
            </PopoverContent>
        </Popover>
    );
}

// --- Main Floating Filter Bar ---
interface FloatingFilterBarProps {
    className?: string;
}

export function FloatingFilterBar({ className }: FloatingFilterBarProps) {
    const { filters, setFilter, resetFilters } = useSearchStore();
    const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);

    // Derived display values
    const priceDisplay = (() => {
        if (!filters.priceMin && !filters.priceMax) return 'Price';
        if (filters.priceMax) return `Up to S$${(filters.priceMax / 1000).toFixed(0)}K`;
        return `S$${(filters.priceMin! / 1000000).toFixed(1)}M+`;
    })();

    const typeDisplay = filters.propertyType
        ? PROPERTY_TYPE_OPTIONS.find((o) => o.value === filters.propertyType)?.label ?? 'Type'
        : 'Property Type';

    const bedsDisplay = filters.bedroomsMin ? `${filters.bedroomsMin}+ Beds` : 'Bedrooms';
    const bathsDisplay = filters.bathroomsMin ? `${filters.bathroomsMin}+ Baths` : 'Bathrooms';

    const hasActiveFilters =
        filters.priceMin !== undefined ||
        filters.priceMax !== undefined ||
        filters.propertyType !== undefined ||
        filters.bedroomsMin !== undefined ||
        filters.bathroomsMin !== undefined ||
        filters.tenure !== undefined ||
        filters.furnishing !== undefined ||
        filters.ownerSingpassVerified === true;

    return (
        <div className={`flex flex-col items-center w-full ${className}`}>
            {/* Floating bar - one row, horizontally scrollable if needed */}
            <div className="flex flex-nowrap items-center gap-1.5 p-2 bg-white border border-gray-200 rounded-xl shadow-sm w-fit max-w-full overflow-x-auto no-scrollbar scroll-smooth">
                {/* --- Price --- */}
                <QuickFilter
                    label="Price"
                    displayValue={priceDisplay}
                    isActive={!!filters.priceMin || !!filters.priceMax}
                >
                    {PRICE_OPTIONS.map((opt) => (
                        <button
                            key={opt.label}
                            type="button"
                            onClick={() => {
                                setFilter('priceMin', opt.min);
                                setFilter('priceMax', opt.max);
                            }}
                            className={`w-full text-left px-3 py-1.5 text-sm rounded-md hover:bg-gray-50 ${filters.priceMin === opt.min && filters.priceMax === opt.max
                                ? 'text-emerald-700 font-medium'
                                : 'text-gray-700'
                                }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </QuickFilter>

                {/* --- Property Type --- */}
                <QuickFilter
                    label="Property Type"
                    displayValue={typeDisplay}
                    isActive={!!filters.propertyType}
                >
                    {PROPERTY_TYPE_OPTIONS.map((opt) => (
                        <button
                            key={opt.label}
                            type="button"
                            onClick={() => setFilter('propertyType', opt.value)}
                            className={`w-full text-left px-3 py-1.5 text-sm rounded-md hover:bg-gray-50 ${filters.propertyType === opt.value ? 'text-emerald-700 font-medium' : 'text-gray-700'
                                }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </QuickFilter>

                {/* --- Bedrooms --- */}
                <QuickFilter
                    label="Bedrooms"
                    displayValue={bedsDisplay}
                    isActive={!!filters.bedroomsMin}
                >
                    {BEDROOM_OPTIONS.map((opt) => (
                        <button
                            key={opt.label}
                            type="button"
                            onClick={() => setFilter('bedroomsMin', opt.value)}
                            className={`w-full text-left px-3 py-1.5 text-sm rounded-md hover:bg-gray-50 ${filters.bedroomsMin === opt.value ? 'text-emerald-700 font-medium' : 'text-gray-700'
                                }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </QuickFilter>

                {/* --- Bathrooms --- */}
                <QuickFilter
                    label="Bathrooms"
                    displayValue={bathsDisplay}
                    isActive={!!filters.bathroomsMin}
                >
                    {BATHROOM_OPTIONS.map((opt) => (
                        <button
                            key={opt.label}
                            type="button"
                            onClick={() => setFilter('bathroomsMin', opt.value)}
                            className={`w-full text-left px-3 py-1.5 text-sm rounded-md hover:bg-gray-50 ${filters.bathroomsMin === opt.value ? 'text-emerald-700 font-medium' : 'text-gray-700'
                                }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </QuickFilter>

                {/* --- Tenure --- */}
                <QuickFilter
                    label="Tenure"
                    displayValue={filters.tenure || 'Tenure'}
                    isActive={!!filters.tenure}
                >
                    {TENURE_OPTIONS.map((opt) => (
                        <button
                            key={opt.label}
                            type="button"
                            onClick={() => setFilter('tenure', opt.value as any)}
                            className={`w-full text-left px-3 py-1.5 text-sm rounded-md hover:bg-gray-50 ${filters.tenure === opt.value ? 'text-emerald-700 font-medium' : 'text-gray-700'
                                }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </QuickFilter>

                {/* --- Furnishing --- */}
                <QuickFilter
                    label="Furnishing"
                    displayValue={FURNISHING_OPTIONS.find(o => o.value === filters.furnishing)?.label || 'Furnishing'}
                    isActive={!!filters.furnishing}
                >
                    {FURNISHING_OPTIONS.map((opt) => (
                        <button
                            key={opt.label}
                            type="button"
                            onClick={() => setFilter('furnishing', opt.value as any)}
                            className={`w-full text-left px-3 py-1.5 text-sm rounded-md hover:bg-gray-50 ${filters.furnishing === opt.value ? 'text-emerald-700 font-medium' : 'text-gray-700'
                                }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </QuickFilter>

                {/* --- Verified Toggle --- */}
                <button
                    type="button"
                    onClick={() => setFilter('ownerSingpassVerified', filters.ownerSingpassVerified ? undefined : true)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all shrink-0 ${filters.ownerSingpassVerified
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                        }`}
                >
                    <span>Verified Only</span>
                </button>

                {/* --- More Filters button --- */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setMoreFiltersOpen(true)}
                    className="rounded-full gap-1.5 text-sm font-medium shrink-0"
                >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    More Filters
                </Button>

                {/* --- Clear All --- */}
                {hasActiveFilters && (
                    <button
                        type="button"
                        onClick={resetFilters}
                        className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors px-1 shrink-0"
                    >
                        <X className="w-3 h-3" />
                        Clear
                    </button>
                )}
            </div>

            {/* --- More Filters Modal --- */}
            <Dialog open={moreFiltersOpen} onOpenChange={setMoreFiltersOpen}>
                <DialogContent className="max-w-sm p-0 overflow-hidden max-h-[90vh]">
                    <DialogHeader className="px-5 pt-5 pb-0">
                        <DialogTitle className="text-base font-bold text-gray-900">All Filters</DialogTitle>
                    </DialogHeader>
                    <div className="overflow-y-auto max-h-[75vh]">
                        <FilterSidebar />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
