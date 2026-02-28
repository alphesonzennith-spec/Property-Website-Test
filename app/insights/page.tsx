import { Suspense } from 'react';
import { DashboardControls } from './DashboardControls';
import { WidgetGrid } from './WidgetGrid';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnalyticsTab } from './AnalyticsTab';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Skeleton } from '@/components/ui/skeleton';
// SingaporeMapClient wraps the dynamic() call with ssr:false inside a 'use client'
// boundary — required because ssr:false is not allowed in Server Components.
import { SingaporeMapClient } from './SingaporeMapClient';

export default function InsightsDashboard() {
    return (
        <ProtectedRoute>
            <Tabs defaultValue="analytics" className="w-full min-h-screen bg-gray-50 flex flex-col">
                <DashboardControls />
                <main className="flex-1 w-full p-4 sm:p-6 lg:p-8">
                    <h1 className="text-2xl font-bold text-gray-900 hidden sm:block mb-6">Dashboard</h1>

                    <TabsContent value="analytics" className="w-full min-h-[800px]">
                        <Suspense fallback={<div className="space-y-4"><Skeleton className="h-48 w-full rounded-xl" /><Skeleton className="h-64 w-full rounded-xl" /></div>}>
                            <AnalyticsTab />
                        </Suspense>
                    </TabsContent>


                    <TabsContent value="map" className="h-[700px] bg-slate-100 rounded-xl relative overflow-hidden border">
                        <div className="absolute top-4 left-4 z-10 bg-white/90 p-4 rounded-xl shadow-lg border border-gray-200 pointer-events-none">
                            <h3 className="font-semibold text-gray-800">Geospatial Explorer</h3>
                            <p className="text-sm text-gray-500">Color coded by median PSF</p>
                            <div className="mt-4 flex items-center gap-2">
                                <div className="w-4 h-4 rounded bg-green-500"></div> Low
                                <div className="flex-1"></div>
                                <div className="w-4 h-4 rounded bg-red-500"></div> High
                            </div>
                        </div>
                        <div className="w-full h-full">
                            <SingaporeMapClient />
                        </div>
                    </TabsContent>
                </main>
            </Tabs>
        </ProtectedRoute>
    );
}
