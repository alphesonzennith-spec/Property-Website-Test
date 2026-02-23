import type {
  StampDutyInput,
  StampDutyOutput,
  ABSDCalculation,
} from '@/types/calculator';
import type {
  BSDTier,
  ABSDRate,
  SSDTier,
} from '@/lib/mock/regulatoryConfig';

// ── Helper: Calculate Progressive Tier Amount ──────────────────────────────

function calculateProgressiveTiers(
  baseAmount: number,
  tiers: BSDTier[]
): { total: number; breakdown: Array<{ tier: string; rate: number; amount: number }> } {
  let remaining = baseAmount;
  let total = 0;
  const breakdown: Array<{ tier: string; rate: number; amount: number }> = [];

  for (const tier of tiers) {
    if (remaining <= 0) break;

    const tierMax = tier.maxValue ?? Infinity;
    const tierMin = tier.minValue;
    const tierRange = tierMax - tierMin;
    const applicableAmount = Math.min(remaining, tierRange);

    const tierDuty = applicableAmount * tier.rate;
    total += tierDuty;

    breakdown.push({
      tier: tier.label,
      rate: tier.rate,
      amount: tierDuty,
    });

    remaining -= applicableAmount;
  }

  return { total, breakdown };
}

// ── BSD Calculation ─────────────────────────────────────────────────────────

export function calculateBSD(
  purchasePrice: number,
  bsdTiers: BSDTier[]
): { amount: number; breakdown: Array<{ tier: string; rate: number; amount: number }> } {
  const result = calculateProgressiveTiers(purchasePrice, bsdTiers);

  return {
    amount: result.total,
    breakdown: result.breakdown,
  };
}

// ── ABSD Calculation ────────────────────────────────────────────────────────

export function calculateABSD(
  input: Pick<
    StampDutyInput,
    | 'purchasePrice'
    | 'buyerResidencyStatus'
    | 'propertyType'
    | 'existingPropertiesOwned'
    | 'isBuyingUnderEntity'
  >,
  absdRates: ABSDRate[]
): ABSDCalculation {
  // Entity purchases always face maximum ABSD (65%)
  if (input.isBuyingUnderEntity) {
    return {
      applicableRate: 0.65,
      amount: input.purchasePrice * 0.65,
      rationale: 'Entity purchases (trust, company) face 65% ABSD',
    };
  }

  // Find matching rate based on residency, property type, and existing properties
  const matchingRate = absdRates.find(
    (r) =>
      r.residencyStatus === input.buyerResidencyStatus &&
      r.propertyType === input.propertyType &&
      r.existingProperties === input.existingPropertiesOwned
  );

  if (!matchingRate) {
    // Fallback: if no exact match, apply highest tier for that residency status
    const fallback = absdRates
      .filter((r) => r.residencyStatus === input.buyerResidencyStatus)
      .sort((a, b) => b.existingProperties - a.existingProperties)[0];

    if (fallback) {
      return {
        applicableRate: fallback.rate,
        amount: input.purchasePrice * fallback.rate,
        rationale: `${fallback.rationale} (fallback for ${input.existingPropertiesOwned}+ properties)`,
      };
    }

    // Ultimate fallback (shouldn't happen with complete config)
    return {
      applicableRate: 0,
      amount: 0,
      rationale: 'No ABSD rate found for this scenario',
    };
  }

  return {
    applicableRate: matchingRate.rate,
    amount: input.purchasePrice * matchingRate.rate,
    rationale: matchingRate.rationale,
  };
}

// ── SSD Calculation ─────────────────────────────────────────────────────────

export function calculateSSD(
  salePrice: number,
  holdingPeriodMonths: number,
  ssdTiers: SSDTier[],
  exemptionThresholdMonths: number
): { amount: number; rate: number; isExempt: boolean } {
  // Exempt if held beyond threshold (typically 36 months)
  if (holdingPeriodMonths >= exemptionThresholdMonths) {
    return { amount: 0, rate: 0, isExempt: true };
  }

  // Find applicable tier based on holding period
  const applicableTier = ssdTiers.find(
    (t) =>
      holdingPeriodMonths >= t.minMonths &&
      (t.maxMonths === null || holdingPeriodMonths < t.maxMonths)
  );

  if (!applicableTier) {
    return { amount: 0, rate: 0, isExempt: true };
  }

  return {
    amount: salePrice * applicableTier.rate,
    rate: applicableTier.rate,
    isExempt: false,
  };
}

// ── Master Stamp Duty Function ─────────────────────────────────────────────

export function calculateStampDuty(
  input: StampDutyInput,
  config: {
    bsdTiers: BSDTier[];
    absdRates: ABSDRate[];
    ssdTiers: SSDTier[];
    ssdExemptionMonths: number;
  }
): StampDutyOutput {
  // Calculate BSD (always applies)
  const bsd = calculateBSD(input.purchasePrice, config.bsdTiers);

  // Calculate ABSD (depends on residency, property type, existing properties)
  const absd = calculateABSD(input, config.absdRates);

  // Calculate SSD (only if holdingPeriodMonths is provided)
  const ssd =
    input.holdingPeriodMonths !== undefined
      ? calculateSSD(
          input.purchasePrice,
          input.holdingPeriodMonths,
          config.ssdTiers,
          config.ssdExemptionMonths
        )
      : { amount: 0, rate: 0, isExempt: true };

  return {
    bsd: bsd.amount,
    absd,
    ssd: ssd.amount,
    totalStampDuty: bsd.amount + absd.amount + ssd.amount,
    breakdown: {
      bsdBreakdown: bsd.breakdown,
      absdRate: absd.applicableRate,
      ssdRate: ssd.rate,
    },
  };
}
