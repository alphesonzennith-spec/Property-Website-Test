import Link from 'next/link';
import { PropertyImage } from '@/components/ui/PropertyImage';
import {
  ShieldCheck,
  Shield,
  ShieldAlert,
  Star,
  Heart,
  MapPin,
  Bed,
  Bath,
  Ruler,
  Train,
  User,
  Home,
} from 'lucide-react';
import {
  Property,
  PropertyType,
  ListingType,
  VerificationLevel,
  ListingSource,
  Tenure,
  Furnishing,
} from '@/types/property';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// ─── Helpers ────────────────────────────────────────────────────────────────

// Hoisted module-level formatter — avoids recreating the object on every render
const sgdFormatter = new Intl.NumberFormat('en-SG', {
  style: 'currency',
  currency: 'SGD',
  maximumFractionDigits: 0,
});

function formatPrice(price: number): string {
  return sgdFormatter.format(price);
}

function formatTenure(tenure: Tenure): string {
  switch (tenure) {
    case Tenure.Freehold:
      return 'Freehold';
    case Tenure.Leasehold99:
      return '99 Yr';
    case Tenure.Leasehold999:
      return '999 Yr';
    case Tenure.Leasehold30:
      return '30 Yr';
    default:
      return tenure;
  }
}

function getPropertyTypeLabel(property: Property): string {
  if (property.propertyType === PropertyType.HDB && property.hdbRoomType) {
    return `HDB ${property.hdbRoomType}`;
  }
  return property.propertyType;
}

// ─── PropertyCard ────────────────────────────────────────────────────────────

interface PropertyCardProps {
  property: Property;
  className?: string;
}

export function PropertyCard({ property, className = '' }: PropertyCardProps) {
  const primaryImage =
    property.images.find((img) => img.isPrimary) ?? property.images[0] ?? null;

  const addressTitle =
    property.address.length > 32
      ? property.address.slice(0, 32) + '…'
      : property.address;

  const nearestMRT = property.nearbyMRT[0] ?? null;

  const showFurnishing = property.furnishing !== Furnishing.Unfurnished;

  // Fix 4: three-branch ternary so Unfurnished correctly produces ''
  const furnishingLabel =
    property.furnishing === Furnishing.FullyFurnished
      ? 'Fully Furnished'
      : property.furnishing === Furnishing.PartialFurnished
        ? 'Part Furnished'
        : '';

  // Verification badge config
  let verificationBgClass = '';
  let verificationTextClass = '';
  let verificationLabel = '';
  let VerificationIcon: React.ComponentType<{ className?: string }> = Shield;

  switch (property.verificationLevel) {
    case VerificationLevel.FullyVerified:
      verificationBgClass = 'bg-emerald-500';
      verificationTextClass = 'text-white';
      verificationLabel = 'Verified';
      VerificationIcon = ShieldCheck;
      break;
    case VerificationLevel.LegalDocsVerified:
      verificationBgClass = 'bg-amber-400';
      verificationTextClass = 'text-amber-900';
      verificationLabel = 'Docs Verified';
      VerificationIcon = ShieldCheck;
      break;
    case VerificationLevel.OwnershipVerified:
      verificationBgClass = 'bg-sky-500';
      verificationTextClass = 'text-white';
      verificationLabel = 'Owner Verified';
      VerificationIcon = Shield;
      break;
    case VerificationLevel.Unverified:
    default:
      verificationBgClass = 'bg-gray-400/80';
      verificationTextClass = 'text-white';
      verificationLabel = 'Unverified';
      VerificationIcon = ShieldAlert;
      break;
  }

  // Listing quality score dot color
  let qualityDotClass = '';
  if (property.listingQualityScore !== undefined) {
    if (property.listingQualityScore >= 80) {
      qualityDotClass = 'bg-emerald-500';
    } else if (property.listingQualityScore >= 60) {
      qualityDotClass = 'bg-amber-400';
    } else {
      qualityDotClass = 'bg-red-500';
    }
  }

  // Fix 1: wrap in <Link> for keyboard navigation & accessibility
  return (
    <Link
      href={`/properties/${property.id}`}
      className={[
        'bg-white rounded-xl border border-gray-100 shadow-sm',
        'hover:-translate-y-0.5 hover:shadow-lg',
        'transition-all duration-200',
        'overflow-hidden',
        'flex flex-col h-full',
        className,
      ].join(' ')}
    >
      {/* Image area */}
      <div className="relative overflow-hidden rounded-t-xl flex-shrink-0" style={{ aspectRatio: '16/9' }}>
        <PropertyImage
          src={primaryImage?.url}
          alt={property.address}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Bottom gradient overlay */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Top-left badge stack */}
        <div className="absolute top-2 left-2 flex items-center gap-1">
          <TooltipProvider>
            {/* Verification Icon Badge */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${verificationBgClass}`}>
                  <VerificationIcon className={`w-4 h-4 ${verificationTextClass}`} />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{verificationLabel}</p>
              </TooltipContent>
            </Tooltip>

            {/* Featured Icon Badge */}
            {property.featured && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center bg-amber-500">
                    <Star className="w-4 h-4 text-white fill-white" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Featured Listing</p>
                </TooltipContent>
              </Tooltip>
            )}

            {/* Owner Direct Icon Badge */}
            {property.listingSource === ListingSource.OwnerDirect && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center bg-emerald-500">
                    <Home className="w-4 h-4 text-white" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Owner Direct Listing</p>
                </TooltipContent>
              </Tooltip>
            )}
          </TooltipProvider>
        </div>

        {/* Top-right: quality score dot + heart button */}
        <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
          {/* Fix 2: role="img" + aria-label instead of title */}
          {property.listingQualityScore !== undefined && (
            <div
              role="img"
              aria-label={`Listing quality score: ${property.listingQualityScore}/100`}
              className={`w-2.5 h-2.5 rounded-full ${qualityDotClass}`}
            />
          )}
          {/* Fix 3: type="button" on the save/heart button */}
          <button
            type="button"
            aria-label="Save property"
            className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/40 flex items-center justify-center transition-colors"
          >
            <Heart aria-hidden="true" className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Bottom-left chips */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1">
          <span className="bg-white/90 text-[#0d2137] text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">
            {getPropertyTypeLabel(property)}
          </span>
          <span
            className={[
              'text-[10px] font-bold uppercase px-2 py-0.5 rounded-full',
              property.listingType === ListingType.Sale
                ? 'bg-emerald-500 text-white'
                : 'bg-indigo-500 text-white',
            ].join(' ')}
          >
            {property.listingType === ListingType.Sale ? 'Sale' : 'Rent'}
          </span>
        </div>
      </div>

      {/* Card body */}
      <div className="p-4 flex-grow flex flex-col justify-between">
        {/* Row 1 — Price */}
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-xl font-extrabold text-[#0d2137]">
            {formatPrice(property.price)}
          </span>
          {property.psf !== undefined && (
            <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
              {formatPrice(property.psf)} psf
            </span>
          )}
        </div>

        {/* Row 2 — Title / Address */}
        <p className="text-sm font-semibold text-gray-800 truncate mt-1">
          {addressTitle}
        </p>
        <div className="flex items-center gap-1 mt-0.5">
          <MapPin aria-hidden="true" className="w-3 h-3 text-gray-400 flex-shrink-0" />
          <p className="text-xs text-gray-400 truncate">{property.address}</p>
        </div>

        {/* Row 3 — Specs */}
        <div className="flex items-center gap-3 mt-2 text-xs text-gray-600">
          {property.bedrooms > 0 && (
            <div className="flex items-center gap-1">
              <Bed aria-hidden="true" className="w-3 h-3" />
              <span>{property.bedrooms} Bed</span>
            </div>
          )}
          {property.bathrooms > 0 && (
            <div className="flex items-center gap-1">
              <Bath aria-hidden="true" className="w-3 h-3" />
              <span>{property.bathrooms} Bath</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Ruler aria-hidden="true" className="w-3 h-3" />
            <span>{property.floorAreaSqft.toLocaleString()} sqft</span>
          </div>
        </div>

        {/* Row 4 — Tags */}
        <div className="flex flex-wrap gap-1 mt-2">
          {/* Tenure */}
          <span className="text-[10px] bg-gray-50 border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
            {formatTenure(property.tenure)}
          </span>

          {/* Nearest MRT */}
          {nearestMRT !== null && (
            <span className="text-[10px] bg-indigo-50 border border-indigo-200 text-indigo-700 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Train aria-hidden="true" className="w-2.5 h-2.5" />
              {nearestMRT.station} ({nearestMRT.distanceMeters}m)
            </span>
          )}

          {/* Furnishing */}
          {showFurnishing && (
            <span className="text-[10px] bg-amber-50 border border-amber-200 text-amber-700 px-2 py-0.5 rounded-full">
              {furnishingLabel}
            </span>
          )}
        </div>

        {/* Row 5 — Footer */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1">
            {property.agentId ? (
              <>
                <User aria-hidden="true" className="w-3 h-3 text-gray-500" />
                <span className="text-xs text-gray-500">Agent</span>
              </>
            ) : (
              <>
                <Home aria-hidden="true" className="w-3 h-3 text-emerald-600" />
                <span className="text-xs text-emerald-600 font-medium">Owner Direct</span>
              </>
            )}
          </div>
          <span className="bg-gray-100 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
            {property.district}
          </span>
        </div>
      </div>
    </Link>
  );
}

// ─── PropertyCardSkeleton ────────────────────────────────────────────────────

export function PropertyCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
      {/* Image placeholder */}
      <div className="bg-gray-200 aspect-video rounded-t-xl" />

      {/* Body */}
      <div className="p-4 space-y-3">
        {/* Price row */}
        <div className="flex items-baseline justify-between">
          <div className="w-32 h-6 bg-gray-200 rounded" />
          <div className="w-16 h-4 bg-gray-200 rounded" />
        </div>

        {/* Title */}
        <div className="w-full h-4 bg-gray-200 rounded" />

        {/* Address */}
        <div className="w-3/4 h-3 bg-gray-200 rounded" />

        {/* Specs row */}
        <div className="flex items-center gap-3 mt-2">
          <div className="w-16 h-3 bg-gray-200 rounded" />
          <div className="w-16 h-3 bg-gray-200 rounded" />
          <div className="w-16 h-3 bg-gray-200 rounded" />
        </div>

        {/* Tags row */}
        <div className="flex gap-2 mt-2">
          <div className="w-20 h-4 bg-gray-200 rounded-full" />
          <div className="w-20 h-4 bg-gray-200 rounded-full" />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="w-24 h-3 bg-gray-200 rounded" />
          <div className="w-10 h-4 bg-gray-200 rounded-full" />
        </div>
      </div>
    </div>
  );
}

// ─── PropertyCardCompact ─────────────────────────────────────────────────────

interface PropertyCardCompactProps {
  property: Property;
  className?: string;
}

export function PropertyCardCompact({ property, className = '' }: PropertyCardCompactProps) {
  const primaryImage =
    property.images.find((img) => img.isPrimary) ?? property.images[0] ?? null;

  // Verification icon only
  let VerificationIcon: React.ComponentType<{ className?: string }> = Shield;
  let verificationIconColorClass = '';

  switch (property.verificationLevel) {
    case VerificationLevel.FullyVerified:
      VerificationIcon = ShieldCheck;
      verificationIconColorClass = 'text-emerald-500';
      break;
    case VerificationLevel.LegalDocsVerified:
      VerificationIcon = ShieldCheck;
      verificationIconColorClass = 'text-amber-400';
      break;
    case VerificationLevel.OwnershipVerified:
      VerificationIcon = Shield;
      verificationIconColorClass = 'text-sky-500';
      break;
    case VerificationLevel.Unverified:
    default:
      VerificationIcon = ShieldAlert;
      verificationIconColorClass = 'text-gray-400';
      break;
  }

  const specs: string[] = [];
  if (property.bedrooms > 0) specs.push(`${property.bedrooms}bd`);
  if (property.bathrooms > 0) specs.push(`${property.bathrooms}ba`);
  specs.push(`${property.floorAreaSqft.toLocaleString()} sqft`);

  // Fix 1: wrap in <Link> for keyboard navigation & accessibility
  return (
    <Link
      href={`/properties/${property.id}`}
      className={[
        'flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100',
        'hover:shadow-md transition-shadow',
        className,
      ].join(' ')}
    >
      {/* Left: square image or gradient placeholder */}
      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
        <div className="relative w-full h-full">
          <PropertyImage
            src={primaryImage?.url}
            alt={property.address}
            sizes="64px"
          />
        </div>
      </div>

      {/* Middle */}
      <div className="flex-1 min-w-0">
        {/* Price + district chip */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-bold text-[#0d2137]">
            {formatPrice(property.price)}
          </span>
          <span className="bg-gray-100 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0">
            {property.district}
          </span>
        </div>

        {/* Address */}
        <p className="text-xs text-gray-500 truncate mt-0.5">{property.address}</p>

        {/* Specs */}
        <p className="text-xs text-gray-400 mt-0.5">{specs.join(' · ')}</p>
      </div>

      {/* Right: verification icon — meaningful, so NOT aria-hidden */}
      <div className="flex-shrink-0">
        <VerificationIcon
          aria-label={`Verification: ${property.verificationLevel}`}
          className={`w-5 h-5 ${verificationIconColorClass}`}
        />
      </div>
    </Link>
  );
}
