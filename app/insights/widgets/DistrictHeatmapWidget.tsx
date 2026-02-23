'use client';

import { useMemo } from 'react';
import { useDashboardStore } from '@/lib/store/useDashboardStore';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const DISTRICTS = Array.from({ length: 28 }, (_, i) => `D${String(i + 1).padStart(2, '0')}`);

// Generate heatmap data
const getHeatmapData = (propertyType: string) => {
    let base = 1200;
    if (propertyType === 'Landed') base += 800;
    if (propertyType === 'HDB') base -= 600;

    return DISTRICTS.map(d => {
        let psf = base;
        // Prime districts are more expensive
        if (['D09', 'D10', 'D11', 'D01', 'D02'].includes(d)) psf += 1200;
        else if (['D03', 'D04', 'D15', 'D21'].includes(d)) psf += 600;
        else if (['D25', 'D26', 'D27'].includes(d)) psf -= 300; // OCR

        // Add some noise
        psf += Math.random() * 200 - 100;

        return {
            id: d,
            psf: Math.round(psf)
        };
    });
};

export function DistrictHeatmapWidget() {
    const { propertyType, district: selectedDistrict, setFilters } = useDashboardStore();

    const data = useMemo(() => getHeatmapData(propertyType), [propertyType]);

    // Find min/max to establish color scale (Green to Red)
    const minPsf = Math.min(...data.map(d => d.psf));
    const maxPsf = Math.max(...data.map(d => d.psf));

    const getColor = (psf: number) => {
        // Normalize between 0 and 1
        const ratio = (psf - minPsf) / (maxPsf - minPsf || 1);

        // Green to Yellow to Red interpolation approximated via HSL
        // Red is 0, Green is 120
        const hue = (1 - ratio) * 120;
        return `hsl(${hue}, 70%, 50%)`;
    };

    return (
        <div className="w-full h-full p-4 overflow-y-auto">
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 h-full content-start">
                <TooltipProvider delayDuration={0}>
                    {data.map((d) => {
                        const isSelected = selectedDistrict === d.id;
                        const isFilteredOut = selectedDistrict !== 'All' && !isSelected;

                        return (
                            <Tooltip key={d.id}>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={() => setFilters({ district: isSelected ? 'All' : d.id })}
                                        className={cn(
                                            "aspect-square rounded-md flex flex-col items-center justify-center transition-all border-2",
                                            isFilteredOut ? "opacity-30 border-transparent grayscale" : "hover:scale-105 active:scale-95 shadow-sm",
                                            isSelected ? "border-gray-900 shadow-md ring-2 ring-gray-900 ring-offset-2" : "border-transparent"
                                        )}
                                        style={{ backgroundColor: getColor(d.psf) }}
                                    >
                                        <span className="text-[10px] sm:text-xs font-bold text-white drop-shadow-md">{d.id}</span>
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="font-semibold">{d.id}</p>
                                    <p className="text-sm">Median: ${d.psf.toLocaleString()} psf</p>
                                    <p className="text-xs text-gray-400 mt-1">Click to filter dashboard</p>
                                </TooltipContent>
                            </Tooltip>
                        );
                    })}
                </TooltipProvider>
            </div>
        </div>
    );
}
