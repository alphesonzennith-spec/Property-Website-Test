'use client';

import React, { useMemo } from 'react';
import { useDashboardStore } from '@/lib/store/useDashboardStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// Mock data generator for volume
const generateVolumeData = (propertyType: string, district: string, timePeriod: string) => {
    const data = [];
    const months = timePeriod === '3M' ? 3 : timePeriod === '6M' ? 6 : timePeriod === '1Y' ? 12 : timePeriod === '3Y' ? 36 : 60;

    // Scale down volume if specific filters are applied
    const multiplier = (district === 'All' ? 1 : 0.05);

    const now = new Date();

    for (let i = months; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStr = d.toLocaleDateString('en-SG', { month: 'short', year: '2-digit' });

        let hdbVol = Math.floor((Math.random() * 800 + 1200) * multiplier);
        let condoVol = Math.floor((Math.random() * 500 + 800) * multiplier);
        let landedVol = Math.floor((Math.random() * 100 + 50) * multiplier);
        let commVol = Math.floor((Math.random() * 80 + 40) * multiplier);

        // Map filters
        if (propertyType !== 'All') {
            if (propertyType !== 'HDB') hdbVol = 0;
            if (propertyType !== 'Condo') condoVol = 0;
            if (propertyType !== 'Landed') landedVol = 0;
            if (propertyType !== 'Commercial') commVol = 0;
        }

        data.push({
            name: monthStr,
            HDB: hdbVol,
            Condo: condoVol,
            Landed: landedVol,
            Commercial: commVol
        });
    }
    return data;
};

export function VolumeBarWidget() {
    const { propertyType, district, timePeriod } = useDashboardStore();

    // const { data, isLoading } = trpc.insights.getVolume.useQuery({ propertyType, district, timePeriod });
    const data = useMemo(() => generateVolumeData(propertyType, district, timePeriod), [propertyType, district, timePeriod]);

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
                <BarChart
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
                    />
                    <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                        cursor={{ fill: '#f8fafc' }}
                    />
                    <Legend verticalAlign="top" height={36} iconType="circle" />
                    {propertyType === 'All' || propertyType === 'HDB' ? <Bar dataKey="HDB" stackId="a" fill="#0ea5e9" radius={[0, 0, 4, 4]} /> : null}
                    {propertyType === 'All' || propertyType === 'Condo' ? <Bar dataKey="Condo" stackId="a" fill="#3b82f6" /> : null}
                    {propertyType === 'All' || propertyType === 'Landed' ? <Bar dataKey="Landed" stackId="a" fill="#6366f1" /> : null}
                    {propertyType === 'All' || propertyType === 'Commercial' ? <Bar dataKey="Commercial" stackId="a" fill="#8b5cf6" radius={[4, 4, 0, 0]} /> : null}
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
