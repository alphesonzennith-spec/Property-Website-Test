import type { PropertyTaxTier } from '@/lib/mock/regulatoryConfig';

// ── Property Tax Calculation (Progressive Tiers) ───────────────────────────

export function calculatePropertyTax(
  annualValue: number,
  isOwnerOccupied: boolean,
  taxTiers: PropertyTaxTier[]
): { annualTax: number; breakdown: Array<{ tier: string; amount: number }> } {
  let remainingValue = annualValue;
  let totalTax = 0;
  const breakdown: Array<{ tier: string; amount: number }> = [];

  for (const tier of taxTiers) {
    if (remainingValue <= 0) break;

    const tierMax = tier.annualValueMax ?? Infinity;
    const tierMin = tier.annualValueMin;
    const tierRange = tierMax - tierMin;
    const applicableValue = Math.min(remainingValue, tierRange);

    const rate = isOwnerOccupied ? tier.ownerOccupiedRate : tier.nonOwnerOccupiedRate;
    const tierTax = applicableValue * rate;
    totalTax += tierTax;

    breakdown.push({
      tier: tier.label,
      amount: tierTax,
    });

    remainingValue -= applicableValue;
  }

  return { annualTax: totalTax, breakdown };
}
