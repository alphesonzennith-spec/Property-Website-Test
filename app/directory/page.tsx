'use client';

import React, { useState } from 'react';
import { mockServiceProviders } from '@/lib/mock/serviceProviders';
import { ServiceProviderType } from '@/types/services';
import { ProviderCard } from '@/components/directory/ProviderCard';
import { AIAgentCard } from '@/components/directory/AIAgentCard';
import { Search, MapPin, SlidersHorizontal, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const CATEGORIES = [
    { id: 'all', label: 'All Services', value: null, slug: 'all' },
    { id: 'lawyers', label: 'Lawyers', value: ServiceProviderType.Lawyer, slug: 'lawyers' },
    { id: 'brokers', label: 'Mortgage Brokers', value: ServiceProviderType.MortgageBroker, slug: 'brokers' },
    { id: 'agents', label: 'Real Estate Agents', value: ServiceProviderType.Agent, slug: 'agents' },
    { id: 'designers', label: 'Interior Design', value: ServiceProviderType.InteriorDesign, slug: 'designers' },
    { id: 'renovation', label: 'Renovations', value: ServiceProviderType.Renovation, slug: 'renovation' },
    { id: 'handymen', label: 'Handymen', value: ServiceProviderType.Handyman, slug: 'handymen' },
    { id: 'storage', label: 'Storage Solutions', value: ServiceProviderType.Storage, slug: 'storage' },
    { id: 'logistics', label: 'Movers & Logistics', value: ServiceProviderType.Logistics, slug: 'logistics' },
];

export default function DirectoryPage() {
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Extract AI Agents for the Special Section
    const aiAgents = mockServiceProviders.filter(p => p.type === ServiceProviderType.AIAgent);

    // Filter Human providers based on tab and search
    const humanProviders = mockServiceProviders.filter(p => p.type !== ServiceProviderType.AIAgent);

    const filteredHumanProviders = humanProviders.filter(provider => {
        const activeCategory = CATEGORIES.find(c => c.id === activeTab);
        const matchesCategory = activeCategory && activeCategory.value ? provider.type === activeCategory.value : true;

        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = provider.displayName.toLowerCase().includes(searchLower) ||
            provider.description.toLowerCase().includes(searchLower) ||
            provider.serviceAreas.some(area => area.toLowerCase().includes(searchLower));

        return matchesCategory && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-gray-50/30">

            {/* Header & Search */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4 text-center md:text-left">
                        Professional Services Directory
                    </h1>
                    <p className="text-xl text-gray-500 mb-8 text-center md:text-left max-w-3xl">
                        Connect with Singpass-verified professionals to navigate your property journey with confidence.
                    </p>

                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                                placeholder="Search by name, expertise, or area (e.g., 'Bedok', 'Conveyancing')..."
                                className="pl-12 h-14 bg-gray-50 border-gray-200 text-lg rounded-xl focus-visible:ring-emerald-500"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" className="h-14 px-6 border-gray-200 gap-2 shrink-0 rounded-xl">
                            <MapPin className="h-5 w-5 text-gray-500" />
                            Any Location
                        </Button>
                        <Button variant="outline" className="h-14 px-6 border-gray-200 gap-2 shrink-0 rounded-xl">
                            <SlidersHorizontal className="h-5 w-5 text-gray-500" />
                            More Filters
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">

                {/* Special AI Agents Section */}
                {(!searchQuery && activeTab === 'all') && (
                    <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">Platform AI Agents (Free)</span>
                                </h2>
                                <p className="text-gray-500 mt-1 text-sm">Always available 24/7. Get instant answers before consulting a paid human professional.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                            {aiAgents.slice(0, 5).map(agent => (
                                <AIAgentCard key={agent.id} provider={agent} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Human Professionals Section */}
                <section>
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Verified Human Professionals</h2>
                        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <div className="overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar">
                                <TabsList className="bg-gray-100/50 p-1 rounded-xl w-max flex gap-2">
                                    {CATEGORIES.map(cat => (
                                        <TabsTrigger
                                            key={cat.id}
                                            value={cat.id}
                                            className="rounded-lg px-4 py-2 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm"
                                        >
                                            {cat.label}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                            </div>
                        </Tabs>
                    </div>

                    {filteredHumanProviders.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
                            {filteredHumanProviders.map(provider => {
                                const categoryModel = CATEGORIES.find(c => c.value === provider.type);
                                const categorySlug = categoryModel?.slug || 'unknown';
                                return (
                                    <ProviderCard
                                        key={provider.id}
                                        provider={provider}
                                        categorySlug={categorySlug}
                                    />
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-gray-200">
                            <Settings2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">No professionals found</h3>
                            <p className="text-gray-500 mt-1">Try adjusting your search criteria or switching categories.</p>
                            <Button variant="outline" onClick={() => { setSearchQuery(''); setActiveTab('all'); }} className="mt-4">
                                Clear all filters
                            </Button>
                        </div>
                    )}
                </section>

            </div>
        </div>
    );
}
