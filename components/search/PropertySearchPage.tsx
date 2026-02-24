'use client';

import React, { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Map, List } from 'lucide-react';
import { AISearchBar } from './AISearchBar';
import { FilterSidebar } from './FilterSidebar';
import { ResultsArea } from './ResultsArea';
import { ComparisonFloatingBar } from './ComparisonFloatingBar';
import { FloatingFilterBar } from './FloatingFilterBar';
import { MapPlaceholder } from './MapPlaceholder';
import { useSearchStore } from '@/lib/store';
import { ListingType } from '@/types';

interface PropertySearchPageProps {
  listingType: ListingType;
}

function SearchPageContent({ listingType }: PropertySearchPageProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { filters, setFilters, mapViewEnabled, toggleMapView } = useSearchStore();

  // Sync URL params to store on mount
  useEffect(() => {
    const urlFilters: any = {};

    if (searchParams.get('priceMin')) urlFilters.priceMin = Number(searchParams.get('priceMin'));
    if (searchParams.get('priceMax')) urlFilters.priceMax = Number(searchParams.get('priceMax'));
    if (searchParams.get('bedroomsMin')) urlFilters.bedroomsMin = Number(searchParams.get('bedroomsMin'));
    if (searchParams.get('district')) urlFilters.district = searchParams.get('district');
    if (searchParams.get('propertyType')) urlFilters.propertyType = searchParams.get('propertyType');

    if (Object.keys(urlFilters).length > 0) {
      setFilters(urlFilters);
    }
  }, [searchParams, setFilters]);

  // Sync store filters to URL
  useEffect(() => {
    const params = new URLSearchParams();
    const activeFiltersCount = Object.keys(filters).length;

    if (activeFiltersCount === 0) {
      // If filters are cleared via resetFilters, clear the query string in URL
      const currentPath = window.location.pathname;
      router.replace(currentPath, { scroll: false });
      return;
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, String(value));
      }
    });

    const newUrl = params.toString() ? `?${params.toString()}` : '';
    const currentQuery = searchParams.toString() ? `?${searchParams.toString()}` : '';

    if (newUrl !== currentQuery) {
      router.replace(newUrl || window.location.pathname, { scroll: false });
    }
  }, [filters, router, searchParams]);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* =========================================================
          MAP VIEW LAYOUT: full-width, floating filters
         ========================================================= */}
      {mapViewEnabled && (
        <div className="fixed inset-0 top-[64px] z-40 bg-white flex flex-col overflow-hidden">
          {/* Header strip for Map View */}
          <div className="shrink-0 px-4 py-3 bg-white border-b border-gray-200 z-10 flex items-center justify-between">
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest">
              PROPERTY SEARCH / {listingType.toUpperCase()} / MAP VIEW
            </p>
            <Button
              variant="outline"
              onClick={toggleMapView}
              size="sm"
              className="gap-2 shrink-0"
            >
              <List className="w-4 h-4" />
              List View
            </Button>
          </div>

          {/* 40/60 split body */}
          <div className="flex flex-1 overflow-hidden">
            {/* Left Column: Results */}
            <div className="w-[40%] h-full overflow-y-auto border-r border-gray-200">
              <div className="p-6 h-full flex flex-col">
                <div className="flex justify-center mb-6">
                  <FloatingFilterBar />
                </div>
                <div className="flex-1">
                  <ResultsArea listingType={listingType} compact />
                </div>
              </div>
            </div>

            {/* Right Column: Map */}
            <div className="w-[60%] h-full bg-gray-50 relative">
              <MapPlaceholder />
            </div>
          </div>
        </div>
      )}

      {!mapViewEnabled && (
        /* =========================================================
           LIST VIEW LAYOUT: sidebar + results
           ========================================================= */
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest mb-2">
              PROPERTY SEARCH / {listingType.toUpperCase()}
            </p>
            <h1 className="text-4xl font-extrabold text-[#1E293B] mb-4">
              {listingType === ListingType.Sale ? 'Properties for Sale' : 'Properties for Rent'}
            </h1>
            <p className="text-gray-500 mb-4">
              Find verified listings with AI-powered search and advanced filters
            </p>

            {/* AI Search Bar */}
            <AISearchBar />
          </div>

          {/* Filter Sidebar + Results */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <aside className="lg:col-span-1">
              <div className="sticky top-6">
                <FilterSidebar />
              </div>
            </aside>
            <section className="lg:col-span-3">
              <ResultsArea listingType={listingType} />
            </section>
          </div>
        </div>
      )}

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
