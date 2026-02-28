'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { PropertyImage } from '@/components/ui/PropertyImage';
import { trpc } from '@/lib/trpc/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

function ComparisonContent() {
  const searchParams = useSearchParams();
  const ids = searchParams.get('ids')?.split(',') ?? [];

  // Fetch all properties for comparison
  const queries = ids.map((id) =>
    trpc.properties.getById.useQuery({ id }, { enabled: !!id })
  );

  const isLoading = queries.some((q) => q.isLoading);
  const hasError = queries.some((q) => q.isError);
  const properties = queries.map((q) => q.data).filter((p): p is NonNullable<typeof p> => !!p);

  if (ids.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No properties selected for comparison.</p>
        <Link href="/residential/buy">
          <Button className="mt-4">Go to Search</Button>
        </Link>
      </div>
    );
  }

  if (hasError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error loading properties</AlertTitle>
        <AlertDescription>
          One or more properties could not be loaded. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {ids.map((id) => (
          <Skeleton key={id} className="h-[600px] w-full rounded-xl" />
        ))}
      </div>
    );
  }

  const hasPartialLoad = !isLoading && properties.length > 0 && properties.length < ids.length;

  return (
    <>
      {hasPartialLoad && (
        <Alert className="mb-6 border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-900">Some properties could not be loaded</AlertTitle>
          <AlertDescription className="text-amber-700">
            Showing {properties.length} of {ids.length} selected properties. One or more listings may have been removed.
          </AlertDescription>
        </Alert>
      )}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {properties.map((property) => {
        const primaryImage = property.images.find((img) => img.isPrimary) ?? property.images[0];

        return (
          <Card key={property.id} className="flex flex-col overflow-hidden">
            {/* Property Image */}
            <div className="aspect-video relative overflow-hidden flex-shrink-0">
              <PropertyImage src={primaryImage?.url} alt={property.address} sizes="(max-width: 768px) 100vw, 33vw" />
            </div>

            {/* Property Header */}
            <CardHeader className="pb-3">
              <CardTitle className="text-base line-clamp-2">{property.address}</CardTitle>
              <p className="text-2xl font-extrabold text-emerald-600">
                ${property.price.toLocaleString()}
              </p>
            </CardHeader>

            {/* Property Details - Scrollable if needed */}
            <CardContent className="space-y-3 flex-grow overflow-y-auto">
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                {/* PSF */}
                <div className="col-span-2 pb-2 border-b">
                  <div className="text-gray-500 text-xs font-medium">Price per sqft</div>
                  <div className="font-semibold text-gray-900">
                    ${property.psf?.toLocaleString() ?? 'N/A'}
                  </div>
                </div>

                {/* District */}
                <div>
                  <div className="text-gray-500 text-xs font-medium">District</div>
                  <div className="font-semibold text-gray-900">{property.district}</div>
                </div>

                {/* Property Type */}
                <div>
                  <div className="text-gray-500 text-xs font-medium">Type</div>
                  <div className="font-semibold text-gray-900">{property.propertyType}</div>
                </div>

                {/* Bedrooms */}
                <div>
                  <div className="text-gray-500 text-xs font-medium">Bedrooms</div>
                  <div className="font-semibold text-gray-900">{property.bedrooms}</div>
                </div>

                {/* Bathrooms */}
                <div>
                  <div className="text-gray-500 text-xs font-medium">Bathrooms</div>
                  <div className="font-semibold text-gray-900">{property.bathrooms}</div>
                </div>

                {/* Floor Area */}
                <div className="col-span-2">
                  <div className="text-gray-500 text-xs font-medium">Floor Area</div>
                  <div className="font-semibold text-gray-900">
                    {property.floorAreaSqft.toLocaleString()} sqft
                  </div>
                </div>

                {/* Tenure */}
                <div>
                  <div className="text-gray-500 text-xs font-medium">Tenure</div>
                  <div className="font-semibold text-gray-900">{property.tenure}</div>
                </div>

                {/* Furnishing */}
                <div>
                  <div className="text-gray-500 text-xs font-medium">Furnishing</div>
                  <div className="font-semibold text-gray-900">{property.furnishing}</div>
                </div>

                {/* Verification Level */}
                <div className="col-span-2 pt-2 border-t">
                  <div className="text-gray-500 text-xs font-medium">Verification Level</div>
                  <div className="font-semibold text-gray-900">{property.verificationLevel}</div>
                </div>

                {/* Quality Score */}
                <div>
                  <div className="text-gray-500 text-xs font-medium">Quality Score</div>
                  <div className="font-semibold text-gray-900">
                    {property.listingQualityScore ?? 'N/A'}/100
                  </div>
                </div>

                {/* Listing Source */}
                <div>
                  <div className="text-gray-500 text-xs font-medium">Source</div>
                  <div className="font-semibold text-gray-900">{property.listingSource}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
    </>
  );
}

export default function ComparePage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link href="/residential/buy">
            <Button variant="ghost" size="sm" className="gap-2 mb-4">
              <ArrowLeft className="w-4 h-4" />
              Back to Search
            </Button>
          </Link>
          <h1 className="text-4xl font-extrabold text-[#1E293B]">
            Property Comparison
          </h1>
          <p className="text-gray-500 mt-2">
            Compare up to 3 properties side by side
          </p>
        </div>

        <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-3 gap-6">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-[600px] rounded-xl" />)}</div>}>
          <ComparisonContent />
        </Suspense>
      </div>
    </main>
  );
}
