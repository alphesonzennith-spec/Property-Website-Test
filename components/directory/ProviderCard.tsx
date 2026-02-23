import React from 'react';
import Link from 'next/link';
import { ServiceProvider } from '@/types/services';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, CheckCircle, Clock, ShieldCheck, MapPin } from 'lucide-react';

interface ProviderCardProps {
    provider: ServiceProvider;
    categorySlug: string;
}

export function ProviderCard({ provider, categorySlug }: ProviderCardProps) {
    const isAvailable = true; // In a real app, this would be computed from a schedule API

    return (
        <Card className="flex flex-col h-full bg-white hover:shadow-lg transition-all duration-300 border-gray-100 group">
            <CardHeader className="pb-3 border-b border-gray-50 bg-gray-50/50">
                <div className="flex justify-between items-start gap-4">
                    <div>
                        <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-green-700 transition-colors">
                            {provider.displayName}
                        </CardTitle>
                        {provider.companyName && provider.companyName !== provider.displayName && (
                            <p className="text-sm text-gray-500 mt-1">{provider.companyName}</p>
                        )}
                    </div>

                    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-md">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-sm">{provider.ratings.average.toFixed(1)}</span>
                        <span className="text-xs text-gray-500">({provider.ratings.count})</span>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex-1 pt-4 pb-2">
                <p className="text-sm text-gray-600 line-clamp-3 mb-4">{provider.description}</p>

                <div className="space-y-3">
                    {/* Badges Section */}
                    <div className="flex flex-wrap gap-2">
                        {provider.singpassVerified && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1 font-medium">
                                <CheckCircle className="h-3 w-3" />
                                Verified Identity
                            </Badge>
                        )}
                        {provider.verificationBadges.map((badge, idx) => (
                            <Badge key={idx} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100 gap-1">
                                <ShieldCheck className="h-3 w-3" />
                                {badge.label}
                            </Badge>
                        ))}
                    </div>

                    {/* Pricing & Area */}
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mt-4">
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">Pricing:</span>
                            <span>{provider.pricing.model}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="truncate">{provider.serviceAreas[0]} {provider.serviceAreas.length > 1 ? `+${provider.serviceAreas.length - 1}` : ''}</span>
                        </div>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="pt-4 border-t border-gray-50 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm">
                    {isAvailable ? (
                        <>
                            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-green-700 font-medium">Available Now</span>
                        </>
                    ) : (
                        <>
                            <Clock className="h-4 w-4 text-orange-500" />
                            <span className="text-orange-600 font-medium">Busy until tomorrow</span>
                        </>
                    )}
                </div>

                <Link href={`/directory/${categorySlug}/${provider.id}`} className="shrink-0">
                    <Button className="bg-green-600 hover:bg-green-700 text-white rounded-full px-6">
                        View Profile
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    );
}
