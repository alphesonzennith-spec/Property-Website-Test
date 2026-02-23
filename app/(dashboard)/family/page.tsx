"use client";

import React from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { mockFamilies } from "@/lib/mock/families";
import { FamilyTree } from "@/components/family/FamilyTree";
import { AddFamilyMember } from "@/components/family/AddFamilyMember";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Calculator, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { mockUsers } from "@/lib/mock/users";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function FamilyPage() {
    const { userId } = useAuth();

    // Find current user's profile to get their familyGroupId
    const currentUserProfile = mockUsers.find((u) => u.id === userId);
    const familyGroupId = currentUserProfile?.familyGroupId;

    // Find the family group data
    const familyData = mockFamilies.find(f => f.id === familyGroupId);

    if (!familyData) {
        return (
            <ProtectedRoute>
                <div className="space-y-8 max-w-5xl mx-auto py-8 px-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Family Grouping</h1>
                            <p className="text-muted-foreground mt-2">
                                Plan across generations. Link family members to unlock combined financial insights.
                            </p>
                        </div>
                        <AddFamilyMember />
                    </div>

                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                <Users className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">You don't have a family group yet</h3>
                            <p className="text-muted-foreground max-w-md mb-6">
                                Create a family group to calculate combined TDSR, assess multi-generational HDB eligibility, and optimize ABSD exposure.
                            </p>
                            <AddFamilyMember />
                        </CardContent>
                    </Card>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <div className="space-y-8 max-w-6xl mx-auto py-8 px-4">
                {/* Header section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{familyData.name}</h1>
                        <p className="text-muted-foreground mt-2">
                            Multi-generational property planning
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Link href="/family/eligibility">
                            <Button variant="outline" className="gap-2">
                                <Calculator className="h-4 w-4" />
                                Eligibility Dashboard
                            </Button>
                        </Link>
                        <AddFamilyMember />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Main Family Tree section - takes up 2/3 width on md+ */}
                    <div className="md:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Family Members</CardTitle>
                                <CardDescription>
                                    Click on a member to view their verified profile and holding status.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <FamilyTree family={familyData} />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar Insights - takes up 1/3 width on md+ */}
                    <div className="space-y-6">
                        <Card className="bg-primary/5 border-primary/20">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ShieldCheck className="h-5 w-5 text-primary" />
                                    Verified Trust Layer
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-muted-foreground">
                                    All members in your family group are authenticated via Singpass to ensure 100% accurate multi-generational property planning.
                                </p>
                                <div className="bg-white/60 p-3 rounded-md border border-primary/10 flex items-center justify-between">
                                    <span className="text-sm font-medium">Group Verification</span>
                                    <span className="text-sm text-green-600 font-bold">100% Complete</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle>Asset Overview</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b">
                                    <span className="text-sm text-muted-foreground">Properties Owned</span>
                                    <span className="font-semibold">{familyData.eligibilitySummary.totalPropertiesOwned}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b">
                                    <span className="text-sm text-muted-foreground">Est. Value (Combined)</span>
                                    <span className="font-semibold">-</span> {/* Placeholder until we link property mock data */}
                                </div>

                                <div className="pt-4">
                                    <Link href="/family/eligibility" className="w-full">
                                        <Button className="w-full justify-between" variant="secondary">
                                            <span>View Financial Picture</span>
                                            <ArrowRight className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
