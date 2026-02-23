import { Bed, Bath, Maximize2, CheckCircle2, MapPin } from 'lucide-react';
import { Property, PropertyType, VerificationLevel } from '@/types/property';

interface PropertyCardProps {
  property: Property;
}

function getPropertyGradient(type: PropertyType): string {
  switch (type) {
    case PropertyType.HDB:
      return 'linear-gradient(135deg, #059669 0%, #10B981 100%)';
    case PropertyType.Condo:
      return 'linear-gradient(135deg, #4338ca 0%, #6366F1 100%)';
    case PropertyType.Landed:
      return 'linear-gradient(135deg, #d97706 0%, #F59E0B 100%)';
    case PropertyType.EC:
      return 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)';
    case PropertyType.Commercial:
      return 'linear-gradient(135deg, #be123c 0%, #f43f5e 100%)';
    default:
      return 'linear-gradient(135deg, #475569 0%, #64748b 100%)';
  }
}

function formatPrice(price: number): string {
  if (price >= 1_000_000) {
    return `S$${(price / 1_000_000).toFixed(2)}M`;
  }
  return `S$${price.toLocaleString()}`;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const isFullyVerified = property.verificationLevel === VerificationLevel.FullyVerified;
  const isVerified =
    isFullyVerified ||
    property.verificationLevel === VerificationLevel.OwnershipVerified ||
    property.verificationLevel === VerificationLevel.LegalDocsVerified;

  const addressShort = property.address.length > 40
    ? property.address.slice(0, 40) + '…'
    : property.address;

  return (
    <div className="rounded-xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all group">
      {/* Image area */}
      <div className="relative h-48 overflow-hidden">
        <div
          className="w-full h-full group-hover:scale-105 transition-transform duration-300"
          style={{ background: getPropertyGradient(property.propertyType) }}
        />

        {/* Property type badge */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-semibold border border-white/30">
            {property.propertyType}
          </span>
        </div>

        {/* Verification badge */}
        {isFullyVerified && (
          <div className="absolute top-3 right-3">
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#10B981] text-white text-xs font-semibold">
              <CheckCircle2 className="w-3 h-3" />
              Verified
            </div>
          </div>
        )}

        {/* Listing type badge */}
        <div className="absolute bottom-3 left-3">
          <span className="px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-sm text-white text-xs font-semibold">
            For {property.listingType}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className="text-sm text-[#1E293B] font-medium leading-snug">{addressShort}</p>
        </div>

        <div className="flex items-center gap-1.5 mb-3">
          <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
          <span className="text-xs text-gray-500">{property.district}</span>
          {property.hdbTown && (
            <span className="text-xs text-gray-400">· {property.hdbTown}</span>
          )}
        </div>

        <div className="text-2xl font-extrabold text-[#10B981] mb-3">
          {formatPrice(property.price)}
          {property.psf && (
            <span className="text-sm font-normal text-gray-400 ml-2">
              S${property.psf}/psf
            </span>
          )}
        </div>

        {/* Specs row */}
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Bed className="w-3.5 h-3.5" />
            <span>{property.bedrooms} Bed</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="w-3.5 h-3.5" />
            <span>{property.bathrooms} Bath</span>
          </div>
          <div className="flex items-center gap-1">
            <Maximize2 className="w-3.5 h-3.5" />
            <span>{property.floorAreaSqft.toLocaleString()} sqft</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
        {property.agentId ? (
          <span className="text-xs text-gray-400">Listed by Agent</span>
        ) : (
          <span className="text-xs text-gray-400">Owner Direct</span>
        )}
        {isVerified && (
          <div className="flex items-center gap-1 text-xs text-[#10B981]">
            <CheckCircle2 className="w-3 h-3" />
            <span>Singpass Verified</span>
          </div>
        )}
      </div>
    </div>
  );
}
