'use client';

import { PriceTrendWidget } from './widgets/PriceTrendWidget';
import { VolumeBarWidget } from './widgets/VolumeBarWidget';
import { DistrictHeatmapWidget } from './widgets/DistrictHeatmapWidget';
import { PriceDistributionWidget } from './widgets/PriceDistributionWidget';
import { RentalYieldWidget } from './widgets/RentalYieldWidget';
import { NotableTransactionsWidget } from './widgets/NotableTransactionsWidget';
import { AiMarketAnalysisWidget } from './widgets/AiMarketAnalysisWidget';
import {
    Sparkles,
    BarChart2,
    TrendingUp,
    Map,
    Percent,
    Activity,
    FileText,
    ArrowUpRight,
    ArrowDownRight,
    Info
} from 'lucide-react';

// --- KPI Card Component ---
interface KPICardProps {
    label: string;
    value: string;
    change: string;
    trend: 'up' | 'down';
    icon: React.ReactNode;
}

function KPICard({ label, value, change, trend, icon }: KPICardProps) {
    return (
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-start justify-between">
            <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{label}</p>
                <div className="flex items-baseline gap-2">
                    <h4 className="text-xl font-bold text-gray-900">{value}</h4>
                    <span className={`text-xs font-semibold flex items-center ${trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {change}
                    </span>
                </div>
            </div>
            <div className={`p-2 rounded-lg ${trend === 'up' ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                {icon}
            </div>
        </div>
    );
}

export function AnalyticsTab() {
    return (
        <div className="space-y-8 pb-12">
            {/* 1. KEY PERFORMANCE INDICATORS (SUMMARY RIBBON) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    label="Median Sale Price"
                    value="S$1.42M"
                    change="4.2%"
                    trend="up"
                    icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
                />
                <KPICard
                    label="Avg PSF"
                    value="S$2,150"
                    change="2.1%"
                    trend="up"
                    icon={<Activity className="w-5 h-5 text-emerald-600" />}
                />
                <KPICard
                    label="Volume (MoM)"
                    value="1,245"
                    change="12.5%"
                    trend="down"
                    icon={<BarChart2 className="w-5 h-5 text-rose-600" />}
                />
                <KPICard
                    label="Rental Yield (Avg)"
                    value="3.8%"
                    change="0.4%"
                    trend="up"
                    icon={<Percent className="w-5 h-5 text-emerald-600" />}
                />
            </div>

            {/* 2. MARKET TRENDS & AI INSIGHTS */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 border-l-4 border-emerald-500 pl-4 py-1">
                    <h2 className="text-lg font-bold text-gray-900">Market Trends & Intelligence</h2>
                    <Info className="w-4 h-4 text-gray-400 cursor-help" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[450px]">
                        <div className="bg-gray-50 p-4 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-emerald-600" /> Long-term Price Trend
                            </h3>
                            <span className="text-xs text-gray-400 bg-white px-2 py-1 rounded border">SGD/PSF</span>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <PriceTrendWidget />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col border-t-4 border-t-purple-500 h-[450px]">
                        <div className="bg-purple-50 p-4 border-b border-purple-100 flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-purple-900 flex items-center gap-2">
                                <Sparkles className="w-4 h-4" /> AI Market Analysis
                            </h3>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            <AiMarketAnalysisWidget />
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. DISTRIBUTION & REGIONAL ANALYSIS */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 border-l-4 border-amber-500 pl-4 py-1">
                    <h2 className="text-lg font-bold text-gray-900">Regional & Distribution Analysis</h2>
                    <Info className="w-4 h-4 text-gray-400 cursor-help" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[400px]">
                        <div className="bg-gray-50 p-4 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                                <Map className="w-4 h-4 text-emerald-600" /> Geographic Heatmap
                            </h3>
                            <span className="text-xs text-gray-400 bg-white px-2 py-1 rounded border">avg psf</span>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <DistrictHeatmapWidget />
                        </div>
                    </div>

                    <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[400px]">
                        <div className="bg-gray-50 p-4 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                                <BarChart2 className="w-4 h-4 text-emerald-600" /> Volume Breakdown
                            </h3>
                            <span className="text-xs text-gray-400 bg-white px-2 py-1 rounded border">count</span>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <VolumeBarWidget />
                        </div>
                    </div>

                    <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[400px]">
                        <div className="bg-gray-50 p-4 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                                <Activity className="w-4 h-4 text-emerald-600" /> Price Distribution
                            </h3>
                            <span className="text-xs text-gray-400 bg-white px-2 py-1 rounded border">volume</span>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <PriceDistributionWidget />
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. TRANSACTIONAL DATA & INVESTMENT YIELDS */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 border-l-4 border-blue-500 pl-4 py-1">
                    <h2 className="text-lg font-bold text-gray-900">Transaction History & Investment Metrics</h2>
                    <Info className="w-4 h-4 text-gray-400 cursor-help" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-8 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[500px]">
                        <div className="bg-gray-50 p-4 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-emerald-600" /> Recent Market Transactions
                            </h3>
                            <span className="text-xs text-gray-400 bg-white px-2 py-1 rounded border">verified</span>
                        </div>
                        <div className="flex-1 overflow-hidden border-t">
                            <NotableTransactionsWidget />
                        </div>
                    </div>

                    <div className="lg:col-span-4 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[500px]">
                        <div className="bg-gray-50 p-4 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                                <Percent className="w-4 h-4 text-emerald-600" /> Yield Benchmarks
                            </h3>
                            <span className="text-xs text-gray-400 bg-white px-2 py-1 rounded border">% ann.</span>
                        </div>
                        <div className="flex-1 overflow-hidden border-t">
                            <RentalYieldWidget />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
