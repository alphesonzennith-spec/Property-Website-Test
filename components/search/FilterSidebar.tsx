'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useSearchStore } from '@/lib/store';
import {
  PropertyType,
  HDBRoomType,
  Furnishing,
  Tenure,
  VerificationLevel,
  ListingSource,
} from '@/types';

export function FilterSidebar() {
  const { filters, setFilter, resetFilters } = useSearchStore();

  return (
    <div className="w-full h-full overflow-y-auto space-y-4 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between sticky top-0 bg-white z-10 pb-2">
        <h2 className="text-lg font-bold text-gray-900">Filters</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={resetFilters}
          className="text-xs"
        >
          Reset All
        </Button>
      </div>

      <Separator />

      {/* Price Range */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Price Range (SGD)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label htmlFor="priceMin" className="text-xs">Min</Label>
            <Input
              id="priceMin"
              type="number"
              placeholder="0"
              min="0"
              max="50000000"
              value={filters.priceMin ?? ''}
              onChange={(e) => setFilter('priceMin', Number(e.target.value) || undefined)}
            />
          </div>
          <div>
            <Label htmlFor="priceMax" className="text-xs">Max</Label>
            <Input
              id="priceMax"
              type="number"
              placeholder="No limit"
              min="0"
              max="50000000"
              value={filters.priceMax ?? ''}
              onChange={(e) => setFilter('priceMax', Number(e.target.value) || undefined)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Property Type */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Property Type</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={filters.propertyType ?? ''}
            onValueChange={(val) => setFilter('propertyType', val || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any</SelectItem>
              <SelectItem value={PropertyType.HDB}>HDB</SelectItem>
              <SelectItem value={PropertyType.Condo}>Condo</SelectItem>
              <SelectItem value={PropertyType.Landed}>Landed</SelectItem>
              <SelectItem value={PropertyType.EC}>Executive Condo</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Bedrooms */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Bedrooms</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label htmlFor="bedroomsMin" className="text-xs">Min</Label>
            <Input
              id="bedroomsMin"
              type="number"
              placeholder="0"
              min="0"
              max="10"
              value={filters.bedroomsMin ?? ''}
              onChange={(e) => setFilter('bedroomsMin', Number(e.target.value) || undefined)}
            />
          </div>
          <div>
            <Label htmlFor="bedroomsMax" className="text-xs">Max</Label>
            <Input
              id="bedroomsMax"
              type="number"
              placeholder="No limit"
              min="0"
              max="10"
              value={filters.bedroomsMax ?? ''}
              onChange={(e) => setFilter('bedroomsMax', Number(e.target.value) || undefined)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Bathrooms */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Bathrooms (Min)</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            type="number"
            placeholder="0"
            min="0"
            max="10"
            value={filters.bathroomsMin ?? ''}
            onChange={(e) => setFilter('bathroomsMin', Number(e.target.value) || undefined)}
          />
        </CardContent>
      </Card>

      {/* Floor Area */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Floor Area (sqft)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label htmlFor="floorAreaMin" className="text-xs">Min</Label>
            <Input
              id="floorAreaMin"
              type="number"
              placeholder="0"
              min="0"
              max="50000"
              value={filters.floorAreaMin ?? ''}
              onChange={(e) => setFilter('floorAreaMin', Number(e.target.value) || undefined)}
            />
          </div>
          <div>
            <Label htmlFor="floorAreaMax" className="text-xs">Max</Label>
            <Input
              id="floorAreaMax"
              type="number"
              placeholder="No limit"
              min="0"
              max="50000"
              value={filters.floorAreaMax ?? ''}
              onChange={(e) => setFilter('floorAreaMax', Number(e.target.value) || undefined)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Furnishing */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Furnishing</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={filters.furnishing ?? ''}
            onValueChange={(val) => setFilter('furnishing', val || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any</SelectItem>
              <SelectItem value={Furnishing.Unfurnished}>Unfurnished</SelectItem>
              <SelectItem value={Furnishing.PartialFurnished}>Partially Furnished</SelectItem>
              <SelectItem value={Furnishing.FullyFurnished}>Fully Furnished</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Tenure */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Tenure</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={filters.tenure ?? ''}
            onValueChange={(val) => setFilter('tenure', val || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any</SelectItem>
              <SelectItem value={Tenure.Freehold}>Freehold</SelectItem>
              <SelectItem value={Tenure.Leasehold99}>99-year Leasehold</SelectItem>
              <SelectItem value={Tenure.Leasehold999}>999-year Leasehold</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Separator />

      {/* Verification Level */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Verification Level</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={filters.verificationLevel ?? ''}
            onValueChange={(val) => setFilter('verificationLevel', val || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any</SelectItem>
              <SelectItem value={VerificationLevel.FullyVerified}>Fully Verified</SelectItem>
              <SelectItem value={VerificationLevel.LegalDocsVerified}>Docs Verified</SelectItem>
              <SelectItem value={VerificationLevel.OwnershipVerified}>Owner Verified</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Listing Source */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Listing Source</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={filters.listingSource ?? ''}
            onValueChange={(val) => setFilter('listingSource', val || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any</SelectItem>
              <SelectItem value={ListingSource.OwnerDirect}>Owner Direct</SelectItem>
              <SelectItem value={ListingSource.Agent}>Agent Listed</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Quality Score Slider */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">
            Listing Quality Score: {filters.qualityScoreMin ?? 0}+
          </CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Singpass Verified Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Owner Singpass Verified</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label htmlFor="singpass-toggle" className="text-sm text-gray-600">
              Show only Singpass-verified owners
            </Label>
            <Switch
              id="singpass-toggle"
              checked={filters.ownerSingpassVerified ?? false}
              onCheckedChange={(checked) => setFilter('ownerSingpassVerified', checked || undefined)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
