import Link from 'next/link';
import { CalculatorNav } from '@/components/calculators/CalculatorNav';

export default function StampDutyPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest mb-3">
          CALCULATORS / STAMP DUTY
        </p>
        <h1 className="text-4xl font-extrabold text-[#1E293B] mb-4">Stamp Duty Calculator</h1>
        <CalculatorNav active="stamp-duty" />
        <p className="text-gray-500 mb-8">This section is coming soon.</p>
        <Link href="/" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
          ← Back to Home
        </Link>
      </div>
    </main>
  );
}
