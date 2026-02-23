'use client';

import { Property } from '@/types/property';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
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
        <OverviewTab property={property} />
      </TabsContent>

      <TabsContent value="location">
        <LocationTab property={property} />
      </TabsContent>

      <TabsContent value="price-history">
        <PriceHistoryTab property={property} />
      </TabsContent>

      <TabsContent value="similar">
        <SimilarPropertiesTab property={property} />
      </TabsContent>

      <TabsContent value="calculators">
        <CalculatorsTab property={property} />
      </TabsContent>
    </Tabs>
  );
}
