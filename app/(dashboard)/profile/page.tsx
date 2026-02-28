'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock as LockIcon, ShieldCheck, AlertCircle, Fingerprint, Award, BadgeCheck, ShoppingCart, Home, Key } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function ProfilePage() {
    const {
        verificationStatus,
        legalName,
        nationality,
        dateOfBirth,
        homeAddress,
        role,
        loginWithSingpass
    } = useAuth();

    // Ba Zi State
    const [timeOfBirth, setTimeOfBirth] = useState('');
    const [locationOfBirth, setLocationOfBirth] = useState('Singapore');
    const [gender, setGender] = useState('M');
    const [baziResult, setBaziResult] = useState<any>(null);
    const [baziLoading, setBaziLoading] = useState(false);

    const generateBaZi = () => {
        setBaziLoading(true);
        // Mock API call simulation with loading delay
        setTimeout(() => {
            setBaziResult({
                dayMaster: 'Yang Wood',
                elements: { Wood: 40, Water: 30, Fire: 10, Earth: 10, Metal: 10 },
                propertyAffinities: 'Properties near water or with high floors suit your Yang Wood nature.',
                auspiciousPeriods: '2027-2029'
            });
            setBaziLoading(false);
        }, 1200);
    };

    const handleVerifySingpass = () => {
        // SINGPASS_SWAP: This triggers real Singpass OAuth authentication in Phase 5.1
        loginWithSingpass();
    };

    // SINGPASS_SWAP: Change ACTIVE_MOCK_USER_ID in singpassMock.ts to test different states.
    // We must handle all 4 verification states:
    const renderVerificationBanner = () => {
        switch (verificationStatus) {
            case 'verified':
                return (
                    <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-start gap-3 mb-8">
                        <ShieldCheck className="w-5 h-5 text-emerald-600 mt-0.5" />
                        <div>
                            <h4 className="text-emerald-900 font-semibold">Identity Verified</h4>
                            <p className="text-sm text-emerald-700">Your Identity and Property Ownership have been cryptographically verified via MyInfo.</p>
                        </div>
                    </div>
                );
            case 'pending':
                return (
                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3 mb-8">
                        <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                        <div>
                            <h4 className="text-amber-900 font-semibold">Verification Pending</h4>
                            <p className="text-sm text-amber-700">Your manual verification documents are currently being reviewed by our compliance team.</p>
                        </div>
                    </div>
                );
            case 'failed':
                return (
                    <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-start gap-3 mb-8">
                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                        <div>
                            <h4 className="text-red-900 font-semibold">Verification Failed</h4>
                            <p className="text-sm text-red-700 mb-3">We could not verify your identity. Please try again using Singpass.</p>
                            <Button size="sm" onClick={handleVerifySingpass} className="bg-[#E5002C] hover:bg-[#CC0027] text-white">
                                Retry with Singpass
                            </Button>
                        </div>
                    </div>
                );
            case 'none':
            default:
                return (
                    <div className="bg-slate-100 border border-slate-200 p-5 rounded-xl flex flex-col items-center justify-center text-center mb-8">
                        <Fingerprint className="w-10 h-10 text-slate-400 mb-2" />
                        <h4 className="text-slate-900 font-bold mb-1">Verify Your Identity</h4>
                        <p className="text-sm text-slate-600 max-w-sm mb-4">
                            Unlock the core features of Space Realty, including the 0% DIY Marketplace, by verifying via MyInfo.
                        </p>
                        <Button onClick={handleVerifySingpass} className="bg-[#E5002C] hover:bg-[#CC0027] text-white shadow shadow-red-500/10">
                            Verify with Singpass
                        </Button>
                    </div>
                );
        }
    };

    return (
        <ProtectedRoute>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
                    <p className="text-gray-500 mt-1">Manage your identity, preferences, and transaction records.</p>
                </div>

                {renderVerificationBanner()}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Core Identity */}
                    <div className="lg:col-span-1 space-y-8">

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex justify-between items-center text-lg">
                                    Personal Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-5">

                                {/* SINGPASS_SWAP: This field auto-fills from MyInfo */}
                                <div className="space-y-1">
                                    <Label className="text-xs text-gray-500">Legal Name</Label>
                                    <div className="relative">
                                        <Input
                                            value={legalName ?? ''}
                                            readOnly
                                            className="bg-gray-50 border-gray-200 text-gray-700 cursor-not-allowed pr-32 focus-visible:ring-0 shadow-none"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-gray-400 font-medium bg-gray-50 pl-2">
                                            <LockIcon className="w-3 h-3" />
                                            From Singpass
                                            {/* SINGPASS_SWAP: Populated from MyInfo API in Phase 5.1 */}
                                        </span>
                                    </div>
                                </div>

                                {/* SINGPASS_SWAP: This field auto-fills from MyInfo */}
                                <div className="space-y-1">
                                    <Label className="text-xs text-gray-500">Date of Birth</Label>
                                    <div className="relative">
                                        <Input
                                            value={dateOfBirth ?? ''}
                                            readOnly
                                            className="bg-gray-50 border-gray-200 text-gray-700 cursor-not-allowed pr-32 focus-visible:ring-0 shadow-none"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-gray-400 font-medium bg-gray-50 pl-2">
                                            <LockIcon className="w-3 h-3" />
                                            From Singpass
                                            {/* SINGPASS_SWAP: Populated from MyInfo API in Phase 5.1 */}
                                        </span>
                                    </div>
                                </div>

                                {/* SINGPASS_SWAP: This field auto-fills from MyInfo */}
                                <div className="space-y-1">
                                    <Label className="text-xs text-gray-500">Nationality</Label>
                                    <div className="relative">
                                        <Input
                                            value={nationality ?? ''}
                                            readOnly
                                            className="bg-gray-50 border-gray-200 text-gray-700 cursor-not-allowed pr-32 focus-visible:ring-0 shadow-none"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-gray-400 font-medium bg-gray-50 pl-2">
                                            <LockIcon className="w-3 h-3" />
                                            From Singpass
                                            {/* SINGPASS_SWAP: Populated from MyInfo API in Phase 5.1 */}
                                        </span>
                                    </div>
                                </div>

                                {/* SINGPASS_SWAP: This field auto-fills from MyInfo */}
                                <div className="space-y-1">
                                    <Label className="text-xs text-gray-500">Registered Address</Label>
                                    <div className="relative">
                                        <textarea
                                            value={homeAddress ?? ''}
                                            readOnly
                                            rows={2}
                                            className="flex w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 shadow-none cursor-not-allowed focus-visible:outline-none resize-none pt-2"
                                        />
                                        <span className="absolute bottom-2 right-3 flex items-center gap-1 text-[10px] text-gray-400 font-medium bg-gray-50/90 pl-2">
                                            <LockIcon className="w-2.5 h-2.5" />
                                            From Singpass
                                            {/* SINGPASS_SWAP: Populated from MyInfo API in Phase 5.1 */}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Verification Badges */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Earned Badges</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-wrap gap-2">
                                {verificationStatus === 'verified' && (
                                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 py-1.5 px-3">
                                        <Fingerprint className="w-3.5 h-3.5 mr-1.5" /> Singpass Verified
                                    </Badge>
                                )}
                                {role === 'Owner' && (
                                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100 py-1.5 px-3">
                                        <ShieldCheck className="w-3.5 h-3.5 mr-1.5" /> Verified Owner
                                    </Badge>
                                )}
                                {role === 'Agent' && (
                                    <Badge variant="secondary" className="bg-purple-100 text-purple-800 hover:bg-purple-100 py-1.5 px-3">
                                        <BadgeCheck className="w-3.5 h-3.5 mr-1.5" /> CEA Licensed
                                    </Badge>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Preferences, BaZi, Activity */}
                    <div className="lg:col-span-2 space-y-8">

                        <Card>
                            <CardHeader>
                                <CardTitle>Preferences & AI Profile</CardTitle>
                                <CardDescription>Help our AI Digital Avatar curate the perfect properties and investment strategies for you.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label>Myers-Briggs (MBTI)</Label>
                                        <select className="flex h-10 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2">
                                            <option value="">Select MBTI...</option>
                                            <option value="INTJ">INTJ (Architect)</option>
                                            <option value="INTP">INTP (Logician)</option>
                                            <option value="ENTJ">ENTJ (Commander)</option>
                                            <option value="ENFP">ENFP (Campaigner)</option>
                                            {/* (Other 12 omitted for brevity) */}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Proximity Priorities</Label>
                                        <select className="flex h-10 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2">
                                            <option value="mrt">MRT Station</option>
                                            <option value="school">Primary Schools</option>
                                            <option value="park">Parks / Nature</option>
                                            <option value="mall">Shopping Malls</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label>Must-Have Property Features</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {['High Floor', 'Unblocked View', 'North-South Facing', 'Corner Unit', 'Balcony', 'Enclosed Kitchen'].map(tag => (
                                            <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-gray-100 py-1 px-3 border-emerald-200 text-emerald-800">
                                                + {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Ba Zi Module */}
                        <Card className="border-indigo-100 bg-gradient-to-br from-indigo-50/30 to-white overflow-hidden">
                            <div className="h-1 w-full bg-gradient-to-r from-indigo-400 to-purple-500"></div>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Award className="w-5 h-5 text-indigo-600" /> Ba Zi Metaphysics Engine
                                </CardTitle>
                                <CardDescription>
                                    Discover how traditional Chinese metaphysics align with your property journey.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {!baziResult ? (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            {/* SINGPASS_SWAP: DoB is read automatically from MyInfo */}
                                            <div className="space-y-2">
                                                <Label>Date of Birth</Label>
                                                <Input value={dateOfBirth ?? ''} readOnly className="bg-gray-50" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Time of Birth</Label>
                                                <Input type="time" value={timeOfBirth} onChange={e => setTimeOfBirth(e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Location of Birth</Label>
                                                <Input value={locationOfBirth} onChange={e => setLocationOfBirth(e.target.value)} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Gender</Label>
                                                <select
                                                    value={gender}
                                                    onChange={e => setGender(e.target.value)}
                                                    className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
                                                >
                                                    <option value="M">Male</option>
                                                    <option value="F">Female</option>
                                                </select>
                                            </div>
                                        </div>
                                        <Button
                                            onClick={generateBaZi}
                                            disabled={!timeOfBirth || !dateOfBirth || baziLoading}
                                            className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700"
                                        >
                                            {baziLoading ? 'Generating Reading…' : 'Generate My Ba Zi Reading'}
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <div className="p-4 bg-white rounded-lg border border-indigo-100 shadow-sm flex flex-col items-center text-center">
                                            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Your Day Master</span>
                                            <h3 className="text-2xl font-bold text-indigo-900">{baziResult.dayMaster}</h3>
                                        </div>
                                        <div className="p-4 bg-indigo-50/50 rounded-lg text-sm text-indigo-900 leading-relaxed">
                                            <strong>Property Affinities:</strong> {baziResult.propertyAffinities}
                                        </div>
                                        <div className="p-4 bg-indigo-50/50 rounded-lg text-sm text-indigo-900">
                                            <strong>Auspicious Move-in/Purchase Periods:</strong> {baziResult.auspiciousPeriods}
                                        </div>
                                        <div className="text-[10px] text-gray-400 mt-4 leading-tight">
                                            *Disclaimer: Ba Zi readings are generated by an AI model trained on traditional Chinese metaphysics principles. They are intended for cultural interest and entertainment purposes only, and should not replace professional financial or real estate advice. Space Realty does not guarantee the accuracy of these readings.
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Activity/Transactions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Transaction History</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Tabs defaultValue="buy" className="w-full">
                                    <TabsList className="grid w-full grid-cols-3">
                                        <TabsTrigger value="buy">Buy</TabsTrigger>
                                        <TabsTrigger value="sell">Sell</TabsTrigger>
                                        <TabsTrigger value="rent">Rent</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="buy" className="mt-4 p-8 text-center border-2 border-dashed border-gray-200 rounded-lg">
                                        <ShoppingCart className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                        <p className="text-gray-500 text-sm font-medium">No purchase transactions yet</p>
                                        <p className="text-gray-400 text-xs mt-1">Properties you buy will appear here.</p>
                                    </TabsContent>
                                    <TabsContent value="sell" className="mt-4 p-8 text-center border-2 border-dashed border-gray-200 rounded-lg">
                                        <Home className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                        <p className="text-gray-500 text-sm font-medium">No sale transactions yet</p>
                                        <p className="text-gray-400 text-xs mt-1">Properties you sell will appear here.</p>
                                    </TabsContent>
                                    <TabsContent value="rent" className="mt-4 p-8 text-center border-2 border-dashed border-gray-200 rounded-lg">
                                        <Key className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                        <p className="text-gray-500 text-sm font-medium">No rental agreements yet</p>
                                        <p className="text-gray-400 text-xs mt-1">Rental agreements will appear here.</p>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>

                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
