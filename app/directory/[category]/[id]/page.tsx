import React from 'react';
import { notFound } from 'next/navigation';
import { mockServiceProviders } from '@/lib/mock/serviceProviders';
import { ProviderProfileLayout } from '@/components/directory/ProviderProfileLayout';

// Mock routing since we don't have dynamic DB fetching yet
// Map category slugs to our Enum values to filter
const CLONE_SLUG_MAP: Record<string, string> = {
    lawyers: 'Lawyer',
    brokers: 'MortgageBroker',
    agents: 'Agent',
    handymen: 'Handyman',
    designers: 'InteriorDesign',
    renovation: 'Renovation',
    storage: 'Storage',
    logistics: 'Logistics',
    ai: 'AIAgent',
};

export default async function ProviderProfilePage({ params }: { params: Promise<{ category: string, id: string }> }) {
    const resolvedParams = await params;
    const { category, id } = resolvedParams;

    const validCategory = Object.keys(CLONE_SLUG_MAP).includes(category);
    if (!validCategory) {
        notFound();
    }

    const provider = mockServiceProviders.find((p) => p.id === id);

    if (!provider) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-gray-50/50">
            <ProviderProfileLayout provider={provider} />
        </div>
    );
}
