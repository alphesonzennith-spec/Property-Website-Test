import { mockProperties } from '@/lib/mock';
import {
  PropertyCard,
  PropertyCardSkeleton,
  PropertyCardCompact,
} from '@/components/properties/PropertyCard';

export default function TestPropertyCardPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <h1 className="text-2xl font-bold mb-8 text-[#0d2137]">PropertyCard Test Page</h1>

      {/* Skeletons */}
      <section className="mb-12">
        <h2 className="text-lg font-semibold mb-4 text-gray-600">Skeleton Loading State</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <PropertyCardSkeleton />
          <PropertyCardSkeleton />
          <PropertyCardSkeleton />
        </div>
      </section>

      {/* Full cards — first 6 mock properties */}
      <section className="mb-12">
        <h2 className="text-lg font-semibold mb-4 text-gray-600">
          Full Cards — All Verification Levels &amp; Types
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockProperties.slice(0, 6).map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      </section>

      {/* Compact cards — next 6 */}
      <section className="mb-12">
        <h2 className="text-lg font-semibold mb-4 text-gray-600">Compact Cards</h2>
        <div className="flex flex-col gap-2 max-w-lg">
          {mockProperties.slice(6, 12).map((p) => (
            <PropertyCardCompact key={p.id} property={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
