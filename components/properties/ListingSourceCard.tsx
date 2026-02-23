import { Property, ListingSource } from '@/types/property';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Home, Building, User, Globe } from 'lucide-react';

interface ListingSourceCardProps {
  property: Property;
}

export function ListingSourceCard({ property }: ListingSourceCardProps) {
  const getSourceDetails = () => {
    switch (property.listingSource) {
      case ListingSource.OwnerDirect:
        return {
          icon: Home,
          label: 'Owner Direct',
          description: 'Listed directly by the property owner',
          color: 'text-emerald-600',
          bgColor: 'bg-emerald-50',
        };
      case ListingSource.Agent:
        return {
          icon: User,
          label: 'CEA Agent',
          description: 'Listed by a registered CEA agent',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
        };
      case ListingSource.Developer:
        return {
          icon: Building,
          label: 'Developer',
          description: 'Listed by the property developer',
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
        };
      case ListingSource.Platform:
        return {
          icon: Globe,
          label: 'Platform',
          description: 'Listed via our platform',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
        };
      default:
        return {
          icon: Globe,
          label: 'Unknown',
          description: 'Listing source not specified',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
        };
    }
  };

  const sourceDetails = getSourceDetails();
  const SourceIcon = sourceDetails.icon;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Listing Source</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Source Type */}
        <div className={`flex items-center gap-3 p-3 rounded-lg ${sourceDetails.bgColor}`}>
          <div className={`flex-shrink-0 ${sourceDetails.color}`}>
            <SourceIcon className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className={`text-sm font-semibold ${sourceDetails.color}`}>
              {sourceDetails.label}
            </p>
            <p className="text-xs text-gray-600 mt-0.5">
              {sourceDetails.description}
            </p>
          </div>
        </div>

        {/* Agent Info (if applicable) */}
        {property.agentId && (
          <div className="pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500 font-medium mb-1">Agent ID</p>
            <p className="text-sm font-mono text-gray-900">{property.agentId}</p>
          </div>
        )}

        {/* Owner Info */}
        <div className={!property.agentId ? 'pt-3 border-t border-gray-100' : ''}>
          <p className="text-xs text-gray-500 font-medium mb-1">Owner ID</p>
          <p className="text-sm font-mono text-gray-900">{property.ownerId}</p>
        </div>

        {/* Views Counter */}
        <div className="pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500 font-medium mb-1">Total Views</p>
          <p className="text-sm font-semibold text-gray-900">
            {property.viewsCount.toLocaleString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
