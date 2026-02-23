'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Home, RefreshCcw } from 'lucide-react';

export default function PropertyPageError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to error reporting service (e.g., Sentry)
    console.error('Property page error:', error);
  }, [error]);

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-6">
          {/* Error Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>

          {/* Error Message */}
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold text-[#1E293B]">
              Something went wrong
            </h1>
            <p className="text-gray-500">
              We encountered an error while loading this property
            </p>
          </div>

          {/* Error Details (only show in development) */}
          {process.env.NODE_ENV === 'development' && (
            <Alert variant="destructive" className="text-left">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error Details</AlertTitle>
              <AlertDescription className="mt-2 font-mono text-xs">
                {error.message}
                {error.digest && (
                  <div className="mt-2 text-gray-500">
                    Digest: {error.digest}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Button
              onClick={reset}
              className="gap-2"
              size="lg"
            >
              <RefreshCcw className="w-4 h-4" />
              Try Again
            </Button>
            <Link href="/residential/buy">
              <Button variant="outline" size="lg" className="gap-2">
                <Home className="w-4 h-4" />
                Back to Search
              </Button>
            </Link>
          </div>

          {/* Help Text */}
          <p className="text-sm text-gray-400">
            If this problem persists, please{' '}
            <a href="/contact" className="text-emerald-600 hover:text-emerald-700 font-medium">
              contact support
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
