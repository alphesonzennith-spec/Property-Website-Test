'use client';

import { useMemo } from 'react';
import { useDashboardStore } from '@/lib/store/useDashboardStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// Mock data generator based on filters
const generateTrendData = (propertyType: string, district: string, timePeriod: string) => {
    const data = [];
    const months = timePeriod === '3M' ? 3 : timePeriod === '6M' ? 6 : timePeriod === '1Y' ? 12 : timePeriod === '3Y' ? 36 : 60;

    let basePrice = 1200; // Base PSF
    if (propertyType === 'Landed') basePrice += 800;
    if (propertyType === 'HDB') basePrice -= 600;
    if (district === 'D09' || district === 'D10') basePrice += 1000;

    const now = new Date();

    for (let i = months; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStr = d.toLocaleDateString('en-SG', { month: 'short', year: '2-digit' });

        // Random walk
        const filterPrice = basePrice + (Math.random() * 100 - 50) + (months - i) * 10;
        const sgAvgPrice = 1400 + (Math.random() * 50 - 25) + (months - i) * 8; // More stable avg

        data.push({
            name: monthStr,
            selectedUrl: Math.round(filterPrice),
            allSg: Math.round(sgAvgPrice),
        });
    }
    return data;
};

export function PriceTrendWidget() {
    const { propertyType, district, timePeriod } = useDashboardStore();

    // In a real app, this would use tRPC:
    // const { data, isLoading } = trpc.insights.getPriceTrend.useQuery({ propertyType, district, timePeriod });
    const data = useMemo(() => generateTrendData(propertyType, district, timePeriod), [propertyType, district, timePeriod]);

    return (
        <div className="w-full h-full p-2 pb-6">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={data}
                    margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#888', fontSize: 12 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#888', fontSize: 12 }}
                        tickFormatter={(value) => `$${value}`}
                        domain={['auto', 'auto']}
                    />
                    <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: any) => [`$${value.toLocaleString()} psf`, undefined]}
                    />
                    <Legend verticalAlign="top" height={36} iconType="circle" />
                    <Line
                        type="monotone"
                        dataKey="selectedUrl"
                        name={`${propertyType === 'All' ? 'All Properties' : propertyType} in ${district === 'All' ? 'Singapore' : district}`}
                        stroke="#059669" // emerald-600
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#059669', strokeWidth: 0 }}
                        activeDot={{ r: 6 }}
                    />
                    <Line
                        type="monotone"
                        dataKey="allSg"
                        name="All Singapore Avg"
                        stroke="#94a3b8" // slate-400
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
