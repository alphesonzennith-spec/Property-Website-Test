'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface StampDutyCalculatorSectionProps {
  propertyPrice: number;
}

export function StampDutyCalculatorSection({ propertyPrice }: StampDutyCalculatorSectionProps) {
  const [buyerProfile, setBuyerProfile] = useState<'singaporean-first' | 'singaporean-second' | 'pr-first' | 'foreigner'>('singaporean-first');

  // Calculate BSD (Buyer's Stamp Duty)
  const calculateBSD = (price: number) => {
    let duty = 0;
    if (price > 1500000) {
      duty += (price - 1500000) * 0.06;
      price = 1500000;
    }
    if (price > 1000000) {
      duty += (price - 1000000) * 0.05;
      price = 1000000;
    }
    if (price > 600000) {
      duty += (price - 600000) * 0.04;
      price = 600000;
    }
    if (price > 360000) {
      duty += (price - 360000) * 0.03;
      price = 360000;
    }
    if (price > 180000) {
      duty += (price - 180000) * 0.02;
      price = 180000;
    }
    duty += price * 0.01;
    return duty;
  };

  // Calculate ABSD (Additional Buyer's Stamp Duty)
  const calculateABSD = (price: number, profile: string) => {
    switch (profile) {
      case 'singaporean-first':
        return 0;
      case 'singaporean-second':
        return price * 0.20;
      case 'pr-first':
        return price * 0.05;
      case 'foreigner':
        return price * 0.60;
      default:
        return 0;
    }
  };

  const bsd = calculateBSD(propertyPrice);
  const absd = calculateABSD(propertyPrice, buyerProfile);
  const totalStampDuty = bsd + absd;

  return (
    <div className="space-y-6">
      {/* Buyer Profile Selection */}
      <div className="space-y-2">
        <Label>Buyer Profile</Label>
        <Select value={buyerProfile} onValueChange={(val: any) => setBuyerProfile(val)}>
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="singaporean-first">Singapore Citizen (1st Property)</SelectItem>
            <SelectItem value="singaporean-second">Singapore Citizen (2nd+ Property)</SelectItem>
            <SelectItem value="pr-first">Singapore PR (1st Property)</SelectItem>
            <SelectItem value="foreigner">Foreigner</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results */}
      <Card className="bg-emerald-50 border-emerald-200">
        <CardContent className="p-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Property Price</span>
            <span className="font-semibold">${propertyPrice.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Buyer's Stamp Duty (BSD)</span>
            <span className="font-semibold">${bsd.toLocaleString('en-SG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Additional Buyer's Stamp Duty (ABSD)</span>
            <span className="font-semibold">${absd.toLocaleString('en-SG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
          </div>
          <div className="flex justify-between text-base pt-3 border-t border-emerald-300">
            <span className="font-semibold text-gray-900">Total Stamp Duty</span>
            <span className="font-bold text-emerald-600 text-lg">
              ${totalStampDuty.toLocaleString('en-SG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* ABSD Rates Reference */}
      <Card>
        <CardContent className="p-4">
          <p className="text-xs font-semibold text-gray-700 mb-2">ABSD Rates Reference:</p>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Singapore Citizen (1st property): 0%</li>
            <li>• Singapore Citizen (2nd property): 20%</li>
            <li>• Singapore PR (1st property): 5%</li>
            <li>• Foreigner: 60%</li>
          </ul>
          <p className="text-xs text-gray-500 mt-3">
            Rates are accurate as of 2024. Please verify current rates with IRAS.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
