'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSearchStore } from '@/lib/store';
import { trpc } from '@/lib/trpc/client';

export function ComparisonFloatingBar() {
  const router = useRouter();
  const { comparisonList, removeFromComparison, clearComparison } = useSearchStore();

  // Fetch basic property details for thumbnails
  const propertiesQuery = trpc.properties.list.useQuery(
    { limit: 100 },
    { enabled: comparisonList.length > 0 }
  );

  const comparedProperties = comparisonList
    .map((id) => propertiesQuery.data?.items.find((p) => p.id === id))
    .filter(Boolean);

  const handleCompare = () => {
    const ids = comparisonList.join(',');
    router.push(`/compare?ids=${ids}`);
  };

  if (comparisonList.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-emerald-500 shadow-2xl z-50 animate-in slide-in-from-bottom">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Property Thumbnails */}
          <div className="flex items-center gap-3 flex-1 overflow-x-auto">
            <p className="text-sm font-semibold text-gray-700 whitespace-nowrap">
              Comparing {comparisonList.length}/3
            </p>
            {comparedProperties.map((property) => {
              if (!property) return null;
              const primaryImage = property.images.find((img) => img.isPrimary) ?? property.images[0];

              return (
                <div key={property.id} className="relative flex-shrink-0">
                  <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-gray-200">
                    {primaryImage ? (
                      <Image
                        src={primaryImage.url}
                        alt={property.address}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFromComparison(property.id)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    aria-label={`Remove ${property.address} from comparison`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={clearComparison}
            >
              Clear All
            </Button>
            <Button
              onClick={handleCompare}
              disabled={comparisonList.length < 2}
              className="gap-2"
            >
              Compare Properties
              <Badge variant="secondary" className="ml-1">
                {comparisonList.length}
              </Badge>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
