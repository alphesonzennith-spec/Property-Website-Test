'use client';

import React, { useMemo } from 'react';
import { useDashboardStore } from '@/lib/store/useDashboardStore';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const generateDistributionData = (propertyType: string, district: string) => {
    const data = [];

    // Distribution shifts based on filters (e.g., Landed has a wider spread at higher prices)
    let minPrice = 300;
    let maxPrice = 3000;
    let peak = 1400;

    if (propertyType === 'Landed') { peak = 2200; maxPrice = 4000; }
    if (propertyType === 'HDB') { peak = 600; minPrice = 200; maxPrice = 1200; }
    if (district === 'D09' || district === 'D10') { peak += 800; maxPrice += 1000; }

    const step = (maxPrice - minPrice) / 20;

    for (let i = 0; i <= 20; i++) {
        const bucket = minPrice + (i * step);

        // Bell shape logic using a Gaussian approximation
        const stdDev = (maxPrice - minPrice) / 6;
        let volume = 1000 * Math.exp(-Math.pow(bucket - peak, 2) / (2 * Math.pow(stdDev, 2)));

        // Add some noise
        volume += Math.random() * (volume * 0.1);

        data.push({
            bucket: `$${Math.round(bucket)}`,
            rawBucket: bucket,
            volume: Math.round(volume)
        });
    }

    return data;
};

export function PriceDistributionWidget() {
    const { propertyType, district } = useDashboardStore();
    const data = useMemo(() => generateDistributionData(propertyType, district), [propertyType, district]);

    const [isMounted, setIsMounted] = React.useState(false);
    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return <div className="w-full h-full flex items-center justify-center bg-gray-50/50 animate-pulse rounded-xl" />;
    }

    return (
        <div className="w-full h-full p-2 pb-6">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{ top: 20, right: 20, left: 10, bottom: 5 }}
                >
                    <defs>
                        <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis
                        dataKey="bucket"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#888', fontSize: 10 }}
                        interval="preserveStartEnd"
                        minTickGap={20}
                    />
                    <YAxis hide />
                    <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: any) => [`${value} listings`, 'Volume']}
                        labelFormatter={(label) => `${label} PSF`}
                    />
                    <Area
                        type="monotone"
                        dataKey="volume"
                        stroke="#8b5cf6"
                        fillOpacity={1}
                        fill="url(#colorVolume)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
