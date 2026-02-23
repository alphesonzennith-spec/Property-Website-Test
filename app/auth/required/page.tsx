'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ShieldAlert, ArrowRight } from 'lucide-react';

import { Suspense } from 'react';

function AuthRequiredContent() {
    const searchParams = useSearchParams();
    const redirectUrl = searchParams.get('redirect') || '/';

    return (
        <main className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center mb-2 shadow-sm ring-4 ring-emerald-50">
                        <ShieldAlert className="h-8 w-8 text-emerald-600" />
                    </div>
                </div>
                <h2 className="mt-4 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
                    Authentication Required
                </h2>
                <p className="mt-3 text-center text-sm text-gray-500 max-w-sm mx-auto">
                    Please sign in or create an account to access this exclusive dashboard feature.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl shadow-gray-200/50 sm:rounded-2xl sm:px-10 border border-gray-100">
                    <div className="space-y-4">
                        <Link href={`/login?redirect=${encodeURIComponent(redirectUrl)}`} className="block w-full">
                            <Button className="w-full h-12 text-base font-medium shadow-sm" variant="default">
                                Log In to Your Account
                            </Button>
                        </Link>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500 font-medium">New to Space Realty?</span>
                            </div>
                        </div>

                        <Link href={`/signup?redirect=${encodeURIComponent(redirectUrl)}`} className="block w-full">
                            <Button className="w-full h-12 text-base font-medium border-2" variant="outline">
                                Create an Account
                            </Button>
                        </Link>
                    </div>

                    <div className="mt-8 text-center text-sm font-medium">
                        <Link href="/" className="text-gray-500 hover:text-emerald-600 transition-colors inline-flex items-center gap-1 group">
                            <ArrowLeftIcon className="w-4 h-4 text-gray-400 group-hover:-translate-x-1 transition-transform" />
                            Return to Homepage
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default function AuthRequiredPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div></div>}>
            <AuthRequiredContent />
        </Suspense>
    );
}

function ArrowLeftIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
        </svg>
    );
}
