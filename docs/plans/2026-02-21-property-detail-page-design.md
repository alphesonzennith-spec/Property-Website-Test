# Property Detail Page (PDP) Design

**Date:** 2026-02-21
**Status:** Approved
**Approach:** Component-Based Architecture with Server/Client Separation

## Overview

Implement a comprehensive Property Detail Page at `/properties/[id]` featuring a rich, interactive design with:
- **Layout:** 65/35 two-column grid (main content / sticky sidebar)
- **Image Gallery:** Tabbed interface with Photos/Floor Plans/3D Tour, lightbox view
- **Property Tabs:** Overview, Location, Price History, Similar Properties, Calculators
- **Interactive Widgets:** Contact form, mortgage estimator
- **Verification System:** Visual trust indicators based on verification level

## Design Decisions

### Key Technology Choices

1. **Map Integration:** Static OneMap images (fastest loading, no API key needed)
2. **Image Lightbox:** Shadcn Dialog component (consistent with existing UI)
3. **Charts:** Chart.js with react-chartjs-2 (better performance for price history)
4. **Mobile Layout:** Vertical stack with sidebar at bottom (standard responsive pattern)
5. **Agent Data:** Mock data initially (focus on UI/layout first)
6. **Calculators:** Fully embedded calculators in tab (complete functionality)

### Architecture Approach

**Component-Based with Server/Client Separation**
- Clear separation between Server and Client components
- Small, focused components (single responsibility)
- Server components for static content (better performance)
- Client components only where interactivity needed
- Follows Next.js 15 best practices

## File Structure

```
components/properties/property-detail/
├── image-gallery/
│   ├── ImageGallery.tsx           # Client - tabbed gallery with thumbnails
│   └── ImageLightbox.tsx           # Client - full-screen view
├── header/
│   ├── PropertyHeader.tsx          # Server - title, address, price, actions
│   └── SpecificationBar.tsx        # Server - key specs grid
├── tabs/
│   ├── PropertyTabs.tsx            # Client - tab wrapper
│   ├── OverviewTab.tsx            # Server - description, highlights
│   ├── LocationTab.tsx            # Client - map, MRT, amenities
│   ├── PriceHistoryTab.tsx        # Client - chart, comparables
│   ├── SimilarPropertiesTab.tsx   # Server - property grid
│   └── CalculatorsTab.tsx         # Client - embedded calculators
└── sidebar/
    ├── VerificationCard.tsx        # Server - trust indicators
    ├── ListingSourceCard.tsx       # Server - owner/agent info
    ├── ContactForm.tsx             # Client - enquiry form
    └── MortgageEstimatorWidget.tsx # Client - quick calculator

app/properties/[id]/
├── page.tsx          # Server - main layout, data fetching
├── loading.tsx       # Skeleton UI
└── error.tsx         # Error boundary
```

## Architecture

### Page Structure (`app/properties/[id]/page.tsx`)

**Type:** Server Component
**Responsibilities:**
- Fetch property data by ID from mock data (later: database)
- Generate SEO metadata (title, description, Open Graph tags)
- Pre-render top 30 properties with `generateStaticParams`
- Render main 65/35 grid layout

**Layout Grid:**
```tsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
    {/* Left Column: Main Content (65%) */}
    <div className="lg:col-span-2 space-y-6">
      <ImageGallery />
      <PropertyHeader />
      <SpecificationBar />
      <PropertyTabs />
    </div>

    {/* Right Column: Sticky Sidebar (35%) */}
    <div className="lg:col-span-1">
      <div className="sticky top-6 space-y-4">
        <VerificationCard />
        <ListingSourceCard />
        <ContactForm />
        <MortgageEstimatorWidget />
      </div>
    </div>
  </div>
</div>
```

**Data Fetching:**
```tsx
async function getProperty(id: string): Promise<Property> {
  // Current: Mock data
  const { MOCK_PROPERTIES } = await import('@/lib/mock/properties');
  const property = MOCK_PROPERTIES.find(p => p.id === id);

  if (!property) {
    throw new Error('Property not found');
  }

  return property;
}
```

**Static Generation:**
```tsx
export async function generateStaticParams() {
  const { MOCK_PROPERTIES } = await import('@/lib/mock/properties');

  // Pre-render top 30 properties for performance
  return MOCK_PROPERTIES.slice(0, 30).map(p => ({ id: p.id }));
}
```

**Metadata Generation:**
```tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const property = await getProperty(params.id);

  return {
    title: `${property.address} - ${property.propertyType} for ${property.listingType}`,
    description: property.aiGeneratedDescription ||
      `${property.bedrooms} bed, ${property.bathrooms} bath ${property.propertyType} in ${property.district}`,
    openGraph: {
      images: [property.images.find(img => img.isPrimary)?.url || ''],
    },
  };
}
```

## Component Design

### Left Column Components (Main Content)

#### 1. ImageGallery (`image-gallery/ImageGallery.tsx`)

**Type:** Client Component (needs interactivity)
**Props:**
```tsx
{
  images: PropertyImage[];
  layout: PropertyLayout;
}
```

**Features:**
- **Tabbed Interface:** Photos / Floor Plans / 360° Tour
  - Only show tabs if content exists (e.g., hide Floor Plans if no floorplan)
- **Main Display:** Large image in 16:9 aspect ratio
- **Thumbnail Strip:** Horizontal scrollable row (5-6 visible at once)
- **Lightbox:** Click main image → open Shadcn Dialog full-screen view
- **Keyboard Navigation:** Arrow keys to navigate images, ESC to close lightbox

**State:**
```tsx
const [currentIndex, setCurrentIndex] = useState(0);
const [activeTab, setActiveTab] = useState<'photos' | 'floorplan' | '360'>('photos');
const [lightboxOpen, setLightboxOpen] = useState(false);
```

**Layout:**
```tsx
<div className="space-y-4">
  <Tabs value={activeTab} onValueChange={setActiveTab}>
    <TabsList>
      <TabsTrigger value="photos">Photos ({photoCount})</TabsTrigger>
      {layout.has2DFloorplan && <TabsTrigger value="floorplan">Floor Plan</TabsTrigger>}
      {layout.has360Tour && <TabsTrigger value="360">360° Tour</TabsTrigger>}
    </TabsList>

    <TabsContent value="photos">
      <div className="relative aspect-video bg-gray-100 rounded-xl overflow-hidden cursor-pointer"
           onClick={() => setLightboxOpen(true)}>
        <Image src={images[currentIndex].url} fill className="object-cover" />
      </div>

      <div className="flex gap-2 mt-4 overflow-x-auto">
        {images.map((img, idx) => (
          <button
            key={img.id}
            onClick={() => setCurrentIndex(idx)}
            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden
                       ${idx === currentIndex ? 'ring-2 ring-emerald-500' : ''}`}>
            <Image src={img.url} width={80} height={80} className="object-cover" />
          </button>
        ))}
      </div>
    </TabsContent>
  </Tabs>
</div>
```

#### 2. PropertyHeader (`header/PropertyHeader.tsx`)

**Type:** Server Component
**Props:** `{ property: Property }`

**Displays:**
- Property title (e.g., "Spacious 3-Bedroom Condo in Bishan")
- Full address with copy-to-clipboard button
- Verification banner (color-coded by `verificationLevel`)
- Price (large, bold) + PSF (smaller, gray)
- Action buttons: Share, Save to Favorites, Print, Add to Compare

**Verification Banner Logic:**
```tsx
const bannerConfig = {
  [VerificationLevel.FullyVerified]: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-500',
    text: 'text-emerald-700',
    icon: ShieldCheck,
    label: 'Fully Verified Listing',
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
```

#### 3. SpecificationBar (`header/SpecificationBar.tsx`)

**Type:** Server Component
**Props:** Property details

**Layout:**
Grid of key specifications with icons:
```tsx
<div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-gray-50 rounded-xl">
  <Spec icon={Bed} label="Bedrooms" value={property.bedrooms} />
  <Spec icon={Bath} label="Bathrooms" value={property.bathrooms} />
  <Spec icon={Ruler} label="Floor Area" value={`${property.floorAreaSqft} sqft`} />
  <Spec icon={DollarSign} label="PSF" value={`$${property.psf}`} />
  <Spec icon={Building} label="Floor Level" value={property.floorLevel || 'N/A'} />
  <Spec icon={Calendar} label="Tenure" value={formatTenure(property.tenure)} />
  <Spec icon={Clock} label="Listed" value={formatRelativeTime(property.createdAt)} />
</div>
```

#### 4. PropertyTabs (`tabs/PropertyTabs.tsx`)

**Type:** Client Component (tab state)
**Props:** `{ property: Property }`

**Contains 5 Tabs:**

**a) OverviewTab** (Server Component)
- AI-generated description (or fallback)
- AI highlights as badge list
- Facts grid: Completion year, unit number, postal code, etc.

**b) LocationTab** (Client Component)
- **Map:** Static OneMap image centered on property coordinates
  ```tsx
  <Image
    src={`https://www.onemap.gov.sg/api/staticmap?center=${lat},${lng}&zoom=16&width=800&height=400&points=[${lat},${lng},"red"]`}
    alt="Property location"
    width={800}
    height={400}
  />
  ```
- **MRT Table:** List of nearby MRT stations with distance/walking time
- **Amenities List:** Grouped by type (Schools, Supermarkets, Parks, Clinics)

**c) PriceHistoryTab** (Client Component)
- **Chart.js Line Chart:** Property price over time
  ```tsx
  <Line
    data={{
      labels: dates,
      datasets: [{
        label: 'Property Price',
        data: prices,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
      }]
    }}
    options={{
      responsive: true,
      scales: { y: { beginAtZero: false } }
    }}
  />
  ```
- **District Comparison:** Average prices in same district
- **Comparable Transactions:** Table of recent sales in same building/area

**d) SimilarPropertiesTab** (Server Component)
- Grid of PropertyCard components
- Filter: Same property type, ±20% price range, same district
- Limit to 6-9 similar properties

**e) CalculatorsTab** (Client Component)
- **Stamp Duty Calculator:** Full embedded calculator (reuse from /resources/calculators/stamp-duty)
- **Mortgage Estimator:** Full mortgage calculator
- **Affordability Check:** Full affordability calculator
- Each calculator pre-filled with property price

### Right Column Components (Sticky Sidebar)

#### 5. VerificationCard (`sidebar/VerificationCard.tsx`)

**Type:** Server Component
**Props:** `{ property: Property }`

**Displays:**
- List of verification checkmarks
  - ✓ Ownership documents verified
  - ✓ Legal documents verified
  - ✓ Owner Singpass verified (if applicable)
- "View Documents" button (future: links to presigned URLs)

```tsx
<Card>
  <CardHeader>
    <CardTitle className="text-lg">Verification Details</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-2">
      {property.verificationLevel >= VerificationLevel.OwnershipVerified && (
        <div className="flex items-center gap-2 text-sm text-green-700">
          <CheckCircle className="w-4 h-4" />
          <span>Ownership documents verified</span>
        </div>
      )}
      {property.verificationLevel === VerificationLevel.FullyVerified && (
        <div className="flex items-center gap-2 text-sm text-green-700">
          <CheckCircle className="w-4 h-4" />
          <span>Legal documents verified</span>
        </div>
      )}
    </div>

    <Button variant="outline" className="w-full mt-4">
      View Documents
    </Button>
  </CardContent>
</Card>
```

#### 6. ListingSourceCard (`sidebar/ListingSourceCard.tsx`)

**Type:** Server Component
**Props:** `{ property: Property }`

**Logic:**
```tsx
if (property.listingSource === ListingSource.OwnerDirect) {
  return (
    <Card>
      <CardHeader>
        <Badge className="bg-emerald-600">0% Commission</Badge>
        <CardTitle>Direct from Owner</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">
          Deal directly with the owner. No agent commission fees.
        </p>
      </CardContent>
    </Card>
  );
}

// Agent listing
return (
  <Card>
    <CardHeader>
      <CardTitle>Listed by Agent</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex items-center gap-3">
        <Avatar className="w-12 h-12">
          <AvatarImage src="/mock-agent.jpg" />
          <AvatarFallback>AG</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">John Doe (Mock Agent)</p>
          <p className="text-xs text-gray-500">CEA Reg: R123456A</p>
          <div className="flex items-center gap-1 mt-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs">4.8 (24 reviews)</span>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);
```

#### 7. ContactForm (`sidebar/ContactForm.tsx`)

**Type:** Client Component

**Fields:**
- Name (required)
- Email (required, format validation)
- Phone (optional, format: (65) XXXX XXXX)
- Message (required, pre-filled: "I'm interested in this property")

**Validation:**
```tsx
const schema = z.object({
  name: z.string().min(2, 'Name required'),
  email: z.string().email('Valid email required'),
  phone: z.string().regex(/^\(\d{2}\)\s\d{4}\s\d{4}$/).optional(),
  message: z.string().min(10, 'Message too short'),
});
```

**Submit Behavior:**
- Show success toast: "Message sent! Agent will contact you soon."
- No backend call yet (placeholder for future API)

#### 8. MortgageEstimatorWidget (`sidebar/MortgageEstimatorWidget.tsx`)

**Type:** Client Component

**Quick Calculator:**
```tsx
<Card>
  <CardHeader>
    <CardTitle className="text-lg">Mortgage Estimate</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-4">
      <div>
        <Label>Loan Amount (SGD)</Label>
        <Input
          type="number"
          value={loanAmount}
          onChange={(e) => setLoanAmount(Number(e.target.value))}
          placeholder={`${property.price * 0.75}`}
        />
      </div>

      <div className="p-4 bg-emerald-50 rounded-lg">
        <p className="text-sm text-gray-600">Estimated Monthly Payment</p>
        <p className="text-2xl font-bold text-emerald-600">
          ${calculateMonthlyPayment(loanAmount, 3.5, 25).toLocaleString()}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Based on 3.5% interest, 25 years
        </p>
      </div>
    </div>
  </CardContent>
</Card>
```

## Data Flow

### Server-Side Fetching

**Main Data Fetch:**
```tsx
// app/properties/[id]/page.tsx
export default async function PropertyPage({ params }) {
  const property = await getProperty(params.id);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <ImageGallery
          images={property.images}
          layout={property.layout}
        />
        <PropertyHeader property={property} />
        <SpecificationBar property={property} />
        <PropertyTabs property={property} />
      </div>

      <div className="lg:col-span-1">
        <div className="sticky top-6 space-y-4">
          <VerificationCard property={property} />
          <ListingSourceCard property={property} />
          <ContactForm propertyId={property.id} />
          <MortgageEstimatorWidget defaultPrice={property.price} />
        </div>
      </div>
    </div>
  );
}
```

### Prop Passing Strategy

**Full Property Object:**
- Server components receive complete `Property` type
- No performance concern (server-rendered)

**Partial Data:**
- Client components receive only needed fields
- Reduces client bundle size
- Example: `ImageGallery` gets `{ images, layout }` not full property

### State Management

**Component-Level State (No Global State):**
- ImageGallery: `currentIndex`, `activeTab`, `lightboxOpen`
- PropertyTabs: `activeTab`
- ContactForm: `formData`, `errors`
- MortgageEstimatorWidget: `loanAmount`, `calculatedPayment`

**No Zustand/Redux Needed:**
- Property data flows down from page as props
- Each component manages its own UI state
- Simpler architecture, easier to reason about

## Layout & Styling

### Grid Layout

**Desktop (≥1024px):**
```tsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <div className="lg:col-span-2">{/* 65% */}</div>
    <div className="lg:col-span-1">{/* 35% */}</div>
  </div>
</div>
```

**Mobile (<1024px):**
- Single column layout
- Vertical stack order:
  1. Image Gallery
  2. Property Header
  3. Specification Bar
  4. Property Tabs
  5. Verification Card
  6. Listing Source Card
  7. Contact Form
  8. Mortgage Estimator Widget

### Sticky Sidebar

```tsx
<div className="lg:col-span-1">
  <div className="sticky top-6 space-y-4">
    {/* Sidebar cards stack with 16px gap */}
    {/* Sticks to top with 24px offset when scrolling */}
  </div>
</div>
```

### Color Palette

**Primary:**
- Emerald: `#10b981` (emerald-600) - CTAs, active states
- Blue: `#3b82f6` (blue-600) - Links

**Verification Colors:**
- Fully Verified: `bg-emerald-50 border-emerald-500 text-emerald-700`
- Ownership Verified: `bg-yellow-50 border-yellow-500 text-yellow-700`
- Unverified: `bg-gray-50 border-gray-300 text-gray-600`

**Neutrals:**
- Text primary: `text-gray-900`
- Text secondary: `text-gray-700`
- Text muted: `text-gray-500`
- Borders: `border-gray-200`
- Backgrounds: `bg-gray-50`

### Typography

- **Page Title:** `text-3xl font-bold text-gray-900`
- **Section Headers:** `text-xl font-semibold text-gray-900`
- **Card Titles:** `text-lg font-semibold text-gray-900`
- **Body Text:** `text-base text-gray-700`
- **Metadata:** `text-sm text-gray-500`
- **Small Text:** `text-xs text-gray-500`

### Spacing Scale

- **Between major sections:** `space-y-8` (32px)
- **Between cards:** `space-y-4` (16px)
- **Card padding:** `p-6` (24px)
- **Card header/content gap:** `space-y-3` (12px)
- **Grid gaps:** `gap-8` (32px desktop), `gap-4` (16px mobile)

### Component Styles

**Cards:**
```tsx
className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
```

**Buttons:**
- Primary: `bg-emerald-600 hover:bg-emerald-700 text-white`
- Secondary: `border border-gray-300 hover:bg-gray-50 text-gray-700`
- Ghost: `hover:bg-gray-100 text-gray-700`

**Images:**
- Main gallery: `aspect-video rounded-xl overflow-hidden`
- Thumbnails: `w-20 h-20 rounded-lg overflow-hidden`
- Avatars: `w-12 h-12 rounded-full`

## Error Handling & Loading States

### Loading State (`app/properties/[id]/loading.tsx`)

**Skeleton UI:**
```tsx
export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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

        <div className="lg:col-span-1 space-y-4">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-80 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
```

### Error State (`app/properties/[id]/error.tsx`)

**Property Not Found:**
```tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <Alert variant="destructive" className="max-w-lg mx-auto">
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
  );
}
```

### Edge Cases

**Missing Images:**
```tsx
{images.length === 0 ? (
  <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center">
    <div className="text-center text-gray-400">
      <Image className="w-12 h-12 mx-auto mb-2" />
      <p className="text-sm">No images available</p>
    </div>
  </div>
) : (
  <ImageGallery images={images} layout={layout} />
)}
```

**Missing Agent Data:**
```tsx
// ListingSourceCard defaults to "Owner Direct" if no agent info
// Shows "0% Commission" badge
```

**Failed Chart Data:**
```tsx
// PriceHistoryTab
{priceData ? (
  <LineChart data={priceData} />
) : (
  <Alert>
    <AlertTitle>Price history unavailable</AlertTitle>
    <AlertDescription>
      Historical price data is not available for this property yet.
    </AlertDescription>
  </Alert>
)}
```

**Empty Similar Properties:**
```tsx
{similarProperties.length === 0 ? (
  <div className="text-center py-12">
    <p className="text-gray-500">No similar properties found</p>
    <Button variant="link" asChild>
      <Link href="/residential/buy">Browse all properties →</Link>
    </Button>
  </div>
) : (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {similarProperties.map(p => <PropertyCard key={p.id} property={p} />)}
  </div>
)}
```

### Form Validation

**ContactForm Validation:**
```tsx
const ContactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string()
    .regex(/^\(\d{2}\)\s\d{4}\s\d{4}$/, 'Format: (65) XXXX XXXX')
    .optional()
    .or(z.literal('')),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

// Show inline errors below each field
{errors.name && (
  <p className="text-xs text-red-600 mt-1">{errors.name}</p>
)}
```

## Testing Strategy

### Manual Verification Checklist

**Layout:**
- [ ] Desktop 65/35 split renders correctly
- [ ] Right sidebar is sticky when scrolling
- [ ] Mobile layout stacks vertically
- [ ] All components visible and aligned

**Image Gallery:**
- [ ] Tab switching works (Photos/Floor Plans/360)
- [ ] Thumbnail navigation works
- [ ] Lightbox opens on click
- [ ] Keyboard navigation (arrows, ESC) works
- [ ] Missing images show placeholder

**Property Tabs:**
- [ ] All 5 tabs switch correctly
- [ ] Overview shows description and highlights
- [ ] Location tab shows map and MRT data
- [ ] Price History tab shows chart
- [ ] Similar Properties tab shows property grid
- [ ] Calculators tab shows embedded calculators

**Sidebar:**
- [ ] Verification card shows correct badges
- [ ] Listing source shows owner/agent correctly
- [ ] Contact form validates inputs
- [ ] Mortgage estimator calculates correctly

**Responsiveness:**
- [ ] Test on mobile (320px, 375px, 414px)
- [ ] Test on tablet (768px, 1024px)
- [ ] Test on desktop (1280px, 1920px)

**Edge Cases:**
- [ ] Property not found shows error page
- [ ] Loading state shows skeletons
- [ ] Missing images handled gracefully
- [ ] Empty similar properties handled

### Browser Testing

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Mobile Safari (iOS)
- Chrome (Android)

## Acceptance Criteria

✅ **Functionality:**
- Property data fetches and displays correctly
- All tabs and interactive elements work
- Forms validate inputs properly
- Calculators compute correct values

✅ **Design:**
- 65/35 layout matches specification
- Verification colors match design system
- Spacing and typography consistent
- Mobile responsive layout works

✅ **Performance:**
- Page loads within 2 seconds
- Images optimized with Next.js Image
- Server components reduce client bundle
- Static generation for top 30 properties

✅ **User Experience:**
- Smooth tab transitions
- Clear error messages
- Loading states prevent confusion
- Sticky sidebar stays accessible

✅ **Code Quality:**
- Server/Client components properly separated
- TypeScript types complete and accurate
- Components follow single responsibility
- No console errors or warnings

## Future Enhancements

**Post-MVP Features:**
- Real-time availability updates
- Virtual tour integration (Matterport)
- 3D floor plan viewer
- Chat widget for instant agent contact
- Property comparison tool (side-by-side view)
- Save to favorites with user accounts
- Email alerts for price changes
- Share to social media
- Print-friendly view
- Schedule viewing appointment
- Download property brochure PDF

## References

- Property type definitions: `/types/property.ts`
- Mock property data: `/lib/mock/properties.ts`
- Existing PropertyCard: `/components/properties/PropertyCard.tsx`
- Shadcn components: Dialog, Tabs, Card, Button, Form
- Chart.js docs: https://www.chartjs.org/docs/latest/
- OneMap API: https://www.onemap.gov.sg/apidocs/
