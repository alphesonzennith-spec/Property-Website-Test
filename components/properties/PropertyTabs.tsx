'use client';

import { Suspense } from 'react';
import { Property } from '@/types/property';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { OverviewTab } from './tabs/OverviewTab';
import { LocationTab } from './tabs/LocationTab';
import { PriceHistoryTab } from './tabs/PriceHistoryTab';
import { SimilarPropertiesTab } from './tabs/SimilarPropertiesTab';
import { CalculatorsTab } from './tabs/CalculatorsTab';

interface PropertyTabsProps {
  property: Property;
}

export function PropertyTabs({ property }: PropertyTabsProps) {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-5 mb-6">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="location">Location</TabsTrigger>
        <TabsTrigger value="price-history">Price History</TabsTrigger>
        <TabsTrigger value="similar">Similar Properties</TabsTrigger>
        <TabsTrigger value="calculators">Calculators</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <Suspense fallback={<Skeleton className="w-full h-96 rounded-xl" />}>
          <OverviewTab property={property} />
        </Suspense>
      </TabsContent>

      <TabsContent value="location">
        <Suspense fallback={<Skeleton className="w-full h-96 rounded-xl" />}>
          <LocationTab property={property} />
        </Suspense>
      </TabsContent>

      <TabsContent value="price-history">
        <Suspense fallback={<Skeleton className="w-full h-96 rounded-xl" />}>
          <PriceHistoryTab property={property} />
        </Suspense>
      </TabsContent>

      <TabsContent value="similar">
        <Suspense fallback={<Skeleton className="w-full h-96 rounded-xl" />}>
          <SimilarPropertiesTab property={property} />
        </Suspense>
      </TabsContent>

      <TabsContent value="calculators">
        <Suspense fallback={<Skeleton className="w-full h-96 rounded-xl" />}>
          <CalculatorsTab property={property} />
        </Suspense>
      </TabsContent>
    </Tabs>
  );
}
