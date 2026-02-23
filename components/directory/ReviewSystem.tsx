'use client';

import React, { useState } from 'react';
import { ServiceProvider } from '@/types/services';
import { Star, ShieldCheck, User, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ReviewSystemProps {
    provider: ServiceProvider;
}

export function ReviewSystem({ provider }: ReviewSystemProps) {
    const [isWriting, setIsWriting] = useState(false);

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Verified Reviews</h2>
                {!isWriting && (
                    <Button onClick={() => setIsWriting(true)} variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                        Write a Review
                    </Button>
                )}
            </div>

            {isWriting && (
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 animate-in fade-in slide-in-from-top-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-green-600" />
                        Identity Verified Posting
                    </h3>
                    <p className="text-xs text-gray-500 mb-4">
                        You are posting as a Singpass verified user. Your identity will be shown as First Name + Initial. Anonymous reviews are not permitted.
                    </p>

                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-sm font-medium">Rating:</span>
                        <div className="flex text-gray-300 gap-1">
                            {[1, 2, 3, 4, 5].map(s => <Star key={s} className="h-5 w-5 cursor-pointer hover:text-yellow-400 hover:fill-yellow-400 transition-colors" />)}
                        </div>
                    </div>

                    <Textarea
                        placeholder={`Share your experience working with ${provider.displayName}...`}
                        className="min-h-[120px] mb-4 bg-white"
                    />

                    <div className="flex justify-end gap-3">
                        <Button variant="ghost" onClick={() => setIsWriting(false)}>Cancel</Button>
                        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">Submit Review</Button>
                    </div>
                </div>
            )}

            <div className="space-y-6">
                {/* Mock Review 1 */}
                <div className="border-b border-gray-100 pb-6 last:border-0">
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold">
                                JL
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-gray-900">Jason L.</span>
                                    <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1 font-medium border border-green-100">
                                        <ShieldCheck className="h-3 w-3" />
                                        Verified Transaction
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="flex text-yellow-400">
                                        <Star className="h-3.5 w-3.5 fill-current" /><Star className="h-3.5 w-3.5 fill-current" /><Star className="h-3.5 w-3.5 fill-current" /><Star className="h-3.5 w-3.5 fill-current" /><Star className="h-3.5 w-3.5 fill-current" />
                                    </div>
                                    <span className="text-xs text-gray-400">2 weeks ago</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed mt-3">
                        Very responsive and professional. They helped me navigate the complex HDB resale timeline perfectly without any hidden fees. Highly recommended for first-time buyers who need hand-holding.
                    </p>

                    {/* Provider Response */}
                    <div className="mt-4 ml-6 pl-4 border-l-2 border-emerald-200">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm text-gray-900">{provider.displayName}</span>
                            <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">Provider Response</span>
                        </div>
                        <p className="text-sm text-gray-600">
                            Hi Jason, thank you for the glowing review! It was a pleasure helping you and your family secure your dream home.
                        </p>
                    </div>
                </div>

                {/* Mock Review 2 */}
                <div className="border-b border-gray-100 pb-6 last:border-0">
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center font-bold">
                                ST
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-gray-900">Sarah T.</span>
                                    <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1 font-medium border border-green-100">
                                        <ShieldCheck className="h-3 w-3" />
                                        Verified Transaction
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="flex text-yellow-400">
                                        <Star className="h-3.5 w-3.5 fill-current" /><Star className="h-3.5 w-3.5 fill-current" /><Star className="h-3.5 w-3.5 fill-current" /><Star className="h-3.5 w-3.5 fill-current" /><Star className="h-3.5 w-3.5 text-gray-200" />
                                    </div>
                                    <span className="text-xs text-gray-400">1 month ago</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed mt-3">
                        Good service overall, but communication could have been slightly faster during the weekends. Still, achieved the goal at a reasonable price compared to other quotes I got.
                    </p>
                </div>

            </div>
        </div>
    );
}
