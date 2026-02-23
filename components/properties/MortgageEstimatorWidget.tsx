'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Calculator } from 'lucide-react';

interface MortgageEstimatorWidgetProps {
  propertyPrice: number;
}

export function MortgageEstimatorWidget({ propertyPrice }: MortgageEstimatorWidgetProps) {
  const [downPayment, setDownPayment] = useState(25); // percentage
  const [loanTenure, setLoanTenure] = useState(25); // years
  const [interestRate, setInterestRate] = useState(3.5); // percentage
  const [monthlyPayment, setMonthlyPayment] = useState(0);

  // Calculate monthly mortgage payment
  useEffect(() => {
    const principal = propertyPrice * (1 - downPayment / 100);
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = loanTenure * 12;

    if (monthlyRate === 0) {
      setMonthlyPayment(principal / numberOfPayments);
    } else {
      const monthly =
        (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
        (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
      setMonthlyPayment(monthly);
    }
  }, [propertyPrice, downPayment, loanTenure, interestRate]);

  const downPaymentAmount = propertyPrice * (downPayment / 100);
  const loanAmount = propertyPrice - downPaymentAmount;
  const totalPayment = monthlyPayment * loanTenure * 12;
  const totalInterest = totalPayment - loanAmount;

  return (
    <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-100">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-emerald-600" />
          <CardTitle className="text-base">Mortgage Estimator</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Monthly Payment Display */}
        <div className="bg-white rounded-lg p-4 border border-emerald-200 text-center">
          <p className="text-xs text-gray-500 font-medium mb-1">Estimated Monthly Payment</p>
          <p className="text-2xl font-extrabold text-emerald-600">
            ${monthlyPayment.toLocaleString('en-SG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
          <p className="text-xs text-gray-400 mt-1">per month for {loanTenure} years</p>
        </div>

        {/* Down Payment Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-xs font-medium">Down Payment</Label>
            <span className="text-xs font-semibold text-emerald-600">{downPayment}%</span>
          </div>
          <Slider
            value={[downPayment]}
            onValueChange={(value) => setDownPayment(value[0])}
            min={5}
            max={80}
            step={5}
            className="py-2"
          />
          <p className="text-xs text-gray-500">
            ${downPaymentAmount.toLocaleString('en-SG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
        </div>

        {/* Loan Tenure Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-xs font-medium">Loan Tenure</Label>
            <span className="text-xs font-semibold text-emerald-600">{loanTenure} years</span>
          </div>
          <Slider
            value={[loanTenure]}
            onValueChange={(value) => setLoanTenure(value[0])}
            min={5}
            max={35}
            step={5}
            className="py-2"
          />
        </div>

        {/* Interest Rate Input */}
        <div className="space-y-1.5">
          <Label htmlFor="interest-rate" className="text-xs font-medium">
            Interest Rate (% p.a.)
          </Label>
          <Input
            id="interest-rate"
            type="number"
            step="0.1"
            min="0.1"
            max="10"
            value={interestRate}
            onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)}
            className="h-9"
          />
        </div>

        {/* Summary */}
        <div className="pt-3 border-t border-gray-100 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Loan Amount</span>
            <span className="font-semibold text-gray-900">
              ${loanAmount.toLocaleString('en-SG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Total Interest</span>
            <span className="font-semibold text-gray-900">
              ${totalInterest.toLocaleString('en-SG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Total Payment</span>
            <span className="font-semibold text-emerald-600">
              ${totalPayment.toLocaleString('en-SG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-gray-400 leading-relaxed">
          * This is an estimate only. Actual loan terms may vary. Consult a financial advisor for accurate calculations.
        </p>
      </CardContent>
    </Card>
  );
}
