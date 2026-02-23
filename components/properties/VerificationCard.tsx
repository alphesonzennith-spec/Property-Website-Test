import { Property, VerificationLevel } from '@/types/property';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, FileText, ExternalLink } from 'lucide-react';

interface VerificationCardProps {
  property: Property;
}

export function VerificationCard({ property }: VerificationCardProps) {
  const hasOwnershipDoc = !!property.ownershipDocUrl;
  const hasLegalDocs = property.legalDocUrls && property.legalDocUrls.length > 0;

  return (
    <Card className="border-emerald-100">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <CardTitle className="text-base">Verification Status</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Verification Level */}
        <div>
          <p className="text-xs text-gray-500 font-medium mb-1">Verification Level</p>
          <p className="text-sm font-semibold text-gray-900">
            {property.verificationLevel.replace(/([A-Z])/g, ' $1').trim()}
          </p>
        </div>

        {/* Ownership Document */}
        {hasOwnershipDoc && (
          <div>
            <p className="text-xs text-gray-500 font-medium mb-2">Ownership Document</p>
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2 text-xs"
              asChild
            >
              <a href={property.ownershipDocUrl} target="_blank" rel="noopener noreferrer">
                <FileText className="w-4 h-4" />
                View Title Deed
                <ExternalLink className="w-3 h-3 ml-auto" />
              </a>
            </Button>
          </div>
        )}

        {/* Legal Documents */}
        {hasLegalDocs && (
          <div>
            <p className="text-xs text-gray-500 font-medium mb-2">
              Legal Documents ({property.legalDocUrls.length})
            </p>
            <div className="space-y-2">
              {property.legalDocUrls.slice(0, 3).map((url, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="w-full gap-2 text-xs"
                  asChild
                >
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    <FileText className="w-4 h-4" />
                    Document {index + 1}
                    <ExternalLink className="w-3 h-3 ml-auto" />
                  </a>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Verification Info */}
        <div className="pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500 leading-relaxed">
            {property.verificationLevel === VerificationLevel.FullyVerified
              ? 'This property has been fully verified through Singpass MyInfo and legal documentation.'
              : property.verificationLevel === VerificationLevel.LegalDocsVerified
              ? 'Legal documents have been verified for this property.'
              : property.verificationLevel === VerificationLevel.OwnershipVerified
              ? 'Property ownership has been verified.'
              : 'This listing has not yet been verified.'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
