'use client';

import { useMemo } from 'react';
import { useDashboardStore } from '@/lib/store/useDashboardStore';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';

const mockTransactions = [
    { id: 'T1', date: 'Just now', prop: 'The Sail @ Marina Bay', dist: 'D01', type: 'Condo', price: 2450000, psf: 2850, flag: 'record', text: 'Record PSF for D01' },
    { id: 'T2', date: '2 hrs ago', prop: 'Blk 123 Toa Payoh', dist: 'D12', type: 'HDB', price: 950000, psf: 820, flag: 'high', text: '15% Above Market' },
    { id: 'T3', date: '5 hrs ago', prop: 'Nassim Park Residences', dist: 'D10', type: 'Condo', price: 12500000, psf: 4100, flag: 'normal', text: '' },
    { id: 'T4', date: '1 day ago', prop: 'Blk 456 Jurong West', dist: 'D22', type: 'HDB', price: 420000, psf: 430, flag: 'low', text: '5% Below Market' },
    { id: 'T5', date: '2 days ago', prop: 'Ocean Drive', dist: 'D04', type: 'Landed', price: 18000000, psf: 3200, flag: 'record', text: 'Highest Quantum 2026' },
    { id: 'T6', date: '2 days ago', prop: 'Paya Lebar Square', dist: 'D14', type: 'Commercial', price: 3200000, psf: 2200, flag: 'normal', text: '' },
];

export function NotableTransactionsWidget() {
    const { propertyType, district } = useDashboardStore();

    const filteredData = useMemo(() => {
        let result = mockTransactions;
        if (propertyType !== 'All') result = result.filter(d => d.type === propertyType);
        if (district !== 'All') result = result.filter(d => d.dist === district);
        return result;
    }, [propertyType, district]);

    return (
        <div className="w-full h-full overflow-y-auto">
            <Table>
                <TableHeader className="sticky top-0 bg-white shadow-sm z-10">
                    <TableRow>
                        <TableHead>Property</TableHead>
                        <TableHead>Dist.</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>PSF</TableHead>
                        <TableHead className="text-right">Insight</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredData.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center text-gray-400">
                                No recent transactions matching criteria.
                            </TableCell>
                        </TableRow>
                    ) : (
                        filteredData.map((row) => (
                            <TableRow key={row.id}>
                                <TableCell>
                                    <div className="font-medium text-sm">{row.prop}</div>
                                    <div className="text-xs text-gray-400">{row.date}</div>
                                </TableCell>
                                <TableCell className="text-gray-500 text-sm">{row.dist}</TableCell>
                                <TableCell className="font-semibold text-sm">${(row.price / 1000000).toFixed(1)}M</TableCell>
                                <TableCell className="text-sm">${row.psf.toLocaleString()}</TableCell>
                                <TableCell className="text-right">
                                    {row.flag === 'record' && (
                                        <Badge variant="default" className="bg-purple-100 text-purple-700 hover:bg-purple-200 gap-1 border-purple-200">
                                            <TrendingUp className="w-3 h-3" /> {row.text}
                                        </Badge>
                                    )}
                                    {row.flag === 'high' && (
                                        <Badge variant="secondary" className="bg-red-50 text-red-600 gap-1 border-red-100 hover:bg-red-100">
                                            <ArrowUpRight className="w-3 h-3" /> {row.text}
                                        </Badge>
                                    )}
                                    {row.flag === 'low' && (
                                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1">
                                            <ArrowDownRight className="w-3 h-3" /> {row.text}
                                        </Badge>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
