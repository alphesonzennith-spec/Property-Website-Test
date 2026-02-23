"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { mockFamilies } from "@/lib/mock/families";
import { mockUsers } from "@/lib/mock/users";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, AlertTriangle, ArrowLeft, Calculator, CheckCircle2, FileText, Home, Info, Loader2, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Helper to calculate ABSD simplified
function calculateNextABSD(
    memberId: string,
    extraProperties: number = 0
): number {
    const user = mockUsers.find((u) => u.id === memberId);
    if (!user) return 0;

    const currentProps = user.buyHistory?.length || 0;
    const totalProps = currentProps + extraProperties;

    const resStatus = user.residencyStatus;
    if (resStatus === "Singaporean") {
        if (totalProps === 0) return 0; // 0%
        if (totalProps === 1) return 20; // 20%
        return 30; // 30%
    } else if (resStatus === "PR") {
        if (totalProps === 0) return 5;
        return 30;
    } else {
        // Foreigner
        return 60;
    }
}

export default function EligibilityDashboard() {
    const { userId } = useAuth();
    const currentUserProfile = mockUsers.find((u) => u.id === userId);
    const familyGroupId = currentUserProfile?.familyGroupId;
    const familyData = mockFamilies.find((f) => f.id === familyGroupId);

    const [whatIfMember, setWhatIfMember] = useState<string>("none");

    if (!familyData) {
        return (
            <ProtectedRoute>
                <div className="max-w-5xl mx-auto py-8 px-4 text-center">
                    <h2 className="text-2xl font-bold">No Family Group Found</h2>
                    <p className="mt-2 text-muted-foreground">
                        Please create a family group first to view combined eligibility.
                    </p>
                    <Link href="/family" className="mt-4 inline-block">
                        <Button>Go back to Family</Button>
                    </Link>
                </div>
            </ProtectedRoute>
        );
    }

    const membersProfiles = familyData.members
        .map((m) => mockUsers.find((u) => u.id === m.userId))
        .filter((u) => u !== undefined) as typeof mockUsers;

    return (
        <ProtectedRoute>
            <div className="space-y-8 max-w-6xl mx-auto py-8 px-4">
                <div className="flex items-center gap-4">
                    <Link href="/family">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Eligibility Dashboard
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Combined financial picture for {familyData.name}
                        </p>
                    </div>
                </div>

                {/* What-If Scenarios Tool */}
                <Card className="border-primary/20 bg-primary/5">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Calculator className="h-5 w-5 text-primary" />
                            "What-if" Scenario Planning
                        </CardTitle>
                        <CardDescription>
                            See how one member's purchase affects the ABSD exposure of others.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4">
                            <span className="font-medium text-sm">What if</span>
                            <Select value={whatIfMember} onValueChange={setWhatIfMember}>
                                <SelectTrigger className="w-[280px] bg-white">
                                    <SelectValue placeholder="Select a scenario" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No one buys anything yet</SelectItem>
                                    {membersProfiles.map((m) => (
                                        <SelectItem key={m.id} value={m.id}>
                                            {m.singpassVerification?.name} buys a condo first
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <span className="font-medium text-sm">?</span>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* ABSD Exposure Table */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle>ABSD Exposure Table</CardTitle>
                                    <CardDescription>
                                        Current theoretical ABSD if each member purchases the next
                                        property.
                                    </CardDescription>
                                </div>
                                <Link href="/calculators/absd">
                                    <Button variant="ghost" size="sm" className="gap-2">
                                        Full ABSD Calculator <ArrowLeft className="h-3 w-3 rotate-180" />
                                    </Button>
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/50">
                                            <TableHead>Family Member</TableHead>
                                            <TableHead>Current Props</TableHead>
                                            <TableHead>Next Rate (Scenario)</TableHead>
                                            <TableHead className="text-right">ABSD on $1M</TableHead>
                                            <TableHead className="text-right">ABSD on $2M</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {membersProfiles.map((member) => {
                                            const extra = member.id === whatIfMember ? 1 : 0;
                                            const nextRate = calculateNextABSD(member.id, extra);
                                            const absd1M = 1000000 * (nextRate / 100);
                                            const absd2M = 2000000 * (nextRate / 100);

                                            // color coding
                                            let colorClass = "text-green-600 bg-green-50";
                                            if (nextRate > 0 && nextRate <= 20)
                                                colorClass = "text-amber-600 bg-amber-50";
                                            if (nextRate > 20) colorClass = "text-red-600 bg-red-50";

                                            return (
                                                <TableRow key={member.id}>
                                                    <TableCell className="font-medium">
                                                        {member.singpassVerification?.name}
                                                        {member.id === whatIfMember && (
                                                            <Badge variant="secondary" className="ml-2 text-[10px]">
                                                                +1 in Scenario
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>{member.buyHistory?.length || 0}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className={colorClass}>
                                                            {nextRate}%
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right font-mono">
                                                        ${absd1M.toLocaleString()}
                                                    </TableCell>
                                                    <TableCell className="text-right font-mono">
                                                        ${absd2M.toLocaleString()}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* TDSR Joined Capacity */}
                    <Card>
                        <CardHeader>
                            <CardTitle>TDSR & Affordability</CardTitle>
                            <CardDescription>
                                Max purchase price based on combined incomes and debt load.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium">Combined TDSR Capacity</span>
                                    <span className="text-xl font-bold text-primary">
                                        ${familyData.eligibilitySummary.combinedTDSRCapacity.toLocaleString()}
                                    </span>
                                </div>
                                <div className="h-3 w-full bg-muted rounded-full overflow-hidden flex">
                                    <div className="h-full bg-primary w-[30%]" title="Current Debt" />
                                    <div
                                        className="h-full bg-primary/30 w-[70%]"
                                        title="Available Capacity"
                                    />
                                </div>
                                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                                    <span>Current Debt Load (15%)</span>
                                    <span>Max Allowed (55%)</span>
                                </div>
                            </div>

                            <div className="space-y-3 pt-4 border-t">
                                <p className="text-sm font-semibold">Individual Capacities</p>
                                {membersProfiles.map((m) => (
                                    <div key={m.id} className="flex justify-between items-center text-sm">
                                        <span>{m.singpassVerification?.name?.split(" ")[0]}</span>
                                        <span className="font-mono text-muted-foreground">
                                            Est. $ {((m.id.charCodeAt(m.id.length - 1) * 153000) % 1500000 + 500000).toLocaleString(
                                                undefined,
                                                { maximumFractionDigits: 0 }
                                            )}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* CPF Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle>CPF Ordinary Account</CardTitle>
                            <CardDescription>Available funds for downpayment</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex justify-between items-center bg-muted/50 p-4 rounded-lg">
                                <span className="font-medium">Total Family OA</span>
                                <span className="text-2xl font-bold">
                                    ${familyData.eligibilitySummary.combinedCPFAvailable.toLocaleString()}
                                </span>
                            </div>

                            <div className="space-y-3">
                                {membersProfiles.map((m) => (
                                    <div key={m.id} className="flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-primary" />
                                            <span>{m.singpassVerification?.name?.split(" ")[0]}'s OA</span>
                                        </div>
                                        <span className="font-mono">
                                            $ {((m.id.charCodeAt(m.id.length - 1) * 15400) % 100000 + 40000).toLocaleString(
                                                undefined,
                                                { maximumFractionDigits: 0 }
                                            )}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* HDB Eligibility Check */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>HDB Eligibility Status</CardTitle>
                            <CardDescription>
                                Rules and wait-out periods for HDB grants and purchases.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {familyData.eligibilitySummary.canBuyHDB ? (
                                <Alert className="bg-green-50 border-green-200 mb-6">
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    <AlertTitle className="text-green-800">
                                        Family Nucleus is HDB Eligible
                                    </AlertTitle>
                                    <AlertDescription className="text-green-700">
                                        Your family group forms a valid nucleus and meets the basic
                                        citizenship/ownership criteria to purchase an HDB flat.
                                    </AlertDescription>
                                </Alert>
                            ) : (
                                <Alert variant="destructive" className="mb-6">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertTitle>Not Currently Eligible for HDB Purchase</AlertTitle>
                                    <AlertDescription>
                                        Your family group currently does not meet the requirements to
                                        purchase a new or resale HDB flat together.
                                    </AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-4">
                                <h4 className="text-sm font-semibold">Important Notes</h4>
                                <ul className="grid gap-3">
                                    {familyData.eligibilitySummary.hdbEligibilityNotes.map(
                                        (note, idx) => (
                                            <li
                                                key={idx}
                                                className="flex items-start gap-3 text-sm text-slate-700 bg-slate-50 p-3 rounded-md"
                                            >
                                                <Info className="h-4 w-4 text-slate-500 mt-0.5 shrink-0" />
                                                <span>{note}</span>
                                            </li>
                                        )
                                    )}
                                    {whatIfMember !== "none" && (
                                        <li className="flex items-start gap-3 text-sm text-amber-700 bg-amber-50 p-3 rounded-md border border-amber-200">
                                            <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                                            <span>
                                                <strong>Warning:</strong> Purchasing a condo first will
                                                trigger a 15-month wait-out period if you intend to buy an
                                                HDB resale flat later.
                                            </span>
                                        </li>
                                    )}
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </ProtectedRoute>
    );
}
