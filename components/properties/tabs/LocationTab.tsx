import { Property } from '@/types/property';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { MapPin, Train, School, ShoppingCart, Heart as Hospital } from 'lucide-react';
import Image from 'next/image';

interface LocationTabProps {
  property: Property;
}

export function LocationTab({ property }: LocationTabProps) {
  // Generate OneMap static image URL
  const generateOneMapUrl = () => {
    const lat = property.latitude;
    const lon = property.longitude;
    const zoom = 16;
    const width = 800;
    const height = 600;

    // OneMap Static Map API endpoint
    return `https://www.onemap.gov.sg/api/staticmap/getStaticImage?layerchosen=default&latitude=${lat}&longitude=${lon}&zoom=${zoom}&width=${width}&height=${height}&points=[${lat},${lon},"255,0,0","A"]&polygons=[]&lines=[]`;
  };

  // Group amenities by type
  const amenitiesByType = property.nearbyAmenities.reduce((acc, amenity) => {
    if (!acc[amenity.type]) {
      acc[amenity.type] = [];
    }
    acc[amenity.type].push(amenity);
    return acc;
  }, {} as Record<string, typeof property.nearbyAmenities>);

  // Get icon for amenity type
  const getAmenityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'school':
        return School;
      case 'supermarket':
      case 'mall':
        return ShoppingCart;
      case 'clinic':
      case 'hospital':
        return Hospital;
      default:
        return MapPin;
    }
  };

  return (
    <div className="space-y-6">
      {/* Map */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-600" />
            <CardTitle className="text-lg">Location Map</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100">
            <Image
              src={generateOneMapUrl()}
              alt="Property location map"
              fill
              className="object-cover"
              unoptimized // OneMap images are dynamic
            />
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Coordinates: {property.latitude.toFixed(6)}, {property.longitude.toFixed(6)}
          </p>
        </CardContent>
      </Card>

      {/* Nearby MRT Stations */}
      {property.nearbyMRT && property.nearbyMRT.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Train className="w-5 h-5 text-emerald-600" />
              <CardTitle className="text-lg">Nearby MRT Stations</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(property.nearbyMRT ?? []).slice(0, 5).map((mrt, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                      <Train className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{mrt.station}</p>
                      <p className="text-xs text-gray-500">{mrt.line} Line</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-emerald-600">
                      {(mrt.distanceMeters / 1000).toFixed(1)} km
                    </p>
                    <p className="text-xs text-gray-500">
                      ~{Math.round(mrt.distanceMeters / 80)} min walk
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Nearby Amenities */}
      {Object.keys(amenitiesByType).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Nearby Amenities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(amenitiesByType).map(([type, amenities]) => {
              const Icon = getAmenityIcon(type);
              return (
                <div key={type}>
                  <p className="text-xs font-semibold text-gray-700 uppercase mb-2">
                    {type}
                  </p>
                  <div className="space-y-2">
                    {amenities.slice(0, 5).map((amenity, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Icon className="w-4 h-4 text-blue-600" />
                          </div>
                          <p className="text-sm font-medium text-gray-900">{amenity.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-blue-600">
                            {(amenity.distanceMeters / 1000).toFixed(1)} km
                          </p>
                          <p className="text-xs text-gray-500">
                            {amenity.walkingMinutes} min walk
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Address Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Address Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500 font-medium mb-1">Full Address</p>
              <p className="text-sm font-semibold text-gray-900">{property.address}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium mb-1">Postal Code</p>
              <p className="text-sm font-semibold text-gray-900">{property.postalCode}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium mb-1">District</p>
              <p className="text-sm font-semibold text-gray-900">{property.district}</p>
            </div>
            {property.hdbTown && (
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">HDB Town</p>
                <p className="text-sm font-semibold text-gray-900">{property.hdbTown}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
