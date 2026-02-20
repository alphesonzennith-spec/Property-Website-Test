'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { trpc } from '@/lib/trpc/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowLeft, MapPin, Bed, Bath, Ruler } from 'lucide-react';

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
        <Link href="/(portal)/buy">
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
          <Skeleton key={id} className="h-96 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Property Images Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {properties.map((property) => {
          const primaryImage = property.images.find((img) => img.isPrimary) ?? property.images[0];

          return (
            <Card key={property.id}>
              <div className="aspect-video relative overflow-hidden rounded-t-xl">
                {primaryImage ? (
                  <Image
                    src={primaryImage.url}
                    alt={property.address}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200" />
                )}
              </div>
              <CardHeader>
                <CardTitle className="text-lg">{property.address}</CardTitle>
                <p className="text-2xl font-extrabold text-emerald-600">
                  ${property.price.toLocaleString()}
                </p>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {/* Comparison Table */}
      <Card>
        <CardContent className="p-0">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4 bg-gray-50 font-semibold">Feature</th>
                {properties.map((property) => (
                  <th key={property.id} className="text-left p-4 bg-gray-50">
                    Property {properties.indexOf(property) + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-4 font-medium">Price</td>
                {properties.map((p) => (
                  <td key={p.id} className="p-4">${p.price.toLocaleString()}</td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="p-4 font-medium">PSF</td>
                {properties.map((p) => (
                  <td key={p.id} className="p-4">${p.psf?.toLocaleString() ?? 'N/A'}</td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="p-4 font-medium">Property Type</td>
                {properties.map((p) => (
                  <td key={p.id} className="p-4">{p.propertyType}</td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="p-4 font-medium">Bedrooms</td>
                {properties.map((p) => (
                  <td key={p.id} className="p-4">{p.bedrooms}</td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="p-4 font-medium">Bathrooms</td>
                {properties.map((p) => (
                  <td key={p.id} className="p-4">{p.bathrooms}</td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="p-4 font-medium">Floor Area</td>
                {properties.map((p) => (
                  <td key={p.id} className="p-4">{p.floorAreaSqft.toLocaleString()} sqft</td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="p-4 font-medium">Tenure</td>
                {properties.map((p) => (
                  <td key={p.id} className="p-4">{p.tenure}</td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="p-4 font-medium">Furnishing</td>
                {properties.map((p) => (
                  <td key={p.id} className="p-4">{p.furnishing}</td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="p-4 font-medium">District</td>
                {properties.map((p) => (
                  <td key={p.id} className="p-4">{p.district}</td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="p-4 font-medium">Verification Level</td>
                {properties.map((p) => (
                  <td key={p.id} className="p-4">{p.verificationLevel}</td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="p-4 font-medium">Quality Score</td>
                {properties.map((p) => (
                  <td key={p.id} className="p-4">
                    {p.listingQualityScore ?? 'N/A'}/100
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-medium">Listing Source</td>
                {properties.map((p) => (
                  <td key={p.id} className="p-4">{p.listingSource}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ComparePage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link href="/(portal)/buy">
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

        <Suspense fallback={<Skeleton className="h-96 w-full" />}>
          <ComparisonContent />
        </Suspense>
      </div>
    </main>
  );
}
