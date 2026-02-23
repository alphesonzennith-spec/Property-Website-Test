'use client';

import { useRef, useEffect, useState } from 'react';
import { TrendingUp, Home, ShieldCheck, Banknote } from 'lucide-react';
import type { ComponentType } from 'react';

interface Stat {
  icon: ComponentType<{ className?: string }>;
  prefix?: string;
  value: number;
  suffix: string;
  label1: string;
  label2: string;
}

const STATS: Stat[] = [
  { icon: TrendingUp, value: 12000, suffix: '+', label1: 'Transactions', label2: 'Completed' },
  { icon: Home, value: 50000, suffix: '+', label1: 'Verified', label2: 'Listings' },
  { icon: ShieldCheck, value: 98, suffix: '%', label1: 'Singpass', label2: 'Verified Users' },
  { icon: Banknote, prefix: 'S$', value: 2.8, suffix: 'B+', label1: 'Transaction', label2: 'Volume (2024)' },
];

function useCountUp(target: number, duration: number, active: boolean) {
  const [count, setCount] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) return;
    startTimeRef.current = null;

    function animate(timestamp: number) {
      if (startTimeRef.current === null) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(eased * target);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    }

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [active, target, duration]);

  return count;
}

function StatItem({ stat, active }: { stat: Stat; active: boolean }) {
  const count = useCountUp(stat.value, 2000, active);
  const formatted = stat.value < 100
    ? count.toFixed(stat.value % 1 !== 0 ? 1 : 0)
    : Math.floor(count).toLocaleString();

  const Icon = stat.icon;

  return (
    <div className="flex flex-col items-center text-center px-4">
      <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
        <Icon className="w-6 h-6 text-[#10B981]" aria-hidden="true" />
      </div>
      <div className="text-3xl md:text-4xl font-extrabold text-[#1E293B] tabular-nums">
        {stat.prefix ?? ''}{formatted}{stat.suffix}
      </div>
      <div className="mt-1 text-sm text-gray-500 leading-snug">
        {stat.label1}<br />{stat.label2}
      </div>
    </div>
  );
}

export function StatsBar() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          obs.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="py-12 border-y border-gray-100 bg-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-y md:divide-y-0 md:divide-x divide-gray-100">
          {STATS.map((stat) => (
            <StatItem key={stat.label1} stat={stat} active={active} />
          ))}
        </div>
      </div>
    </section>
  );
}
