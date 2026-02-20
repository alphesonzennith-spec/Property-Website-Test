'use client';

import React, { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AISearchBar } from './AISearchBar';
import { FilterSidebar } from './FilterSidebar';
import { ResultsArea } from './ResultsArea';
import { ComparisonFloatingBar } from './ComparisonFloatingBar';
import { useSearchStore } from '@/lib/store';
import { ListingType } from '@/types';

interface PropertySearchPageProps {
  listingType: ListingType;
}

function SearchPageContent({ listingType }: PropertySearchPageProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { filters, setFilters } = useSearchStore();

  // Sync URL params to store on mount
  useEffect(() => {
    const urlFilters: any = {};

    // Parse URL search params
    if (searchParams.get('priceMin')) urlFilters.priceMin = Number(searchParams.get('priceMin'));
    if (searchParams.get('priceMax')) urlFilters.priceMax = Number(searchParams.get('priceMax'));
    if (searchParams.get('bedroomsMin')) urlFilters.bedroomsMin = Number(searchParams.get('bedroomsMin'));
    if (searchParams.get('district')) urlFilters.district = searchParams.get('district');
    if (searchParams.get('propertyType')) urlFilters.propertyType = searchParams.get('propertyType');

    if (Object.keys(urlFilters).length > 0) {
      setFilters(urlFilters);
    }
  }, [searchParams, setFilters]);

  // Sync store filters to URL (debounced would be better in production)
  useEffect(() => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, String(value));
      }
    });

    const newUrl = params.toString() ? `?${params.toString()}` : '';
    if (newUrl !== `?${searchParams.toString()}`) {
      router.replace(newUrl, { scroll: false });
    }
  }, [filters, router, searchParams]);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest mb-2">
            PROPERTY SEARCH / {listingType.toUpperCase()}
          </p>
          <h1 className="text-4xl font-extrabold text-[#1E293B] mb-4">
            {listingType === ListingType.Sale ? 'Properties for Sale' : 'Properties for Rent'}
          </h1>
          <p className="text-gray-500 mb-6">
            Find verified listings with AI-powered search and advanced filters
          </p>

          {/* AI Search Bar */}
          <AISearchBar />
        </div>

        {/* Main Layout: Sidebar + Results */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left: Filter Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-6">
              <FilterSidebar />
            </div>
          </aside>

          {/* Right: Results Area */}
          <section className="lg:col-span-3">
            <ResultsArea listingType={listingType} />
          </section>
        </div>
      </div>

      {/* Floating Comparison Bar */}
      <ComparisonFloatingBar />
    </main>
  );
}

export function PropertySearchPage({ listingType }: PropertySearchPageProps) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <SearchPageContent listingType={listingType} />
    </Suspense>
  );
}
