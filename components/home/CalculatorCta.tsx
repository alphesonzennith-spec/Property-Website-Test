import Link from 'next/link';
import { Receipt, BarChart2, Wallet } from 'lucide-react';
import type { ComponentType } from 'react';

interface CalculatorCard {
  title: string;
  description: string;
  cta: string;
  href: string;
  gradient: string;
  Icon: ComponentType<{ className?: string }>;
}

const CALCULATORS: CalculatorCard[] = [
  {
    title: 'Stamp Duty (BSD/ABSD)',
    description: 'Calculate your stamp duty instantly — buyer, seller, or additional buyer.',
    cta: 'Calculate Now →',
    href: '/resources/calculators/stamp-duty',
    gradient: 'linear-gradient(135deg, #4338ca 0%, #6366F1 100%)',
    Icon: Receipt,
  },
  {
    title: 'TDSR / MSR Check',
    description: "Know your loan eligibility before you make an offer. Know your exact numbers.",
    cta: 'Check Eligibility →',
    href: '/resources/calculators/tdsr',
    gradient: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
    Icon: BarChart2,
  },
  {
    title: 'Affordability Planner',
    description: 'Find your ideal property budget based on income, CPF, and expenses.',
    cta: 'Plan Budget →',
    href: '/resources/calculators/affordability',
    gradient: 'linear-gradient(135deg, #d97706 0%, #F59E0B 100%)',
    Icon: Wallet,
  },
];

export function CalculatorCta() {
  return (
    <section className="py-20 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#1E293B] mb-3">
            Plan Your Finances
          </h2>
          <p className="text-gray-500 max-w-md mx-auto">
            Singapore-specific calculators powered by AI — free for all users.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CALCULATORS.map((calc) => (
            <Link
              key={calc.title}
              href={calc.href}
              className="rounded-2xl p-6 text-center cursor-pointer hover:scale-[1.02] transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981] block relative overflow-hidden group"
              style={{ background: calc.gradient }}
            >
              {/* Decorative circle */}
              <div
                aria-hidden="true"
                className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-white/10 group-hover:scale-110 transition-transform"
              />

              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mx-auto mb-4">
                  <calc.Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{calc.title}</h3>
                <p className="text-sm text-white/80 leading-relaxed mb-5">{calc.description}</p>
                <span className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 text-white text-sm font-semibold hover:bg-white/30 transition-colors">
                  {calc.cta}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
