'use client';

import dynamic from 'next/dynamic';

// ssr: false must live in a Client Component — not allowed in Server Components.
// This thin wrapper lets the Server Component page.tsx use it safely.
const SingaporeMapCanvas = dynamic(
  () => import('@/components/home/SingaporeMapCanvas'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-slate-200 animate-pulse rounded-xl" />
    ),
  }
);

export function SingaporeMapClient() {
  return <SingaporeMapCanvas />;
}
