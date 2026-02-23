import React from 'react';
import { ServiceProvider } from '@/types/services';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Star, ShieldCheck, MapPin, Briefcase, Mail, Phone, CalendarDays } from 'lucide-react';
import { ReviewSystem } from './ReviewSystem';

interface ProviderProfileLayoutProps {
    provider: ServiceProvider;
}

export function ProviderProfileLayout({ provider }: ProviderProfileLayoutProps) {
    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-8 md:py-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Profile Details & Reviews */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Header Section */}
                    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 items-start">
                        <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-200 shrink-0 overflow-hidden">
                            {/* Placeholder for Photo/Logo */}
                            <Briefcase className="w-12 h-12 text-gray-400" />
                        </div>

                        <div className="flex-1 space-y-4">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{provider.displayName}</h1>
                                {provider.companyName && provider.companyName !== provider.displayName && (
                                    <p className="text-lg text-gray-600 mt-1">{provider.companyName}</p>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {provider.singpassVerified && (
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1 font-medium">
                                        <ShieldCheck className="h-4 w-4" />
                                        Singpass Verified Identity
                                    </Badge>
                                )}
                                {provider.verificationBadges.map((badge, idx) => (
                                    <Badge key={idx} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100 gap-1">
                                        <ShieldCheck className="h-4 w-4" />
                                        {badge.label}
                                    </Badge>
                                ))}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-gray-400" />
                                    <span>{provider.serviceAreas.join(', ')}</span>
                                </div>
                                {provider.licenceNumber && (
                                    <div className="flex items-center gap-2">
                                        <Briefcase className="h-4 w-4 text-gray-400" />
                                        <span>Licence: {provider.licenceNumber}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* About Section */}
                    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
                        <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{provider.description}</p>

                        {provider.portfolioUrls.length > 0 && (
                            <div className="mt-8">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {provider.portfolioUrls.map((url, idx) => (
                                        <div key={idx} className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                                            <span className="text-xs text-gray-400">Image {idx + 1}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Reviews Section */}
                    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
                        <ReviewSystem provider={provider} />
                    </div>

                </div>

                {/* Right Column: Booking & Contact widget */}
                <div className="space-y-6">

                    {/* Rating Summary Card */}
                    <Card className="shadow-sm border-gray-100">
                        <CardHeader className="bg-gray-50/50 pb-4">
                            <CardTitle className="text-lg font-semibold">Client Ratings</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-center gap-4 mb-6">
                                <div className="text-5xl font-bold text-gray-900">{provider.ratings.average.toFixed(1)}</div>
                                <div className="flex flex-col gap-1">
                                    <div className="flex text-yellow-400">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <Star key={star} className={`h-5 w-5 ${star <= Math.round(provider.ratings.average) ? 'fill-current' : 'text-gray-200'}`} />
                                        ))}
                                    </div>
                                    <span className="text-sm text-gray-500 font-medium">{provider.ratings.count} verified reviews</span>
                                </div>
                            </div>

                            {/* Rating Bar Breakdown */}
                            <div className="space-y-2">
                                {[5, 4, 3, 2, 1].map((rating) => {
                                    const r = rating as 1 | 2 | 3 | 4 | 5;
                                    const count = provider.ratings.breakdown[r] || 0;
                                    const percentage = provider.ratings.count > 0 ? (count / provider.ratings.count) * 100 : 0;

                                    return (
                                        <div key={rating} className="flex items-center gap-3 text-sm">
                                            <div className="w-8 text-gray-600 flex items-center gap-1 font-medium">{rating} <Star className="h-3 w-3 fill-gray-400 text-gray-400" /></div>
                                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${percentage}%` }} />
                                            </div>
                                            <div className="w-8 text-right text-gray-500">{count}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Booking Widget Card */}
                    <Card className="shadow-sm border-emerald-100 bg-white overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />
                        <CardHeader className="bg-emerald-50/30 pb-4">
                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                <CalendarDays className="h-5 w-5 text-emerald-600" />
                                Book Appointment
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                            <div className="rounded-lg bg-gray-50 p-4 border border-gray-100 flex items-center justify-center h-48">
                                <p className="text-sm text-gray-500 text-center">Interactive Calendar Widget<br /><span className="text-xs">(Select Date & Time)</span></p>
                            </div>

                            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 text-lg rounded-xl">
                                Confirm Booking
                            </Button>
                            <p className="text-xs text-center text-gray-500">
                                Contact details (Email/Phone) are unlocked and shared via encrypted platform messaging only after booking is confirmed.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Performance Metrics */}
                    <Card className="shadow-sm border-gray-100">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-semibold">Performance Metrics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                <span className="text-gray-600">Transactions Completed</span>
                                <span className="font-semibold text-gray-900">42+</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                <span className="text-gray-600">Average Response Time</span>
                                <span className="font-semibold text-gray-900">&lt; 2 Hours</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-gray-600">Pricing Model</span>
                                <span className="font-semibold text-gray-900">{provider.pricing.model}</span>
                            </div>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </div>
    );
}
