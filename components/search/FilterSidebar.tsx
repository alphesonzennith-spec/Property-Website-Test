'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useSearchStore } from '@/lib/store';
import {
  PropertyType,
  Furnishing,
  Tenure,
  ListingSource,
} from '@/types';

export function FilterSidebar() {
  const { filters, setFilter, resetFilters } = useSearchStore();

  return (
    <div className="h-full flex flex-col bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      {/* Sticky Header - Better Integration */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50/80 backdrop-blur-sm">
        <h2 className="text-base font-bold text-gray-900">Filters</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={resetFilters}
          className="h-8 px-3 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
        >
          Reset All
        </Button>
      </div>

      {/* Scrollable Accordion Container */}
      <div className="flex-1 overflow-y-auto">
        <Accordion
          type="multiple"
          defaultValue={['price', 'type', 'beds']}
          className="px-4 py-2"
        >
          {/* 1. Price Range */}
          <AccordionItem value="price">
            <AccordionTrigger className="text-sm font-semibold py-3 hover:no-underline">
              Price Range (SGD)
            </AccordionTrigger>
            <AccordionContent className="space-y-3 pb-4">
              <div>
                <Label htmlFor="priceMin" className="text-xs text-gray-600">Min</Label>
                <Input
                  id="priceMin"
                  type="number"
                  placeholder="0"
                  min="0"
                  max="50000000"
                  className="h-9"
                  value={filters.priceMin ?? ''}
                  onChange={(e) => setFilter('priceMin', Number(e.target.value) || undefined)}
                />
              </div>
              <div>
                <Label htmlFor="priceMax" className="text-xs text-gray-600">Max</Label>
                <Input
                  id="priceMax"
                  type="number"
                  placeholder="No limit"
                  min="0"
                  max="50000000"
                  className="h-9"
                  value={filters.priceMax ?? ''}
                  onChange={(e) => setFilter('priceMax', Number(e.target.value) || undefined)}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 2. Property Type */}
          <AccordionItem value="type">
            <AccordionTrigger className="text-sm font-semibold py-3 hover:no-underline">
              Property Type
            </AccordionTrigger>
            <AccordionContent className="space-y-3 pb-4">
              <Select
                value={filters.propertyType ?? undefined}
                onValueChange={(val) => setFilter('propertyType', val === 'clear' ? undefined : val)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clear">Any</SelectItem>
                  <SelectItem value={PropertyType.HDB}>HDB</SelectItem>
                  <SelectItem value={PropertyType.Condo}>Condo</SelectItem>
                  <SelectItem value={PropertyType.Landed}>Landed</SelectItem>
                  <SelectItem value={PropertyType.EC}>Executive Condo</SelectItem>
                </SelectContent>
              </Select>
            </AccordionContent>
          </AccordionItem>

          {/* 3. Bedrooms */}
          <AccordionItem value="beds">
            <AccordionTrigger className="text-sm font-semibold py-3 hover:no-underline">
              Bedrooms
            </AccordionTrigger>
            <AccordionContent className="space-y-3 pb-4">
              <div>
                <Label htmlFor="bedroomsMin" className="text-xs text-gray-600">Min</Label>
                <Input
                  id="bedroomsMin"
                  type="number"
                  placeholder="0"
                  min="0"
                  max="10"
                  className="h-9"
                  value={filters.bedroomsMin ?? ''}
                  onChange={(e) => setFilter('bedroomsMin', Number(e.target.value) || undefined)}
                />
              </div>
              <div>
                <Label htmlFor="bedroomsMax" className="text-xs text-gray-600">Max</Label>
                <Input
                  id="bedroomsMax"
                  type="number"
                  placeholder="No limit"
                  min="0"
                  max="10"
                  className="h-9"
                  value={filters.bedroomsMax ?? ''}
                  onChange={(e) => setFilter('bedroomsMax', Number(e.target.value) || undefined)}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 4. Bathrooms */}
          <AccordionItem value="baths">
            <AccordionTrigger className="text-sm font-semibold py-3 hover:no-underline">
              Bathrooms
            </AccordionTrigger>
            <AccordionContent className="space-y-3 pb-4">
              <div>
                <Label htmlFor="bathroomsMin" className="text-xs text-gray-600">Min</Label>
                <Input
                  id="bathroomsMin"
                  type="number"
                  placeholder="0"
                  min="0"
                  max="10"
                  className="h-9"
                  value={filters.bathroomsMin ?? ''}
                  onChange={(e) => setFilter('bathroomsMin', Number(e.target.value) || undefined)}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 5. Floor Area */}
          <AccordionItem value="area">
            <AccordionTrigger className="text-sm font-semibold py-3 hover:no-underline">
              Floor Area (sqft)
            </AccordionTrigger>
            <AccordionContent className="space-y-3 pb-4">
              <div>
                <Label htmlFor="floorAreaMin" className="text-xs text-gray-600">Min</Label>
                <Input
                  id="floorAreaMin"
                  type="number"
                  placeholder="0"
                  min="0"
                  max="50000"
                  className="h-9"
                  value={filters.floorAreaMin ?? ''}
                  onChange={(e) => setFilter('floorAreaMin', Number(e.target.value) || undefined)}
                />
              </div>
              <div>
                <Label htmlFor="floorAreaMax" className="text-xs text-gray-600">Max</Label>
                <Input
                  id="floorAreaMax"
                  type="number"
                  placeholder="No limit"
                  min="0"
                  max="50000"
                  className="h-9"
                  value={filters.floorAreaMax ?? ''}
                  onChange={(e) => setFilter('floorAreaMax', Number(e.target.value) || undefined)}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 6. Furnishing */}
          <AccordionItem value="furnishing">
            <AccordionTrigger className="text-sm font-semibold py-3 hover:no-underline">
              Furnishing
            </AccordionTrigger>
            <AccordionContent className="space-y-3 pb-4">
              <Select
                value={filters.furnishing ?? undefined}
                onValueChange={(val) => setFilter('furnishing', val === 'clear' ? undefined : val)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clear">Any</SelectItem>
                  <SelectItem value={Furnishing.Unfurnished}>Unfurnished</SelectItem>
                  <SelectItem value={Furnishing.PartialFurnished}>Partially Furnished</SelectItem>
                  <SelectItem value={Furnishing.FullyFurnished}>Fully Furnished</SelectItem>
                </SelectContent>
              </Select>
            </AccordionContent>
          </AccordionItem>

          {/* 7. Tenure */}
          <AccordionItem value="tenure">
            <AccordionTrigger className="text-sm font-semibold py-3 hover:no-underline">
              Tenure
            </AccordionTrigger>
            <AccordionContent className="space-y-3 pb-4">
              <Select
                value={filters.tenure ?? undefined}
                onValueChange={(val) => setFilter('tenure', val === 'clear' ? undefined : val)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clear">Any</SelectItem>
                  <SelectItem value={Tenure.Freehold}>Freehold</SelectItem>
                  <SelectItem value={Tenure.Leasehold99}>99-year Leasehold</SelectItem>
                  <SelectItem value={Tenure.Leasehold999}>999-year Leasehold</SelectItem>
                </SelectContent>
              </Select>
            </AccordionContent>
          </AccordionItem>

          {/* 8. Listing Source */}
          <AccordionItem value="source">
            <AccordionTrigger className="text-sm font-semibold py-3 hover:no-underline">
              Listing Source
            </AccordionTrigger>
            <AccordionContent className="space-y-3 pb-4">
              <div className="space-y-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="listingSource"
                    className="h-4 w-4 border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    checked={filters.listingSource === undefined}
                    onChange={() => setFilter('listingSource', undefined)}
                  />
                  <span className="text-sm text-gray-700">Any</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="listingSource"
                    className="h-4 w-4 border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    checked={filters.listingSource === ListingSource.OwnerDirect}
                    onChange={() => setFilter('listingSource', ListingSource.OwnerDirect)}
                  />
                  <span className="text-sm text-gray-700">Owner Direct</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="listingSource"
                    className="h-4 w-4 border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    checked={filters.listingSource === ListingSource.Agent}
                    onChange={() => setFilter('listingSource', ListingSource.Agent)}
                  />
                  <span className="text-sm text-gray-700">Agent Listed</span>
                </label>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 9. Location */}
          <AccordionItem value="location">
            <AccordionTrigger className="text-sm font-semibold py-3 hover:no-underline">
              Location
            </AccordionTrigger>
            <AccordionContent className="space-y-3 pb-4">
              <div>
                <Label htmlFor="district" className="text-xs text-gray-600">District</Label>
                <Input
                  id="district"
                  type="text"
                  placeholder="e.g., D01, D16"
                  className="h-9"
                  value={filters.district ?? ''}
                  onChange={(e) => setFilter('district', e.target.value || undefined)}
                />
              </div>
              <div>
                <Label htmlFor="hdbTown" className="text-xs text-gray-600">HDB Town</Label>
                <Input
                  id="hdbTown"
                  type="text"
                  placeholder="e.g., Bedok, Bishan"
                  className="h-9"
                  value={filters.hdbTown ?? ''}
                  onChange={(e) => setFilter('hdbTown', e.target.value || undefined)}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 10. Quality Score */}
          <AccordionItem value="quality">
            <AccordionTrigger className="text-sm font-semibold py-3 hover:no-underline">
              Quality Score: {filters.qualityScoreMin ?? 0}+
            </AccordionTrigger>
            <AccordionContent className="space-y-3 pb-4">
              <Slider
                min={0}
                max={100}
                step={5}
                value={[filters.qualityScoreMin ?? 0]}
                onValueChange={(val) => setFilter('qualityScoreMin', val[0])}
                className="mt-2"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>0</span>
                <span>50</span>
                <span>100</span>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 11. Owner Verification */}
          <AccordionItem value="singpass">
            <AccordionTrigger className="text-sm font-semibold py-3 hover:no-underline">
              Owner Verification
            </AccordionTrigger>
            <AccordionContent className="space-y-3 pb-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="singpass-toggle" className="text-xs text-gray-600">
                  Singpass Verified Only
                </Label>
                <Switch
                  id="singpass-toggle"
                  checked={filters.ownerSingpassVerified ?? false}
                  onCheckedChange={(checked) => setFilter('ownerSingpassVerified', checked || undefined)}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
