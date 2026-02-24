import Link from 'next/link';
import {
  Calculator,
  Percent,
  Landmark,
  CreditCard,
  PieChart,
  Home,
  CalendarDays,
  Coins,
  ReceiptText
} from 'lucide-react';

const CALCULATORS = [
  {
    id: 'm-value',
    title: 'M-Value Calculator',
    description: "Estimate your property's current market value using our real-time AI valuation engine based on recent transactions.",
    icon: <Home className="h-8 w-8 text-blue-600" />,
    color: 'bg-blue-50 border-blue-200',
    hover: 'hover:border-blue-400 hover:shadow-blue-100/50',
    href: '/resources/calculators/m-value'
  },
  {
    id: 'stamp-duty',
    title: 'Stamp Duty Calculator',
    description: "Quickly estimate your Buyer's Stamp Duty (BSD) and Additional Buyer's Stamp Duty (ABSD) liabilities based on your residency.",
    icon: <Percent className="h-8 w-8 text-emerald-600" />,
    color: 'bg-emerald-50 border-emerald-200',
    hover: 'hover:border-emerald-400 hover:shadow-emerald-100/50',
    href: '/resources/calculators/stamp-duty'
  },
  {
    id: 'msr',
    title: 'MSR Calculator',
    description: "Mortgage Servicing Ratio: Check how much of your monthly income can be used to service your HDB loan or bank mortgage for HDBs.",
    icon: <PieChart className="h-8 w-8 text-amber-600" />,
    color: 'bg-amber-50 border-amber-200',
    hover: 'hover:border-amber-400 hover:shadow-amber-100/50',
    href: '/resources/calculators/msr'
  },
  {
    id: 'tdsr',
    title: 'TDSR Calculator',
    description: "Total Debt Servicing Ratio: See how your total fixed monthly debts affect your maximum loan eligibility for private property.",
    icon: <Landmark className="h-8 w-8 text-rose-600" />,
    color: 'bg-rose-50 border-rose-200',
    hover: 'hover:border-rose-400 hover:shadow-rose-100/50',
    href: '/resources/calculators/tdsr'
  },
  {
    id: 'mortgage',
    title: 'Mortgage Calculator',
    description: "Plan your monthly mortgage repayments across different bank loan rates and tenure options.",
    icon: <CreditCard className="h-8 w-8 text-indigo-600" />,
    color: 'bg-indigo-50 border-indigo-200',
    hover: 'hover:border-indigo-400 hover:shadow-indigo-100/50',
    href: '/resources/calculators/mortgage'
  },
  {
    id: 'progressive-payment',
    title: 'Progressive Payment',
    description: "Estimate staged payments for uncompleted (BUC) properties based on the standard construction timeline.",
    icon: <CalendarDays className="h-8 w-8 text-cyan-600" />,
    color: 'bg-cyan-50 border-cyan-200',
    hover: 'hover:border-cyan-400 hover:shadow-cyan-100/50',
    href: '/resources/calculators/progressive-payment'
  },
  {
    id: 'affordability',
    title: 'Affordability Planner',
    description: "Reverse-engineer your budget. Input your income and downpayment to discover the home price that fits your financial capacity.",
    icon: <Coins className="h-8 w-8 text-violet-600" />,
    color: 'bg-violet-50 border-violet-200',
    hover: 'hover:border-violet-400 hover:shadow-violet-100/50',
    href: '/resources/calculators/affordability'
  },
  {
    id: 'cpf-optimizer',
    title: 'CPF Usage Optimizer',
    description: "Compare three CPF usage strategies — Max CPF, Full Cash, and Optimized Split — to find the best balance between monthly outflow and retirement savings.",
    icon: <Coins className="h-8 w-8 text-teal-600" />,
    color: 'bg-teal-50 border-teal-200',
    hover: 'hover:border-teal-400 hover:shadow-teal-100/50',
    href: '/resources/calculators/cpf-optimizer'
  },
  {
    id: 'total-cost',
    title: 'Total Cost of Ownership',
    description: 'Model the full long-term cost of owning a property — stamp duties, mortgage interest, property tax, maintenance, and opportunity costs over 5, 10, or 20 years.',
    icon: <ReceiptText className="h-8 w-8 text-indigo-600" />,
    color: 'bg-indigo-50 border-indigo-200',
    hover: 'hover:border-indigo-400 hover:shadow-indigo-100/50',
    href: '/resources/calculators/total-cost'
  }
];

export default function CalculatorsHubPage() {
  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      {/* Hero Section */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="inline-flex items-center justify-center p-4 bg-indigo-50 rounded-3xl mb-6 shadow-inner">
            <Calculator className="h-10 w-10 text-indigo-600" />
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-[#1E293B] tracking-tight mb-6">
            Property Calculator Hub
          </h1>
          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Your comprehensive toolkit for smarter real estate decisions. Select a calculator below to estimate your costs, eligibility, and potential returns.
          </p>
        </div>
      </section>

      {/* Grid Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {CALCULATORS.map((calc) => (
            <Link
              key={calc.id}
              href={calc.href}
              className={`group flex flex-col h-full bg-white rounded-3xl p-8 border-2 border-transparent shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-2 ${calc.hover}`}
            >
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 shadow-inner transition-transform duration-300 group-hover:scale-110 ${calc.color}`}>
                {calc.icon}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">
                {calc.title}
              </h3>
              <p className="text-gray-500 mb-8 flex-grow leading-relaxed">
                {calc.description}
              </p>

              <div className="mt-auto pt-6 border-t border-gray-100">
                <span className="inline-flex items-center text-indigo-600 font-semibold group-hover:block transition-all transform origin-left">
                  Calculate Now
                  <span className="ml-2 transition-transform duration-300 group-hover:translate-x-2">→</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-12">
        <div className="bg-slate-900 rounded-3xl p-10 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-4">Need Personalized Advice?</h2>
            <p className="text-slate-300 mb-8 max-w-xl mx-auto text-lg leading-relaxed">
              Our property calculators provide estimates based on current market rates. For a comprehensive review of your portfolio, speak to one of our verified expert agents.
            </p>
            <button className="bg-white text-slate-900 px-8 py-4 rounded-full font-bold shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all hover:-translate-y-1">
              Find an Agent
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
