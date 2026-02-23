import { HeroSearch } from './HeroSearch';
import { SingaporePixelFire } from './SingaporePixelFire';

const TRUST_BADGES = [
  { icon: '🛡️', label: 'Singpass Verified' },
  { icon: '🤖', label: 'AI-Powered' },
  { icon: '🏠', label: '50,000+ Listings' },
  { icon: '✅', label: '12,000+ Transactions' },
];

export function HeroSection() {
  return (
    <section className="relative bg-white pt-16 pb-12 overflow-hidden z-0">
      {/* Background ASCII Fire Animation */}
      <SingaporePixelFire />

      {/* Content wrapper with a subtle background mask to keep text legible over the animation */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">

        {/* Top: Centered headline */}
        <div className="flex flex-col items-center mb-10 mt-4">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50/90 border border-emerald-200 text-emerald-700 text-sm font-medium mb-6 backdrop-blur-sm shadow-sm ring-1 ring-emerald-500/10">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
            Singapore&apos;s #1 Verified Platform
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#1E293B] leading-tight mb-5 text-center px-4 max-w-4xl drop-shadow-sm">
            Find Your{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(to right, #10B981, #6366F1)' }}
            >
              Perfect Home
            </span>{' '}
            in Singapore
          </h1>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto text-center leading-relaxed drop-shadow-sm px-4">
            AI-powered insights, Singpass verified listings, family portfolio planning — all in
            one platform built for Singapore.
          </p>
        </div>

        {/* Search — centered below headline */}
        <div className="relative max-w-3xl mx-auto backdrop-blur-md bg-white/40 rounded-3xl p-1 shadow-lg border border-white/60">
          <HeroSearch />
        </div>

        {/* Trust badges */}
        <div className="relative flex flex-wrap justify-center gap-3 mt-8">
          {TRUST_BADGES.map((badge) => (
            <div
              key={badge.label}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 border border-emerald-100 shadow-sm text-gray-700 text-xs backdrop-blur-sm hover:-translate-y-0.5 transition-transform"
            >
              <span aria-hidden="true">{badge.icon}</span>
              <span className="font-medium">{badge.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
