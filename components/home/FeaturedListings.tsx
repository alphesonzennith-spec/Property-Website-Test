import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2 } from 'lucide-react';
import { mockProperties } from '@/lib/mock';
import { PropertyCard } from './PropertyCard';

function getFeaturedProperties() {
  const featured = mockProperties.filter((p) => p.featured);
  if (featured.length >= 6) return featured.slice(0, 6);

  const byScore = [...mockProperties]
    .sort((a, b) => (b.listingQualityScore ?? 0) - (a.listingQualityScore ?? 0))
    .slice(0, 6);

  const combined = [...featured, ...byScore.filter((p) => !p.featured)];
  return combined.slice(0, 6);
}

const FEATURED_PROPERTIES = getFeaturedProperties();

export function FeaturedListings() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#1E293B]">
                Featured Properties
              </h2>
              <Badge className="bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Verified Listings
              </Badge>
            </div>
            <p className="text-gray-500">
              Hand-picked properties with full Singpass verification
            </p>
          </div>
          <Link
            href="/buy"
            className="hidden sm:inline-flex text-sm font-semibold text-[#10B981] hover:text-emerald-700 transition-colors"
          >
            View all listings →
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURED_PROPERTIES.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>

        {/* Mobile CTA */}
        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/buy"
            className="inline-flex items-center text-sm font-semibold text-[#10B981] hover:text-emerald-700 transition-colors"
          >
            View all listings →
          </Link>
        </div>
      </div>
    </section>
  );
}
