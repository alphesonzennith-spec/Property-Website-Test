'use client';

import React, { useState, useMemo } from 'react';
import { mockNews, NewsCategory } from '@/lib/mock/news';
import { NewsCard } from '@/components/news/NewsCard';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { Filter } from 'lucide-react';

const CATEGORIES: NewsCategory[] = [
    'Policy',
    'Market Data',
    'New Launches',
    'Agent News',
    'Investment'
];

export default function NewsPage() {
    const [activeCategory, setActiveCategory] = useState<NewsCategory | 'All'>('All');

    const filteredNews = useMemo(() => {
        if (activeCategory === 'All') return mockNews;
        return mockNews.filter(item => item.category === activeCategory);
    }, [activeCategory]);

    return (
        <div className="container max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="relative rounded-2xl bg-gradient-to-br from-emerald-900 via-teal-900 to-indigo-900 overflow-hidden mb-10 overflow-hidden shadow-xl">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -ml-20 -mb-20"></div>

                <div className="relative z-10 p-8 md:p-12 lg:p-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 text-white min-h-[220px]">
                    <div className="space-y-4 max-w-2xl">
                        <p className="text-emerald-400 font-semibold uppercase tracking-wider text-sm flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                            Updates & Insights
                        </p>
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-2">Market News Coverage</h1>
                        <p className="text-emerald-100/80 text-lg max-w-xl leading-relaxed">
                            Stay up to date with the latest Singapore property market news, policy changes, and data-driven insights.
                        </p>
                    </div>
                </div>
            </div>

            {/* Categories Filter */}
            <div className="mb-10 w-full border-b border-gray-100">
                <Tabs defaultValue="All" value={activeCategory} onValueChange={(v) => setActiveCategory(v as NewsCategory | 'All')} className="w-full relative top-[2px]">
                    <div className="flex items-center gap-4 px-1 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        <Filter className="w-4 h-4 text-emerald-600 hidden sm:block shrink-0 mb-1" />
                        <TabsList className="bg-transparent h-auto p-0 w-full justify-start rounded-none flex-nowrap gap-6">
                            <TabsTrigger
                                value="All"
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-600 data-[state=active]:text-emerald-700 px-1 py-3 data-[state=active]:bg-transparent data-[state=active]:shadow-none text-gray-500 font-medium hover:text-gray-800 transition-colors"
                            >
                                All News
                            </TabsTrigger>
                            {CATEGORIES.map(category => (
                                <TabsTrigger
                                    key={category}
                                    value={category}
                                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-600 data-[state=active]:text-emerald-700 px-1 py-3 data-[state=active]:bg-transparent data-[state=active]:shadow-none whitespace-nowrap text-gray-500 font-medium hover:text-gray-800 transition-colors"
                                >
                                    {category}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </div>
                </Tabs>
            </div>

            {/* News Grid */}
            {filteredNews.length > 0 ? (
                <motion.div
                    key={activeCategory}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    initial="hidden"
                    animate="show"
                    variants={{
                        hidden: { opacity: 0 },
                        show: {
                            opacity: 1,
                            transition: {
                                staggerChildren: 0.05
                            }
                        }
                    }}
                >
                    {filteredNews.map((item) => (
                        <motion.div
                            key={item.id}
                            className="h-full"
                            variants={{
                                hidden: { opacity: 0, y: 20 },
                                show: { opacity: 1, y: 0 }
                            }}
                        >
                            <NewsCard news={item} />
                        </motion.div>
                    ))}
                </motion.div>
            ) : (
                <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">No news found</h3>
                    <p className="text-gray-500 mt-2">Check back later for updates on {activeCategory}.</p>
                </div>
            )}
        </div>
    );
}
