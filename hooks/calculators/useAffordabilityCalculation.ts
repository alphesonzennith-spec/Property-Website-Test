'use client';

import { useState, useMemo } from 'react';
import { useRegulatoryRates } from '@/hooks/useRegulatoryRates';
import { calculateAffordability } from '@/lib/calculations/affordability';
import type { AffordabilityInput, AffordabilityOutput } from '@/types/calculator';
import { PropertyType, ResidencyStatus } from '@/types';

const DEFAULT_INTEREST_RATE = 3.5; // Update periodically; not in regulatory config (market data)
const DEFAULT_TENURE = 25;
const DEFAULT_AGE = 35;

export function useAffordabilityCalculation() {
    // ── Personal Situation ──────────────────────────────────────────────────────
    const [applicantMode, setApplicantMode] = useState<'single' | 'joint'>('single');
    const [residency, setResidency] = useState<ResidencyStatus>(ResidencyStatus.Singaporean);
    const [age, setAge] = useState<number>(DEFAULT_AGE);
    const [propertiesOwned, setPropertiesOwned] = useState<number>(0);

    // ── Financial Position (Main) ───────────────────────────────────────────────
    const [fixedIncome, setFixedIncome] = useState<number>(0);
    const [variableIncome, setVariableIncome] = useState<number>(0);
    const [cpfOABalance, setCpfOABalance] = useState<number>(0);
    const [cashOnHand, setCashOnHand] = useState<number>(0);
    const [creditCardMin, setCreditCardMin] = useState<number>(0);
    const [carLoan, setCarLoan] = useState<number>(0);
    const [otherHomeLoans, setOtherHomeLoans] = useState<number>(0);
    const [otherLoans, setOtherLoans] = useState<number>(0);

    // ── Financial Position (Joint — only used when applicantMode === 'joint') ───
    const [jointFixedIncome, setJointFixedIncome] = useState<number>(0);
    const [jointVariableIncome, setJointVariableIncome] = useState<number>(0);

    // ── Property Variables ──────────────────────────────────────────────────────
    const [propertyType, setPropertyType] = useState<PropertyType>(PropertyType.HDB);
    const [tenure, setTenure] = useState<number>(DEFAULT_TENURE);
    const [interestRate, setInterestRate] = useState<number>(DEFAULT_INTEREST_RATE);

    // ── Regulatory Rates ────────────────────────────────────────────────────────
    // Fetches the 'borrowing' section (which includes tdsr, msr, and ltv rules)
    const borrowingQuery = useRegulatoryRates('borrowingLimits');
    const ltvQuery = useRegulatoryRates('ltv');
    // hdbEligibility also maps to 'borrowing' — used for MSR note display
    const hdbRatesQuery = useRegulatoryRates('hdbEligibility');

    // Stamp duty section needed for BSD/ABSD in calculation
    const stampDutyQuery = useRegulatoryRates('stampDuty');

    const isLoading =
        borrowingQuery.isLoading ||
        ltvQuery.isLoading ||
        stampDutyQuery.isLoading;

    const error =
        borrowingQuery.error ||
        ltvQuery.error ||
        stampDutyQuery.error;

    // Derived config from fetched rates
    const borrowingConfig = borrowingQuery.data as
        | { tdsr: { limit: number; variableIncomeHaircutPct: number; description: string }; msr: { limit: number; applicablePropertyTypes: PropertyType[]; description: string }; ltv: { rules: import('@/lib/mock/regulatoryConfig').LTVRule[]; description: string } }
        | undefined;
    const stampDutySection = stampDutyQuery.data as
        | import('@/lib/mock/regulatoryConfig').RegulatoryConfig['stampDuty']
        | undefined;

    // ── Computed Results ────────────────────────────────────────────────────────
    const results: AffordabilityOutput | null = useMemo(() => {
        if (!borrowingConfig || !stampDutySection) return null;

        const input: AffordabilityInput = {
            grossMonthlyIncome: fixedIncome,
            variableMonthlyIncome: variableIncome,
            jointFixedIncome: applicantMode === 'joint' ? jointFixedIncome : 0,
            jointVariableIncome: applicantMode === 'joint' ? jointVariableIncome : 0,
            creditCardMinimum: creditCardMin,
            carLoan,
            otherHomeLoans,
            otherLoans,
            cpfOABalance,
            cashOnHand,
            preferredTenureYears: Math.min(tenure, Math.max(5, 65 - age)),
            annualInterestRatePct: interestRate,
            buyerResidencyStatus: residency,
            existingPropertiesOwned: propertiesOwned,
            propertyType,
            buyerAge: age,
            applicantMode,
        };

        try {
            return calculateAffordability(input, {
                ...borrowingConfig,
                stampDuty: stampDutySection,
            });
        } catch {
            return null;
        }
    }, [
        fixedIncome, variableIncome, jointFixedIncome, jointVariableIncome,
        creditCardMin, carLoan, otherHomeLoans, otherLoans,
        cpfOABalance, cashOnHand, tenure, interestRate, residency,
        propertiesOwned, propertyType, age, applicantMode,
        borrowingConfig, stampDutySection,
    ]);

    // Derived display values from fetched config
    const tdsrLimitPct = borrowingConfig ? borrowingConfig.tdsr.limit * 100 : null;
    const msrLimitPct = borrowingConfig ? borrowingConfig.msr.limit * 100 : null;
    const haircutPct = borrowingConfig ? borrowingConfig.tdsr.variableIncomeHaircutPct : 30;
    const effectiveTenure = Math.min(tenure, Math.max(5, 65 - age));

    return {
        // State
        applicantMode, setApplicantMode,
        residency, setResidency,
        age, setAge,
        propertiesOwned, setPropertiesOwned,
        fixedIncome, setFixedIncome,
        variableIncome, setVariableIncome,
        cpfOABalance, setCpfOABalance,
        cashOnHand, setCashOnHand,
        creditCardMin, setCreditCardMin,
        carLoan, setCarLoan,
        otherHomeLoans, setOtherHomeLoans,
        otherLoans, setOtherLoans,
        jointFixedIncome, setJointFixedIncome,
        jointVariableIncome, setJointVariableIncome,
        propertyType, setPropertyType,
        tenure, setTenure,
        interestRate, setInterestRate,

        // Computed
        results,
        effectiveTenure,

        // Config-derived labels (never hardcoded in component)
        tdsrLimitPct,
        msrLimitPct,
        haircutPct,
        borrowingConfig,

        // Fetch state
        isLoading,
        error,
    };
}
