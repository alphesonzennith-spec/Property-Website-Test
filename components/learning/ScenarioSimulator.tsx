'use client';

import { useState } from 'react';
import { HelpCircle, ChevronRight, AlertCircle, FileText, Calendar } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from 'next/link';

type Residency = 'SC' | 'SPR' | 'Foreigner';
type CurrentProperty = 'None' | 'HDB' | 'Private';
type TargetProperty = 'HDB' | 'Private';

export function ScenarioSimulator() {
    const [residency, setResidency] = useState<Residency | ''>('');
    const [currentProp, setCurrentProp] = useState<CurrentProperty | ''>('');
    const [targetProp, setTargetProp] = useState<TargetProperty | ''>('');

    // Simple hardcoded rule engine for demonstration
    const getResults = () => {
        if (!residency || !currentProp || !targetProp) return null;

        const results = [];

        // ABSD Logic (Simplified 2024 rates)
        if (residency === 'Foreigner') {
            results.push({
                title: 'ABSD Liability',
                icon: <FileText className="h-5 w-5 text-rose-500" />,
                content: 'As a foreigner, you are subject to a 60% Additional Buyer\'s Stamp Duty (ABSD) on any residential property purchase.',
                color: 'border-rose-200 bg-rose-50 text-rose-800'
            });
        } else if (residency === 'SPR' && currentProp !== 'None') {
            results.push({
                title: 'ABSD Liability',
                icon: <FileText className="h-5 w-5 text-amber-500" />,
                content: 'As an SPR buying a second property, you are subject to 30% ABSD.',
                color: 'border-amber-200 bg-amber-50 text-amber-800'
            });
        } else if (residency === 'SC' && currentProp !== 'None') {
            results.push({
                title: 'ABSD Liability',
                icon: <FileText className="h-5 w-5 text-amber-500" />,
                content: 'As a Singapore Citizen buying a second property, you are subject to 20% ABSD. You may apply for remission if you sell your first property within 6 months.',
                color: 'border-amber-200 bg-amber-50 text-amber-800'
            });
        } else {
            results.push({
                title: 'ABSD Liability',
                icon: <FileText className="h-5 w-5 text-emerald-500" />,
                content: residency === 'SC' ? 'No ABSD for your first property purchase.' : '5% ABSD for your first property purchase as an SPR.',
                color: 'border-emerald-200 bg-emerald-50 text-emerald-800'
            });
        }

        // MOP / Wait-out Logic
        if (currentProp === 'Private' && targetProp === 'HDB') {
            results.push({
                title: 'Wait-Out Period',
                icon: <Calendar className="h-5 w-5 text-rose-500" />,
                content: 'You must wait 15 months after selling your private property before you can buy a non-subsidized HDB resale flat (unless you are 55+ buying a 4-room or smaller).',
                color: 'border-rose-200 bg-rose-50 text-rose-800'
            });
        } else if (currentProp === 'HDB' && targetProp === 'Private') {
            results.push({
                title: 'MOP Requirement',
                icon: <AlertCircle className="h-5 w-5 text-amber-500" />,
                content: 'You must have fulfilled your 5-year Minimum Occupation Period (MOP) on your HDB before you can purchase a private property.',
                color: 'border-amber-200 bg-amber-50 text-amber-800'
            });
        }

        return results;
    };

    const results = getResults();

    return (
        <div className="bg-slate-900 rounded-3xl p-8 shadow-xl text-white">
            <div className="flex items-start justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold mb-2 flex items-center">
                        <HelpCircle className="h-6 w-6 mr-3 text-indigo-400" />
                        "What happens if..." Simulator
                    </h2>
                    <p className="text-slate-400 max-w-xl">
                        Select your situation below to see how current regulations affecting ABSD, MOP, and wait-out periods apply to you.
                    </p>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">My Residency Status</label>
                    <Select value={residency} onValueChange={(val: Residency) => setResidency(val)}>
                        <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="SC">Singapore Citizen (SC)</SelectItem>
                            <SelectItem value="SPR">Permanent Resident (SPR)</SelectItem>
                            <SelectItem value="Foreigner">Foreigner</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">I currently own</label>
                    <Select value={currentProp} onValueChange={(val: CurrentProperty) => setCurrentProp(val)}>
                        <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                            <SelectValue placeholder="Select current property" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="None">No property</SelectItem>
                            <SelectItem value="HDB">An HDB flat</SelectItem>
                            <SelectItem value="Private">A Private condo/landed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">I want to buy</label>
                    <Select value={targetProp} onValueChange={(val: TargetProperty) => setTargetProp(val)}>
                        <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                            <SelectValue placeholder="Select target property" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="HDB">An HDB flat</SelectItem>
                            <SelectItem value="Private">A Private condo/landed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {results && results.length > 0 && (
                <div className="mt-8 pt-8 border-t border-slate-800 space-y-4 animate-in fade-in slide-in-from-bottom-4">
                    <h3 className="text-lg font-semibold text-white mb-4">Your Regulatory Snapshot:</h3>
                    {results.map((res, i) => (
                        <Alert key={i} className={`bg-slate-800 border-l-4 border-l-indigo-500 border-y-0 border-r-0 text-white`}>
                            {res.icon}
                            <AlertTitle className="ml-2">{res.title}</AlertTitle>
                            <AlertDescription className="ml-2 text-slate-300 mt-1">
                                {res.content}
                            </AlertDescription>
                        </Alert>
                    ))}

                    <div className="flex justify-end mt-6">
                        <Link
                            href="/calculators"
                            className="inline-flex items-center text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors bg-slate-800 px-4 py-2 rounded-lg"
                        >
                            Go to Calculators for exact figures <ChevronRight className="h-4 w-4 ml-1" />
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
