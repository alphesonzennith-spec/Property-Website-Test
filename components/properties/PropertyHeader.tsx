'use client';

import { Property, VerificationLevel } from '@/types/property';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { ShieldCheck, ShieldAlert, ShieldX, MapPin, Copy, Heart, Share2, Printer } from 'lucide-react';

interface PropertyHeaderProps {
  property: Property;
}

export function PropertyHeader({ property }: PropertyHeaderProps) {
  // Verification status styling
  const getVerificationStyles = () => {
    switch (property.verificationLevel) {
      case VerificationLevel.FullyVerified:
        return {
          bgClass: 'bg-emerald-50 border-emerald-200',
          textClass: 'text-emerald-900',
          iconClass: 'text-emerald-600',
          icon: ShieldCheck,
          title: 'Fully Verified Property',
          description: 'Ownership and legal documents verified via Singpass MyInfo',
        };
      case VerificationLevel.LegalDocsVerified:
        return {
          bgClass: 'bg-blue-50 border-blue-200',
          textClass: 'text-blue-900',
          iconClass: 'text-blue-600',
          icon: ShieldCheck,
          title: 'Legal Documents Verified',
          description: 'Legal documentation has been verified',
        };
      case VerificationLevel.OwnershipVerified:
        return {
          bgClass: 'bg-amber-50 border-amber-200',
          textClass: 'text-amber-900',
          iconClass: 'text-amber-600',
          icon: ShieldAlert,
          title: 'Ownership Verified',
          description: 'Property ownership has been verified',
        };
      default:
        return {
          bgClass: 'bg-gray-50 border-gray-200',
          textClass: 'text-gray-900',
          iconClass: 'text-gray-600',
          icon: ShieldX,
          title: 'Unverified Listing',
          description: 'Verification pending',
        };
    }
  };

  const verificationStyles = getVerificationStyles();
  const VerificationIcon = verificationStyles.icon;

  // Copy address to clipboard
  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(property.address);
      // You can add a toast notification here
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  return (
    <div className="space-y-4">
      {/* Verification Banner */}
      {property.verificationLevel !== VerificationLevel.Unverified && (
        <Alert className={`${verificationStyles.bgClass} border`}>
          <VerificationIcon className={`h-5 w-5 ${verificationStyles.iconClass}`} />
          <AlertTitle className={`font-semibold ${verificationStyles.textClass}`}>
            {verificationStyles.title}
          </AlertTitle>
          <AlertDescription className={`text-sm ${verificationStyles.textClass}`}>
            {verificationStyles.description}
          </AlertDescription>
        </Alert>
      )}

      {/* Property Title */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-[#1E293B]">
          {property.propertyType} in {property.district}
        </h1>

        {/* Address with Copy Button */}
        <div className="flex items-center gap-2 text-gray-600">
          <MapPin className="w-5 h-5 flex-shrink-0" />
          <span className="text-base">{property.address}</span>
          <button
            onClick={copyAddress}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            aria-label="Copy address"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>

        {/* Unit Number (if available) */}
        {property.unitNumber && (
          <p className="text-sm text-gray-500">
            Unit {property.unitNumber}
            {property.floorLevel && ` • Floor ${property.floorLevel}`}
            {property.totalFloors && ` of ${property.totalFloors}`}
          </p>
        )}
      </div>

      {/* Price Display */}
      <div className="flex items-baseline gap-3">
        <p className="text-4xl font-extrabold text-emerald-600">
          ${property.price.toLocaleString()}
        </p>
        {property.psf && (
          <p className="text-lg text-gray-500">
            ${property.psf.toLocaleString()} psf
          </p>
        )}
        {property.priceNegotiable && (
          <span className="text-sm bg-amber-100 text-amber-800 px-2 py-1 rounded-full font-medium">
            Negotiable
          </span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button size="lg" className="gap-2">
          <Heart className="w-5 h-5" />
          Save Property
        </Button>
        <Button variant="outline" size="lg" className="gap-2">
          <Share2 className="w-5 h-5" />
          Share
        </Button>
        <Button variant="outline" size="lg" className="gap-2">
          <Printer className="w-5 h-5" />
          Print
        </Button>
      </div>

      {/* AI Highlights */}
      {property.aiHighlights && property.aiHighlights.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {property.aiHighlights.map((highlight, index) => (
            <span
              key={index}
              className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full font-medium"
            >
              {highlight}
            </span>
          ))}
        </div>
      )}

      {/* Quality Score */}
      {property.listingQualityScore !== undefined && (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor:
                  property.listingQualityScore >= 80
                    ? '#10B981'
                    : property.listingQualityScore >= 60
                      ? '#F59E0B'
                      : '#EF4444',
              }}
            />
            <span className="text-sm font-medium text-gray-700">
              Quality Score: {property.listingQualityScore}/100
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
