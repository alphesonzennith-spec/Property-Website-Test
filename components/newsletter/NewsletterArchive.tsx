import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { format, subDays } from 'date-fns';

// Generate 12 mock past issues
const PAST_ISSUES = Array.from({ length: 12 }).map((_, i) => {
    const date = subDays(new Date('2026-02-18'), i * 7); // weekly issues
    return {
        id: `issue-${104 - i}`,
        issueNumber: 104 - i,
        date: date.toISOString(),
        title: i === 0 ? 'MAS Policy Hold & District 15 Surge' :
            i === 1 ? 'New Launch Yields vs Resale Performance' :
                i === 2 ? 'Understanding the January HDB Volume Dip' :
                    i === 3 ? 'Q4 2025 Market Roundup & 2026 Forecast' :
                        `Market Trends Issue #${104 - i}`
    };
});

export function NewsletterArchive() {
    return (
        <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0">
                <CardTitle className="text-xl flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-gray-400" />
                    Archive (Last 12 Issues)
                </CardTitle>
            </CardHeader>
            <CardContent className="px-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {PAST_ISSUES.map((issue) => (
                        <Link
                            key={issue.id}
                            href={`#archive-${issue.id}`} // Mock link
                            className="group block p-4 rounded-xl border bg-white hover:border-indigo-300 hover:shadow-sm transition-all"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                                    Issue #{issue.issueNumber}
                                </span>
                                <span className="text-xs text-gray-500">
                                    {format(new Date(issue.date), 'dd MMM yyyy')}
                                </span>
                            </div>
                            <h4 className="font-semibold text-gray-900 line-clamp-2 mt-2 group-hover:text-indigo-700 transition-colors">
                                {issue.title}
                            </h4>
                            <div className="flex items-center text-sm font-medium leading-none text-indigo-600 mt-4 opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-10px] group-hover:translate-x-0 duration-300">
                                Read Issue <ArrowRight className="w-4 h-4 ml-1" />
                            </div>
                        </Link>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
