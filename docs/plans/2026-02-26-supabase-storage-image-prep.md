# Supabase Storage Image Preparation — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Prepare all property image components for Supabase Storage by adding domain config, a resilient image wrapper with loading/error states, and a URL helper stub.

**Architecture:** `storageUrl.ts` transforms storage paths → URLs (passthrough now, Supabase SDK later). `PropertyImage.tsx` wraps `next/image` with a shimmer loader and an inline fallback (gray div + Home icon) that fires on `onError` or when `src` is falsy. Five property components swap raw `next/image` for `PropertyImage`. `next.config.ts` gains the four missing domain patterns.

**Tech Stack:** Next.js 16, React 19, TypeScript 5, Tailwind CSS 4, lucide-react, shadcn/ui

---

## Reference: Design Doc

Full design rationale: `docs/plans/2026-02-26-supabase-storage-image-prep-design.md`

---

## Task 1: Update next.config.ts with missing remote patterns

**Files:**
- Modify: `next.config.ts`

**Context:**
The file currently has `placehold.co` and `www.onemap.gov.sg`. Four domains are missing.
`*.supabase.co` uses a wildcard pattern — Next.js supports hostname wildcards with a leading `*`.

**Step 1: Open and read the current file**

Current content at `next.config.ts`:
```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'www.onemap.gov.sg',
      },
    ],
  },
};

export default nextConfig;
```

**Step 2: Replace the full file content**

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Current mock property images
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      // OneMap static map images (LocationTab)
      {
        protocol: 'https',
        hostname: 'www.onemap.gov.sg',
      },
      // Supabase Storage (all project subdomains)
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      // Google OAuth profile pictures (Auth.js / next-auth)
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      // Mock agent/user avatars
      {
        protocol: 'https',
        hostname: 'pravatar.cc',
      },
      // Picsum placeholder photos (forward-compat)
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },
};

export default nextConfig;
```

**Step 3: Verify TypeScript**

```bash
cd "d:/Antigravity Workspaces/Fifth/space-realty"
npx tsc --noEmit
```

Expected: 0 errors.

**Step 4: Commit**

```bash
git add next.config.ts
git commit -m "feat(config): add Supabase, Google OAuth, pravatar, and picsum remote image domains"
```

---

## Task 2: Create `lib/utils/storageUrl.ts`

**Files:**
- Create: `lib/utils/storageUrl.ts`

**Context:**
This is a stub. All current image URLs start with `https://` (absolute), so the function passes them through unchanged. The `SUPABASE:` comment marks the exact line to replace when Supabase Storage is wired up. Returning `''` for falsy paths lets the `PropertyImage` wrapper (Task 3) render its inline fallback without making a network request.

**Step 1: Create the file**

```ts
// lib/utils/storageUrl.ts

/**
 * Returns a display URL for a property image.
 *
 * MOCK:    Passes through absolute placehold.co URLs unchanged.
 * SUPABASE: Replace the return in the else branch with:
 *           return supabase.storage.from('property-images').getPublicUrl(path).data.publicUrl
 */
export function getPropertyImageUrl(path: string | null | undefined): string {
  if (!path) return ''
  if (path.startsWith('http')) return path
  // SUPABASE: return supabase.storage.from('property-images').getPublicUrl(path).data.publicUrl
  return path
}

/**
 * Returns a display URL for a user or agent avatar.
 *
 * MOCK:    Passes through absolute URLs unchanged.
 * SUPABASE: Replace the return in the else branch with:
 *           return supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl
 */
export function getAvatarUrl(path: string | null | undefined): string {
  if (!path) return ''
  if (path.startsWith('http')) return path
  // SUPABASE: return supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl
  return path
}
```

**Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

**Step 3: Commit**

```bash
git add lib/utils/storageUrl.ts
git commit -m "feat(utils): add storageUrl helpers stub for Supabase Storage migration"
```

---

## Task 3: Create `components/ui/PropertyImage.tsx`

**Files:**
- Create: `components/ui/PropertyImage.tsx`

**Context:**
This wraps `next/image` in three states:
1. **Fallback** — `src` is empty/null/undefined → renders inline `div` with `Home` icon immediately (no fetch)
2. **Loading** — valid `src`, shimmer visible behind image (implemented with `opacity-0` on the shimmer once loaded via `onLoad`)
3. **Loaded** — shimmer disappears, image fades in
4. **Error** — `onError` fires → `useState` switches to fallback view

The component always uses `fill={true}`. Callers are responsible for the sized, `position: relative` container. This matches every existing call site in the codebase.

**`sizes` guidance:** Callers should pass appropriate `sizes` strings. Good defaults:
- Card thumbnails: `"(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"`
- Comparison bar thumbnails: `"64px"`
- Gallery main: `"(max-width: 768px) 100vw, 70vw"`

**Step 1: Create the file**

```tsx
// components/ui/PropertyImage.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Home } from 'lucide-react';

interface PropertyImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  priority?: boolean;
  unoptimized?: boolean;
  sizes?: string;
}

/**
 * A wrapper around next/image for property photos.
 *
 * - Renders an inline gray + Home icon fallback when src is empty or image fails
 * - Shows a shimmer loading state until the image is ready
 * - Always uses fill mode — caller must provide a sized, position:relative container
 */
export function PropertyImage({
  src,
  alt,
  className = 'object-cover',
  priority = false,
  unoptimized = false,
  sizes,
}: PropertyImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  // Show fallback immediately for missing src OR after an error
  if (!src || errored) {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
        <Home className="w-8 h-8 text-gray-300" aria-hidden="true" />
      </div>
    );
  }

  return (
    <>
      {/* Shimmer shown while image loads */}
      {!loaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <Image
        src={src}
        alt={alt}
        fill
        className={className}
        priority={priority}
        unoptimized={unoptimized}
        sizes={sizes}
        onLoad={() => setLoaded(true)}
        onError={() => setErrored(true)}
      />
    </>
  );
}
```

**Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

**Step 3: Commit**

```bash
git add components/ui/PropertyImage.tsx
git commit -m "feat(ui): add PropertyImage wrapper with shimmer loader and inline fallback"
```

---

## Task 4: Replace `next/image` in `PropertyCard.tsx`

**Files:**
- Modify: `components/properties/PropertyCard.tsx`

**Context:**
`PropertyCard` has two variants — `PropertyCard` (full card, fill image) and `PropertyCardCompact` (small list row, fill image in a `w-16 h-16` container). Both have the same pattern: check `hasImage`, render `<Image fill ...>` if true, or a gradient div if false. After this task both variants delegate the null-check AND error handling to `PropertyImage` — the `{hasImage ? <Image> : <gradientDiv>}` ternary simplifies.

> **Note:** The gradient placeholder in `PropertyCard` (`getGradientClass`) should be kept for the lightbox and other colorful contexts. But for the card image area, the `PropertyImage` inline fallback (gray + Home icon) is simpler and consistent. Remove the `hasImage` ternary entirely and let `PropertyImage` handle both cases.

**Step 1: Update the import block**

Remove `Image from 'next/image'`, add `PropertyImage`:

```ts
// Remove this line:
import Image from 'next/image';

// Add this line (place it with the other component imports, after the type imports):
import { PropertyImage } from '@/components/ui/PropertyImage';
```

**Step 2: Replace the image block in `PropertyCard` (lines ~172–188)**

Find this block inside the `<div className="relative overflow-hidden rounded-t-xl ...">`:

```tsx
{hasImage ? (
  <Image
    src={primaryImage.url}
    alt={property.address}
    fill
    className="object-cover"
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  />
) : (
  <div
    role="img"
    aria-label={`${property.propertyType} property placeholder`}
    className={`w-full h-full bg-gradient-to-br ${gradientClass}`}
  />
)}
```

Replace with:

```tsx
<PropertyImage
  src={primaryImage?.url}
  alt={property.address}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>
```

**Step 3: Remove now-unused variables in `PropertyCard`**

The `hasImage` and `gradientClass` variables are no longer needed in the main card (they may still be used in `PropertyCardCompact` — check). If `gradientClass` is used nowhere else in the card function body, remove it. If `hasImage` is unused, remove it.

> Check: `gradientClass` appears only in the image ternary inside `PropertyCard`. `PropertyCardCompact` has its own local `gradientClass`. Remove both from `PropertyCard` only.

Remove these lines from `PropertyCard`:
```ts
const hasImage = primaryImage !== null;
const gradientClass = getGradientClass(property.propertyType);
```

**Step 4: Replace the image block in `PropertyCardCompact` (lines ~465–483)**

Find this block inside the `<div className="w-16 h-16 rounded-lg overflow-hidden ...">`:

```tsx
{hasImage ? (
  <div className="relative w-full h-full">
    <Image
      src={primaryImage.url}
      alt={property.address}
      fill
      className="object-cover"
      sizes="64px"
    />
  </div>
) : (
  <div
    role="img"
    aria-label={`${property.propertyType} property placeholder`}
    className={`w-full h-full bg-gradient-to-br ${gradientClass}`}
  />
)}
```

Replace with:

```tsx
<div className="relative w-full h-full">
  <PropertyImage
    src={primaryImage?.url}
    alt={property.address}
    sizes="64px"
  />
</div>
```

**Step 5: Remove now-unused variables in `PropertyCardCompact`**

Remove these lines from `PropertyCardCompact`:
```ts
const hasImage = primaryImage !== null;
const gradientClass = getGradientClass(property.propertyType);
```

**Step 6: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: 0 errors. If TypeScript complains that `getGradientClass` is now unused (it's still defined at module level), check whether any remaining code calls it. If not, remove the function and its `PropertyType` import if `PropertyType` is no longer needed.

**Step 7: Commit**

```bash
git add components/properties/PropertyCard.tsx
git commit -m "refactor(PropertyCard): replace next/image with PropertyImage wrapper"
```

---

## Task 5: Replace `next/image` in `ImageGallery.tsx`

**Files:**
- Modify: `components/properties/ImageGallery.tsx`

**Context:**
`ImageGallery` has 8 `<Image>` usages across three tab sections (photo, floorplan, 360tour) — each with a main image and a thumbnail strip — plus a lightbox. All use `fill` mode. Replace all 8 with `PropertyImage`.

The lightbox image (`currentTabImages[lightboxIndex]?.url`) can be undefined — `PropertyImage` handles this correctly by showing the fallback.

**Step 1: Update the import block**

```ts
// Remove:
import Image from 'next/image';

// Add:
import { PropertyImage } from '@/components/ui/PropertyImage';
```

**Step 2: Replace the Photo tab main image (line ~104)**

```tsx
// Remove:
<Image
  src={selectedImage?.url || photoImages[0].url}
  alt="Property photo"
  fill
  className="object-cover"
  priority
/>

// Replace with:
<PropertyImage
  src={selectedImage?.url ?? photoImages[0]?.url}
  alt="Property photo"
  priority
  sizes="(max-width: 768px) 100vw, 70vw"
/>
```

**Step 3: Replace Photo tab thumbnail images (line ~135)**

```tsx
// Remove:
<Image
  src={image.url}
  alt={`Thumbnail ${image.orderIndex + 1}`}
  fill
  className="object-cover"
/>

// Replace with:
<PropertyImage
  src={image.url}
  alt={`Thumbnail ${image.orderIndex + 1}`}
  sizes="80px"
/>
```

**Step 4: Replace Floorplan tab main image (line ~155)**

```tsx
// Remove:
<Image
  src={selectedImage?.url || floorplanImages[0].url}
  alt="Floor plan"
  fill
  className="object-contain"
/>

// Replace with:
<PropertyImage
  src={selectedImage?.url ?? floorplanImages[0]?.url}
  alt="Floor plan"
  className="object-contain"
  sizes="(max-width: 768px) 100vw, 70vw"
/>
```

**Step 5: Replace Floorplan tab thumbnails (line ~185)**

```tsx
// Remove:
<Image
  src={image.url}
  alt={`Floor plan ${image.orderIndex + 1}`}
  fill
  className="object-contain"
/>

// Replace with:
<PropertyImage
  src={image.url}
  alt={`Floor plan ${image.orderIndex + 1}`}
  className="object-contain"
  sizes="80px"
/>
```

**Step 6: Replace 360° Tour main image (line ~205)**

```tsx
// Remove:
<Image
  src={selectedImage?.url || tour360Images[0].url}
  alt="360° tour"
  fill
  className="object-cover"
/>

// Replace with:
<PropertyImage
  src={selectedImage?.url ?? tour360Images[0]?.url}
  alt="360° tour"
  sizes="(max-width: 768px) 100vw, 70vw"
/>
```

**Step 7: Replace 360° Tour thumbnails (line ~230)**

```tsx
// Remove:
<Image
  src={image.url}
  alt={`Tour ${image.orderIndex + 1}`}
  fill
  className="object-cover"
/>

// Replace with:
<PropertyImage
  src={image.url}
  alt={`Tour ${image.orderIndex + 1}`}
  sizes="80px"
/>
```

**Step 8: Replace the Lightbox image (line ~275)**

```tsx
// Remove:
<Image
  src={currentTabImages[lightboxIndex]?.url}
  alt={`Image ${lightboxIndex + 1}`}
  fill
  className="object-contain"
/>

// Replace with:
<PropertyImage
  src={currentTabImages[lightboxIndex]?.url}
  alt={`Image ${lightboxIndex + 1}`}
  className="object-contain"
  priority
  sizes="95vw"
/>
```

**Step 9: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

**Step 10: Commit**

```bash
git add components/properties/ImageGallery.tsx
git commit -m "refactor(ImageGallery): replace next/image with PropertyImage wrapper"
```

---

## Task 6: Replace `next/image` in `SimilarPropertiesTab.tsx`

**Files:**
- Modify: `components/properties/tabs/SimilarPropertiesTab.tsx`

**Context:**
One `<Image fill>` usage inside a `<div className="relative aspect-video ...">` container. The `imageUrl` field can be `/placeholder.jpg` (a local path that doesn't exist on disk) — `PropertyImage` handles this gracefully by showing the fallback when the image 404s.

**Step 1: Update the import block**

```ts
// Remove:
import Image from 'next/image';

// Add:
import { PropertyImage } from '@/components/ui/PropertyImage';
```

**Step 2: Replace the image (line ~63)**

```tsx
// Remove:
<Image
  src={similarProp.imageUrl}
  alt={similarProp.address}
  fill
  className="object-cover"
/>

// Replace with:
<PropertyImage
  src={similarProp.imageUrl}
  alt={similarProp.address}
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

**Step 3: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

**Step 4: Commit**

```bash
git add components/properties/tabs/SimilarPropertiesTab.tsx
git commit -m "refactor(SimilarPropertiesTab): replace next/image with PropertyImage wrapper"
```

---

## Task 7: Replace `next/image` in `ComparisonFloatingBar.tsx`

**Files:**
- Modify: `components/search/ComparisonFloatingBar.tsx`

**Context:**
One `<Image width={64} height={64}>` inside a `<div className="w-16 h-16 rounded-lg overflow-hidden ...">` container. The container is already a fixed 64px × 64px block. We need to add `relative` and `position: relative` so `fill` mode works, and remove the `width`/`height` props.

**Step 1: Update the import block**

```ts
// Remove:
import Image from 'next/image';

// Add:
import { PropertyImage } from '@/components/ui/PropertyImage';
```

**Step 2: Update the container div to add `relative`**

```tsx
// Find this line:
<div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-gray-200">

// Replace with:
<div className="relative w-16 h-16 rounded-lg overflow-hidden border-2 border-gray-200">
```

**Step 3: Replace the image (line ~52)**

```tsx
// Remove:
<Image
  src={primaryImage.url}
  alt={property.address}
  width={64}
  height={64}
  className="w-full h-full object-cover"
/>

// Replace with:
<PropertyImage
  src={primaryImage.url}
  alt={property.address}
  sizes="64px"
/>
```

**Step 4: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

**Step 5: Commit**

```bash
git add components/search/ComparisonFloatingBar.tsx
git commit -m "refactor(ComparisonFloatingBar): replace next/image with PropertyImage wrapper"
```

---

## Task 8: Replace `next/image` in `app/compare/page.tsx`

**Files:**
- Modify: `app/compare/page.tsx`

**Context:**
One `<Image fill>` inside `<div className="aspect-video relative overflow-hidden ...">`. The container already has `relative`. Simple swap.

**Step 1: Update the import block**

```ts
// Remove:
import Image from 'next/image';

// Add:
import { PropertyImage } from '@/components/ui/PropertyImage';
```

**Step 2: Replace the image (line ~69)**

```tsx
// Remove:
<Image
  src={primaryImage.url}
  alt={property.address}
  fill
  className="object-cover"
/>

// Replace with:
<PropertyImage
  src={primaryImage?.url}
  alt={property.address}
  sizes="(max-width: 768px) 100vw, 33vw"
/>
```

**Step 3: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

**Step 4: Commit**

```bash
git add app/compare/page.tsx
git commit -m "refactor(compare): replace next/image with PropertyImage wrapper"
```

---

## Task 9: Update `claude.md`

**Files:**
- Modify: `claude.md`

**Context:**
`claude.md` should document the image handling patterns so future work knows to use `PropertyImage` and `storageUrl.ts`.

**Step 1: Append to `claude.md`**

Add this section at the end of the file:

```markdown
---

## Image Handling Patterns

### PropertyImage Component

All property photo displays use `components/ui/PropertyImage.tsx`, NOT bare `next/image`.

**Signature:**
```tsx
<PropertyImage
  src={url}          // string | null | undefined — falsy → inline fallback
  alt="description"
  sizes="..."        // always provide for LCP performance
  priority           // only on above-the-fold hero images
  className="object-cover | object-contain"  // default: object-cover
/>
```

**Rule:** The parent container MUST be `position: relative` (Tailwind: `relative`) and have explicit dimensions. `PropertyImage` always renders with `fill={true}`.

**Fallback:** `src` is falsy OR image 404s → gray div + centered Home icon. No static placeholder files needed.

**Exception:** `LocationTab.tsx` (OneMap map image) uses bare `next/image` with `unoptimized`. This is intentional — the fallback should not be a Home icon for a map.

### URL Helpers

Before rendering any image URL, pass it through the appropriate helper:

```ts
import { getPropertyImageUrl, getAvatarUrl } from '@/lib/utils/storageUrl'

// For property images
<PropertyImage src={getPropertyImageUrl(property.images[0]?.url)} ... />

// For user/agent avatars
<img src={getAvatarUrl(user.avatarPath)} ... />
```

**SUPABASE migration:** When Supabase Storage is live, update only `lib/utils/storageUrl.ts`. The component layer needs zero changes.

### next.config.ts domains

All image source domains must be in `remotePatterns`. Currently configured:
- `placehold.co` — mock property images
- `www.onemap.gov.sg` — OneMap static map
- `*.supabase.co` — Supabase Storage (all project subdomains)
- `lh3.googleusercontent.com` — Google OAuth profile pictures
- `pravatar.cc` — mock agent/user avatars
- `picsum.photos` — future placeholder photos
```

**Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

**Step 3: Commit**

```bash
git add claude.md
git commit -m "docs(claude.md): document PropertyImage, storageUrl helpers, and image domain config"
```

---

## Final Verification

**Step 1: Full type check**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

**Step 2: Build check**

```bash
npm run build
```

Expected: Successful build, 0 TypeScript errors, 0 `next/image` warnings about missing domains.

**Step 3: Visual verification checklist**

Start the dev server (`npm run dev`) and check:

- [ ] `/residential/buy` — property cards show images with no console errors
- [ ] Any property card — the shimmer (gray pulse) is visible briefly before the image loads on slow connections (use DevTools → Network → Slow 3G)
- [ ] A property detail page → ImageGallery shows images, thumbnails are clickable, lightbox opens
- [ ] `/compare?ids=prop-001,prop-002` — comparison page shows property images
- [ ] Open DevTools → Console — no `next/image` domain errors for any loaded image

**Step 4: Final commit if any cleanup was done**

If any small cleanups were needed post-verification:
```bash
git add -p
git commit -m "chore: post-verification image handling cleanup"
```
