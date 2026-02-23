import { Property } from '@/types/property';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Sparkles, Home, Calendar, FileText } from 'lucide-react';

interface OverviewTabProps {
  property: Property;
}

export function OverviewTab({ property }: OverviewTabProps) {
  return (
    <div className="space-y-6">
      {/* AI-Generated Description */}
      {property.aiGeneratedDescription && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <CardTitle className="text-lg">Property Description</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {property.aiGeneratedDescription}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Property Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Home className="w-5 h-5 text-emerald-600" />
            <CardTitle className="text-lg">Property Details</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Property Type */}
            <div>
              <p className="text-xs text-gray-500 font-medium mb-1">Property Type</p>
              <p className="text-sm font-semibold text-gray-900">{property.propertyType}</p>
            </div>

            {/* HDB Specific */}
            {property.hdbRoomType && (
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">HDB Type</p>
                <p className="text-sm font-semibold text-gray-900">{property.hdbRoomType}</p>
              </div>
            )}

            {property.hdbTown && (
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">HDB Town</p>
                <p className="text-sm font-semibold text-gray-900">{property.hdbTown}</p>
              </div>
            )}

            {property.hdbBlock && (
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Block</p>
                <p className="text-sm font-semibold text-gray-900">{property.hdbBlock}</p>
              </div>
            )}

            {/* Furnishing */}
            <div>
              <p className="text-xs text-gray-500 font-medium mb-1">Furnishing</p>
              <p className="text-sm font-semibold text-gray-900">
                {property.furnishing.replace(/([A-Z])/g, ' $1').trim()}
              </p>
            </div>

            {/* Built-Up Area */}
            {property.builtUpAreaSqft && (
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Built-Up Area</p>
                <p className="text-sm font-semibold text-gray-900">
                  {property.builtUpAreaSqft.toLocaleString()} sqft
                </p>
              </div>
            )}

            {/* Land Area */}
            {property.landAreaSqft && (
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Land Area</p>
                <p className="text-sm font-semibold text-gray-900">
                  {property.landAreaSqft.toLocaleString()} sqft
                </p>
              </div>
            )}

            {/* Postal Code */}
            <div>
              <p className="text-xs text-gray-500 font-medium mb-1">Postal Code</p>
              <p className="text-sm font-semibold text-gray-900">{property.postalCode}</p>
            </div>

            {/* District */}
            <div>
              <p className="text-xs text-gray-500 font-medium mb-1">District</p>
              <p className="text-sm font-semibold text-gray-900">{property.district}</p>
            </div>

            {/* Status */}
            <div>
              <p className="text-xs text-gray-500 font-medium mb-1">Status</p>
              <p className="text-sm font-semibold text-gray-900">{property.status}</p>
            </div>

            {/* Featured */}
            {property.featured && (
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Featured</p>
                <p className="text-sm font-semibold text-amber-600">Yes</p>
              </div>
            )}

            {/* Rental Yield */}
            {property.rentalYield && (
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Rental Yield</p>
                <p className="text-sm font-semibold text-emerald-600">
                  {property.rentalYield.toFixed(2)}%
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Development Timeline */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" />
            <CardTitle className="text-lg">Timeline</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Completion Year */}
            {property.completionYear && (
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Completion Year</p>
                <p className="text-sm font-semibold text-gray-900">{property.completionYear}</p>
              </div>
            )}

            {/* TOP Date */}
            {property.topDate && (
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Expected TOP</p>
                <p className="text-sm font-semibold text-gray-900">
                  {new Date(property.topDate).toLocaleDateString('en-SG', {
                    year: 'numeric',
                    month: 'long',
                  })}
                </p>
              </div>
            )}

            {/* Listed Date */}
            <div>
              <p className="text-xs text-gray-500 font-medium mb-1">Listed On</p>
              <p className="text-sm font-semibold text-gray-900">
                {new Date(property.createdAt).toLocaleDateString('en-SG', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>

            {/* Updated Date */}
            <div>
              <p className="text-xs text-gray-500 font-medium mb-1">Last Updated</p>
              <p className="text-sm font-semibold text-gray-900">
                {new Date(property.updatedAt).toLocaleDateString('en-SG', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>

            {/* Sold At */}
            {property.soldAt && (
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Sold On</p>
                <p className="text-sm font-semibold text-gray-900">
                  {new Date(property.soldAt).toLocaleDateString('en-SG', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            )}

            {/* Transacted Price */}
            {property.transactedPrice && (
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Transacted Price</p>
                <p className="text-sm font-semibold text-emerald-600">
                  ${property.transactedPrice.toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Layout & Media */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            <CardTitle className="text-lg">Available Media</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className={`p-3 rounded-lg text-center ${property.layout.has2DFloorplan ? 'bg-emerald-50 border border-emerald-200' : 'bg-gray-50 border border-gray-200'}`}>
              <p className="text-xs font-medium mb-1">2D Floor Plan</p>
              <p className={`text-sm font-semibold ${property.layout.has2DFloorplan ? 'text-emerald-600' : 'text-gray-400'}`}>
                {property.layout.has2DFloorplan ? 'Available' : 'Not Available'}
              </p>
            </div>
            <div className={`p-3 rounded-lg text-center ${property.layout.has3DModel ? 'bg-emerald-50 border border-emerald-200' : 'bg-gray-50 border border-gray-200'}`}>
              <p className="text-xs font-medium mb-1">3D Model</p>
              <p className={`text-sm font-semibold ${property.layout.has3DModel ? 'text-emerald-600' : 'text-gray-400'}`}>
                {property.layout.has3DModel ? 'Available' : 'Not Available'}
              </p>
            </div>
            <div className={`p-3 rounded-lg text-center ${property.layout.has360Tour ? 'bg-emerald-50 border border-emerald-200' : 'bg-gray-50 border border-gray-200'}`}>
              <p className="text-xs font-medium mb-1">360° Tour</p>
              <p className={`text-sm font-semibold ${property.layout.has360Tour ? 'text-emerald-600' : 'text-gray-400'}`}>
                {property.layout.has360Tour ? 'Available' : 'Not Available'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
