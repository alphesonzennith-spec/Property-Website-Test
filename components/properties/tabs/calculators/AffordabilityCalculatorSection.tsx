'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

interface AffordabilityCalculatorSectionProps {
  propertyPrice: number;
}

export function AffordabilityCalculatorSection({ propertyPrice }: AffordabilityCalculatorSectionProps) {
  const [monthlyIncome, setMonthlyIncome] = useState(10000);
  const [monthlyDebt, setMonthlyDebt] = useState(0);
  const [savings, setSavings] = useState(300000);
  const [interestRate, setInterestRate] = useState(3.5);

  const [maxAffordable, setMaxAffordable] = useState(0);
  const [canAfford, setCanAfford] = useState(false);

  useEffect(() => {
    // Calculate max affordable based on TDSR 55%
    const maxMonthlyPayment = monthlyIncome * 0.55 - monthlyDebt;

    // Calculate max loan based on monthly payment (25 years)
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = 25 * 12;

    let maxLoan = 0;
    if (monthlyRate === 0) {
      maxLoan = maxMonthlyPayment * numberOfPayments;
    } else {
      maxLoan =
        (maxMonthlyPayment * (Math.pow(1 + monthlyRate, numberOfPayments) - 1)) /
        (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments));
    }

    // Add down payment (assume 25% minimum)
    const downPayment = savings * 0.75; // Reserve 25% for fees and buffer
    const affordable = maxLoan + downPayment;

    setMaxAffordable(affordable);
    setCanAfford(affordable >= propertyPrice);
  }, [monthlyIncome, monthlyDebt, savings, interestRate, propertyPrice]);

  const requiredDownPayment = propertyPrice * 0.25; // 25% down payment
  const hasEnoughSavings = savings >= requiredDownPayment * 1.1; // 10% buffer for fees

  return (
    <div className="space-y-6">
      {/* Affordability Result */}
      <Alert className={canAfford ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}>
        {canAfford ? (
          <CheckCircle className="h-5 w-5 text-emerald-600" />
        ) : (
          <Info className="h-5 w-5 text-amber-600" />
        )}
        <AlertDescription className="ml-2">
          <p className={`font-semibold ${canAfford ? 'text-emerald-900' : 'text-amber-900'}`}>
            {canAfford
              ? `✓ You can afford this property!`
              : `Based on your inputs, this property may be beyond your budget.`}
          </p>
          <p className={`text-sm mt-1 ${canAfford ? 'text-emerald-700' : 'text-amber-700'}`}>
            Max affordable: ${maxAffordable.toLocaleString('en-SG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
        </AlertDescription>
      </Alert>

      {/* Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="aff-income">Monthly Gross Income (SGD)</Label>
          <Input
            id="aff-income"
            type="number"
            value={monthlyIncome}
            onChange={(e) => setMonthlyIncome(Number(e.target.value))}
            className="h-9"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="aff-debt">Monthly Debt Obligations (SGD)</Label>
          <Input
            id="aff-debt"
            type="number"
            value={monthlyDebt}
            onChange={(e) => setMonthlyDebt(Number(e.target.value))}
            className="h-9"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="aff-savings">Available Savings (SGD)</Label>
          <Input
            id="aff-savings"
            type="number"
            value={savings}
            onChange={(e) => setSavings(Number(e.target.value))}
            className="h-9"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="aff-rate">Expected Interest Rate (% p.a.)</Label>
          <Input
            id="aff-rate"
            type="number"
            step="0.1"
            value={interestRate}
            onChange={(e) => setInterestRate(Number(e.target.value))}
            className="h-9"
          />
        </div>
      </div>

      {/* Summary */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Property Price</span>
            <span className="font-semibold">${propertyPrice.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Required Down Payment (25%)</span>
            <span className="font-semibold">${requiredDownPayment.toLocaleString('en-SG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Your Available Savings</span>
            <span className={`font-semibold ${hasEnoughSavings ? 'text-emerald-600' : 'text-red-600'}`}>
              ${savings.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-sm pt-3 border-t">
            <span className="text-gray-600 font-medium">Max Affordable Property</span>
            <span className="font-bold text-emerald-600">
              ${maxAffordable.toLocaleString('en-SG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Savings Check */}
      {!hasEnoughSavings && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <AlertDescription className="ml-2">
            <p className="font-semibold text-red-900">Insufficient Savings</p>
            <p className="text-sm text-red-700 mt-1">
              You need at least ${(requiredDownPayment * 1.1).toLocaleString('en-SG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} for down payment and fees.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* Assumptions */}
      <Card>
        <CardContent className="p-4">
          <p className="text-xs font-semibold text-gray-700 mb-2">Assumptions:</p>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• 25% down payment required</li>
            <li>• 25-year loan tenure</li>
            <li>• TDSR capped at 55%</li>
            <li>• 10% buffer reserved for fees and stamp duty</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
