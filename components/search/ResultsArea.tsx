'use client';

import React, { useState } from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { PropertyCard } from '@/components/properties/PropertyCard';
import { useSearchStore } from '@/lib/store';
import { trpc } from '@/lib/trpc/client';
import { AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { ListingType } from '@/types';

interface ResultsAreaProps {
  listingType: ListingType;
}

export function ResultsArea({ listingType }: ResultsAreaProps) {
  const { filters, comparisonList, addToComparison, removeFromComparison } = useSearchStore();
  const [sortBy, setSortBy] = useState<string>('quality_score');
  const [page, setPage] = useState(1);

  // Fetch properties with filters
  const { data, isLoading, error } = trpc.properties.list.useQuery({
    ...filters,
    listingType,
    sortBy: sortBy as any,
    page,
    limit: 20,
  });

  const handleCompareToggle = (propertyId: string, checked: boolean) => {
    if (checked) {
      const success = addToComparison(propertyId);
      if (!success) {
        alert('You can only compare up to 3 properties at a time.');
      }
    } else {
      removeFromComparison(propertyId);
    }
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error loading properties</AlertTitle>
        <AlertDescription>
          Failed to load property listings. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Sort Options */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {isLoading ? (
            <Skeleton className="h-4 w-32" />
          ) : (
            `${data?.total ?? 0} properties found`
          )}
        </p>
        <div className="flex items-center gap-2">
          <label htmlFor="sort-select" className="text-sm text-gray-600">
            Sort by:
          </label>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger id="sort-select" className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="quality_score">Quality Score</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price_asc">Price: Low to High</SelectItem>
              <SelectItem value="price_desc">Price: High to Low</SelectItem>
              <SelectItem value="psf_asc">PSF: Low to High</SelectItem>
              <SelectItem value="psf_desc">PSF: High to Low</SelectItem>
              <SelectItem value="most_viewed">Most Viewed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-96 w-full rounded-xl" />
          ))}
        </div>
      ) : data && data.items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.items.map((property) => (
            <div key={property.id} className="relative">
              {/* Compare Checkbox */}
              <div className="absolute top-4 right-4 z-10">
                <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-sm flex items-center gap-2">
                  <Checkbox
                    id={`compare-${property.id}`}
                    checked={comparisonList.includes(property.id)}
                    onCheckedChange={(checked) => handleCompareToggle(property.id, checked as boolean)}
                  />
                  <label
                    htmlFor={`compare-${property.id}`}
                    className="text-xs font-medium text-gray-700 cursor-pointer"
                  >
                    Compare
                  </label>
                </div>
              </div>
              <PropertyCard property={property as any} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No properties found matching your criteria.</p>
          <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or search query.</p>
        </div>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {page} of {data.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
            disabled={page === data.totalPages}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
