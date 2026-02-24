import type { TotalCostOwnershipInput, TotalCostOwnershipOutput } from '@/types/calculator';
import { PropertyType } from '@/types';
import { calculateStampDuty } from './stampDuty';
import { calculateMortgage } from './mortgage';
import { calculatePropertyTax } from './propertyTax';
import type {
  BSDTier,
  ABSDRate,
  SSDTier,
  PropertyTaxTier,
  MaintenanceFees,
} from '@/lib/mock/regulatoryConfig';

// ── Config passed from the page via tRPC/query ────────────────────────────────

export interface TCOConfig {
  bsdTiers: BSDTier[];
  absdRates: ABSDRate[];
  ssdTiers: SSDTier[];
  ssdExemptionMonths: number;
  ownerOccupiedTaxTiers: PropertyTaxTier[];
  nonOwnerOccupiedTaxTiers: PropertyTaxTier[];
  annualValueProxyPct: number; // e.g. 0.035
  legalFeesEstimateMin: number;
  legalFeesEstimateMax: number;
  valuationFeeSGD: number;
  insuranceAnnualMin: number;
  insuranceAnnualMax: number;
  maintenanceFees: MaintenanceFees;
  cpfSaInterestRate: number; // decimal, e.g. 0.04
}

// ── Main Calculation ──────────────────────────────────────────────────────────

export function calculateTotalCostOfOwnership(
  input: TotalCostOwnershipInput,
  config: TCOConfig,
): TotalCostOwnershipOutput {
  const isOwnerOccupied = input.usage === 'owner-occupied';

  // ── 1. Stamp Duty ───────────────────────────────────────────────────────────
  const stampDutyResult = calculateStampDuty(
    {
      purchasePrice: input.purchasePrice,
      buyerResidencyStatus: input.buyerResidencyStatus,
      propertyType: input.propertyType,
      existingPropertiesOwned: input.existingPropertiesOwned,
      isBuyingUnderEntity: false,
    },
    {
      bsdTiers: config.bsdTiers,
      absdRates: config.absdRates,
      ssdTiers: config.ssdTiers,
      ssdExemptionMonths: config.ssdExemptionMonths,
    },
  );

  const bsd = stampDutyResult.bsd;
  const absd = stampDutyResult.absd.amount;
  const totalStampDuty = bsd + absd;

  // ── 2. One-time fees (estimates) ────────────────────────────────────────────
  const legalFeesEstimate = (config.legalFeesEstimateMin + config.legalFeesEstimateMax) / 2;
  const valuationFee = config.valuationFeeSGD;
  const totalOneTimeCosts = input.purchasePrice + totalStampDuty + legalFeesEstimate + valuationFee;

  // ── 3. Property Tax (annual, from tiers) ────────────────────────────────────
  const estimatedAV = input.purchasePrice * config.annualValueProxyPct;
  const taxTiers = isOwnerOccupied
    ? config.ownerOccupiedTaxTiers
    : config.nonOwnerOccupiedTaxTiers;
  const { annualTax: annualPropertyTax } = calculatePropertyTax(estimatedAV, isOwnerOccupied, taxTiers);

  // ── 4. Maintenance Fees (annual mid estimate) ───────────────────────────────
  const mf = config.maintenanceFees;
  let annualMaintenanceFeesMid: number;
  if (input.propertyType === PropertyType.HDB) {
    annualMaintenanceFeesMid = ((mf.hdbMonthlyRange.min + mf.hdbMonthlyRange.max) / 2) * 12;
  } else if (input.propertyType === PropertyType.Condo || input.propertyType === PropertyType.EC) {
    const monthlyPerSqft = (mf.condoMonthlyPerSqft.min + mf.condoMonthlyPerSqft.max) / 2;
    annualMaintenanceFeesMid = monthlyPerSqft * input.floorAreaSqft * 12;
  } else {
    // Landed
    annualMaintenanceFeesMid = mf.landedMonthlyEstimate * 12;
  }

  // ── 5. Insurance (annual mid estimate) ─────────────────────────────────────
  const annualInsuranceMid = (config.insuranceAnnualMin + config.insuranceAnnualMax) / 2;

  // ── 6. Mortgage amortisation ────────────────────────────────────────────────
  const mortgageResult = calculateMortgage({
    loanAmount: input.loanAmount,
    annualInterestRatePct: input.annualInterestRatePct,
    loanTenureYears: input.loanTenureYears,
    loanType: input.propertyType === PropertyType.HDB ? 'HDB' : 'bank',
  });

  const schedule = mortgageResult.amortizationSchedule;

  // ── 7. Opportunity Cost (downpayment earning CPF SA) ───────────────────────
  const downpayment = input.purchasePrice - input.loanAmount;
  const cpfSaRate = config.cpfSaInterestRate; // e.g. 0.04

  // ── 8. Build per-year breakdown ─────────────────────────────────────────────
  const yearlyBreakdown: TotalCostOwnershipOutput['yearlyBreakdown'] = [];
  let cumulativeCost = totalOneTimeCosts;

  for (let y = 1; y <= input.holdingPeriodYears; y++) {
    // Mortgage interest for the year (sum months (y-1)*12+1 → y*12)
    const startMonth = (y - 1) * 12 + 1;
    const endMonth = Math.min(y * 12, schedule.length);
    let mortgageInterestThisYear = 0;
    for (let m = startMonth; m <= endMonth; m++) {
      const entry = schedule.find((e) => e.month === m);
      if (entry) mortgageInterestThisYear += entry.interestComponent;
    }

    // Opportunity cost for this year: downpayment compound growth increment
    const opportunityCostToDate =
      downpayment * (Math.pow(1 + cpfSaRate, y) - 1);
    const opportunityCostPreviousYear =
      y === 1 ? 0 : downpayment * (Math.pow(1 + cpfSaRate, y - 1) - 1);
    const opportunityCostThisYear = opportunityCostToDate - opportunityCostPreviousYear;

    const rentalIncome =
      !isOwnerOccupied && input.monthlyRentalIncome ? input.monthlyRentalIncome * 12 : 0;

    const yearlyTotal =
      mortgageInterestThisYear +
      annualPropertyTax +
      annualMaintenanceFeesMid +
      annualInsuranceMid +
      opportunityCostThisYear -
      rentalIncome;

    cumulativeCost += yearlyTotal;

    yearlyBreakdown.push({
      year: y,
      mortgageInterest: Math.round(mortgageInterestThisYear),
      propertyTax: Math.round(annualPropertyTax),
      maintenanceFees: Math.round(annualMaintenanceFeesMid),
      insurance: Math.round(annualInsuranceMid),
      opportunityCost: Math.round(opportunityCostThisYear),
      rentalIncome: Math.round(rentalIncome),
      cumulativeCost: Math.round(cumulativeCost),
    });
  }

  // ── 9. Totals for holding period ────────────────────────────────────────────
  const totalMortgageInterest = yearlyBreakdown.reduce((s, y) => s + y.mortgageInterest, 0);
  const totalPropertyTax = annualPropertyTax * input.holdingPeriodYears;
  const totalMaintenanceFees = annualMaintenanceFeesMid * input.holdingPeriodYears;
  const totalInsurance = annualInsuranceMid * input.holdingPeriodYears;
  const opportunityCostTotal = downpayment * (Math.pow(1 + cpfSaRate, input.holdingPeriodYears) - 1);
  const grandTotalCost =
    totalOneTimeCosts +
    totalMortgageInterest +
    totalPropertyTax +
    totalMaintenanceFees +
    totalInsurance +
    opportunityCostTotal;

  // ── 10. Investment-specific outputs ────────────────────────────────────────
  let totalRentalIncome: number | undefined;
  let netCostAfterRental: number | undefined;
  let grossRentalYieldPct: number | undefined;
  let netRentalYieldPct: number | undefined;
  let breakevenSalePrice: number | undefined;

  if (!isOwnerOccupied && input.monthlyRentalIncome) {
    totalRentalIncome = input.monthlyRentalIncome * 12 * input.holdingPeriodYears;
    netCostAfterRental = grandTotalCost - totalRentalIncome;
    grossRentalYieldPct = ((input.monthlyRentalIncome * 12) / input.purchasePrice) * 100;
    const annualNetIncome =
      input.monthlyRentalIncome * 12 - annualPropertyTax - annualMaintenanceFeesMid - annualInsuranceMid;
    netRentalYieldPct = (annualNetIncome / input.purchasePrice) * 100;
    // Breakeven = total costs excluding any already-offset rental income
    breakevenSalePrice = grandTotalCost - totalRentalIncome;
  }

  return {
    purchasePrice: input.purchasePrice,
    bsd: Math.round(bsd),
    absd: Math.round(absd),
    totalStampDuty: Math.round(totalStampDuty),
    legalFeesEstimate: Math.round(legalFeesEstimate),
    valuationFee,
    totalOneTimeCosts: Math.round(totalOneTimeCosts),

    annualPropertyTax: Math.round(annualPropertyTax),
    annualMaintenanceFeesMid: Math.round(annualMaintenanceFeesMid),
    annualInsuranceMid: Math.round(annualInsuranceMid),

    totalPropertyTax: Math.round(totalPropertyTax),
    totalMaintenanceFees: Math.round(totalMaintenanceFees),
    totalInsurance: Math.round(totalInsurance),
    totalMortgageInterest: Math.round(totalMortgageInterest),

    opportunityCostTotal: Math.round(opportunityCostTotal),
    cpfSaRateUsed: cpfSaRate,

    grandTotalCost: Math.round(grandTotalCost),

    totalRentalIncome: totalRentalIncome !== undefined ? Math.round(totalRentalIncome) : undefined,
    netCostAfterRental: netCostAfterRental !== undefined ? Math.round(netCostAfterRental) : undefined,
    grossRentalYieldPct,
    netRentalYieldPct,
    breakevenSalePrice: breakevenSalePrice !== undefined ? Math.round(breakevenSalePrice) : undefined,

    yearlyBreakdown,
  };
}
