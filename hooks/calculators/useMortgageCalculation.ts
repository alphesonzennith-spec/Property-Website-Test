'use client';

import { useState, useMemo } from 'react';
import {
    calculateMonthlyRepayment,
    calculateAmortizationSchedule,
    calculateMortgageSummary,
} from '@/lib/calculations/mortgage';
import type { AmortizationEntry } from '@/types/calculator';

// RATE: Update this default periodically or fetch from bank API.
// This is the ONE exception — live interest rates are market data, not regulation.
// As of early 2026, average Singapore bank home loan rates are ~3.0-3.5%.
export const DEFAULT_INTEREST_RATE = 3.25;

export type LoanInputMode = 'percentage' | 'fixed';

export interface RateComparisonCard {
    label: string;
    rate: number;
    monthlyRepayment: number;
    totalInterest: number;
}

export type AmortizationEntryWithCumulative = AmortizationEntry & {
    cumulativeInterest: number;
};

export function useMortgageCalculation() {
    // ── Inputs ──────────────────────────────────────────────────────────────
    const [propertyValue, setPropertyValue] = useState<number>(0);
    const [loanInputMode, setLoanInputMode] = useState<LoanInputMode>('percentage');
    const [loanPercentage, setLoanPercentage] = useState<number>(75); // default 75% LTV
    const [loanFixed, setLoanFixed] = useState<number>(0);
    const [tenureYears, setTenureYears] = useState<number>(25);
    const [interestRate, setInterestRate] = useState<number>(DEFAULT_INTEREST_RATE);
    const [startDate, setStartDate] = useState<Date>(() => {
        const d = new Date();
        d.setDate(1); // first of current month
        return d;
    });
    // Optional: borrower age for tenure cap note
    const [borrowerAge, setBorrowerAge] = useState<number | null>(null);

    // ── Derived loan amount ─────────────────────────────────────────────────
    const loanAmount = useMemo(() => {
        if (loanInputMode === 'percentage') {
            return Math.round((propertyValue * loanPercentage) / 100);
        }
        return loanFixed;
    }, [loanInputMode, propertyValue, loanPercentage, loanFixed]);

    // ── Sync: when toggling mode, recalculate the other field ──────────────
    function handleLoanPercentageChange(pct: number) {
        setLoanPercentage(pct);
        setLoanFixed(Math.round((propertyValue * pct) / 100));
    }

    function handleLoanFixedChange(amount: number) {
        setLoanFixed(amount);
        if (propertyValue > 0) {
            setLoanPercentage(Math.round((amount / propertyValue) * 100 * 100) / 100);
        }
    }

    function handlePropertyValueChange(value: number) {
        setPropertyValue(value);
        // keep percentage mode in sync → recalculate fixed amount
        if (loanInputMode === 'percentage') {
            setLoanFixed(Math.round((value * loanPercentage) / 100));
        } else {
            // fixed mode → recalculate percentage
            if (value > 0) {
                setLoanPercentage(Math.round((loanFixed / value) * 100 * 100) / 100);
            }
        }
    }

    // ── Max tenure note ─────────────────────────────────────────────────────
    const maxTenure = useMemo(() => {
        if (borrowerAge !== null && borrowerAge > 0) {
            return Math.min(30, 65 - borrowerAge);
        }
        return 30;
    }, [borrowerAge]);

    // ── Summary ─────────────────────────────────────────────────────────────
    const summary = useMemo(() => {
        if (loanAmount <= 0 || interestRate <= 0 || tenureYears <= 0) return null;
        return calculateMortgageSummary(loanAmount, interestRate, tenureYears, startDate);
    }, [loanAmount, interestRate, tenureYears, startDate]);

    // ── Amortization schedule ────────────────────────────────────────────────
    const schedule = useMemo<AmortizationEntryWithCumulative[]>(() => {
        if (loanAmount <= 0 || interestRate <= 0 || tenureYears <= 0) return [];
        return calculateAmortizationSchedule(loanAmount, interestRate, tenureYears);
    }, [loanAmount, interestRate, tenureYears]);

    // ── Chart data: yearly aggregated for AreaChart ──────────────────────────
    const chartData = useMemo(() => {
        if (schedule.length === 0) return [];
        const yearlyData: { year: number; balance: number; cumulativeInterest: number }[] = [];
        // Include year 0 (starting point)
        yearlyData.push({ year: 0, balance: loanAmount, cumulativeInterest: 0 });
        for (let y = 1; y <= tenureYears; y++) {
            const monthIdx = y * 12 - 1;
            const entry = schedule[Math.min(monthIdx, schedule.length - 1)];
            if (entry) {
                yearlyData.push({
                    year: y,
                    balance: Math.round(entry.remainingBalance),
                    cumulativeInterest: Math.round(entry.cumulativeInterest),
                });
            }
        }
        return yearlyData;
    }, [schedule, tenureYears, loanAmount]);

    // ── Rate comparison panel ────────────────────────────────────────────────
    const rateComparison = useMemo<RateComparisonCard[]>(() => {
        if (loanAmount <= 0 || tenureYears <= 0) return [];
        const deltas = [-0.5, 0, 0.5];
        return deltas.map((delta) => {
            const rate = Math.max(0.01, interestRate + delta);
            const monthly = calculateMonthlyRepayment(loanAmount, rate, tenureYears);
            const totalInterest = monthly * tenureYears * 12 - loanAmount;
            return {
                label: delta === 0 ? 'Base Rate' : delta > 0 ? `Base Rate +${delta}%` : `Base Rate ${delta}%`,
                rate,
                monthlyRepayment: monthly,
                totalInterest,
            };
        });
    }, [loanAmount, interestRate, tenureYears]);

    return {
        // Input state
        propertyValue,
        setPropertyValue: handlePropertyValueChange,
        loanInputMode,
        setLoanInputMode,
        loanPercentage,
        setLoanPercentage: handleLoanPercentageChange,
        loanFixed,
        setLoanFixed: handleLoanFixedChange,
        loanAmount,
        tenureYears,
        setTenureYears,
        interestRate,
        setInterestRate,
        startDate,
        setStartDate,
        borrowerAge,
        setBorrowerAge,

        // Derived
        maxTenure,
        summary,
        schedule,
        chartData,
        rateComparison,
    };
}
