# Supabase Storage Image Preparation — Design

**Date:** 2026-02-26
**Status:** Approved

---

## Problem

Property images currently use `placehold.co` placeholder URLs. When we migrate to real Supabase Storage, every image component will need to:

1. Handle load errors gracefully (real images can fail; mock ones never do)
2. Show a loading state during fetch
3. Accept relative Supabase Storage paths as well as absolute mock URLs
4. Work without any code changes at the call sites once Supabase is live

Currently none of the 6 files using `next/image` have `onError` handlers, and `next.config.ts` is missing the Supabase and OAuth domains.

---

## Audit Findings

### Files Using `next/image`

| File | Mode | `onError`? | Notes |
|------|------|-----------|-------|
| `components/properties/PropertyCard.tsx` | `fill` | ❌ | Main card + compact variant |
| `components/properties/ImageGallery.tsx` | `fill` ×8 | ❌ | Main, thumbnails, lightbox |
| `components/properties/tabs/SimilarPropertiesTab.tsx` | `fill` | ❌ | |
| `components/search/ComparisonFloatingBar.tsx` | `w=64 h=64` | ❌ | Sized wrapper present |
| `app/compare/page.tsx` | `fill` | ❌ | |
| `components/properties/tabs/LocationTab.tsx` | `fill` + `unoptimized` | ❌ | **Map image — left as raw next/image** |

### Mock Image Sources

- **Property images:** `placehold.co` (not `picsum.photos` — spec note was incorrect)
- **Location maps:** `www.onemap.gov.sg` (dynamic API URL, `unoptimized`)
- **Agent avatars:** `pravatar.cc` — referenced in spec, not yet used in mock data
- **Auth profile pics:** `lh3.googleusercontent.com` — Google OAuth via Auth.js

### `next.config.ts` Gaps

Currently configured: `placehold.co`, `www.onemap.gov.sg`
Missing: `*.supabase.co`, `lh3.googleusercontent.com`, `pravatar.cc`, `picsum.photos`

---

## Design Decisions

### Fallback style: Inline div (not static files)

`/public/images/property-placeholder.jpg` and `avatar-placeholder.jpg` do not exist.
Rather than creating placeholder image files, we use an inline CSS solution: gray background + centered `Home` icon from `lucide-react`. This matches the existing gradient placeholder pattern in `PropertyCard.tsx` and requires no static asset management.

### `PropertyImage` API: Single component, fill-first

All 6 call sites already use `fill` mode inside a relatively-positioned container. The component always renders with `fill={true}`. Callers size the container; the component handles error, loading, and fallback states.

### `LocationTab.tsx`: Left unchanged

The OneMap image is a map API response, not a property photo. Showing a Home icon when a map fails to load is semantically wrong. `LocationTab.tsx` keeps its raw `next/image` with `unoptimized`.

---

## Architecture

### Task 1 — `next.config.ts` additions

Add 4 `remotePatterns`:

```ts
{ protocol: 'https', hostname: '*.supabase.co' }
{ protocol: 'https', hostname: 'lh3.googleusercontent.com' }
{ protocol: 'https', hostname: 'pravatar.cc' }
{ protocol: 'https', hostname: 'picsum.photos' }
```

### Task 2 — `components/ui/PropertyImage.tsx`

```ts
interface PropertyImageProps {
  src?: string | null
  alt: string
  className?: string
  priority?: boolean
  unoptimized?: boolean
  sizes?: string
}
```

**State machine:**

```
src is empty/null ──────────────────────→ render inline fallback (no request)
src is valid  →  loading (shimmer pulse)
              →  loaded  (shimmer fades out via opacity-0 transition)
              →  error   (onError fires → render inline fallback)
```

**Inline fallback UI:**

```
┌─────────────────────────────┐
│    bg-gray-100              │
│                             │
│        🏠 (gray-300)        │
│                             │
└─────────────────────────────┘
```

Implemented with: `w-full h-full bg-gray-100 flex items-center justify-center`
Icon: `Home` from `lucide-react`, `className="w-8 h-8 text-gray-300"`

**Files updated to use `PropertyImage`:**
- `components/properties/PropertyCard.tsx`
- `components/properties/ImageGallery.tsx`
- `components/properties/tabs/SimilarPropertiesTab.tsx`
- `components/search/ComparisonFloatingBar.tsx`
- `app/compare/page.tsx`

### Task 3 — `lib/utils/storageUrl.ts`

```ts
export function getPropertyImageUrl(path: string): string {
  if (!path) return ''  // PropertyImage renders inline fallback when src is falsy
  if (path.startsWith('http')) return path  // mock placehold.co / any absolute URL
  // SUPABASE: return supabase.storage.from('property-images').getPublicUrl(path).data.publicUrl
  return path
}

export function getAvatarUrl(path: string): string {
  if (!path) return ''
  if (path.startsWith('http')) return path
  // SUPABASE: return supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl
  return path
}
```

**Key deviation from original spec:** Returns `''` (not `'/images/property-placeholder.jpg'`) when path is empty, because the static file doesn't exist and `PropertyImage` handles empty `src` with its inline fallback.

---

## Files Created / Modified

| File | Action |
|------|--------|
| `next.config.ts` | Modified — add 4 `remotePatterns` |
| `components/ui/PropertyImage.tsx` | Created |
| `lib/utils/storageUrl.ts` | Created |
| `components/properties/PropertyCard.tsx` | Modified — replace `Image` with `PropertyImage` |
| `components/properties/ImageGallery.tsx` | Modified — replace `Image` with `PropertyImage` |
| `components/properties/tabs/SimilarPropertiesTab.tsx` | Modified — replace `Image` with `PropertyImage` |
| `components/search/ComparisonFloatingBar.tsx` | Modified — replace `Image` with `PropertyImage` |
| `app/compare/page.tsx` | Modified — replace `Image` with `PropertyImage` |
| `claude.md` | Modified — document image handling patterns |

---

## Out of Scope

- Actual Supabase Storage bucket creation and upload pipeline
- Agent/user avatar image display components (no avatar `<Image>` usage exists yet)
- `picsum.photos` usage (added to config for forward-compat only)
- `LocationTab.tsx` map image (intentionally excluded)
