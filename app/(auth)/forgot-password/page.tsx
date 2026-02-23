'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MailCheck, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // SINGPASS_SWAP: In Phase 5.1, replace this timeout with the real Supabase call:
        // await supabase.auth.resetPasswordForEmail(email, {
        //   redirectTo: `${window.location.origin}/auth/update-password`,
        // });

        // Simulating network request
        setTimeout(() => {
            setIsLoading(false);
            setIsSubmitted(true);
        }, 1200);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Reset your password
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Enter your email address and we'll send you a link to reset your password.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <Card className="border-gray-200 shadow-sm">
                    {!isSubmitted ? (
                        <>
                            <CardHeader className="pb-4">
                                <CardTitle className="text-xl">Account Email</CardTitle>
                                <CardDescription>
                                    Please provide the email address associated with your Space Realty account.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email address</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            required
                                            placeholder="wei.ming@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            disabled={isLoading}
                                        />
                                    </div>
                                    <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={isLoading || !email}>
                                        {isLoading ? 'Sending Link...' : 'Send Reset Link'}
                                    </Button>
                                </form>
                            </CardContent>
                        </>
                    ) : (
                        <CardContent className="pt-6 pb-8 text-center px-8">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 mb-6 shadow-inner">
                                <MailCheck className="h-8 w-8 text-emerald-600" aria-hidden="true" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Check your inbox</h3>
                            <p className="text-sm text-gray-500 mb-6">
                                We've sent password reset instructions to <span className="font-semibold text-gray-800">{email}</span>. Please check your spam folder if you don't see it within a few minutes.
                            </p>
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => setIsSubmitted(false)}
                            >
                                Try another email
                            </Button>
                        </CardContent>
                    )}

                    <CardFooter className="flex flex-col border-t bg-gray-50/50 py-4 rounded-b-xl border-gray-100">
                        <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-emerald-600 flex items-center justify-center gap-1.5 transition-colors group">
                            <ArrowLeft className="w-4 h-4 text-gray-400 group-hover:-translate-x-1 transition-transform" />
                            Back to log in
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
