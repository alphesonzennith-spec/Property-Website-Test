import { Property } from '@/types/property';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Home } from 'lucide-react';
import Link from 'next/link';
import { PropertyImage } from '@/components/ui/PropertyImage';

interface SimilarPropertiesTabProps {
  property: Property;
}

export function SimilarPropertiesTab({ property }: SimilarPropertiesTabProps) {
  // Mock similar properties (in production, fetch from API based on filters)
  const generateMockSimilarProperties = () => {
    const basePrice = property.price;
    const variance = 0.15; // 15% variance

    return Array.from({ length: 6 }, (_, i) => {
      const priceVariation = (Math.random() - 0.5) * variance * 2 * basePrice;
      const price = Math.round(basePrice + priceVariation);

      return {
        id: `similar-${i + 1}`,
        address: `${property.district} Similar Property ${i + 1}`,
        propertyType: property.propertyType,
        bedrooms: property.bedrooms + (Math.random() > 0.5 ? 1 : -1),
        bathrooms: property.bathrooms,
        floorAreaSqft: property.floorAreaSqft + Math.round((Math.random() - 0.5) * 200),
        price,
        psf: Math.round(price / (property.floorAreaSqft + (Math.random() - 0.5) * 200)),
        district: property.district,
        imageUrl: property.images[Math.floor(Math.random() * property.images.length)]?.url ?? null,
      };
    });
  };

  const similarProperties = generateMockSimilarProperties();

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-emerald-100 bg-gradient-to-br from-emerald-50 to-white">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Home className="w-5 h-5 text-emerald-600" />
            <CardTitle className="text-lg">Similar Properties in {property.district}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-700">
            Based on your current property, we found {similarProperties.length} similar listings
            with comparable features and pricing.
          </p>
        </CardContent>
      </Card>

      {/* Similar Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {similarProperties.map((similarProp) => (
          <Link key={similarProp.id} href={`/properties/${similarProp.id}`}>
            <Card className="overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer">
              {/* Property Image */}
              <div className="relative aspect-video overflow-hidden bg-gray-100">
                <PropertyImage src={similarProp.imageUrl} alt={similarProp.address} sizes="(max-width: 768px) 100vw, 50vw" />
              </div>

              {/* Property Details */}
              <CardContent className="p-4 space-y-3">
                {/* Address */}
                <h3 className="font-semibold text-gray-900 line-clamp-1">
                  {similarProp.address}
                </h3>

                {/* Price */}
                <div className="flex items-baseline gap-2">
                  <p className="text-xl font-extrabold text-emerald-600">
                    ${similarProp.price.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    ${similarProp.psf.toLocaleString()} psf
                  </p>
                </div>

                {/* Specs */}
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>{similarProp.bedrooms} Bed</span>
                  <span>•</span>
                  <span>{similarProp.bathrooms} Bath</span>
                  <span>•</span>
                  <span>{similarProp.floorAreaSqft.toLocaleString()} sqft</span>
                </div>

                {/* Property Type */}
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full font-medium">
                    {similarProp.propertyType}
                  </span>
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full font-medium">
                    {similarProp.district}
                  </span>
                </div>

                {/* Price Comparison */}
                <div className="pt-3 border-t border-gray-100">
                  {(() => {
                    const priceDiff = similarProp.price - property.price;
                    const priceDiffPercent = ((priceDiff / property.price) * 100).toFixed(1);

                    return priceDiff === 0 ? (
                      <p className="text-xs text-gray-500">Same price as current property</p>
                    ) : (
                      <p className={`text-xs font-medium ${priceDiff > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                        {priceDiff > 0 ? '+' : ''}${Math.abs(priceDiff).toLocaleString()}{' '}
                        ({priceDiff > 0 ? '+' : ''}{priceDiffPercent}%)
                      </p>
                    );
                  })()}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Disclaimer */}
      <Card>
        <CardContent className="p-4">
          <p className="text-xs text-gray-500 leading-relaxed">
            <strong>Note:</strong> Similar properties are identified based on property type, location,
            size, and price range. These listings are for demonstration purposes. In production,
            this would use a recommendation algorithm to find genuinely comparable properties.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
