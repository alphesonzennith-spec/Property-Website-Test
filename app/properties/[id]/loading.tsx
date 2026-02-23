import { Skeleton } from '@/components/ui/skeleton';

export default function PropertyPageLoading() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button skeleton */}
        <div className="mb-6">
          <Skeleton className="h-9 w-32" />
        </div>

        {/* 65/35 Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content (65%) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery Skeleton */}
            <div className="space-y-4">
              <Skeleton className="w-full aspect-video rounded-xl" />
              <div className="flex gap-2 overflow-hidden">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="w-20 h-20 rounded-lg flex-shrink-0" />
                ))}
              </div>
            </div>

            {/* Property Header Skeleton */}
            <div className="space-y-3">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-10 w-1/3" />
            </div>

            {/* Specification Bar Skeleton */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
              {[...Array(7)].map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-lg" />
              ))}
            </div>

            {/* Property Tabs Skeleton */}
            <div className="space-y-4">
              <div className="flex gap-2 border-b">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-24" />
                ))}
              </div>
              <div className="space-y-3">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-3/4" />
              </div>
            </div>
          </div>

          {/* Sidebar (35%) */}
          <aside className="lg:col-span-1 space-y-6">
            {/* Verification Card Skeleton */}
            <div className="border rounded-xl p-6 space-y-3">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>

            {/* Listing Source Card Skeleton */}
            <div className="border rounded-xl p-6 space-y-3">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-full" />
            </div>

            {/* Contact Form Skeleton */}
            <div className="border rounded-xl p-6 space-y-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>

            {/* Mortgage Estimator Skeleton */}
            <div className="border rounded-xl p-6 space-y-4">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
