'use client';

import React from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { SubscribeForm } from '@/components/newsletter/SubscribeForm';
import { NewsletterArchive } from '@/components/newsletter/NewsletterArchive';
import { Sparkles, TrendingUp, AlertTriangle, LightbulbIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { motion } from 'framer-motion';

export default function NewsletterPage() {
    const { isAuthenticated } = useAuth();
    const isLoggedIn = isAuthenticated;

    return (
        <div className="container max-w-5xl mx-auto py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-gray-900">AI Market Intelligence</h1>
                        <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-0 py-1">
                            Issue #105
                        </Badge>
                    </div>
                    <p className="text-gray-500 text-lg max-w-2xl leading-relaxed">
                        Your weekly curated insights into Singapore's dynamic property landscape, powered by real-time URA data and predictive analytics.
                    </p>
                </div>
                <div className="text-sm font-medium text-gray-400">
                    Published: {new Date().toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content (Newsletter body) */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Personalized Banner */}
                    {isLoggedIn && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex gap-3 items-start"
                        >
                            <Sparkles className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-indigo-900">Personalized for you</h4>
                                <p className="text-sm text-indigo-700/80 mt-1">
                                    Based on your saved family portfolio, we've highlighted the impact of recent changes in the Rest of Central Region (RCR) below.
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {/* Section 1: Macro Overview */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2 pb-2 border-b">
                            <TrendingUp className="w-6 h-6 text-gray-400" />
                            Macro Overview
                        </h2>
                        <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed">
                            <p>
                                The Singapore property market remains resilient entering the first quarter of 2026. Despite unchanged monetary policy from MAS, bank fixed rates have begun a subtle downward adjustment, signaling liquidity preparing for Q2 launches.
                            </p>
                            <p>
                                The Core Central Region (CCR) sees a tentative return of foreign high-net-worth individuals, though ABSD rates continue to act as a significant dampener on volume. Rest of Central Region (RCR) properties remain the sweet spot for local upgraders.
                            </p>
                        </div>
                    </section>

                    {/* Section 2: Singapore Market Moves */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2 pb-2 border-b">
                            <span className="text-2xl">🇸🇬</span>
                            Singapore Market Moves
                        </h2>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <Card className="bg-emerald-50/50 border-emerald-100 shadow-sm">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base text-emerald-800">HDB Resale Volume</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-emerald-600">-4.2%</div>
                                    <p className="text-sm text-emerald-700/80 mt-1">Month-on-Month dip, stabilizing prices in non-mature estates.</p>
                                </CardContent>
                            </Card>
                            <Card className="bg-blue-50/50 border-blue-100 shadow-sm">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base text-blue-800">Private Rental Index</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-blue-600">-1.1%</div>
                                    <p className="text-sm text-blue-700/80 mt-1">Continued softening as 2023-2024 TOP supply is fully absorbed.</p>
                                </CardContent>
                            </Card>
                        </div>
                    </section>

                    {/* Section 3: Outlier Events */}
                    <section className="space-y-4 bg-amber-50 rounded-xl p-6 border border-amber-100">
                        <h2 className="text-2xl font-bold text-amber-900 flex items-center gap-2 pb-2 border-b border-amber-200">
                            <AlertTriangle className="w-6 h-6 text-amber-500" />
                            Outlier Events
                        </h2>
                        <ul className="space-y-4 mt-4">
                            <li className="flex gap-3">
                                <div className="w-2 h-2 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                                <div>
                                    <h4 className="font-semibold text-amber-900">Record psf in D15</h4>
                                    <p className="text-sm text-amber-800/80 mt-1">A freehold penthouse unit in Meyer Road transacted at a record $3,450 psf, skewing the overall district average upwards by 0.6% this week.</p>
                                </div>
                            </li>
                            <li className="flex gap-3">
                                <div className="w-2 h-2 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                                <div>
                                    <h4 className="font-semibold text-amber-900">BTO Fallout in Kallang/Whampoa</h4>
                                    <p className="text-sm text-amber-800/80 mt-1">High drop-out rates for the latest PLH BTO exercise have resulted in an immediate 15% spike in viewing inquiries for nearby 5-year-old MOP flats.</p>
                                </div>
                            </li>
                        </ul>
                    </section>

                    {/* Section 4: Outlook */}
                    <section className="space-y-4 bg-gray-900 text-white rounded-xl p-6 shadow-lg shadow-gray-900/10">
                        <h2 className="text-2xl font-bold flex items-center gap-2 pb-2 border-b border-gray-700">
                            <LightbulbIcon className="w-6 h-6 text-yellow-400" />
                            Next 30 Days Outlook
                        </h2>
                        <div className="prose prose-invert max-w-none text-gray-300">
                            <p>
                                We anticipate aggressive marketing from developers for the upcoming District 5 and District 21 launches. Buyers should look out for early-bird discounts that aren't officially advertised.
                            </p>
                            <p>
                                <strong>Recommendation:</strong> If you are planning an HDB upgrade, aim to secure your resale buyer before March to avoid the typical post-Chinese New Year inventory surge which may dilute your pricing power.
                            </p>
                        </div>
                    </section>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1 space-y-8 mt-8 lg:mt-0">
                    <div className="sticky top-24 space-y-8">
                        <SubscribeForm />
                        <div className="hidden lg:block">
                            <NewsletterArchive />
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Archive */}
            <div className="mt-12 lg:hidden">
                <NewsletterArchive />
            </div>
        </div>
    );
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}>
            {children}
        </span>
    );
}
