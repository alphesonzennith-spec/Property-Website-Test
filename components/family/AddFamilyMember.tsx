"use client";

import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, UserPlus, Send, ShieldCheck } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { FamilyRole } from "@/types";

export function AddFamilyMember() {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [email, setEmail] = useState("");
    const [role, setRole] = useState<string>("");

    const handleSendInvite = () => {
        // In a real app, this would trigger an API call to send the invite
        setStep(2);
        // Simulate member accepting (Step 3 in UI flow represented here as confirmation)
        setTimeout(() => {
            setStep(3);
        }, 1500);
    };

    const handleConfirm = () => {
        // In a real app, this would finalize the addition to the family group
        setOpen(false);
        setTimeout(() => {
            setStep(1);
            setEmail("");
            setRole("");
        }, 300); // reset after closing animation
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <UserPlus className="h-4 w-4" />
                    Add Family Member
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Family Member</DialogTitle>
                    <DialogDescription>
                        Invite a family member to join your group. They must verify via
                        Singpass to be successfully added.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    {step === 1 && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email or Phone Number</Label>
                                <Input
                                    id="email"
                                    placeholder="Enter email or phone..."
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div className="bg-primary/5 p-4 rounded-lg flex gap-3 text-sm text-primary">
                                <ShieldCheck className="h-5 w-5 shrink-0" />
                                <p>
                                    For multi-generational planning, all invited members must
                                    authenticate via Singpass to prove identity and property
                                    ownership.
                                </p>
                            </div>
                            <Button
                                className="w-full gap-2"
                                disabled={!email}
                                onClick={handleSendInvite}
                            >
                                Send Invitation <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                                <Send className="h-6 w-6 text-primary" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-semibold text-lg">Invitation Sent!</h3>
                                <p className="text-sm text-muted-foreground">
                                    Waiting for {email} to accept and verify their Singpass...
                                </p>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-3 bg-green-50 text-green-700 rounded-lg border border-green-200">
                                <CheckCircle2 className="h-5 w-5 shrink-0" />
                                <p className="text-sm font-medium">
                                    {email} has accepted and completed Singpass verification!
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="role">Confirm Relationship</Label>
                                <Select value={role} onValueChange={setRole}>
                                    <SelectTrigger id="role">
                                        <SelectValue placeholder="Select relationship..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={FamilyRole.Spouse}>Spouse</SelectItem>
                                        <SelectItem value={FamilyRole.Child}>Child</SelectItem>
                                        <SelectItem value={FamilyRole.Parent}>Parent</SelectItem>
                                        <SelectItem value={FamilyRole.Sibling}>Sibling</SelectItem>
                                        <SelectItem value={FamilyRole.Other}>Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button
                                className="w-full"
                                onClick={handleConfirm}
                                disabled={!role}
                            >
                                Confirm & Link Accounts
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
