'use client';

import { useState, useEffect, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Responsive, Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { useDashboardStore } from '@/lib/store/useDashboardStore';
import { PriceTrendWidget } from './widgets/PriceTrendWidget';
import { VolumeBarWidget } from './widgets/VolumeBarWidget';
import { DistrictHeatmapWidget } from './widgets/DistrictHeatmapWidget';
import { PriceDistributionWidget } from './widgets/PriceDistributionWidget';
import { RentalYieldWidget } from './widgets/RentalYieldWidget';
import { NotableTransactionsWidget } from './widgets/NotableTransactionsWidget';
import { AiMarketAnalysisWidget } from './widgets/AiMarketAnalysisWidget';
import { Sparkles, Settings2 } from 'lucide-react';
import { useRef } from 'react';
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Initial default layout for the widgets
const INITIAL_LAYOUT = [
    { i: 'trend', x: 0, y: 0, w: 10, h: 4, minW: 6 },
    { i: 'volume', x: 10, y: 0, w: 7, h: 4, minW: 5 },
    { i: 'yield', x: 17, y: 0, w: 7, h: 4, minW: 5 },
    { i: 'heatmap', x: 0, y: 4, w: 9, h: 4, minW: 6 },
    { i: 'distribution', x: 9, y: 4, w: 9, h: 4, minW: 6 },
    { i: 'ai', x: 18, y: 4, w: 6, h: 4, minW: 5 },
    { i: 'transactions', x: 0, y: 8, w: 24, h: 4, minW: 10 },
];

const WIDGET_OPTIONS = [
    { id: 'trend', label: 'Price Trend' },
    { id: 'volume', label: 'Transaction Volume' },
    { id: 'heatmap', label: 'Regional Heatmap' },
    { id: 'distribution', label: 'Price Distribution' },
    { id: 'yield', label: 'Rental Yields' },
    { id: 'transactions', label: 'Notable Transactions' },
    { id: 'ai', label: 'AI Market Insight' },
];

export function WidgetGrid() {
    const [layout, setLayout] = useState<any[]>(INITIAL_LAYOUT);
    const [visibleWidgets, setVisibleWidgets] = useState<string[]>(['trend', 'volume', 'heatmap', 'distribution', 'yield', 'transactions', 'ai']);
    const [isMounted, setIsMounted] = useState(false);

    // We subscribe to filters here just to force a re-render/logging if needed, 
    // but the individual widgets will subscribe to the data themselves.
    const propertyType = useDashboardStore(state => state.propertyType);
    const district = useDashboardStore(state => state.district);
    const timePeriod = useDashboardStore(state => state.timePeriod);

    useEffect(() => {
        // Load layout from localStorage if exists
        const saved = localStorage.getItem('space-realty-dashboard-layout-v6');
        const savedWidgets = localStorage.getItem('space-realty-dashboard-widgets-v6');
        if (saved) {
            try { setLayout(JSON.parse(saved)); } catch (e) { }
        }
        if (savedWidgets) {
            try { setVisibleWidgets(JSON.parse(savedWidgets)); } catch (e) { }
        }
        setIsMounted(true);
    }, []);

    const handleLayoutChange = (newLayout: any[]) => {
        setLayout(newLayout);
        localStorage.setItem('space-realty-dashboard-layout-v6', JSON.stringify(newLayout));
    };

    const toggleWidget = (id: string, checked: boolean) => {
        const newVisible = checked ? [...visibleWidgets, id] : visibleWidgets.filter(w => w !== id);
        setVisibleWidgets(newVisible);
        localStorage.setItem('space-realty-dashboard-widgets-v6', JSON.stringify(newVisible));
    };

    const containerRef = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState(1200);

    useEffect(() => {
        if (!containerRef.current) return;
        const observer = new ResizeObserver((entries) => {
            if (entries[0]) setWidth(entries[0].contentRect.width);
        });
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    if (!isMounted) return <div className="animate-pulse bg-gray-200 h-[500px] rounded-xl" />;

    const ResponsiveGridLayout = Responsive as any;

    return (
        <div className="bg-transparent -mx-4 sm:mx-0" ref={containerRef}>
            <div className="flex justify-between items-center mb-4 px-4 sm:px-0">
                <p className="text-sm text-gray-500 hidden sm:block">Widgets can be dragged and resized. Your layout is auto-saved.</p>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2 bg-white ml-auto">
                            <Settings2 className="w-4 h-4" /> Manage Grid
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Visible Widgets</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {WIDGET_OPTIONS.map(option => (
                            <DropdownMenuCheckboxItem
                                key={option.id}
                                checked={visibleWidgets.includes(option.id)}
                                onCheckedChange={(checked) => toggleWidget(option.id, checked)}
                            >
                                {option.label}
                            </DropdownMenuCheckboxItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <ResponsiveGridLayout
                className="layout"
                width={width}
                layouts={{ lg: layout }}
                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                cols={{ lg: 24, md: 24, sm: 12, xs: 8, xxs: 4 }}
                rowHeight={100}
                onLayoutChange={(currentLayout: any) => handleLayoutChange(currentLayout)}
                draggableHandle=".drag-handle"
                isResizable={true}
                margin={[16, 16]}
            >
                {/* WIDGET 1: Price Trend Line Chart */}
                {visibleWidgets.includes('trend') && (
                    <div key="trend" className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                        <div className="drag-handle bg-gray-50 p-3 border-b border-gray-100 cursor-move flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-800">Price Trend</h3>
                            <span className="text-xs text-gray-400 bg-white px-2 py-1 rounded border">psf</span>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <Suspense fallback={<Skeleton className="w-full h-full rounded-none" />}>
                                <PriceTrendWidget />
                            </Suspense>
                        </div>
                    </div>
                )}

                {/* WIDGET 2: Transaction Volume */}
                {visibleWidgets.includes('volume') && (
                    <div key="volume" className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                        <div className="drag-handle bg-gray-50 p-3 border-b border-gray-100 cursor-move flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-800">Transaction Volume</h3>
                            <span className="text-xs text-gray-400 bg-white px-2 py-1 rounded border">count</span>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <Suspense fallback={<Skeleton className="w-full h-full rounded-none" />}>
                                <VolumeBarWidget />
                            </Suspense>
                        </div>
                    </div>
                )}

                {/* WIDGET 3: PSF Heatmap */}
                {visibleWidgets.includes('heatmap') && (
                    <div key="heatmap" className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                        <div className="drag-handle bg-gray-50 p-3 border-b border-gray-100 cursor-move flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-800">Regional Heatmap</h3>
                            <span className="text-xs text-gray-400 bg-white px-2 py-1 rounded border">psf</span>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <Suspense fallback={<Skeleton className="w-full h-full rounded-none" />}>
                                <DistrictHeatmapWidget />
                            </Suspense>
                        </div>
                    </div>
                )}

                {/* WIDGET 4: Price Distribution */}
                {visibleWidgets.includes('distribution') && (
                    <div key="distribution" className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                        <div className="drag-handle bg-gray-50 p-3 border-b border-gray-100 cursor-move flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-800">Price Distribution</h3>
                            <span className="text-xs text-gray-400 bg-white px-2 py-1 rounded border">volume</span>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <Suspense fallback={<Skeleton className="w-full h-full rounded-none" />}>
                                <PriceDistributionWidget />
                            </Suspense>
                        </div>
                    </div>
                )}

                {/* WIDGET 5: Rental Yield */}
                {visibleWidgets.includes('yield') && (
                    <div key="yield" className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                        <div className="drag-handle bg-gray-50 p-3 border-b border-gray-100 cursor-move flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-800">Rental Yields</h3>
                            <span className="text-xs text-gray-400 bg-white px-2 py-1 rounded border">%</span>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <Suspense fallback={<Skeleton className="w-full h-full rounded-none" />}>
                                <RentalYieldWidget />
                            </Suspense>
                        </div>
                    </div>
                )}

                {/* WIDGET 6: Recent Transactions */}
                {visibleWidgets.includes('transactions') && (
                    <div key="transactions" className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                        <div className="drag-handle bg-gray-50 p-3 border-b border-gray-100 cursor-move flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-800">Notable Transactions</h3>
                            <span className="text-xs text-gray-400 bg-white px-2 py-1 rounded border">market</span>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <Suspense fallback={<Skeleton className="w-full h-full rounded-none" />}>
                                <NotableTransactionsWidget />
                            </Suspense>
                        </div>
                    </div>
                )}

                {/* WIDGET 7: AI Analysis */}
                {visibleWidgets.includes('ai') && (
                    <div key="ai" className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col border-l-4 border-l-purple-500">
                        <div className="drag-handle bg-purple-50 p-3 border-b border-purple-100 cursor-move flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-purple-900 flex items-center gap-1">
                                <Sparkles className="w-4 h-4" /> AI Market Insight
                            </h3>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <Suspense fallback={<Skeleton className="w-full h-full rounded-none" />}>
                                <AiMarketAnalysisWidget />
                            </Suspense>
                        </div>
                    </div>
                )}

            </ResponsiveGridLayout>
        </div>
    );
}
