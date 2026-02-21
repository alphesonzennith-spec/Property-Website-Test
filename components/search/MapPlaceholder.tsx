import { MapPin } from 'lucide-react';

export function MapPlaceholder() {
  return (
    <div className="w-full h-[calc(100vh-12rem)] bg-gradient-to-br from-emerald-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center">
      <div className="text-center p-8">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MapPin className="w-8 h-8 text-emerald-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Map View Coming Soon</h3>
        <p className="text-sm text-gray-500 max-w-xs">
          Interactive property map will be displayed here with cluster markers and filtering
        </p>
      </div>
    </div>
  );
}
