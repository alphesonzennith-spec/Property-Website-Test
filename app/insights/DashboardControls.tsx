'use client';

import { useState, useEffect } from 'react';
import { useDashboardStore, PropertyType, TimePeriod } from '@/lib/store/useDashboardStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

const DISTRICTS = Array.from({ length: 28 }, (_, i) => `D${String(i + 1).padStart(2, '0')}`);

export function DashboardControls() {
    const { propertyType, district, timePeriod, setFilters } = useDashboardStore();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return null; // Prevent hydration mismatch

    const handleExport = () => {
        toast.success('Compiling CSV data...', {
            description: `Exporting ${propertyType} data for ${district} (${timePeriod})`
        });

        // In a real implementation, you would trigger a tRPC query here
        // const data = await trpc.insights.exportData.query({ propertyType, district, timePeriod });
        // downloadCsv(data);

        setTimeout(() => toast.success('Download complete.'), 1500);
    };

    return (
        <div className="sticky top-[64px] z-40 bg-white border-b border-gray-200 px-4 py-3 sm:px-6 lg:px-8 flex flex-col sm:flex-row shadow-sm gap-4 items-center justify-between">
            <div className="flex flex-wrap items-center gap-3">

                {/* View Tabs */}
                <TabsList className="grid w-full sm:w-[300px] grid-cols-2 mr-0 sm:mr-4">
                    <TabsTrigger value="analytics">Data</TabsTrigger>
                    <TabsTrigger value="map">Map Interface</TabsTrigger>
                </TabsList>

                {/* Property Type Filter */}
                <Select
                    value={propertyType}
                    onValueChange={(val) => setFilters({ propertyType: val as PropertyType })}
                >
                    <SelectTrigger className="w-[140px] h-9 text-sm font-medium border-gray-300">
                        <SelectValue placeholder="Property Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Properties</SelectItem>
                        <SelectItem value="HDB">HDB</SelectItem>
                        <SelectItem value="Condo">Condominium</SelectItem>
                        <SelectItem value="Landed">Landed</SelectItem>
                        <SelectItem value="Commercial">Commercial</SelectItem>
                    </SelectContent>
                </Select>

                {/* District Filter */}
                <Select
                    value={district}
                    onValueChange={(val) => setFilters({ district: val })}
                >
                    <SelectTrigger className="w-[140px] h-9 text-sm font-medium border-gray-300">
                        <SelectValue placeholder="District" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                        <SelectItem value="All">All Singapore</SelectItem>
                        {DISTRICTS.map(d => (
                            <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Time Period Filter */}
                <Select
                    value={timePeriod}
                    onValueChange={(val) => setFilters({ timePeriod: val as TimePeriod })}
                >
                    <SelectTrigger className="w-[120px] h-9 text-sm font-medium border-gray-300">
                        <SelectValue placeholder="Time Period" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="3M">Past 3 Months</SelectItem>
                        <SelectItem value="6M">Past 6 Months</SelectItem>
                        <SelectItem value="1Y">Past 1 Year</SelectItem>
                        <SelectItem value="3Y">Past 3 Years</SelectItem>
                        <SelectItem value="5Y">Past 5 Years</SelectItem>
                    </SelectContent>
                </Select>

            </div>

            <Button
                variant="outline"
                size="sm"
                className="h-9 gap-2 border-emerald-200 text-emerald-800 hover:bg-emerald-50 hover:text-emerald-900 w-full sm:w-auto"
                onClick={handleExport}
            >
                <Download className="w-4 h-4" />
                Export Data
            </Button>
        </div>
    );
}
