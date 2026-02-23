"use client";

import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Info } from "lucide-react";
import { calculateQualityScore } from "@/lib/utils/listing-score";

interface ListingQualityMeterProps {
    draft: any;
}

export function ListingQualityMeter({ draft }: ListingQualityMeterProps) {
    const [score, setScore] = useState(0);

    useEffect(() => {
        setScore(calculateQualityScore(draft));
    }, [draft]);

    const getColor = (s: number) => {
        if (s < 60) return "bg-red-500";
        if (s < 80) return "bg-amber-500";
        return "bg-green-500";
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-gray-900">Listing Quality Score</h3>
                <span className={`text-xl font-bold ${score < 60 ? 'text-red-600' : score < 80 ? 'text-amber-600' : 'text-green-600'}`}>
                    {score}/100
                </span>
            </div>

            <Progress value={score} className={`h-2.5 mb-4 ${getColor(score)}`} />

            {score < 60 && (
                <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 p-2.5 rounded-md mb-4">
                    <Info className="h-4 w-4 shrink-0 mt-0.5" />
                    <p>Listings below 60 may have lower visibility. Try adding more photos or a floor plan.</p>
                </div>
            )}

            <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                    <span className="flex items-center gap-2">
                        <span className={`h-1.5 w-1.5 rounded-full ${draft.photos?.length >= 4 ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                        Photos (4+)
                    </span>
                    <span>+20</span>
                </div>
                <div className="flex justify-between text-gray-600">
                    <span className="flex items-center gap-2">
                        <span className={`h-1.5 w-1.5 rounded-full ${draft.floorPlanUrl ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                        Floor Plan
                    </span>
                    <span>+15</span>
                </div>
                <div className="flex justify-between text-gray-600">
                    <span className="flex items-center gap-2">
                        <span className={`h-1.5 w-1.5 rounded-full ${draft.description?.length > 50 ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                        Complete Description
                    </span>
                    <span>+20</span>
                </div>
                <div className="flex justify-between text-gray-600">
                    <span className="flex items-center gap-2">
                        <span className={`h-1.5 w-1.5 rounded-full ${['propertyType', 'price', 'bedrooms', 'bathrooms', 'size'].every(f => !!draft[f]) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                        All Basic Fields
                    </span>
                    <span>+20</span>
                </div>
                <div className="flex justify-between text-gray-600">
                    <span className="flex items-center gap-2">
                        <span className={`h-1.5 w-1.5 rounded-full ${draft.virtualTourUrl ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                        Virtual Tour
                    </span>
                    <span>+10</span>
                </div>
                <div className="flex justify-between text-gray-600">
                    <span className="flex items-center gap-2">
                        <span className={`h-1.5 w-1.5 rounded-full ${draft.isVerified ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                        Verified Owner/Agent
                    </span>
                    <span>+15</span>
                </div>
            </div>
        </div>
    );
}
