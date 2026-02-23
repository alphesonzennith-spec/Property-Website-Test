import { Property } from '@/types/property';
import { Bed, Bath, Maximize, DollarSign, Building2, Award, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface SpecificationBarProps {
  property: Property;
}

export function SpecificationBar({ property }: SpecificationBarProps) {
  const specs = [
    {
      icon: Bed,
      label: 'Bedrooms',
      value: property.bedrooms.toString(),
    },
    {
      icon: Bath,
      label: 'Bathrooms',
      value: property.bathrooms.toString(),
    },
    {
      icon: Maximize,
      label: 'Floor Area',
      value: `${property.floorAreaSqft.toLocaleString()} sqft`,
    },
    {
      icon: DollarSign,
      label: 'PSF',
      value: property.psf ? `$${property.psf.toLocaleString()}` : 'N/A',
    },
    {
      icon: Building2,
      label: 'Floor Level',
      value: property.floorLevel ? `#${property.floorLevel.toString().padStart(2, '0')}` : 'N/A',
    },
    {
      icon: Award,
      label: 'Tenure',
      value: property.tenure.replace('Leasehold', '').replace('99', '99yr').replace('999', '999yr').replace('30', '30yr') || property.tenure,
    },
    {
      icon: Calendar,
      label: 'Listed',
      value: formatDistanceToNow(new Date(property.createdAt), { addSuffix: true }),
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
      {specs.map((spec, index) => {
        const Icon = spec.icon;
        return (
          <div
            key={index}
            className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all"
          >
            <Icon className="w-5 h-5 text-emerald-600 mb-2" />
            <p className="text-xs text-gray-500 font-medium mb-1">{spec.label}</p>
            <p className="text-sm font-bold text-gray-900">{spec.value}</p>
          </div>
        );
      })}
    </div>
  );
}
