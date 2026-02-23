'use client';

import { PriceTrendWidget } from './widgets/PriceTrendWidget';
import { VolumeBarWidget } from './widgets/VolumeBarWidget';
import { DistrictHeatmapWidget } from './widgets/DistrictHeatmapWidget';
import { PriceDistributionWidget } from './widgets/PriceDistributionWidget';
import { RentalYieldWidget } from './widgets/RentalYieldWidget';
import { NotableTransactionsWidget } from './widgets/NotableTransactionsWidget';
import { AiMarketAnalysisWidget } from './widgets/AiMarketAnalysisWidget';
import { Sparkles, BarChart2, TrendingUp, Map, Percent, Activity, FileText } from 'lucide-react';

export function AnalyticsTab() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* PRIMARY METRICS & AI */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[400px]">
                        <div className="bg-gray-50 p-4 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-emerald-600" /> Price Trend Analysis
                            </h3>
                            <span className="text-xs text-gray-400 bg-white px-2 py-1 rounded border">psf</span>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <PriceTrendWidget />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[400px]">
                            <div className="bg-gray-50 p-4 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                                    <BarChart2 className="w-4 h-4 text-emerald-600" /> Transaction Volume
                                </h3>
                                <span className="text-xs text-gray-400 bg-white px-2 py-1 rounded border">count</span>
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <VolumeBarWidget />
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[400px]">
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
                </div>

                {/* SIDEBAR METRICS */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col border-t-4 border-t-purple-500 min-h-[400px]">
                        <div className="bg-purple-50 p-4 border-b border-purple-100 flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-purple-900 flex items-center gap-2">
                                <Sparkles className="w-4 h-4" /> AI Market Insight
                            </h3>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <AiMarketAnalysisWidget />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[400px]">
                        <div className="bg-gray-50 p-4 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                                <Map className="w-4 h-4 text-emerald-600" /> Regional Heatmap
                            </h3>
                            <span className="text-xs text-gray-400 bg-white px-2 py-1 rounded border">psf</span>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <DistrictHeatmapWidget />
                        </div>
                    </div>
                </div>
            </div>

            {/* BOTTOM FULL WIDTH DATA */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[500px]">
                    <div className="bg-gray-50 p-4 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-emerald-600" /> Notable Transactions
                        </h3>
                        <span className="text-xs text-gray-400 bg-white px-2 py-1 rounded border">market</span>
                    </div>
                    <div className="flex-1 overflow-hidden border-t">
                        <NotableTransactionsWidget />
                    </div>
                </div>

                <div className="lg:col-span-4 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[500px]">
                    <div className="bg-gray-50 p-4 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                            <Percent className="w-4 h-4 text-emerald-600" /> Rental Yields
                        </h3>
                        <span className="text-xs text-gray-400 bg-white px-2 py-1 rounded border">%</span>
                    </div>
                    <div className="flex-1 overflow-hidden border-t">
                        <RentalYieldWidget />
                    </div>
                </div>
            </div>

        </div>
    );
}
