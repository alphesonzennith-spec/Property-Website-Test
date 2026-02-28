# SEO Configuration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add complete SEO configuration to Space Realty — metadata, structured data, sitemap, robots, and canonical URLs — targeting Singapore property search keywords to compete with PropertyGuru, 99.co, and EdgeProp.

**Architecture:** Centralise metadata helpers in `lib/seo/` to avoid repetition. All `'use client'` calculator pages require a thin server-component wrapper (`page.tsx`) to export `metadata` — the actual UI moves to a sibling `*View.tsx` file. JSON-LD structured data is rendered via a `<JsonLd>` server component dropped directly into page JSX.

**Tech Stack:** Next.js App Router `metadata` / `generateMetadata` exports, Next.js `MetadataRoute.Sitemap` / `MetadataRoute.Robots`, schema.org JSON-LD, TypeScript.

---

## Route → URL Map (reference)

| File path | Browser URL |
|---|---|
| `app/layout.tsx` | all pages |
| `app/page.tsx` | `/` |
| `app/about/page.tsx` | `/about` |
| `app/(portal)/buy/page.tsx` | `/buy` |
| `app/(portal)/rent/page.tsx` | `/rent` |
| `app/residential/buy/page.tsx` | `/residential/buy` |
| `app/residential/rent/page.tsx` | `/residential/rent` |
| `app/commercial/page.tsx` | `/commercial` |
| `app/commercial/buy/page.tsx` | `/commercial/buy` |
| `app/commercial/rent/page.tsx` | `/commercial/rent` |
| `app/properties/[id]/page.tsx` | `/properties/:id` |
| `app/resources/calculators/page.tsx` | `/resources/calculators` |
| `app/resources/calculators/stamp-duty/page.tsx` | `/resources/calculators/stamp-duty` |
| `app/resources/calculators/tdsr/page.tsx` | `/resources/calculators/tdsr` |
| `app/resources/calculators/mortgage/page.tsx` | `/resources/calculators/mortgage` |
| `app/resources/calculators/affordability/page.tsx` | `/resources/calculators/affordability` |
| `app/resources/calculators/cpf-optimizer/page.tsx` | `/resources/calculators/cpf-optimizer` |
| `app/resources/calculators/msr/page.tsx` | `/resources/calculators/msr` |
| `app/resources/calculators/property-value/page.tsx` | `/resources/calculators/property-value` |
| `app/resources/calculators/total-cost/page.tsx` | `/resources/calculators/total-cost` |
| `app/learn/page.tsx` | `/learn` |
| `app/learn/[category]/[module-slug]/page.tsx` | `/learn/:category/:slug` |
| `app/insights/page.tsx` | `/insights` |
| `app/directory/page.tsx` | `/directory` |
| `app/directory/[category]/[id]/page.tsx` | `/directory/:category/:id` |

---

## Task 1: Create `lib/seo/metadata.ts` — shared metadata helpers

**Files:**
- Create: `lib/seo/metadata.ts`

No tests for this (pure data transformation). Verify manually in Tasks 2–9.

**Step 1: Write the file**

```typescript
// lib/seo/metadata.ts
import type { Metadata } from 'next';
import type { Property } from '@/types';

/** Base production URL. Falls back to localhost for dev/preview. */
export const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || 'http://localhost:3000';

/** Site name used in all titles */
export const SITE_NAME = 'Space Realty';

/** Default OG image for pages that don't have a property photo */
export const DEFAULT_OG_IMAGE = `${BASE_URL}/og-default.png`;

// ── Formatters ────────────────────────────────────────────────────────────────

/** "$1,280,000" or "$3,200/mo" depending on listing type */
export function formatPropertyPrice(price: number, listingType: string): string {
  const formatted = price.toLocaleString('en-SG');
  return listingType === 'Rent' ? `$${formatted}/mo` : `$${formatted}`;
}

/**
 * Build the canonical property page title.
 * Formula: "[N]BR [Type] [For Sale/For Rent] at [Address] | $[Price] | Space Realty"
 * Example: "3BR Condo For Sale at Bishan Street 22 | $1,280,000 | Space Realty"
 * Commercial (no bedrooms): "Commercial Space For Sale at Raffles Place | $2,800,000 | Space Realty"
 */
export function buildPropertyTitle(property: Property): string {
  const verb = property.listingType === 'Sale' ? 'For Sale' : 'For Rent';
  const price = formatPropertyPrice(property.price, property.listingType);

  if (property.propertyType === 'Commercial' || !property.bedrooms) {
    return `${property.propertyType} Space ${verb} at ${property.address} | ${price} | ${SITE_NAME}`;
  }

  return `${property.bedrooms}BR ${property.propertyType} ${verb} at ${property.address} | ${price} | ${SITE_NAME}`;
}

/**
 * Build a rich OG description for a property.
 * Example: "3BR/2BA · 1,001 sqft · $679 psf · D18 Tampines · Partially Furnished · Ownership Verified"
 */
export function buildPropertyDescription(property: Property): string {
  const parts: string[] = [];

  if (property.bedrooms && property.bathrooms) {
    parts.push(`${property.bedrooms}BR/${property.bathrooms}BA`);
  }
  if (property.floorAreaSqft) {
    parts.push(`${property.floorAreaSqft.toLocaleString('en-SG')} sqft`);
  }
  if (property.psf) {
    parts.push(`$${property.psf.toLocaleString('en-SG')} psf`);
  }
  if (property.district) {
    parts.push(property.district);
  }
  if (property.furnishing) {
    parts.push(property.furnishing.replace(/([A-Z])/g, ' $1').trim());
  }
  if (property.verificationLevel && property.verificationLevel !== 'Unverified') {
    parts.push(property.verificationLevel.replace(/([A-Z])/g, ' $1').trim());
  }

  const base = parts.join(' · ');
  const aiDesc = property.aiGeneratedDescription;
  return aiDesc ? `${base}. ${aiDesc}` : base;
}

// ── Calculator metadata map ───────────────────────────────────────────────────

export interface CalculatorMeta {
  title: string;
  description: string;
  keywords: string[];
}

export const CALCULATOR_META: Record<string, CalculatorMeta> = {
  'stamp-duty': {
    title: 'Singapore Stamp Duty Calculator 2024 (BSD, ABSD, SSD)',
    description:
      'Free Singapore stamp duty calculator. Calculate Buyer\'s Stamp Duty (BSD), Additional BSD (ABSD), and Seller\'s Stamp Duty (SSD) using the latest 2024 IRAS rates. Instant results.',
    keywords: [
      'Singapore stamp duty calculator',
      'BSD calculator Singapore',
      'ABSD calculator 2024',
      'seller stamp duty SSD Singapore',
      'stamp duty Singapore property',
      'IRAS stamp duty calculator',
    ],
  },
  tdsr: {
    title: 'TDSR Calculator Singapore — Total Debt Servicing Ratio 2024',
    description:
      'Calculate your Total Debt Servicing Ratio (TDSR) for Singapore property. MAS 55% limit. Check if you qualify for a home loan and see how much you can borrow.',
    keywords: [
      'TDSR calculator Singapore',
      'total debt servicing ratio Singapore',
      'TDSR 55 percent MAS',
      'Singapore home loan eligibility',
      'TDSR limit explained',
    ],
  },
  mortgage: {
    title: 'Singapore Mortgage Calculator — HDB & Bank Loan 2024',
    description:
      'Calculate monthly mortgage repayments for HDB loans (2.6%) and bank loans (3.5%–5%). See amortisation schedule, total interest, and LTV limits for Singapore property.',
    keywords: [
      'Singapore mortgage calculator',
      'HDB loan calculator',
      'home loan calculator Singapore',
      'bank loan calculator Singapore',
      'monthly mortgage repayment Singapore',
    ],
  },
  affordability: {
    title: 'Singapore Property Affordability Calculator 2024',
    description:
      'Find out how much property you can afford in Singapore based on your income, CPF OA balance, and existing debts. Takes TDSR, MSR, and downpayment into account.',
    keywords: [
      'Singapore property affordability calculator',
      'how much property can I afford Singapore',
      'property budget calculator Singapore',
      'HDB affordability calculator',
    ],
  },
  'cpf-optimizer': {
    title: 'CPF OA Property Calculator Singapore — Optimise Your CPF',
    description:
      'Calculate how much CPF Ordinary Account you can use for your property purchase. See CPF accrued interest, Valuation Limit, and Withdrawal Limit for Singapore homes.',
    keywords: [
      'CPF property calculator Singapore',
      'CPF OA withdrawal limit property',
      'CPF accrued interest calculator',
      'use CPF to buy property Singapore',
    ],
  },
  msr: {
    title: 'MSR Calculator Singapore — Mortgage Servicing Ratio for HDB & EC',
    description:
      'Calculate your Mortgage Servicing Ratio (MSR) for HDB flats and Executive Condominiums. MAS 30% MSR limit. Check HDB loan eligibility instantly.',
    keywords: [
      'MSR calculator Singapore',
      'mortgage servicing ratio Singapore',
      'HDB MSR calculator',
      'MSR 30 percent limit HDB',
      'EC mortgage calculator',
    ],
  },
  'property-value': {
    title: 'Singapore Property Valuation Calculator — Estimate Your Home Value',
    description:
      'Estimate the market value of your Singapore property using recent transaction data, PSF benchmarks, and district comparables. HDB, condo, landed, and commercial.',
    keywords: [
      'Singapore property valuation calculator',
      'HDB valuation calculator',
      'condo value estimator Singapore',
      'Singapore property price calculator',
      'PSF calculator Singapore',
    ],
  },
  'total-cost': {
    title: 'Total Cost of Buying Property Singapore — Full Calculator 2024',
    description:
      'Calculate the all-in cost of buying a property in Singapore: purchase price, stamp duties (BSD+ABSD), legal fees, valuation, mortgage, CPF usage, and ongoing costs.',
    keywords: [
      'total cost buying property Singapore',
      'Singapore property buying costs breakdown',
      'hidden costs buying Singapore property',
      'upfront costs Singapore property',
    ],
  },
};

// ── Learning metadata helpers ─────────────────────────────────────────────────

/**
 * Build the title for a learning module page.
 * Target: "[Module Title] — Singapore Property Guide | Space Realty"
 * Example: "Understanding ABSD — Singapore Property Guide | Space Realty"
 */
export function buildModuleTitle(title: string): string {
  return `${title} — Singapore Property Guide | ${SITE_NAME}`;
}

/**
 * Build description for a learning module.
 * Appends "Free guide for Singapore homebuyers." if no custom summary.
 */
export function buildModuleDescription(summary: string | undefined, title: string): string {
  if (summary) return `${summary} Free Singapore property guide.`;
  return `${title}. Free Singapore homebuyer guide covering property laws, CPF, stamp duty, and more.`;
}

// ── Shared defaults ───────────────────────────────────────────────────────────

/** Base metadata shared by all pages. Override specific fields per page. */
export const DEFAULT_METADATA: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Space Realty — Singapore Property Platform',
    template: `%s | ${SITE_NAME}`,
  },
  description:
    'AI-native Singapore property platform. Buy, sell, or rent HDB, condo, landed, and commercial properties with Singpass verification and real-time market insights.',
  keywords: [
    'Singapore property',
    'HDB for sale',
    'condo for rent Singapore',
    'buy property Singapore',
    'Singapore real estate',
    'PropertyGuru alternative',
    'Singpass verified property',
  ],
  authors: [{ name: 'Space Realty' }],
  creator: 'Space Realty',
  publisher: 'Space Realty',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_SG',
    siteName: SITE_NAME,
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: 'Space Realty — Singapore Property Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@spacerealty',
    creator: '@spacerealty',
  },
  alternates: {
    languages: {
      'en-SG': BASE_URL,
      // Future: 'zh-CN': `${BASE_URL}/zh`, 'ms': `${BASE_URL}/ms`
    },
  },
};
```

**Step 2: Commit**

```bash
git add lib/seo/metadata.ts
git commit -m "feat(seo): add shared metadata helpers and calculator keyword map"
```

---

## Task 2: Create `lib/seo/jsonld.ts` — JSON-LD schema generators

**Files:**
- Create: `lib/seo/jsonld.ts`
- Create: `components/seo/JsonLd.tsx`

**Step 1: Write `lib/seo/jsonld.ts`**

```typescript
// lib/seo/jsonld.ts
import type { Property } from '@/types';
import { BASE_URL } from './metadata';

// ── Organization (rendered in root layout — appears on every page) ─────────

export function buildOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: 'Space Realty',
    alternateName: 'ALZEN Realty',
    url: BASE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${BASE_URL}/logo.png`,
      width: 200,
      height: 60,
    },
    description:
      'AI-native Singapore property platform for buying, selling, renting, and managing properties. Singpass-verified listings, real-time market insights.',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'SG',
      addressLocality: 'Singapore',
    },
    areaServed: {
      '@type': 'Country',
      name: 'Singapore',
    },
    knowsAbout: [
      'HDB Resale',
      'Singapore Condominium',
      'Landed Property Singapore',
      'Singapore Stamp Duty',
      'CPF Housing Grant',
      'TDSR MSR Singapore',
    ],
    // sameAs: ['https://www.facebook.com/spacerealty', 'https://www.linkedin.com/company/spacerealty'],
  };
}

// ── Property listing (rendered on /properties/[id]) ────────────────────────

export function buildPropertyJsonLd(property: Property, url: string) {
  const primaryImage =
    property.images.find((img) => img.isPrimary) || property.images[0];

  const listingType = property.listingType === 'Sale' ? 'ForSale' : 'ForRent';

  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: `${property.bedrooms ? `${property.bedrooms}BR ` : ''}${property.propertyType} ${
      property.listingType === 'Sale' ? 'For Sale' : 'For Rent'
    } at ${property.address}`,
    description: property.aiGeneratedDescription || undefined,
    url,
    image: primaryImage ? [primaryImage.url] : [],
    datePosted: property.createdAt
      ? new Date(property.createdAt).toISOString()
      : undefined,
    price: property.price,
    priceCurrency: 'SGD',
    priceValidUntil: new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000
    ).toISOString().split('T')[0],
    // Map our listingType to schema.org's offerType
    offers: {
      '@type': 'Offer',
      price: property.price,
      priceCurrency: 'SGD',
      availability: 'https://schema.org/InStock',
      itemOffered: {
        '@type': 'Accommodation',
        name: property.address,
        numberOfRooms: property.bedrooms || undefined,
        floorSize: property.floorAreaSqft
          ? {
              '@type': 'QuantitativeValue',
              value: property.floorAreaSqft,
              unitCode: 'FTK', // square feet
            }
          : undefined,
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'SG',
          addressLocality: 'Singapore',
          postalCode: property.postalCode,
          streetAddress: property.address,
        },
        geo: property.latitude && property.longitude
          ? {
              '@type': 'GeoCoordinates',
              latitude: property.latitude,
              longitude: property.longitude,
            }
          : undefined,
      },
    },
  };
}

// ── WebPage JSON-LD for calculator pages ──────────────────────────────────

export function buildCalculatorJsonLd(opts: {
  name: string;
  description: string;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: opts.name,
    description: opts.description,
    url: opts.url,
    applicationCategory: 'FinanceApplication',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'SGD',
    },
    operatingSystem: 'Web',
    provider: {
      '@type': 'Organization',
      name: 'Space Realty',
      url: BASE_URL,
    },
  };
}

// ── Article JSON-LD for learning module pages ──────────────────────────────

export function buildArticleJsonLd(opts: {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  category: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: opts.title,
    description: opts.description,
    url: opts.url,
    datePublished: opts.publishedAt,
    author: {
      '@type': 'Organization',
      name: 'Space Realty',
      url: BASE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Space Realty',
      url: BASE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/logo.png`,
      },
    },
    articleSection: opts.category,
    inLanguage: 'en-SG',
    about: {
      '@type': 'Thing',
      name: 'Singapore Property',
    },
  };
}
```

**Step 2: Write `components/seo/JsonLd.tsx`**

```tsx
// components/seo/JsonLd.tsx
// Server component — no 'use client' needed.
// Renders a <script type="application/ld+json"> tag with the given data.

interface JsonLdProps {
  data: Record<string, unknown>;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
```

**Step 3: Commit**

```bash
git add lib/seo/jsonld.ts components/seo/JsonLd.tsx
git commit -m "feat(seo): add JSON-LD schema generators and JsonLd component"
```

---

## Task 3: Update root layout — title template, defaults, org JSON-LD

**Files:**
- Modify: `app/layout.tsx`

**Step 1: Replace the metadata export and add `<JsonLd>` to the body**

Replace the existing `export const metadata` block and the layout body in `app/layout.tsx`:

```tsx
// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Toaster } from '@/components/ui/sonner';
import { MockControlPanel } from '@/components/dev/MockControlPanel';
import { JsonLd } from '@/components/seo/JsonLd';
import { DEFAULT_METADATA } from '@/lib/seo/metadata';
import { buildOrganizationJsonLd } from '@/lib/seo/jsonld';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = DEFAULT_METADATA;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-SG" className={inter.variable}>
      <body className="flex min-h-screen flex-col bg-background font-sans antialiased">
        <JsonLd data={buildOrganizationJsonLd()} />
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster />
          <MockControlPanel />
        </Providers>
      </body>
    </html>
  );
}
```

Key changes:
- `lang="en"` → `lang="en-SG"` (correct locale)
- `metadata` now uses `DEFAULT_METADATA` which includes `title.template` (`%s | Space Realty`)
- Org JSON-LD added above `<Providers>` so it renders on every page

**Step 2: Commit**

```bash
git add app/layout.tsx
git commit -m "feat(seo): update root layout with title template, OG defaults, org JSON-LD"
```

---

## Task 4: Update property detail page metadata and add property JSON-LD

**Files:**
- Modify: `app/properties/[id]/page.tsx`

**Step 1: Replace the `generateMetadata` function and add `<JsonLd>` to JSX**

At the top of the file, add these imports:

```typescript
import { buildPropertyTitle, buildPropertyDescription, BASE_URL } from '@/lib/seo/metadata';
import { buildPropertyJsonLd } from '@/lib/seo/jsonld';
import { JsonLd } from '@/components/seo/JsonLd';
```

Replace the existing `generateMetadata` function:

```typescript
export async function generateMetadata({ params }: PropertyPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const property = await getProperty(resolvedParams.id);

  if (!property) {
    return { title: 'Property Not Found' };
  }

  const primaryImage = property.images.find((img) => img.isPrimary) || property.images[0];
  const title = buildPropertyTitle(property);
  const description = buildPropertyDescription(property);
  const url = `${BASE_URL}/properties/${property.id}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        'en-SG': url,
        // Future: 'zh-CN': `${BASE_URL}/zh/properties/${property.id}`,
      },
    },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      images: primaryImage
        ? [
            {
              url: primaryImage.url,
              width: 1200,
              height: 800,
              alt: title,
            },
          ]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: primaryImage ? [primaryImage.url] : [],
    },
  };
}
```

In the `PropertyPage` component JSX, add `<JsonLd>` as the first child of `<main>`:

```tsx
export default async function PropertyPage({ params }: PropertyPageProps) {
  const resolvedParams = await params;
  const property = await getProperty(resolvedParams.id);

  if (!property) notFound();

  const url = `${BASE_URL}/properties/${property.id}`;

  return (
    <main className="min-h-screen bg-white">
      <JsonLd data={buildPropertyJsonLd(property, url)} />
      {/* ... rest of existing JSX unchanged ... */}
    </main>
  );
}
```

**Step 2: Commit**

```bash
git add app/properties/[id]/page.tsx
git commit -m "feat(seo): property page — keyword-rich title formula, OG tags, property JSON-LD"
```

---

## Task 5: Add metadata to listing/search pages + canonical URLs

These pages are already server components (no `'use client'`). Add `export const metadata` to each.

**Files to modify:**
- `app/(portal)/buy/page.tsx` → `/buy`
- `app/(portal)/rent/page.tsx` → `/rent`
- `app/residential/buy/page.tsx` → `/residential/buy`
- `app/residential/rent/page.tsx` → `/residential/rent`
- `app/residential/page.tsx` → `/residential`
- `app/commercial/page.tsx` → `/commercial`
- `app/commercial/buy/page.tsx` → `/commercial/buy`
- `app/commercial/rent/page.tsx` → `/commercial/rent`

**Step 1: Add metadata exports (exact values for each file)**

`app/(portal)/buy/page.tsx` — add at top of file (after imports):
```typescript
import type { Metadata } from 'next';
import { BASE_URL } from '@/lib/seo/metadata';

export const metadata: Metadata = {
  title: 'Buy Property in Singapore — HDB, Condo, Landed, Commercial',
  description: 'Search thousands of verified Singapore properties for sale. HDB resale, new launch condos, landed homes, and commercial spaces. Singpass-verified listings.',
  alternates: { canonical: `${BASE_URL}/buy` },
  openGraph: {
    title: 'Buy Property in Singapore',
    description: 'Browse verified HDB, condo, landed, and commercial properties for sale in Singapore.',
  },
};
```

`app/(portal)/rent/page.tsx`:
```typescript
export const metadata: Metadata = {
  title: 'Rent Property in Singapore — HDB, Condo, Landed, Commercial',
  description: 'Find rental properties in Singapore. HDB rooms & flats, condominiums, landed homes. Verified landlords. Search by district, price, and MRT line.',
  alternates: { canonical: `${BASE_URL}/rent` },
};
```

`app/residential/buy/page.tsx`:
```typescript
export const metadata: Metadata = {
  title: 'Buy Residential Property in Singapore — HDB & Condo For Sale',
  description: 'Search HDB resale flats and private condominiums for sale in Singapore. Filter by district, price, bedrooms, and more. Singpass-verified listings.',
  alternates: {
    canonical: `${BASE_URL}/residential/buy`,  // canonical = clean URL, ignores all filter query params
  },
};
```

`app/residential/rent/page.tsx`:
```typescript
export const metadata: Metadata = {
  title: 'Rent Residential Property in Singapore — HDB & Condo For Rent',
  description: 'Rent HDB flats, condominiums, and private apartments in Singapore. All budgets and districts. Direct owner and agent listings.',
  alternates: { canonical: `${BASE_URL}/residential/rent` },
};
```

`app/residential/page.tsx`:
```typescript
export const metadata: Metadata = {
  title: 'Residential Property Singapore — Buy & Rent HDB, Condo, Landed',
  description: 'Explore Singapore residential property listings. Buy or rent HDB flats, condominiums, executive condos, and landed homes across all 28 districts.',
  alternates: { canonical: `${BASE_URL}/residential` },
};
```

`app/commercial/page.tsx`:
```typescript
export const metadata: Metadata = {
  title: 'Commercial Property Singapore — Office, Retail, Industrial For Sale & Rent',
  description: 'Find commercial properties in Singapore. Office spaces, retail shops, shophouses, and industrial units for sale and rent. All districts and budgets.',
  alternates: { canonical: `${BASE_URL}/commercial` },
};
```

`app/commercial/buy/page.tsx`:
```typescript
export const metadata: Metadata = {
  title: 'Commercial Property For Sale in Singapore — Office, Shophouse, Retail',
  description: 'Buy commercial property in Singapore. Office units, retail shops, shophouses, and industrial spaces. Direct listings and agent-managed properties.',
  alternates: { canonical: `${BASE_URL}/commercial/buy` },
};
```

`app/commercial/rent/page.tsx`:
```typescript
export const metadata: Metadata = {
  title: 'Commercial Property For Rent in Singapore — Office, Shophouse, Retail',
  description: 'Rent commercial space in Singapore. Office units, co-working spaces, retail shops, and industrial facilities available now.',
  alternates: { canonical: `${BASE_URL}/commercial/rent` },
};
```

**Step 2: Commit**

```bash
git add app/\(portal\)/buy/page.tsx app/\(portal\)/rent/page.tsx \
        app/residential/buy/page.tsx app/residential/rent/page.tsx \
        app/residential/page.tsx \
        app/commercial/page.tsx app/commercial/buy/page.tsx app/commercial/rent/page.tsx
git commit -m "feat(seo): add metadata + canonical URLs to listing search pages"
```

---

## Task 6: Calculator pages — server wrapper pattern

All 8 calculator detail pages are `'use client'` and cannot export `metadata`. The fix:
1. Rename each `page.tsx` → `[Name]View.tsx` (keep all existing content)
2. Create a new thin `page.tsx` (server component) that exports `metadata` and renders `<[Name]View />`

**Files (repeat this pattern for all 8 calculators):**

| Calculator | Rename existing to | New page.tsx renders |
|---|---|---|
| `stamp-duty` | `StampDutyView.tsx` | `<StampDutyView />` |
| `tdsr` | `TdsrView.tsx` | `<TdsrView />` |
| `mortgage` | `MortgageView.tsx` | `<MortgageView />` |
| `affordability` | `AffordabilityView.tsx` | `<AffordabilityView />` |
| `cpf-optimizer` | `CpfOptimizerView.tsx` | `<CpfOptimizerView />` |
| `msr` | `MsrView.tsx` | `<MsrView />` |
| `property-value` | `PropertyValueView.tsx` | `<PropertyValueView />` |
| `total-cost` | `TotalCostView.tsx` | `<TotalCostView />` |

**Step 1: Rename existing `page.tsx` files (using bash)**

```bash
cd "d:/Antigravity Workspaces/Fifth/space-realty/app/resources/calculators"

mv stamp-duty/page.tsx stamp-duty/StampDutyView.tsx
mv tdsr/page.tsx tdsr/TdsrView.tsx
mv mortgage/page.tsx mortgage/MortgageView.tsx
mv affordability/page.tsx affordability/AffordabilityView.tsx
mv cpf-optimizer/page.tsx cpf-optimizer/CpfOptimizerView.tsx
mv msr/page.tsx msr/MsrView.tsx
mv property-value/page.tsx property-value/PropertyValueView.tsx
mv total-cost/page.tsx total-cost/TotalCostView.tsx
```

**Step 2: Create 8 new server-component `page.tsx` files**

Template for each (substitute the slug, view component name, and JSON-LD description):

`app/resources/calculators/stamp-duty/page.tsx`:
```tsx
import type { Metadata } from 'next';
import { BASE_URL, CALCULATOR_META } from '@/lib/seo/metadata';
import { buildCalculatorJsonLd } from '@/lib/seo/jsonld';
import { JsonLd } from '@/components/seo/JsonLd';
import StampDutyView from './StampDutyView';

const slug = 'stamp-duty';
const meta = CALCULATOR_META[slug];
const url = `${BASE_URL}/resources/calculators/${slug}`;

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  keywords: meta.keywords,
  alternates: { canonical: url },
  openGraph: { title: meta.title, description: meta.description, url },
};

export default function StampDutyPage() {
  return (
    <>
      <JsonLd data={buildCalculatorJsonLd({ name: meta.title, description: meta.description, url })} />
      <StampDutyView />
    </>
  );
}
```

Repeat for `tdsr`, `mortgage`, `affordability`, `cpf-optimizer`, `msr`, `property-value`, `total-cost` — only change `slug`, `meta = CALCULATOR_META[slug]`, the view component name, and the export function name.

Also add metadata to the calculators hub page (already a server component):

`app/resources/calculators/page.tsx` — add at top:
```typescript
import type { Metadata } from 'next';
import { BASE_URL } from '@/lib/seo/metadata';

export const metadata: Metadata = {
  title: 'Singapore Property Calculators — Stamp Duty, TDSR, Mortgage, CPF',
  description: 'Free Singapore property calculators. Calculate stamp duty (BSD+ABSD+SSD), TDSR, MSR, mortgage repayments, CPF usage, affordability, and total buying cost.',
  alternates: { canonical: `${BASE_URL}/resources/calculators` },
  keywords: ['Singapore property calculator', 'stamp duty calculator', 'TDSR calculator', 'mortgage calculator Singapore'],
};
```

**Step 3: Commit**

```bash
git add app/resources/calculators/
git commit -m "feat(seo): calculator pages — split client views, add per-page metadata + JSON-LD"
```

---

## Task 7: Learning hub and module page metadata

**Files:**
- Modify: `app/learn/page.tsx`
- Modify: `app/learn/[category]/[module-slug]/page.tsx`

**Step 1: Add metadata to the learning hub**

`app/learn/page.tsx` — add at top (server component, already no `'use client'`):
```typescript
import type { Metadata } from 'next';
import { BASE_URL } from '@/lib/seo/metadata';

export const metadata: Metadata = {
  title: 'Singapore Property Knowledge Hub — Free Guides & Explainers',
  description: 'Free Singapore property guides covering ABSD, stamp duty, HDB buying process, CPF usage, TDSR/MSR limits, renovation tips, and market insights. Learn before you buy.',
  alternates: { canonical: `${BASE_URL}/learn` },
  keywords: [
    'Singapore property guide',
    'HDB buying guide Singapore',
    'ABSD explained Singapore',
    'TDSR Singapore explained',
    'CPF for property Singapore',
    'Singapore real estate education',
  ],
};
```

**Step 2: Add `generateMetadata` and JSON-LD to the module page**

`app/learn/[category]/[module-slug]/page.tsx` — this page uses `MOCK_MODULES` hardcoded data. Add the following before the `generateStaticParams` function:

```typescript
import type { Metadata } from 'next';
import { buildModuleTitle, buildModuleDescription, BASE_URL } from '@/lib/seo/metadata';
import { buildArticleJsonLd } from '@/lib/seo/jsonld';
import { JsonLd } from '@/components/seo/JsonLd';

export async function generateMetadata({
  params,
}: {
  params: { category: string; 'module-slug': string };
}): Promise<Metadata> {
  const module = MOCK_MODULES.find((m) => m.slug === params['module-slug']);

  if (!module) return { title: 'Module Not Found' };

  const title = buildModuleTitle(module.title);
  const description = buildModuleDescription(module.summary, module.title);
  const url = `${BASE_URL}/learn/${params.category}/${params['module-slug']}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'article',
    },
  };
}
```

In the `LearningModulePage` component JSX, add `<JsonLd>` before the header section:

```tsx
export default function LearningModulePage({ params }: { ... }) {
  const module = MOCK_MODULES.find(m => m.slug === params['module-slug']);
  if (!module) notFound();

  const url = `${BASE_URL}/learn/${params.category}/${params['module-slug']}`;

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <JsonLd
        data={buildArticleJsonLd({
          title: module.title,
          description: module.summary,
          url,
          publishedAt: '2024-01-15', // use actual publishedAt when DB-driven
          category: params.category,
        })}
      />
      {/* ... existing JSX unchanged ... */}
    </main>
  );
}
```

**Step 3: Commit**

```bash
git add app/learn/page.tsx app/learn/[category]/[module-slug]/page.tsx
git commit -m "feat(seo): learning pages — hub metadata, module generateMetadata, article JSON-LD"
```

---

## Task 8: Remaining static pages metadata

**Files:**
- Modify: `app/page.tsx` (home)
- Modify: `app/about/page.tsx`
- Modify: `app/insights/page.tsx`
- Modify: `app/directory/page.tsx`
- Modify: `app/resources/page.tsx`

All are server components. Add `export const metadata` to each (they inherit the title template from root layout).

`app/page.tsx`:
```typescript
export const metadata: Metadata = {
  title: 'Space Realty — Singapore Property Platform | Buy, Rent, Sell',
  description: 'AI-native Singapore property platform. Browse verified HDB, condo, landed, and commercial listings. Singpass verification, real-time market insights, and free property calculators.',
  alternates: { canonical: BASE_URL },
  openGraph: {
    type: 'website',
    url: BASE_URL,
    title: 'Space Realty — Singapore Property Platform',
    description: 'Buy, rent, and sell Singapore property with AI-powered insights and Singpass-verified listings.',
  },
};
```

`app/about/page.tsx`:
```typescript
export const metadata: Metadata = {
  title: 'About Space Realty — Singapore\'s AI-Native Property Platform',
  description: 'Space Realty is Singapore\'s first AI-native property platform. Singpass-verified listings, real-time URA data, and AI-powered property insights for buyers, renters, and sellers.',
  alternates: { canonical: `${BASE_URL}/about` },
};
```

`app/insights/page.tsx`:
```typescript
export const metadata: Metadata = {
  title: 'Singapore Property Market Insights — Price Trends, District Analysis',
  description: 'Real-time Singapore property market data. District price trends, transaction volumes, rental yields, and AI market analysis. HDB, condo, and landed property data.',
  alternates: { canonical: `${BASE_URL}/insights` },
  keywords: ['Singapore property market 2024', 'HDB resale price trend', 'Singapore condo price index', 'district property analysis'],
};
```

`app/directory/page.tsx`:
```typescript
export const metadata: Metadata = {
  title: 'Singapore Property Service Directory — Lawyers, Mortgage Brokers, Renovators',
  description: 'Find trusted Singapore property service providers. Conveyancing lawyers, mortgage brokers, interior designers, renovation contractors, and more. Singpass-verified professionals.',
  alternates: { canonical: `${BASE_URL}/directory` },
};
```

`app/resources/page.tsx`:
```typescript
export const metadata: Metadata = {
  title: 'Singapore Property Resources — Calculators, Guides, Market Data',
  description: 'Free Singapore property tools: stamp duty, TDSR/MSR, mortgage, CPF calculators; property buying guides; and live URA market data.',
  alternates: { canonical: `${BASE_URL}/resources` },
};
```

**Step 4: Commit**

```bash
git add app/page.tsx app/about/page.tsx app/insights/page.tsx app/directory/page.tsx app/resources/page.tsx
git commit -m "feat(seo): add metadata to home, about, insights, directory, resources pages"
```

---

## Task 9: `app/sitemap.ts`

**Files:**
- Create: `app/sitemap.ts`

**Step 1: Write the sitemap**

```typescript
// app/sitemap.ts
import type { MetadataRoute } from 'next';
import { mockProperties } from '@/lib/mock/properties';
import { mockLearningModules } from '@/lib/mock/learningModules';
import { BASE_URL } from '@/lib/seo/metadata';

// ── Helpers ───────────────────────────────────────────────────────────────────

function toDate(val: unknown): Date {
  if (val instanceof Date) return val;
  if (typeof val === 'string' || typeof val === 'number') {
    const d = new Date(val);
    return isNaN(d.getTime()) ? new Date() : d;
  }
  return new Date();
}

// ── Sitemap ───────────────────────────────────────────────────────────────────

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // ── Static pages ────────────────────────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL,                              lastModified: now, changeFrequency: 'daily',   priority: 1.0 },
    { url: `${BASE_URL}/residential/buy`,         lastModified: now, changeFrequency: 'hourly',  priority: 0.9 },
    { url: `${BASE_URL}/residential/rent`,        lastModified: now, changeFrequency: 'hourly',  priority: 0.9 },
    { url: `${BASE_URL}/commercial/buy`,          lastModified: now, changeFrequency: 'daily',   priority: 0.8 },
    { url: `${BASE_URL}/commercial/rent`,         lastModified: now, changeFrequency: 'daily',   priority: 0.8 },
    { url: `${BASE_URL}/residential`,             lastModified: now, changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${BASE_URL}/commercial`,              lastModified: now, changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${BASE_URL}/resources/calculators`,   lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/resources/calculators/stamp-duty`,    lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/resources/calculators/tdsr`,          lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/resources/calculators/mortgage`,      lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/resources/calculators/affordability`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/resources/calculators/cpf-optimizer`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/resources/calculators/msr`,           lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/resources/calculators/property-value`,lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/resources/calculators/total-cost`,    lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/learn`,                   lastModified: now, changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${BASE_URL}/insights`,                lastModified: now, changeFrequency: 'daily',   priority: 0.6 },
    { url: `${BASE_URL}/directory`,               lastModified: now, changeFrequency: 'weekly',  priority: 0.6 },
    { url: `${BASE_URL}/about`,                   lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ];

  // ── Property pages ───────────────────────────────────────────────────────────
  // Priority: featured=0.9, active=0.8, default=0.7
  const propertyPages: MetadataRoute.Sitemap = mockProperties.map((p) => ({
    url: `${BASE_URL}/properties/${p.id}`,
    lastModified: toDate(p.updatedAt),
    changeFrequency: 'daily' as const,
    priority: p.featured ? 0.9 : p.status === 'Active' ? 0.8 : 0.5,
  }));

  // ── Learning module pages ─────────────────────────────────────────────────────
  const learningPages: MetadataRoute.Sitemap = mockLearningModules.map((m) => ({
    url: `${BASE_URL}/learn/${m.category.toLowerCase()}/${m.slug}`,
    lastModified: toDate(m.publishedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...propertyPages, ...learningPages];
}
```

**Step 2: Verify it builds**

```bash
cd "d:/Antigravity Workspaces/Fifth/space-realty"
npx next build 2>&1 | grep -E "sitemap|error|Error" | head -20
```

Expected: No errors. `sitemap.xml` generated in `.next/`.

**Step 3: Commit**

```bash
git add app/sitemap.ts
git commit -m "feat(seo): add sitemap.ts — all property, calculator, and learning module URLs"
```

---

## Task 10: `app/robots.ts`

**Files:**
- Create: `app/robots.ts`

**Step 1: Write the robots file**

```typescript
// app/robots.ts
import type { MetadataRoute } from 'next';
import { BASE_URL } from '@/lib/seo/metadata';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/properties/',
          '/residential/',
          '/commercial/',
          '/buy',
          '/rent',
          '/resources/',
          '/learn/',
          '/insights/',
          '/directory/',
          '/about',
        ],
        disallow: [
          '/api/',
          '/profile/',
          '/family/',
          '/list-property/',
          '/auth/',
          '/verify',
          '/compare',           // personalised — no value to index
          '/test-property-card', // dev page
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
```

**Step 2: Commit**

```bash
git add app/robots.ts
git commit -m "feat(seo): add robots.ts — allow listings/calculators/learn, block auth/api/dashboard"
```

---

## Task 11: hreflang — English-only with future flags

hreflang is already wired into `DEFAULT_METADATA` in Task 1 (`alternates.languages`). Per-page `generateMetadata` functions each pass `alternates.canonical` and `alternates.languages`.

**For property pages** (Task 4 already handles this):
```typescript
alternates: {
  canonical: url,
  languages: {
    'en-SG': url,
    // FUTURE: uncomment when Chinese/Malay routes are added
    // 'zh-CN': `${BASE_URL}/zh/properties/${property.id}`,
    // 'ms-MY': `${BASE_URL}/ms/properties/${property.id}`,
    // 'x-default': url,
  },
},
```

No additional files needed — this is already covered by the tasks above. Leave commented-out `'zh-CN'` and `'ms'` entries in `lib/seo/metadata.ts` `DEFAULT_METADATA` as the flag for future localisation.

**No commit needed** — this is handled in Tasks 1, 4, and 5.

---

## Task 12: Final verification

**Step 1: Build the project**

```bash
cd "d:/Antigravity Workspaces/Fifth/space-realty"
npx next build
```

Expected: Zero errors. No "metadata cannot be exported from a Client Component" warnings.

**Step 2: Check generated sitemap**

```bash
npx next start &
curl http://localhost:3000/sitemap.xml | head -60
```

Expected: XML with all property, calculator, and learning URLs.

**Step 3: Check robots.txt**

```bash
curl http://localhost:3000/robots.txt
```

Expected: `Disallow: /api/` etc., `Sitemap: http://localhost:3000/sitemap.xml`.

**Step 4: Spot-check JSON-LD on a property page**

```bash
curl -s http://localhost:3000/properties/prop-001 | grep -A 30 'application/ld+json'
```

Expected: Two JSON-LD blocks — Organization (from layout) + RealEstateListing (from property page).

**Step 5: Validate title formula**

Open `http://localhost:3000/properties/prop-001` in browser. Check `<title>` tag:
Expected: `3BR HDB For Sale at Tampines Street 81 | $680,000 | Space Realty`

**Step 6: Final commit**

```bash
git add -A
git commit -m "feat(seo): complete SEO configuration — metadata, JSON-LD, sitemap, robots, canonicals"
```

---

## Summary of all files

| Action | File |
|---|---|
| Create | `lib/seo/metadata.ts` |
| Create | `lib/seo/jsonld.ts` |
| Create | `components/seo/JsonLd.tsx` |
| Create | `app/sitemap.ts` |
| Create | `app/robots.ts` |
| Modify | `app/layout.tsx` |
| Modify | `app/page.tsx` |
| Modify | `app/about/page.tsx` |
| Modify | `app/insights/page.tsx` |
| Modify | `app/directory/page.tsx` |
| Modify | `app/resources/page.tsx` |
| Modify | `app/resources/calculators/page.tsx` |
| Modify | `app/properties/[id]/page.tsx` |
| Modify | `app/(portal)/buy/page.tsx` |
| Modify | `app/(portal)/rent/page.tsx` |
| Modify | `app/residential/page.tsx` |
| Modify | `app/residential/buy/page.tsx` |
| Modify | `app/residential/rent/page.tsx` |
| Modify | `app/commercial/page.tsx` |
| Modify | `app/commercial/buy/page.tsx` |
| Modify | `app/commercial/rent/page.tsx` |
| Modify | `app/learn/page.tsx` |
| Modify | `app/learn/[category]/[module-slug]/page.tsx` |
| Rename + Create (×8) | All 8 `app/resources/calculators/*/page.tsx` → `*View.tsx` + new server `page.tsx` |

**Total: 5 creates, 15 modifies, 8 rename+create pairs = 36 file operations**
