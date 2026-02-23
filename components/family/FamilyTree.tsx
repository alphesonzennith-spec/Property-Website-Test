"use client";

import React, { useState } from "react";
import { UserProfile, FamilyGroup, FamilyRole } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { CheckCircle2, Home, User as UserIcon, AlertCircle } from "lucide-react";
import { mockUsers } from "@/lib/mock/users";

interface FamilyTreeProps {
    family: FamilyGroup;
}

export function FamilyTree({ family }: FamilyTreeProps) {
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

    const getMemberProfile = (userId: string) =>
        mockUsers.find((u) => u.id === userId);

    const selectedProfile = selectedUserId ? getMemberProfile(selectedUserId) : null;
    const selectedMemberData = family.members.find(
        (m) => m.userId === selectedUserId
    );

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {family.members.map((member) => {
                    const profile = getMemberProfile(member.userId);
                    if (!profile) return null;

                    const isVerified = profile.singpassVerification?.verified;

                    return (
                        <Card
                            key={member.userId}
                            className="cursor-pointer hover:border-primary transition-colors hover:shadow-md"
                            onClick={() => setSelectedUserId(member.userId)}
                        >
                            <CardContent className="p-6 flex items-start gap-4">
                                <Avatar className="h-12 w-12 border">
                                    <AvatarFallback className="bg-primary/10 text-primary">
                                        {profile.singpassVerification?.name?.[0] ||
                                            profile.email[0].toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0 space-y-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <h4 className="font-semibold text-sm truncate">
                                            {profile.singpassVerification?.name || "Unknown Name"}
                                        </h4>
                                        {isVerified && (
                                            <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground capitalize truncate">
                                        {member.role.toLowerCase()} • {member.relationship}
                                    </p>
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {profile.buyHistory?.length > 0 && (
                                            <Badge variant="secondary" className="text-xs">
                                                <Home className="h-3 w-3 mr-1" />
                                                {profile.buyHistory.length} Properties
                                            </Badge>
                                        )}
                                        {isVerified ? (
                                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                                Singpass
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-xs text-amber-600 border-amber-200 bg-amber-50">
                                                Unverified
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <Dialog
                open={!!selectedUserId}
                onOpenChange={(open) => !open && setSelectedUserId(null)}
            >
                <DialogContent className="sm:max-w-[425px] overflow-hidden p-0 border-0 shadow-xl rounded-2xl">
                    {selectedProfile && (
                        <>
                            <DialogHeader className="p-6 pb-0">
                                <DialogTitle className="text-xl text-primary">Member Profile</DialogTitle>
                                <DialogDescription>
                                    Details and eligibility status for this family member.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="px-6 pb-6 space-y-6">
                                <div className="flex items-center gap-4 bg-primary/5 p-4 rounded-xl border border-primary/10">
                                    <Avatar className="h-16 w-16 border-2 border-white shadow-sm">
                                        <AvatarFallback className="bg-primary/10 text-primary text-xl">
                                            {selectedProfile.singpassVerification?.name?.[0] ||
                                                selectedProfile.email[0].toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="font-semibold text-lg text-slate-800">
                                            {selectedProfile.singpassVerification?.name ||
                                                selectedProfile.email}
                                        </h3>
                                        <p className="text-sm font-medium text-primary capitalize">
                                            {selectedMemberData?.role.toLowerCase()} •{" "}
                                            {selectedMemberData?.relationship}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {selectedProfile.residencyStatus}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid gap-3">
                                    <Card className={`border shadow-sm border-opacity-50 ${selectedProfile.singpassVerification?.verified ? 'bg-green-50/50 border-green-200' : 'bg-amber-50/50 border-amber-200'}`}>
                                        <CardHeader className="pb-2 pt-4 px-4">
                                            <CardTitle className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                Verification Status
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="px-4 pb-4">
                                            {selectedProfile.singpassVerification?.verified ? (
                                                <div className="flex items-center gap-2 text-sm font-medium text-green-700">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                    <span>
                                                        Singpass Verified on{" "}
                                                        {selectedProfile.singpassVerification.verifiedAt?.toLocaleDateString()}
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-sm font-medium text-amber-600">
                                                    <AlertCircle className="h-4 w-4" />
                                                    <span>Not verified with Singpass</span>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>

                                    <div className="grid grid-cols-2 gap-3">
                                        <Card className="bg-slate-50/50 border shadow-sm border-slate-100">
                                            <CardHeader className="pb-1 pt-4 px-4">
                                                <CardTitle className="text-xs font-medium text-slate-500 uppercase tracking-wider">Properties</CardTitle>
                                            </CardHeader>
                                            <CardContent className="px-4 pb-4">
                                                <p className="text-2xl font-bold text-primary">
                                                    {selectedProfile.buyHistory?.length || 0}
                                                </p>
                                            </CardContent>
                                        </Card>

                                        <Card className="bg-slate-50/50 border shadow-sm border-slate-100">
                                            <CardHeader className="pb-1 pt-4 px-4">
                                                <CardTitle className="text-xs font-medium text-slate-500 uppercase tracking-wider">Contact Info</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-1.5 px-4 pb-4 text-xs">
                                                <div className="flex flex-col">
                                                    <span className="text-muted-foreground">Email:</span>
                                                    <span className="font-medium truncate" title={selectedProfile.email}>{selectedProfile.email}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-muted-foreground">Phone:</span>
                                                    <span className="font-medium">{selectedProfile.phone}</span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
