'use client';

import dynamic from 'next/dynamic';

function MapSkeleton() {
  return (
    <div className="w-full h-full min-h-[400px] flex items-center justify-center">
      <div className="relative w-full h-full min-h-[400px]">
        {/* Shimmer base */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d2137] to-[#0a1628] rounded-xl overflow-hidden">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, rgba(16,185,129,0.3) 50%, transparent 100%)',
              animation: 'shimmer 2s infinite',
            }}
          />
          {/* Fake island outline */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-48 h-24 rounded-[50%] border border-[#10B981]/30"
              style={{
                background:
                  'radial-gradient(ellipse, rgba(16,185,129,0.1) 0%, transparent 70%)',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const SingaporeMapCanvas = dynamic(() => import('./SingaporeMapCanvas'), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

export function SingaporeMap() {
  return (
    <div className="w-full h-full min-h-[400px]">
      <SingaporeMapCanvas />
    </div>
  );
}
