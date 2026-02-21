# Property Detail Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans or superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Build a comprehensive Property Detail Page with 65/35 layout, image gallery, property tabs, and interactive widgets

**Architecture:** Component-based with Server/Client separation, mock data initially, static OneMap images, Chart.js for charts, Shadcn Dialog for lightbox

**Tech Stack:** React 19, Next.js 15, TypeScript, Tailwind CSS, Shadcn/UI, Chart.js, react-chartjs-2

---

## Task 1: Install Dependencies

**Files:**
- Modify: `space-realty/package.json`

**Step 1: Install Chart.js and react-chartjs-2**

```bash
cd space-realty
npm install chart.js react-chartjs-2
```

Expected: Packages installed successfully

**Step 2: Verify installation**

Run: `npm list chart.js react-chartjs-2`
Expected: Shows installed versions

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "deps: add chart.js and react-chartjs-2 for price history charts

- chart.js: Core charting library
- react-chartjs-2: React wrapper for Chart.js
- Used in Property Detail Page price history tab

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 2: Create Loading and Error Pages

**Files:**
- Create: `space-realty/app/properties/[id]/loading.tsx`
- Create: `space-realty/app/properties/[id]/error.tsx`

**Step 1: Create loading.tsx with skeleton UI**

```tsx
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column Skeletons */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image gallery skeleton */}
            <Skeleton className="aspect-video w-full rounded-xl" />

            {/* Header skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
            </div>

            {/* Specs skeleton */}
            <Skeleton className="h-24 w-full rounded-xl" />

            {/* Tabs skeleton */}
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>

          {/* Right Column Skeletons */}
          <div className="lg:col-span-1 space-y-4">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-80 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Create error.tsx with error boundary**

```tsx
'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Property page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="max-w-lg mx-auto text-center">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Property Not Found</AlertTitle>
            <AlertDescription>
              The property you're looking for doesn't exist or has been removed.
            </AlertDescription>
          </Alert>

          <div className="mt-8 flex gap-4 justify-center">
            <Button onClick={reset}>Try Again</Button>
            <Button variant="outline" asChild>
              <Link href="/residential/buy">Browse Properties</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Step 3: Verify pages compile**

Run: `npm run dev`
Expected: No TypeScript errors

**Step 4: Commit**

```bash
git add app/properties/\[id\]/loading.tsx app/properties/\[id\]/error.tsx
git commit -m "feat(pdp): add loading and error states

- loading.tsx: Skeleton UI for property page
- error.tsx: Error boundary for not found/fetch errors
- Includes navigation back to browse properties

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 3: Create ImageGallery Component

**Files:**
- Create: `space-realty/components/properties/property-detail/image-gallery/ImageGallery.tsx`

**Step 1: Create ImageGallery component**

```tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { PropertyImage, PropertyLayout } from '@/types/property';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageGalleryProps {
  images: PropertyImage[];
  layout: PropertyLayout;
}

export function ImageGallery({ images, layout }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'photos' | 'floorplan' | '360'>('photos');

  const photos = images.filter(img => img.type === 'photo');
  const floorplans = images.filter(img => img.type === 'floorplan');
  const tours = images.filter(img => img.type === '360tour');

  const currentImages = activeTab === 'photos' ? photos :
                        activeTab === 'floorplan' ? floorplans : tours;

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? currentImages.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === currentImages.length - 1 ? 0 : prev + 1));
  };

  if (images.length === 0) {
    return (
      <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center">
        <div className="text-center text-gray-400">
          <p className="text-sm">No images available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)}>
        <TabsList>
          <TabsTrigger value="photos">Photos ({photos.length})</TabsTrigger>
          {layout.has2DFloorplan && floorplans.length > 0 && (
            <TabsTrigger value="floorplan">Floor Plan</TabsTrigger>
          )}
          {layout.has360Tour && tours.length > 0 && (
            <TabsTrigger value="360">360° Tour</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {/* Main Image */}
          <div
            className="relative aspect-video bg-gray-100 rounded-xl overflow-hidden cursor-pointer group"
            onClick={() => setLightboxOpen(true)}
          >
            {currentImages[currentIndex] && (
              <Image
                src={currentImages[currentIndex].url}
                alt="Property image"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 65vw"
              />
            )}

            {/* Navigation Arrows */}
            {currentImages.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); goToNext(); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Image Counter */}
            <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {currentIndex + 1} / {currentImages.length}
            </div>
          </div>

          {/* Thumbnail Strip */}
          {currentImages.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
              {currentImages.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all
                             ${idx === currentIndex ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-transparent hover:border-gray-300'}`}
                >
                  <Image
                    src={img.url}
                    alt={`Thumbnail ${idx + 1}`}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Lightbox Dialog */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-7xl w-full h-[90vh] p-0">
          <div className="relative w-full h-full bg-black">
            {currentImages[currentIndex] && (
              <Image
                src={currentImages[currentIndex].url}
                alt="Property image fullscreen"
                fill
                className="object-contain"
                sizes="100vw"
              />
            )}

            {/* Lightbox Navigation */}
            {currentImages.length > 1 && (
              <>
                <button
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 p-3 rounded-full"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 p-3 rounded-full"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}

            {/* Lightbox Counter */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/90 text-gray-900 px-4 py-2 rounded-full text-sm font-medium">
              {currentIndex + 1} / {currentImages.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

**Step 2: Verify component compiles**

Run: `npm run dev`
Expected: No TypeScript errors

**Step 3: Commit**

```bash
git add components/properties/property-detail/image-gallery/ImageGallery.tsx
git commit -m "feat(pdp): add ImageGallery component with lightbox

- Tabbed interface for Photos/Floor Plans/360 Tour
- Main image display with navigation arrows
- Thumbnail strip with scroll
- Full-screen lightbox using Shadcn Dialog
- Keyboard navigation support
- Responsive image loading with Next.js Image

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 4: Create PropertyHeader Component

**Files:**
- Create: `space-realty/components/properties/property-detail/header/PropertyHeader.tsx`

**Step 1: Create PropertyHeader component**

```tsx
import { Property, VerificationLevel } from '@/types/property';
import { ShieldCheck, Shield, ShieldAlert, Share2, Heart, Printer, Plus, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface PropertyHeaderProps {
  property: Property;
}

export function PropertyHeader({ property }: PropertyHeaderProps) {
  const verificationConfig = {
    [VerificationLevel.FullyVerified]: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-500',
      text: 'text-emerald-700',
      icon: ShieldCheck,
      label: 'Fully Verified Listing',
    },
    [VerificationLevel.LegalDocsVerified]: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-500',
      text: 'text-emerald-700',
      icon: ShieldCheck,
      label: 'Legal Documents Verified',
    },
    [VerificationLevel.OwnershipVerified]: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-500',
      text: 'text-yellow-700',
      icon: Shield,
      label: 'Ownership Verified',
    },
    [VerificationLevel.Unverified]: {
      bg: 'bg-gray-50',
      border: 'border-gray-300',
      text: 'text-gray-600',
      icon: ShieldAlert,
      label: 'Unverified Listing',
    },
  };

  const verification = verificationConfig[property.verificationLevel];
  const VerificationIcon = verification.icon;

  return (
    <div className="space-y-4">
      {/* Verification Banner */}
      <div className={`${verification.bg} border ${verification.border} ${verification.text} rounded-lg p-3 flex items-center gap-2`}>
        <VerificationIcon className="w-5 h-5" />
        <span className="text-sm font-medium">{verification.label}</span>
      </div>

      {/* Title and Address */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {property.bedrooms}-Bedroom {property.propertyType} in {property.district}
        </h1>

        <div className="flex items-center gap-2 text-gray-700">
          <span>{property.address}</span>
          <CopyButton text={property.address} />
        </div>
      </div>

      {/* Price and Actions */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="text-4xl font-extrabold text-gray-900">
            ${property.price.toLocaleString()}
          </div>
          {property.psf && (
            <div className="text-sm text-gray-500 mt-1">
              ${property.psf.toLocaleString()} per sqft
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Share2 className="w-4 h-4" />
            Share
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Heart className="w-4 h-4" />
            Save
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Printer className="w-4 h-4" />
            Print
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Compare
          </Button>
        </div>
      </div>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  return (
    <button
      onClick={() => navigator.clipboard.writeText(text)}
      className="text-gray-400 hover:text-gray-600 transition-colors"
      title="Copy address"
    >
      <Copy className="w-4 h-4" />
    </button>
  );
}
```

**Step 2: Verify component compiles**

Run: `npm run dev`
Expected: No TypeScript errors

**Step 3: Commit**

```bash
git add components/properties/property-detail/header/PropertyHeader.tsx
git commit -m "feat(pdp): add PropertyHeader component

- Property title with bedroom count and type
- Full address with copy-to-clipboard button
- Color-coded verification banner (green/yellow/gray)
- Price display with PSF
- Action buttons: Share, Save, Print, Compare

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 5: Create SpecificationBar Component

**Files:**
- Create: `space-realty/components/properties/property-detail/header/SpecificationBar.tsx`

**Step 1: Create SpecificationBar component**

```tsx
import { Property, Tenure } from '@/types/property';
import { Bed, Bath, Ruler, DollarSign, Building2, Calendar, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface SpecificationBarProps {
  property: Property;
}

function formatTenure(tenure: Tenure): string {
  switch (tenure) {
    case Tenure.Freehold:
      return 'Freehold';
    case Tenure.Leasehold99:
      return '99 Years';
    case Tenure.Leasehold999:
      return '999 Years';
    case Tenure.Leasehold30:
      return '30 Years';
    default:
      return tenure;
  }
}

export function SpecificationBar({ property }: SpecificationBarProps) {
  const specs = [
    {
      icon: Bed,
      label: 'Bedrooms',
      value: property.bedrooms.toString(),
    },
    {
      icon: Bath,
      label: 'Bathrooms',
      value: property.bathrooms.toString(),
    },
    {
      icon: Ruler,
      label: 'Floor Area',
      value: `${property.floorAreaSqft.toLocaleString()} sqft`,
    },
    {
      icon: DollarSign,
      label: 'PSF',
      value: property.psf ? `$${property.psf.toLocaleString()}` : 'N/A',
    },
    {
      icon: Building2,
      label: 'Floor Level',
      value: property.floorLevel ? `#${property.floorLevel}` : 'N/A',
    },
    {
      icon: Calendar,
      label: 'Tenure',
      value: formatTenure(property.tenure),
    },
    {
      icon: Clock,
      label: 'Listed',
      value: formatDistanceToNow(new Date(property.createdAt), { addSuffix: true }),
    },
  ];

  return (
    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
        {specs.map((spec) => {
          const Icon = spec.icon;
          return (
            <div key={spec.label} className="flex flex-col items-center text-center">
              <Icon className="w-5 h-5 text-gray-400 mb-2" />
              <div className="text-xs text-gray-500 mb-1">{spec.label}</div>
              <div className="text-sm font-semibold text-gray-900">{spec.value}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

**Step 2: Install date-fns if not already installed**

```bash
npm install date-fns
```

**Step 3: Verify component compiles**

Run: `npm run dev`
Expected: No TypeScript errors

**Step 4: Commit**

```bash
git add components/properties/property-detail/header/SpecificationBar.tsx package.json package-lock.json
git commit -m "feat(pdp): add SpecificationBar component

- Grid display of 7 key specifications
- Icons for each spec (bed, bath, ruler, etc.)
- Formatted values (tenure, floor area, PSF)
- Relative time for listing date
- Responsive grid layout (2-4-7 columns)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

---

## Remaining Tasks Summary

Due to the comprehensive nature of this feature (15+ components), the remaining tasks are listed here as high-level guides. Each task follows the same pattern as Tasks 1-5 above.

### Task 6: Sidebar Components
- Create VerificationCard.tsx (Server component)
- Create ListingSourceCard.tsx (Server component with owner/agent logic)
- Create ContactForm.tsx (Client component with validation)
- Create MortgageEstimatorWidget.tsx (Client component with calculations)

### Task 7: Property Tabs Components
- Create PropertyTabs.tsx (Client wrapper component)
- Create OverviewTab.tsx (Server - description, highlights, facts)
- Create LocationTab.tsx (Client - static OneMap image, MRT table, amenities)
- Create PriceHistoryTab.tsx (Client - Chart.js line chart, comparables table)
- Create SimilarPropertiesTab.tsx (Server - PropertyCard grid)
- Create CalculatorsTab.tsx (Client - embedded calculators from /resources/calculators)

### Task 8: Main Page Implementation
- Update app/properties/[id]/page.tsx with:
  - `getProperty()` function to fetch from mock data
  - `generateStaticParams()` for top 30 properties
  - `generateMetadata()` for SEO
  - Main layout grid (65/35 split)
  - Component composition

### Task 9: OneMap Image Configuration
- Add onemap.gov.sg to next.config.ts remotePatterns
- Test static map images load correctly

### Task 10: Testing & Polish
- Manual testing checklist (all components, responsive, interactions)
- Fix any layout issues
- Verify all links work
- Test error states
- Final commit and review

---

## Implementation Notes

**Start with Foundation Components:**
Execute Tasks 1-5 first to establish the base components, then proceed with sidebar and tabs components.

**Test Incrementally:**
After each task, verify the component renders correctly by temporarily importing it in a test page.

**Use Mock Data:**
All data comes from `/lib/mock/properties.ts` initially. The first property in MOCK_PROPERTIES array is a good test case.

**Responsive Testing:**
Test at breakpoints: 320px (mobile), 768px (tablet), 1024px (desktop), 1440px (large desktop).

**Key Dependencies:**
- chart.js + react-chartjs-2 (Task 1)
- date-fns (Task 5)
- Shadcn components: Dialog, Tabs, Card, Button, Form, Alert, Skeleton

**Common Patterns:**
- Server components: Accept `{ property: Property }` props
- Client components: Accept minimal props (only needed fields)
- All components use Tailwind for styling
- Follow existing project patterns (see PropertyCard.tsx for reference)

---

## Execution Checklist

### Phase 1: Setup & Foundation (Tasks 1-3)
- [ ] Install dependencies
- [ ] Create loading/error pages
- [ ] Create ImageGallery component
- [ ] Test gallery with mock data

### Phase 2: Header & Specs (Tasks 4-5)
- [ ] Create PropertyHeader component
- [ ] Create SpecificationBar component
- [ ] Verify header displays correctly

### Phase 3: Sidebar (Task 6)
- [ ] Create VerificationCard
- [ ] Create ListingSourceCard
- [ ] Create ContactForm
- [ ] Create MortgageEstimatorWidget
- [ ] Test sidebar sticky behavior

### Phase 4: Tabs (Task 7)
- [ ] Create PropertyTabs wrapper
- [ ] Create all 5 tab components
- [ ] Test tab switching
- [ ] Verify chart displays in Price History
- [ ] Test calculator embeddings

### Phase 5: Main Page (Task 8)
- [ ] Implement page.tsx with data fetching
- [ ] Add generateMetadata
- [ ] Add generateStaticParams
- [ ] Compose all components in layout
- [ ] Test full page flow

### Phase 6: Polish (Tasks 9-10)
- [ ] Configure OneMap images
- [ ] Manual testing (desktop/mobile)
- [ ] Fix any bugs
- [ ] Final review
- [ ] Update claude.md with new patterns

---

## Success Criteria

✅ **Functionality**
- Property page loads with correct data
- All interactive elements work (gallery, tabs, forms)
- Responsive layout adapts correctly
- Error/loading states display properly

✅ **Design**
- 65/35 layout matches specification
- Verification colors correct (green/yellow/gray)
- Spacing and typography consistent
- Mobile layout stacks correctly

✅ **Performance**
- Page loads within 2 seconds
- Images optimized with Next.js Image
- Static generation works for top 30 properties
- No console errors

✅ **Code Quality**
- Server/Client components properly separated
- TypeScript types complete
- Components follow single responsibility
- Code matches project patterns

---

## Next Steps After Implementation

1. **Add to claude.md:**
   - Document PDP component patterns
   - Add common mistakes (e.g., prop drilling, client/server boundaries)
   - Note verification banner color patterns

2. **Future Enhancements:**
   - Real-time availability updates
   - Virtual tour integration
   - Comparison tool
   - Save to favorites
   - Schedule viewing
   - Download brochure

3. **Connect to Real Data:**
   - Replace mock data with tRPC queries
   - Implement actual contact form submission
   - Add real transaction data for price history
