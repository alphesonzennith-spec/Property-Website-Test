'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { Loader2 } from 'lucide-react';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            // Redirect to interstitial auth required page, saving the original URL
            const redirectUrl = encodeURIComponent(pathname);
            router.push(`/auth/required?redirect=${redirectUrl}`);
        }
    }, [isAuthenticated, isLoading, router, pathname]);

    // While checking auth state, show a loading spinner
    if (isLoading || !isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
                    <p className="text-gray-500 font-medium tracking-tight">Verifying access...</p>
                </div>
            </div>
        );
    }

    // If authenticated, render the protected content
    return <>{children}</>;
}
