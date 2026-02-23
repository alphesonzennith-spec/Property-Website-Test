import Link from 'next/link';
import {
    BookOpen,
    Home,
    Tags,
    Key,
    PieChart,
    Scale,
    Hammer,
    LineChart,
    Map,
    Wrench,
    Compass
} from 'lucide-react';
import { LearningCategory } from '@/types';

const CATEGORIES = [
    {
        id: LearningCategory.Buying,
        title: 'Buying',
        description: 'Master the process of purchasing your dream home.',
        icon: Home,
        color: 'bg-blue-100 text-blue-600',
        hover: 'hover:border-blue-300 hover:shadow-blue-100/50',
    },
    {
        id: LearningCategory.Selling,
        title: 'Selling',
        description: 'Strategies to maximize your property value.',
        icon: Tags,
        color: 'bg-emerald-100 text-emerald-600',
        hover: 'hover:border-emerald-300 hover:shadow-emerald-100/50',
    },
    {
        id: LearningCategory.Renting,
        title: 'Renting',
        description: 'Everything you need to know about leasing.',
        icon: Key,
        color: 'bg-amber-100 text-amber-600',
        hover: 'hover:border-amber-300 hover:shadow-amber-100/50',
    },
    {
        id: LearningCategory.Financing,
        title: 'Financing',
        description: 'Demystifying mortgages, CPF, and loans.',
        icon: PieChart,
        color: 'bg-violet-100 text-violet-600',
        hover: 'hover:border-violet-300 hover:shadow-violet-100/50',
    },
    {
        id: LearningCategory.LegalTax,
        title: 'Legal & Tax',
        description: 'Navigate SSD, ABSD, and conveyancing.',
        icon: Scale,
        color: 'bg-rose-100 text-rose-600',
        hover: 'hover:border-rose-300 hover:shadow-rose-100/50',
    },
    {
        id: LearningCategory.HomeImprovements,
        title: 'Home Improvements',
        description: 'Renovation guides and cost estimates.',
        icon: Hammer,
        color: 'bg-cyan-100 text-cyan-600',
        hover: 'hover:border-cyan-300 hover:shadow-cyan-100/50',
    },
    {
        id: LearningCategory.Insights,
        title: 'Market Insights',
        description: 'Data-driven analysis on property trends.',
        icon: LineChart,
        color: 'bg-indigo-100 text-indigo-600',
        hover: 'hover:border-indigo-300 hover:shadow-indigo-100/50',
    },
    {
        id: LearningCategory.HomeJourney,
        title: 'Home Journey',
        description: 'Step-by-step guidance from start to finish.',
        icon: Map,
        color: 'bg-fuchsia-100 text-fuchsia-600',
        hover: 'hover:border-fuchsia-300 hover:shadow-fuchsia-100/50',
    },
    {
        id: LearningCategory.DIY,
        title: 'DIY',
        description: 'Learn how to transact without an agent.',
        icon: Wrench,
        color: 'bg-orange-100 text-orange-600',
        hover: 'hover:border-orange-300 hover:shadow-orange-100/50',
    },
    {
        id: LearningCategory.FengShui,
        title: 'Feng Shui',
        description: 'Tips for a harmonious living space.',
        icon: Compass,
        color: 'bg-teal-100 text-teal-600',
        hover: 'hover:border-teal-300 hover:shadow-teal-100/50',
    },
];

export default function KnowledgeHubHomepage() {
    return (
        <main className="min-h-screen bg-gray-50 pb-20">
            {/* Hero Section */}
            <section className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                    <div className="inline-flex items-center justify-center p-3 bg-indigo-50 rounded-2xl mb-6">
                        <BookOpen className="h-8 w-8 text-indigo-600" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-[#1E293B] tracking-tight mb-6">
                        Property Knowledge Hub
                    </h1>
                    <p className="text-lg md:text-xl text-gray-500 max-w-3xl mx-auto leading-relaxed">
                        Your comprehensive guide to navigating Singapore's real estate market.
                        From understanding complex regulations to DIY selling guides, we've got you covered.
                    </p>
                </div>
            </section>

            {/* Categories Grid */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {CATEGORIES.map((category) => {
                        const Icon = category.icon;
                        return (
                            <Link
                                href={`/learn/${category.id.toLowerCase()}`}
                                key={category.id}
                                className={`group bg-white rounded-2xl p-6 border border-gray-200 shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${category.hover}`}
                            >
                                <div className={`inline-flex p-3 rounded-xl mb-4 transition-transform duration-200 group-hover:scale-110 ${category.color}`}>
                                    <Icon className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                                    {category.title}
                                </h3>
                                <p className="text-sm text-gray-500 line-clamp-2">
                                    {category.description}
                                </p>
                            </Link>
                        );
                    })}
                </div>
            </section>

            {/* Featured/Popular Modules Section (Placeholder for future) */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-12">
                <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-3xl p-8 md:p-12 text-white overflow-hidden relative">
                    <div className="relative z-10 max-w-2xl">
                        <h2 className="text-3xl font-bold mb-4">Start Your Journey</h2>
                        <p className="text-indigo-100 mb-8 text-lg">
                            Not sure where to begin? Take our interactive assessment to get a personalized learning path tailored to your specific situation and property goals.
                        </p>
                        <button className="bg-white text-indigo-900 px-6 py-3 rounded-xl font-semibold hover:bg-indigo-50 transition-colors">
                            Get Personalized Path
                        </button>
                    </div>

                    {/* Decorative elements */}
                    <div className="absolute right-0 top-0 w-1/2 h-full opacity-10 pointer-events-none">
                        <svg viewBox="0 0 100 100" className="w-full h-full text-white fill-current" preserveAspectRatio="none">
                            <polygon points="0,100 100,0 100,100" />
                        </svg>
                    </div>
                </div>
            </section>
        </main>
    );
}
