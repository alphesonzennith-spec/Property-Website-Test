'use client';

import { useState, useMemo } from 'react';
import { useRegulatorySection } from '@/hooks/useRegulatoryRates';
import { calculateTDSR, calculateMSR, getMaxLoanAmount } from '@/lib/calculations/borrowing';
import { PropertyType } from '@/types';
import type { TDSRInput, MSRInput } from '@/types/calculator';

// shadcn/ui components
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

export default function TdsrMsrCalculatorPage() {
  // Fetch borrowing config from regulatory rates
  const { data: borrowingConfig, isLoading, error, refetch } = useRegulatorySection('borrowing');

  // Loading state
  if (isLoading) {
    return (
      <main className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-12 w-96 mb-8" />
          <Skeleton className="h-96 w-full" />
        </div>
      </main>
    );
  }

  // Error state
  if (error || !borrowingConfig) {
    return (
      <main className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <Alert variant="destructive">
            <AlertTitle>Unable to load regulatory rates</AlertTitle>
            <AlertDescription>
              Please try refreshing the page. If the problem persists, contact support.
            </AlertDescription>
            <Button onClick={() => refetch()} className="mt-4">Retry</Button>
          </Alert>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest mb-3">
          CALCULATORS / TDSR
        </p>
        <h1 className="text-4xl font-extrabold text-[#1E293B] mb-4">
          TDSR & MSR Calculator
        </h1>
        <p className="text-gray-500 mb-8">
          Calculate your Total Debt Servicing Ratio and Mortgage Servicing Ratio
        </p>

        {/* Tab structure will go here */}
        <div className="text-center text-gray-400 py-20">
          Config loaded successfully. Tabs coming next.
        </div>
      </div>
    </main>
  );
}
