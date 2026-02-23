'use client';

import { useState, useEffect } from 'react';
import { useDashboardStore } from '@/lib/store/useDashboardStore';
import { Button } from '@/components/ui/button';
import { RefreshCcw, Sparkles, Share2 } from 'lucide-react';
import { toast } from 'sonner';

export function AiMarketAnalysisWidget() {
    const { propertyType, district, timePeriod } = useDashboardStore();
    const [isLoading, setIsLoading] = useState(false);
    const [analysis, setAnalysis] = useState<string | null>(null);

    // Mock an AI call based on filters
    const generateInsight = async () => {
        setIsLoading(true);
        // Simulate network delay
        await new Promise(r => setTimeout(r, 1500));

        const insights = [
            `The ${propertyType === 'All' ? 'overall' : propertyType} market in ${district === 'All' ? 'Singapore' : district} is experiencing a stabilization phase over the last ${timePeriod}.`,
            `We are seeing increased resistance at the $1,800 PSF psychological barrier for mass market condos.`,
            `Rental yields remain strong, averaging 3.8% due to steady expatriate demand.`,
            `Looking ahead, expect price growth to hover between 1-3% as interest rate expectations remain elevated.`
        ];

        if (district === 'D09' || district === 'D10') {
            insights[1] = `Luxury segments in ${district} are seeing renewed interest from ultra-high-net-worth foreign buyers.`;
        }
        if (propertyType === 'HDB') {
            insights[1] = `HDB resale prices show resilience, supported by buyers priced out of the private market. Million-dollar flats continue to headline.`;
        }

        setAnalysis(insights.join(' '));
        setIsLoading(false);
    };

    // Auto-generate on initial load
    useEffect(() => {
        generateInsight();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [propertyType, district, timePeriod]);

    const handleRefresh = () => {
        toast.info("Generating new insights...");
        generateInsight();
    };

    const handleShare = () => {
        toast.success("Analysis copied to clipboard!");
    };

    return (
        <div className="w-full h-full flex flex-col p-4 bg-gradient-to-br from-purple-50 to-white">
            <div className="flex-1 overflow-y-auto mb-4">
                {isLoading ? (
                    <div className="space-y-3">
                        <div className="h-4 bg-purple-100 rounded animate-pulse w-3/4"></div>
                        <div className="h-4 bg-purple-100 rounded animate-pulse w-full"></div>
                        <div className="h-4 bg-purple-100 rounded animate-pulse w-5/6"></div>
                        <div className="h-4 bg-purple-100 rounded animate-pulse w-full"></div>
                        <div className="h-4 bg-purple-100 rounded animate-pulse w-1/2"></div>
                    </div>
                ) : (
                    <p className="text-sm text-gray-700 leading-relaxed">
                        {analysis}
                    </p>
                )}
            </div>

            <div className="flex gap-2 mt-auto border-t pt-3">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={isLoading}
                    className="flex-1 text-purple-700 border-purple-200 hover:bg-purple-100"
                >
                    <RefreshCcw className={`w-3 h-3 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleShare}
                    className="text-gray-500 hover:text-gray-700"
                >
                    <Share2 className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}
