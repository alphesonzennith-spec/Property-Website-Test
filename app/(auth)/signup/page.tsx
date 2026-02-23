'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Fingerprint, Home, Key, User, Building2, Briefcase } from 'lucide-react';

type AccountType = 'buyer' | 'renter' | 'owner' | 'agent' | 'business' | null;

export default function SignupPage() {
    const router = useRouter();
    const { loginWithSingpass } = useAuth();

    const [step, setStep] = useState<number>(1);
    const [accountType, setAccountType] = useState<AccountType>(null);

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        residency: 'Citizen',
        ceaNumber: '',
        agency: '',
        companyName: '',
        uen: '',
        role: ''
    });

    const handleNext = () => {
        if (step === 1 && !accountType) return; // Prevent proceeding without selection
        setStep(s => s + 1);
    };

    const handleBack = () => setStep(s => s - 1);

    const handleSingpassVerify = () => {
        // SINGPASS_SWAP: This click triggers real Singpass OAuth redirect in Phase 5.1
        // It is mandatory for identity verification post basic-signup.
        loginWithSingpass();
    };

    const accountOptions = [
        { id: 'buyer', title: "I'm Looking to Buy", icon: Home },
        { id: 'renter', title: "I'm Looking to Rent", icon: Key },
        { id: 'owner', title: "I'm an Owner", icon: User },
        { id: 'agent', title: "I'm a Licensed Agent", icon: Briefcase },
        { id: 'business', title: "I represent a Business", icon: Building2 },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
                <div className="mb-8 flex justify-center items-center space-x-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
                    <div className={`h-1 w-12 ${step >= 2 ? 'bg-emerald-600' : 'bg-gray-200'}`} />
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
                    <div className={`h-1 w-12 ${step >= 3 ? 'bg-emerald-600' : 'bg-gray-200'}`} />
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-500'}`}>3</div>
                </div>

                <Card className="border-gray-200 shadow-sm overflow-hidden pb-0">

                    {step === 1 && (
                        <>
                            <CardHeader className="text-center">
                                <CardTitle className="text-2xl font-bold text-gray-900">Choose Account Type</CardTitle>
                                <CardDescription>How do you plan to use Space Realty?</CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4 sm:grid-cols-2">
                                {accountOptions.map((opt) => {
                                    const Icon = opt.icon;
                                    const isSelected = accountType === opt.id;
                                    return (
                                        <div
                                            key={opt.id}
                                            onClick={() => setAccountType(opt.id as AccountType)}
                                            className={`cursor-pointer rounded-xl border p-4 flex flex-col items-center justify-center space-y-3 transition-colors ${isSelected ? 'border-emerald-600 bg-emerald-50 text-emerald-900' : 'border-gray-200 hover:border-emerald-300'}`}
                                        >
                                            <Icon className={`w-8 h-8 ${isSelected ? 'text-emerald-600' : 'text-gray-400'}`} />
                                            <span className="font-medium text-center">{opt.title}</span>
                                        </div>
                                    );
                                })}
                            </CardContent>
                            <CardFooter className="bg-gray-50 flex justify-end p-6 border-t border-gray-100 rounded-b-xl">
                                <Button onClick={handleNext} disabled={!accountType} className="bg-emerald-600 hover:bg-emerald-700">Continue</Button>
                            </CardFooter>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <CardHeader>
                                <CardTitle className="text-xl font-bold">Basic Information</CardTitle>
                                <CardDescription>Tell us a bit about yourself</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {accountType === 'business' ? (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Company Name</Label>
                                                <Input value={formData.companyName} onChange={e => setFormData({ ...formData, companyName: e.target.value })} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>UEN Number</Label>
                                                <Input value={formData.uen} onChange={e => setFormData({ ...formData, uen: e.target.value })} placeholder="e.g. 199001234E" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Contact Person</Label>
                                                <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Role</Label>
                                                <Input value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Business Email</Label>
                                                <Input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Password</Label>
                                                <Input type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid gap-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Full Name</Label>
                                                <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Phone Number</Label>
                                                <Input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Email</Label>
                                                <Input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Password</Label>
                                                <Input type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                                            </div>
                                        </div>

                                        {accountType === 'agent' && (
                                            <div className="grid grid-cols-2 gap-4 p-4 mt-2 bg-amber-50 rounded-lg border border-amber-100">
                                                <div className="space-y-2">
                                                    <Label className="text-amber-900">CEA Registration No.</Label>
                                                    {/* SINGPASS_SWAP: Validation against real CEA registry API occurs in Phase 5.1 */}
                                                    <Input value={formData.ceaNumber} onChange={e => setFormData({ ...formData, ceaNumber: e.target.value })} placeholder="e.g. R123456A" className="border-amber-200" />
                                                    <p className="text-xs text-amber-700">Must match exactly as registered.</p>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-amber-900">Agency Name</Label>
                                                    <Input value={formData.agency} onChange={e => setFormData({ ...formData, agency: e.target.value })} className="border-amber-200" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="bg-gray-50 flex justify-between p-6 border-t border-gray-100 rounded-b-xl">
                                <Button variant="ghost" onClick={handleBack}>Back</Button>
                                <Button onClick={handleNext} className="bg-emerald-600 hover:bg-emerald-700">Verify Identity</Button>
                            </CardFooter>
                        </>
                    )}

                    {step === 3 && (
                        <>
                            <CardHeader className="text-center pb-2">
                                <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                                    <Fingerprint className="w-8 h-8 text-[#E5002C]" />
                                </div>
                                <CardTitle className="text-2xl font-bold">Verify With Singpass</CardTitle>
                                <CardDescription className="max-w-sm mx-auto mt-2">
                                    Space Realty strictly requires identity and property ownership verification to ensure a scam-free trusted environment.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center py-6">
                                <Button
                                    onClick={handleSingpassVerify}
                                    className="w-full sm:w-80 h-12 text-lg bg-[#E5002C] hover:bg-[#CC0027] text-white shadow-lg shadow-red-500/20"
                                >
                                    Retrieve MyInfo with Singpass
                                </Button>
                                <p className="mt-4 text-xs text-center text-gray-500 max-w-sm">
                                    By connecting, you agree to retrieve your basic profile and property ownership status from MyInfo for verification purposes.
                                </p>
                            </CardContent>
                            <CardFooter className="bg-gray-50 flex justify-start p-6 border-t border-gray-100 rounded-b-xl">
                                <Button variant="ghost" onClick={handleBack} className="text-gray-500">Back</Button>
                            </CardFooter>
                        </>
                    )}
                </Card>
            </div>
        </div>
    );
}
