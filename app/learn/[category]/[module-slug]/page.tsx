import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Info, Trophy, PlayCircle } from 'lucide-react';
import { ModuleContent } from '@/components/learning/ModuleContent';
import { ScenarioSimulator } from '@/components/learning/ScenarioSimulator';
import { CommunityQA } from '@/components/learning/CommunityQA';
import { LearningCategory } from '@/types';

// Mock data generator for static rendering
const MOCK_MODULES = [
    {
        slug: 'understanding-absd',
        category: 'legaltax',
        title: 'Understanding ABSD',
        summary: 'Master the Additional Buyers Stamp Duty and learn how it impacts your property purchasing power.',
        estimatedMinutes: 8,
        completionCount: 1420,
        hasVideoExplainer: true,
        hasQuiz: true,
        originalContent: `
      <h3>What is ABSD?</h3>
      <p>The Additional Buyer's Stamp Duty (ABSD) is a tax levied on top of the Buyer's Stamp Duty (BSD) for residential property purchases in Singapore. It was introduced to cool the property market and manage demand, particularly from investors and foreigners.</p>
      
      <h3>Current ABSD Rates (as of 2024)</h3>
      <p>The rates vary significantly based on your residency status and the number of residential properties you currently own:</p>
      <ul>
        <li><strong>Singapore Citizens:</strong> No ABSD on first property. 20% on the second, and 30% on the third and subsequent properties.</li>
        <li><strong>Permanent Residents (SPR):</strong> 5% on the first property. 30% on the second, and 35% on subsequent properties.</li>
        <li><strong>Foreigners:</strong> A flat 60% ABSD on any residential property purchase.</li>
        <li><strong>Entities/Trusts:</strong> 65% on any purchase.</li>
      </ul>

      <h3>Remission of ABSD</h3>
      <p>Married couples where at least one spouse is a SC can apply for ABSD remission if they jointly purchase a second property and sell their first property within 6 months of purchasing a completed property (or within 6 months of TOP for uncompleted properties).</p>
    `
    }
];

export async function generateStaticParams() {
    return MOCK_MODULES.map((mod) => ({
        category: mod.category,
        'module-slug': mod.slug,
    }));
}

export default function LearningModulePage({ params }: { params: { category: string; 'module-slug': string } }) {
    const module = MOCK_MODULES.find(m => m.slug === params['module-slug']);

    if (!module) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-gray-50 pb-20">

            {/* Header section */}
            <div className="bg-indigo-900 pt-32 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] animate-pulse"></div>

                <div className="max-w-4xl mx-auto relative z-10">
                    <Link href="/learn" className="inline-flex items-center text-indigo-200 hover:text-white mb-6 transition-colors">
                        <ChevronLeft className="h-4 w-4 mr-1" /> Back to Knowledge Hub
                    </Link>

                    <div className="flex items-center gap-3 mb-4">
                        <span className="bg-indigo-800 text-indigo-100 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                            {params.category.replace(/-/g, ' ')}
                        </span>
                        <span className="text-indigo-200 text-sm flex items-center">
                            <Info className="h-4 w-4 mr-1" /> {module.estimatedMinutes} min read
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
                        {module.title}
                    </h1>
                    <p className="text-xl text-indigo-100 mb-8 max-w-2xl leading-relaxed">
                        {module.summary}
                    </p>

                    <div className="flex items-center gap-6">
                        <div className="flex -space-x-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-8 h-8 rounded-full border-2 border-indigo-900 bg-indigo-400 flex items-center justify-center text-xs font-bold text-white shadow-sm overflow-hidden">
                                    <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="avatar" />
                                </div>
                            ))}
                        </div>
                        <span className="text-indigo-200 text-sm">Join {module.completionCount.toLocaleString()} others who completed this module</span>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20 space-y-8">

                {/* Key Metrics Callout */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col justify-center items-center text-center">
                        <span className="text-gray-500 text-sm font-medium mb-1 uppercase tracking-wider">Max ABSD Rate</span>
                        <span className="text-3xl font-extrabold text-rose-600">60%</span>
                        <span className="text-xs text-gray-400 mt-2">For Foreigners</span>
                    </div>
                    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col justify-center items-center text-center">
                        <span className="text-gray-500 text-sm font-medium mb-1 uppercase tracking-wider">SC 2nd Property</span>
                        <span className="text-3xl font-extrabold text-amber-500">20%</span>
                        <span className="text-xs text-gray-400 mt-2">Payable upfront in cash/CPF</span>
                    </div>
                    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col justify-center items-center text-center">
                        <span className="text-gray-500 text-sm font-medium mb-1 uppercase tracking-wider">Remission Window</span>
                        <span className="text-3xl font-extrabold text-emerald-600">6 Mths</span>
                        <span className="text-xs text-gray-400 mt-2">To sell first property</span>
                    </div>
                </div>

                {/* Video Placeholder */}
                {module.hasVideoExplainer && (
                    <div className="bg-slate-900 rounded-3xl aspect-video relative flex items-center justify-center group cursor-pointer overflow-hidden shadow-xl border border-slate-800">
                        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/50 to-slate-900/50"></div>
                        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 transition-transform duration-300 group-hover:scale-105">
                            <PlayCircle className="h-20 w-20 text-white/90 mb-4 group-hover:text-indigo-400 transition-colors" />
                            <span className="text-white font-medium text-lg tracking-wide">Watch 2-Min Explainer</span>
                        </div>
                    </div>
                )}

                {/* Core Lesson Content with ELI5 */}
                <ModuleContent originalContent={module.originalContent} moduleId={params['module-slug']} />

                {/* Interactive Scenario Simulator */}
                <ScenarioSimulator />

                {/* Community Q&A */}
                <CommunityQA />

                {/* Completion Action */}
                <div className="flex justify-center mt-12 mb-8">
                    <button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-emerald-200 transition-all hover:shadow-xl hover:-translate-y-1 flex items-center text-lg">
                        <Trophy className="h-6 w-6 mr-3 text-emerald-100" />
                        Mark Module as Complete
                    </button>
                </div>

            </div>
        </main>
    );
}
