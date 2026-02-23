import { HeroSearch } from './HeroSearch';
import { SingaporeMap } from './SingaporeMap';

const TRUST_BADGES = [
  { icon: '🛡️', label: 'Singpass Verified' },
  { icon: '🤖', label: 'AI-Powered' },
  { icon: '🏠', label: '50,000+ Listings' },
  { icon: '✅', label: '12,000+ Transactions' },
];

export function HeroSection() {
  return (
    <section className="bg-white pt-12 pb-8 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top: headline (left) + map (right) */}
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-12 mb-10">
          {/* Left — headline */}
          <div className="flex-[55] w-full text-center lg:text-left">
            {/* Pill badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-500" aria-hidden="true" />
              Singapore&apos;s #1 Verified Platform
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#1E293B] leading-tight mb-5">
              Find Your{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(to right, #10B981, #6366F1)' }}
              >
                Perfect Home
              </span>{' '}
              in Singapore
            </h1>

            <p className="text-lg text-gray-500 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              AI-powered insights, Singpass verified listings, family portfolio planning — all in
              one platform built for Singapore.
            </p>
          </div>

          {/* Right — 3D map */}
          <div className="flex-[45] w-full">
            <div className="relative h-[360px] lg:h-[440px] rounded-2xl overflow-hidden bg-[#0d2137] border border-gray-200 shadow-lg">
              <SingaporeMap />
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-xs text-white/40">
                <span>Drag to explore</span>
                <span className="text-[#10B981]">•</span>
                <span>Singapore Districts</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search — centered below both columns */}
        <div className="max-w-3xl mx-auto">
          <HeroSearch />
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          {TRUST_BADGES.map((badge) => (
            <div
              key={badge.label}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-gray-600 text-xs"
            >
              <span aria-hidden="true">{badge.icon}</span>
              <span>{badge.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
