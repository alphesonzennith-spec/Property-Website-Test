import type { TotalCostOwnershipInput, TotalCostOwnershipOutput } from '@/types/calculator';
import { calculateStampDuty } from './stampDuty';
import { calculateMortgage } from './mortgage';
import type { BSDTier, ABSDRate, SSDTier } from '@/lib/mock/regulatoryConfig';

// ── Total Cost of Ownership Calculation ────────────────────────────────────

export function calculateTotalCostOfOwnership(
  input: TotalCostOwnershipInput,
  config: {
    bsdTiers: BSDTier[];
    absdRates: ABSDRate[];
    ssdTiers: SSDTier[];
    ssdExemptionMonths: number;
    legalConveyancingFeesPct: number;
  }
): TotalCostOwnershipOutput {
  // 1. Calculate stamp duty
  const stampDuty = calculateStampDuty(
    {
      purchasePrice: input.purchasePrice,
      buyerResidencyStatus: input.buyerResidencyStatus,
      propertyType: input.propertyType,
      existingPropertiesOwned: input.existingPropertiesOwned,
      isBuyingUnderEntity: false,
    },
    config
  );

  // 2. Calculate mortgage details
  const mortgage = calculateMortgage({
    loanAmount: input.loanAmount,
    annualInterestRatePct: input.annualInterestRatePct,
    loanTenureYears: input.loanTenureYears,
    loanType: 'bank', // Defaulting to bank loan for TCO
  });

  // 3. Calculate property tax over holding period
  const totalPropertyTax = input.annualPropertyTax * input.holdingPeriodYears;

  // 4. Calculate maintenance fees over holding period
  const totalMaintenanceFees = input.annualMaintenanceFees * input.holdingPeriodYears;

  // 5. Calculate legal and conveyancing fees
  const legalAndConveyancingFees = input.purchasePrice * config.legalConveyancingFeesPct;

  // 6. Calculate grand total cost
  const grandTotalCost =
    input.purchasePrice +
    stampDuty.totalStampDuty +
    mortgage.totalInterestPaid +
    totalPropertyTax +
    totalMaintenanceFees +
    legalAndConveyancingFees;

  // 7. Project sale price with appreciation
  const projectedSalePrice =
    input.purchasePrice *
    Math.pow(1 + input.expectedAppreciationPct / 100, input.holdingPeriodYears);

  // 8. Calculate net gain/loss
  const netGainLoss = projectedSalePrice - grandTotalCost;

  // 9. Calculate annualized return percentage
  const annualisedReturnPct =
    (Math.pow(projectedSalePrice / grandTotalCost, 1 / input.holdingPeriodYears) - 1) * 100;

  return {
    purchasePrice: input.purchasePrice,
    stampDuty: stampDuty.totalStampDuty,
    totalMortgageRepayment: mortgage.totalRepayment,
    totalInterestPaid: mortgage.totalInterestPaid,
    totalPropertyTax,
    totalMaintenanceFees,
    legalAndConveyancingFees,
    grandTotalCost,
    projectedSalePrice,
    netGainLoss,
    annualisedReturnPct,
  };
}
