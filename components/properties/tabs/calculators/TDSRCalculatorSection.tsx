'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface TDSRCalculatorSectionProps {
  propertyPrice: number;
}

export function TDSRCalculatorSection({ propertyPrice }: TDSRCalculatorSectionProps) {
  const [monthlyIncome, setMonthlyIncome] = useState(10000);
  const [monthlyDebt, setMonthlyDebt] = useState(0);
  const [downPayment, setDownPayment] = useState(25);
  const [interestRate, setInterestRate] = useState(3.5);
  const [loanTenure, setLoanTenure] = useState(25);

  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [tdsr, setTdsr] = useState(0);
  const [eligible, setEligible] = useState(false);

  useEffect(() => {
    const principal = propertyPrice * (1 - downPayment / 100);
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = loanTenure * 12;

    let monthly = 0;
    if (monthlyRate === 0) {
      monthly = principal / numberOfPayments;
    } else {
      monthly =
        (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
        (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    }

    setMonthlyPayment(monthly);

    const totalDebt = monthly + monthlyDebt;
    const tdsrValue = (totalDebt / monthlyIncome) * 100;
    setTdsr(tdsrValue);
    setEligible(tdsrValue <= 55);
  }, [propertyPrice, monthlyIncome, monthlyDebt, downPayment, interestRate, loanTenure]);

  return (
    <div className="space-y-6">
      {/* Result */}
      <Alert className={eligible ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}>
        {eligible ? (
          <CheckCircle className="h-5 w-5 text-emerald-600" />
        ) : (
          <AlertCircle className="h-5 w-5 text-red-600" />
        )}
        <AlertDescription className="ml-2">
          <p className={`font-semibold ${eligible ? 'text-emerald-900' : 'text-red-900'}`}>
            TDSR: {tdsr.toFixed(1)}% {eligible ? '✓ Eligible' : '✗ Not Eligible'}
          </p>
          <p className={`text-sm mt-1 ${eligible ? 'text-emerald-700' : 'text-red-700'}`}>
            {eligible
              ? 'You are within the 55% TDSR limit and may qualify for this loan.'
              : 'You exceed the 55% TDSR limit. Consider increasing your down payment or reducing debt.'}
          </p>
        </AlertDescription>
      </Alert>

      {/* Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="income">Monthly Gross Income (SGD)</Label>
          <Input
            id="income"
            type="number"
            value={monthlyIncome}
            onChange={(e) => setMonthlyIncome(Number(e.target.value))}
            className="h-9"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="debt">Monthly Debt Obligations (SGD)</Label>
          <Input
            id="debt"
            type="number"
            value={monthlyDebt}
            onChange={(e) => setMonthlyDebt(Number(e.target.value))}
            className="h-9"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="down">Down Payment (%)</Label>
          <Input
            id="down"
            type="number"
            min="5"
            max="80"
            value={downPayment}
            onChange={(e) => setDownPayment(Number(e.target.value))}
            className="h-9"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="rate">Interest Rate (% p.a.)</Label>
          <Input
            id="rate"
            type="number"
            step="0.1"
            value={interestRate}
            onChange={(e) => setInterestRate(Number(e.target.value))}
            className="h-9"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="tenure">Loan Tenure (years)</Label>
          <Input
            id="tenure"
            type="number"
            min="5"
            max="35"
            value={loanTenure}
            onChange={(e) => setLoanTenure(Number(e.target.value))}
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
            <span className="text-gray-600">Monthly Mortgage Payment</span>
            <span className="font-semibold">${monthlyPayment.toLocaleString('en-SG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total Monthly Debt</span>
            <span className="font-semibold">${(monthlyPayment + monthlyDebt).toLocaleString('en-SG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
          </div>
          <div className="flex justify-between text-sm pt-3 border-t">
            <span className="text-gray-600 font-medium">TDSR Ratio</span>
            <span className={`font-bold ${eligible ? 'text-emerald-600' : 'text-red-600'}`}>
              {tdsr.toFixed(1)}%
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
