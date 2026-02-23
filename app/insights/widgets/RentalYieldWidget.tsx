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
import { ArrowUpDown } from 'lucide-react';

const mockYieldData = [
    { id: 1, district: 'D15 East Coast', type: 'Condo', sale: 2100000, rent: 5500, gross: 3.14, net: 2.2 },
    { id: 2, district: 'D09 Orchard', type: 'Condo', sale: 3800000, rent: 8200, gross: 2.58, net: 1.8 },
    { id: 3, district: 'D03 Queenstown', type: 'HDB', sale: 850000, rent: 4100, gross: 5.78, net: 4.5 },
    { id: 4, district: 'D27 Yishun', type: 'HDB', sale: 520000, rent: 2900, gross: 6.69, net: 5.4 },
    { id: 5, district: 'D10 Tanglin', type: 'Landed', sale: 8500000, rent: 14000, gross: 1.97, net: 1.1 },
    { id: 6, district: 'D01 Boat Quay', type: 'Commercial', sale: 4500000, rent: 18000, gross: 4.80, net: 3.9 },
    { id: 7, district: 'D19 Hougang', type: 'Condo', sale: 1450000, rent: 4400, gross: 3.64, net: 2.8 },
    { id: 8, district: 'D22 Jurong', type: 'HDB', sale: 620000, rent: 3500, gross: 6.77, net: 5.5 },
];

export function RentalYieldWidget() {
    const { propertyType, district } = useDashboardStore();

    const filteredData = useMemo(() => {
        let result = mockYieldData;
        if (propertyType !== 'All') result = result.filter(d => d.type === propertyType);
        if (district !== 'All') result = result.filter(d => d.district.startsWith(district));

        // Sort by highest gross yield by default
        return result.sort((a, b) => b.gross - a.gross);
    }, [propertyType, district]);

    return (
        <div className="w-full h-full overflow-y-auto">
            <Table>
                <TableHeader className="sticky top-0 bg-white shadow-sm">
                    <TableRow>
                        <TableHead className="w-[120px]">District</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Med. Price</TableHead>
                        <TableHead className="text-right">Med. Rent</TableHead>
                        <TableHead className="text-right bg-emerald-50">
                            <span className="flex items-center justify-end gap-1 font-semibold text-emerald-800">
                                Gross Yield <ArrowUpDown className="w-3 h-3" />
                            </span>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredData.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center text-gray-400">
                                No yield data matches filters.
                            </TableCell>
                        </TableRow>
                    ) : (
                        filteredData.map((row) => (
                            <TableRow key={row.id}>
                                <TableCell className="font-medium truncate max-w-[120px]" title={row.district}>{row.district.split(' ')[0]}</TableCell>
                                <TableCell className="text-gray-500">{row.type}</TableCell>
                                <TableCell className="text-right">${(row.sale / 1000000).toFixed(1)}M</TableCell>
                                <TableCell className="text-right">${row.rent.toLocaleString()}</TableCell>
                                <TableCell className="text-right font-semibold text-emerald-700 bg-emerald-50/50">
                                    {row.gross.toFixed(2)}%
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
