'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function SubscribeForm() {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [email, setEmail] = useState('');
    const [showPreferences, setShowPreferences] = useState(false);

    // Mock preferences state
    const [districts, setDistricts] = useState<string[]>([]);
    const [propertyTypes, setPropertyTypes] = useState<string[]>([]);

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            // Simulate API call
            setTimeout(() => {
                setIsSubscribed(true);
            }, 500);
        }
    };

    const toggleDistrict = (district: string) => {
        setDistricts(prev =>
            prev.includes(district) ? prev.filter(d => d !== district) : [...prev, district]
        );
    };

    const togglePropertyType = (type: string) => {
        setPropertyTypes(prev =>
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        );
    };

    if (isSubscribed) {
        return (
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-8 text-center sm:min-h-[300px] flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold text-emerald-900 mb-2">You're Subscribed!</h3>
                <p className="text-emerald-700 max-w-md mx-auto">
                    We've sent a confirmation email to <span className="font-medium text-emerald-900">{email}</span>. You'll receive your first personalized AI newsletter on Monday.
                </p>
                <Button
                    variant="outline"
                    className="mt-6 bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800"
                    onClick={() => {
                        setIsSubscribed(false);
                        setEmail('');
                        setDistricts([]);
                        setPropertyTypes([]);
                    }}
                >
                    Manage Preferences
                </Button>
            </div>
        );
    }

    return (
        <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 sm:p-8 bg-gradient-to-br from-indigo-50 to-white">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-gray-900">Personalize Your AI Report</h3>
                        <p className="text-sm text-gray-600">Get insights tailored exactly to your multi-generational portfolio.</p>
                    </div>
                </div>

                <form onSubmit={handleSubscribe} className="space-y-4 mt-6">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-white"
                        />
                    </div>

                    <div className="pt-2 border-t border-indigo-100/50">
                        <button
                            type="button"
                            onClick={() => setShowPreferences(!showPreferences)}
                            className="flex items-center justify-between w-full p-2 text-sm font-medium text-indigo-700 hover:bg-indigo-50/50 rounded-lg transition-colors"
                        >
                            <span>Advanced Preferences (Optional)</span>
                            {showPreferences ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>

                        <AnimatePresence>
                            {showPreferences && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                >
                                    <div className="p-4 bg-indigo-50/30 rounded-lg mt-2 space-y-4 border border-indigo-100/60">
                                        <div>
                                            <Label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">Property Types</Label>
                                            <div className="flex flex-wrap gap-2">
                                                {['HDB Resale', 'BTO', 'Condo Resale', 'New Launch', 'Landed'].map(type => (
                                                    <BadgeButton
                                                        key={type}
                                                        selected={propertyTypes.includes(type)}
                                                        onClick={() => togglePropertyType(type)}
                                                    >
                                                        {type}
                                                    </BadgeButton>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">Focus Districts</Label>
                                            <div className="flex flex-wrap gap-2">
                                                {['D1-D8 (Central)', 'D9-D11 (Core)', 'D15-D16 (East)', 'D19-D20 (North-East)', 'D21-D23 (West)'].map(district => (
                                                    <BadgeButton
                                                        key={district}
                                                        selected={districts.includes(district)}
                                                        onClick={() => toggleDistrict(district)}
                                                    >
                                                        {district}
                                                    </BadgeButton>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm mt-4">
                        Subscribe to AI Insights
                    </Button>
                </form>
            </div>
        </div>
    );
}

// Helper component for preference selectable badges
function BadgeButton({ children, selected, onClick }: { children: React.ReactNode, selected: boolean, onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors border ${selected
                    ? 'bg-indigo-100 text-indigo-700 border-indigo-300'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                }`}
        >
            {children}
        </button>
    );
}
