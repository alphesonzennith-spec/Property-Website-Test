'use client';

import { useState, useMemo } from 'react';
import { useRegulatorySection } from '@/hooks/useRegulatoryRates';
import {
    calculateBSD,
    calculateABSD,
    calculateSSD,
} from '@/lib/calculations/stampDuty';
import { ResidencyStatus, PropertyType } from '@/types';

export type TransactionType = 'buy' | 'sell';
export type PurchaseStatus = 'single' | 'joint';

export function useStampDutyCalculation() {
    // Fetch stamp duty config from regulatory section
    const { data: stampDutyConfig, isLoading, error } = useRegulatorySection('stampDuty');

    // ── Inputs ────────────────────────────────────────────────────────────
    const [transactionType, setTransactionType] = useState<TransactionType>('buy');
    const [purchaseStatus, setPurchaseStatus] = useState<PurchaseStatus>('single');
    const [residencyStatus, setResidencyStatus] = useState<ResidencyStatus>(ResidencyStatus.Singaporean);
    const [secondBuyerResidency, setSecondBuyerResidency] = useState<ResidencyStatus>(ResidencyStatus.Singaporean);
    const [existingPropertiesOwned, setExistingPropertiesOwned] = useState<number>(0);
    const [purchasePrice, setPurchasePrice] = useState<number>(0);
    const [originalPurchaseDate, setOriginalPurchaseDate] = useState<string>('');
    const [propertyType, setPropertyType] = useState<PropertyType>(PropertyType.Condo);

    // ── Derived: holding period in months (for SSD) ───────────────────────
    const holdingPeriodMonths = useMemo(() => {
        if (transactionType !== 'sell' || !originalPurchaseDate) return undefined;
        const purchaseMs = new Date(originalPurchaseDate).getTime();
        const nowMs = new Date().getTime();
        if (isNaN(purchaseMs)) return undefined;
        return Math.floor((nowMs - purchaseMs) / (1000 * 60 * 60 * 24 * 30.44));
    }, [transactionType, originalPurchaseDate]);

    // ── BSD ───────────────────────────────────────────────────────────────
    const bsdResult = useMemo(() => {
        if (!stampDutyConfig || !('bsd' in stampDutyConfig) || purchasePrice <= 0) {
            return { amount: 0, breakdown: [] };
        }
        return calculateBSD(purchasePrice, stampDutyConfig.bsd.tiers);
    }, [stampDutyConfig, purchasePrice]);

    // ── ABSD ──────────────────────────────────────────────────────────────
    const absdResult = useMemo(() => {
        if (!stampDutyConfig || !('absd' in stampDutyConfig) || purchasePrice <= 0) {
            return { applicableRate: 0, amount: 0, rationale: '' };
        }
        // For joint purchase, worst-case buyer residency drives the higher ABSD
        const effectiveResidency =
            purchaseStatus === 'joint' &&
                secondBuyerResidency === ResidencyStatus.Foreigner
                ? ResidencyStatus.Foreigner
                : purchaseStatus === 'joint' &&
                    secondBuyerResidency === ResidencyStatus.PR &&
                    residencyStatus === ResidencyStatus.Singaporean
                    ? ResidencyStatus.PR
                    : residencyStatus;

        return calculateABSD(
            {
                purchasePrice,
                buyerResidencyStatus: effectiveResidency,
                propertyType,
                existingPropertiesOwned,
                isBuyingUnderEntity: false,
            },
            stampDutyConfig.absd.rates
        );
    }, [
        stampDutyConfig,
        purchasePrice,
        residencyStatus,
        secondBuyerResidency,
        purchaseStatus,
        propertyType,
        existingPropertiesOwned,
    ]);

    // ── SSD ───────────────────────────────────────────────────────────────
    const ssdResult = useMemo(() => {
        if (
            transactionType !== 'sell' ||
            !stampDutyConfig ||
            !('ssd' in stampDutyConfig) ||
            holdingPeriodMonths === undefined ||
            purchasePrice <= 0
        ) {
            return { amount: 0, rate: 0, isExempt: true };
        }
        return calculateSSD(
            purchasePrice,
            holdingPeriodMonths,
            stampDutyConfig.ssd.tiers,
            stampDutyConfig.ssd.exemptionThresholdMonths
        );
    }, [stampDutyConfig, purchasePrice, transactionType, holdingPeriodMonths]);

    // ── Totals ────────────────────────────────────────────────────────────
    const totalStampDuty = bsdResult.amount + absdResult.amount + ssdResult.amount;

    // ── What-if comparison (SC / PR / Foreigner at current price) ────────
    const whatIfResults = useMemo(() => {
        if (!stampDutyConfig || !('absd' in stampDutyConfig) || purchasePrice <= 0) return null;

        const statuses = [
            { key: 'SC', status: ResidencyStatus.Singaporean, label: 'Singaporean Citizen' },
            { key: 'PR', status: ResidencyStatus.PR, label: 'Permanent Resident' },
            { key: 'FR', status: ResidencyStatus.Foreigner, label: 'Foreigner' },
        ];

        return statuses.map(({ key, status, label }) => {
            const bsd = calculateBSD(purchasePrice, stampDutyConfig.bsd.tiers);
            const absd = calculateABSD(
                {
                    purchasePrice,
                    buyerResidencyStatus: status,
                    propertyType,
                    existingPropertiesOwned,
                    isBuyingUnderEntity: false,
                },
                stampDutyConfig.absd.rates
            );
            return {
                key,
                label,
                bsd: bsd.amount,
                absd: absd.amount,
                absdRate: absd.applicableRate,
                total: bsd.amount + absd.amount,
            };
        });
    }, [stampDutyConfig, purchasePrice, propertyType, existingPropertiesOwned]);

    // ── Config metadata ───────────────────────────────────────────────────
    const effectiveDate = stampDutyConfig && 'effectiveDate' in stampDutyConfig
        ? (stampDutyConfig as any).effectiveDate
        : null;

    return {
        // State
        transactionType, setTransactionType,
        purchaseStatus, setPurchaseStatus,
        residencyStatus, setResidencyStatus,
        secondBuyerResidency, setSecondBuyerResidency,
        existingPropertiesOwned, setExistingPropertiesOwned,
        purchasePrice, setPurchasePrice,
        originalPurchaseDate, setOriginalPurchaseDate,
        propertyType, setPropertyType,

        // Computed
        bsdResult,
        absdResult,
        ssdResult,
        holdingPeriodMonths,
        totalStampDuty,
        whatIfResults,

        // Config / loading
        isLoading,
        error,
        stampDutyConfig,
        effectiveDate,
    };
}
