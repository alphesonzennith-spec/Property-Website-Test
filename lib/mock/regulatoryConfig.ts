import { z } from 'zod';
import { ResidencyStatus, PropertyType } from '@/types';

// ── Zod Schemas (Runtime Validation) ────────────────────────────────────────

export const BSDTierSchema = z.object({
  minValue: z.number(),
  maxValue: z.number().nullable(), // null = no upper bound (final tier)
  rate: z.number(), // decimal, e.g., 0.01 for 1%
  label: z.string(),
});

export const ABSDRateSchema = z.object({
  residencyStatus: z.nativeEnum(ResidencyStatus),
  propertyType: z.nativeEnum(PropertyType),
  existingProperties: z.number().int(),
  rate: z.number(),
  rationale: z.string(),
});

export const SSDTierSchema = z.object({
  minMonths: z.number().int(),
  maxMonths: z.number().int().nullable(), // null for final tier
  rate: z.number(),
  label: z.string(),
});

export const LTVRuleSchema = z.object({
  loanType: z.enum(['HDB', 'bank']),
  propertyType: z.nativeEnum(PropertyType),
  loanTenureYears: z.number().int(),
  existingLoans: z.number().int(),
  maxLTVPct: z.number(),
  minCashDownPaymentPct: z.number(),
});

export const PropertyTaxTierSchema = z.object({
  annualValueMin: z.number(),
  annualValueMax: z.number().nullable(),
  ownerOccupiedRate: z.number(),
  nonOwnerOccupiedRate: z.number(),
  label: z.string(),
});

export const MaintenanceFeesSchema = z.object({
  hdbMonthlyRange: z.object({ min: z.number(), max: z.number() }),
  condoMonthlyPerSqft: z.object({ min: z.number(), max: z.number() }),
  landedMonthlyEstimate: z.number(),
  note: z.string(),
});

export const CPFRatesSchema = z.object({
  oaInterestRate: z.number(), // decimal, e.g. 0.025 for 2.5%
  saInterestRate: z.number(), // decimal, e.g. 0.04 for 4%
  effectiveDate: z.string(),
  sourceUrl: z.string().url(),
});

export const RegulatoryConfigSchema = z.object({
  version: z.string(),
  effectiveDate: z.string(), // ISO 8601
  lastUpdated: z.string(),

  stampDuty: z.object({
    bsd: z.object({
      tiers: z.array(BSDTierSchema),
      description: z.string(),
    }),
    absd: z.object({
      rates: z.array(ABSDRateSchema),
      description: z.string(),
    }),
    ssd: z.object({
      tiers: z.array(SSDTierSchema),
      description: z.string(),
      exemptionThresholdMonths: z.number().int(),
    }),
  }),

  borrowing: z.object({
    tdsr: z.object({
      limit: z.number(),
      variableIncomeHaircutPct: z.number(),
      description: z.string(),
    }),
    msr: z.object({
      limit: z.number(),
      applicablePropertyTypes: z.array(z.nativeEnum(PropertyType)),
      description: z.string(),
    }),
    ltv: z.object({
      rules: z.array(LTVRuleSchema),
      description: z.string(),
    }),
  }),

  mortgage: z.object({
    hdbLoan: z.object({
      baseInterestRatePct: z.number(),
      description: z.string(),
    }),
    bankLoan: z.object({
      typicalInterestRangePct: z.object({ min: z.number(), max: z.number() }),
      description: z.string(),
    }),
  }),

  cpf: z.object({
    ordinaryAccount: z.object({
      annualInterestRatePct: z.number(),
      usageCap: z.object({
        propertyPurchase: z.string(),
        monthlyInstallment: z.string(),
      }),
      accrualInterestRatePct: z.number(), // 2.5% floor for accrued interest
    }),
    specialAccount: z.object({
      annualInterestRatePct: z.number(),
    }),
  }),

  propertyTax: z.object({
    ownerOccupied: z.array(PropertyTaxTierSchema),
    nonOwnerOccupied: z.array(PropertyTaxTierSchema),
    annualValueProxyPct: z.number(), // % of purchase price used as AV proxy
    effectiveDateOverride: z.string(),
    sourceUrl: z.string(),
    description: z.string(),
  }),

  maintenanceFees: MaintenanceFeesSchema,

  misc: z.object({
    legalConveyancingFeesPct: z.number(),
    legalFeesEstimateRange: z.object({ min: z.number(), max: z.number() }),
    valuationFeeSGD: z.number(),
    insuranceAnnualRange: z.object({ min: z.number(), max: z.number() }),
  }),

  cpfRates: CPFRatesSchema,
});

// ── Type Exports ─────────────────────────────────────────────────────────────

export type RegulatoryConfig = z.infer<typeof RegulatoryConfigSchema>;
export type BSDTier = z.infer<typeof BSDTierSchema>;
export type ABSDRate = z.infer<typeof ABSDRateSchema>;
export type SSDTier = z.infer<typeof SSDTierSchema>;
export type LTVRule = z.infer<typeof LTVRuleSchema>;
export type PropertyTaxTier = z.infer<typeof PropertyTaxTierSchema>;
export type MaintenanceFees = z.infer<typeof MaintenanceFeesSchema>;
export type CPFRates = z.infer<typeof CPFRatesSchema>;

// ── Mock Data (Singapore 2024 Regulatory Rates) ─────────────────────────────

export const mockRegulatoryConfig: RegulatoryConfig = {
  version: '2024.1',
  effectiveDate: '2024-01-01',
  lastUpdated: '2024-02-15',

  stampDuty: {
    bsd: {
      tiers: [
        { minValue: 0, maxValue: 180000, rate: 0.01, label: 'First $180,000' },
        { minValue: 180000, maxValue: 360000, rate: 0.02, label: '$180,000 to $360,000' },
        { minValue: 360000, maxValue: 1000000, rate: 0.03, label: '$360,000 to $1,000,000' },
        { minValue: 1000000, maxValue: 1500000, rate: 0.04, label: '$1,000,000 to $1,500,000' },
        { minValue: 1500000, maxValue: 3000000, rate: 0.05, label: '$1,500,000 to $3,000,000' },
        { minValue: 3000000, maxValue: null, rate: 0.06, label: 'Above $3,000,000' },
      ],
      description: "Buyer's Stamp Duty (BSD) applies to all property purchases in Singapore. Progressive tier structure based on purchase price.",
    },
    absd: {
      rates: [
        // Singaporean Citizens
        { residencyStatus: ResidencyStatus.Singaporean, propertyType: PropertyType.HDB, existingProperties: 0, rate: 0, rationale: 'First HDB flat for Singaporean Citizens' },
        { residencyStatus: ResidencyStatus.Singaporean, propertyType: PropertyType.Condo, existingProperties: 0, rate: 0, rationale: 'First residential property for Singaporean Citizens' },
        { residencyStatus: ResidencyStatus.Singaporean, propertyType: PropertyType.EC, existingProperties: 0, rate: 0, rationale: 'First EC for Singaporean Citizens' },
        { residencyStatus: ResidencyStatus.Singaporean, propertyType: PropertyType.Landed, existingProperties: 0, rate: 0, rationale: 'First landed property for Singaporean Citizens' },
        { residencyStatus: ResidencyStatus.Singaporean, propertyType: PropertyType.Condo, existingProperties: 1, rate: 0.20, rationale: 'Second residential property for Singaporean Citizens (20% ABSD)' },
        { residencyStatus: ResidencyStatus.Singaporean, propertyType: PropertyType.Landed, existingProperties: 1, rate: 0.20, rationale: 'Second residential property for Singaporean Citizens (20% ABSD)' },
        { residencyStatus: ResidencyStatus.Singaporean, propertyType: PropertyType.EC, existingProperties: 1, rate: 0.20, rationale: 'Second residential property for Singaporean Citizens (20% ABSD)' },
        { residencyStatus: ResidencyStatus.Singaporean, propertyType: PropertyType.Condo, existingProperties: 2, rate: 0.30, rationale: 'Third and subsequent properties for Singaporean Citizens (30% ABSD)' },
        { residencyStatus: ResidencyStatus.Singaporean, propertyType: PropertyType.Landed, existingProperties: 2, rate: 0.30, rationale: 'Third and subsequent properties for Singaporean Citizens (30% ABSD)' },

        // Permanent Residents
        { residencyStatus: ResidencyStatus.PR, propertyType: PropertyType.HDB, existingProperties: 0, rate: 0.05, rationale: 'First HDB flat for PRs (5% ABSD)' },
        { residencyStatus: ResidencyStatus.PR, propertyType: PropertyType.Condo, existingProperties: 0, rate: 0.05, rationale: 'First residential property for PRs (5% ABSD)' },
        { residencyStatus: ResidencyStatus.PR, propertyType: PropertyType.EC, existingProperties: 0, rate: 0.05, rationale: 'First EC for PRs (5% ABSD)' },
        { residencyStatus: ResidencyStatus.PR, propertyType: PropertyType.Landed, existingProperties: 0, rate: 0.05, rationale: 'First residential property for PRs (5% ABSD)' },
        { residencyStatus: ResidencyStatus.PR, propertyType: PropertyType.Condo, existingProperties: 1, rate: 0.30, rationale: 'Second and subsequent properties for PRs (30% ABSD)' },
        { residencyStatus: ResidencyStatus.PR, propertyType: PropertyType.Landed, existingProperties: 1, rate: 0.30, rationale: 'Second and subsequent properties for PRs (30% ABSD)' },

        // Foreigners
        { residencyStatus: ResidencyStatus.Foreigner, propertyType: PropertyType.Condo, existingProperties: 0, rate: 0.60, rationale: 'Any residential property purchase by Foreigners (60% ABSD)' },
        { residencyStatus: ResidencyStatus.Foreigner, propertyType: PropertyType.Landed, existingProperties: 0, rate: 0.60, rationale: 'Any residential property purchase by Foreigners (60% ABSD)' },
        { residencyStatus: ResidencyStatus.Foreigner, propertyType: PropertyType.EC, existingProperties: 0, rate: 0.60, rationale: 'Any residential property purchase by Foreigners (60% ABSD)' },
      ],
      description: "Additional Buyer's Stamp Duty (ABSD) rates by residency status and property count. Entity purchases face 65% ABSD (handled separately in calculation logic).",
    },
    ssd: {
      tiers: [
        { minMonths: 0, maxMonths: 12, rate: 0.12, label: 'Sold within 1 year' },
        { minMonths: 12, maxMonths: 24, rate: 0.08, label: 'Sold within 1 to 2 years' },
        { minMonths: 24, maxMonths: 36, rate: 0.04, label: 'Sold within 2 to 3 years' },
      ],
      exemptionThresholdMonths: 36,
      description: "Seller's Stamp Duty (SSD) applies when selling residential property within 3 years of purchase. No SSD if held for 3+ years.",
    },
  },

  borrowing: {
    tdsr: {
      limit: 0.55,
      variableIncomeHaircutPct: 30,
      description: 'Total Debt Servicing Ratio (TDSR) cap set by MAS at 55% of gross monthly income. Variable income (bonuses, commissions) is subject to a 30% haircut.',
    },
    msr: {
      limit: 0.30,
      applicablePropertyTypes: [PropertyType.HDB, PropertyType.EC],
      description: 'Mortgage Servicing Ratio (MSR) cap at 30% applies only to HDB loans and Executive Condominiums (EC).',
    },
    ltv: {
      rules: [
        // HDB Loans
        { loanType: 'HDB', propertyType: PropertyType.HDB, loanTenureYears: 25, existingLoans: 0, maxLTVPct: 85, minCashDownPaymentPct: 5 },
        { loanType: 'HDB', propertyType: PropertyType.HDB, loanTenureYears: 30, existingLoans: 0, maxLTVPct: 80, minCashDownPaymentPct: 5 },
        { loanType: 'HDB', propertyType: PropertyType.HDB, loanTenureYears: 25, existingLoans: 1, maxLTVPct: 45, minCashDownPaymentPct: 25 },

        // Bank Loans - Private Property (Condo, Landed)
        { loanType: 'bank', propertyType: PropertyType.Condo, loanTenureYears: 30, existingLoans: 0, maxLTVPct: 75, minCashDownPaymentPct: 5 },
        { loanType: 'bank', propertyType: PropertyType.Landed, loanTenureYears: 30, existingLoans: 0, maxLTVPct: 75, minCashDownPaymentPct: 5 },
        { loanType: 'bank', propertyType: PropertyType.Condo, loanTenureYears: 35, existingLoans: 0, maxLTVPct: 55, minCashDownPaymentPct: 10 },
        { loanType: 'bank', propertyType: PropertyType.Landed, loanTenureYears: 35, existingLoans: 0, maxLTVPct: 55, minCashDownPaymentPct: 10 },

        // Bank Loans - EC
        { loanType: 'bank', propertyType: PropertyType.EC, loanTenureYears: 30, existingLoans: 0, maxLTVPct: 75, minCashDownPaymentPct: 5 },

        // Bank Loans - With Existing Loans
        { loanType: 'bank', propertyType: PropertyType.Condo, loanTenureYears: 30, existingLoans: 1, maxLTVPct: 45, minCashDownPaymentPct: 25 },
        { loanType: 'bank', propertyType: PropertyType.Landed, loanTenureYears: 30, existingLoans: 1, maxLTVPct: 45, minCashDownPaymentPct: 25 },
        { loanType: 'bank', propertyType: PropertyType.Condo, loanTenureYears: 30, existingLoans: 2, maxLTVPct: 35, minCashDownPaymentPct: 25 },
        { loanType: 'bank', propertyType: PropertyType.Landed, loanTenureYears: 30, existingLoans: 2, maxLTVPct: 35, minCashDownPaymentPct: 25 },
      ],
      description: 'Loan-to-Value (LTV) ratio limits by loan type, property type, tenure, and number of existing outstanding loans.',
    },
  },

  mortgage: {
    hdbLoan: {
      baseInterestRatePct: 2.6,
      description: 'HDB concessionary loan base interest rate (reviewed quarterly by HDB). Rate as of Jan 2024.',
    },
    bankLoan: {
      typicalInterestRangePct: { min: 3.5, max: 5.0 },
      description: 'Typical bank loan interest rate range for residential property mortgages. Actual rates vary by bank, loan quantum, and borrower profile.',
    },
  },

  cpf: {
    ordinaryAccount: {
      annualInterestRatePct: 2.5,
      usageCap: {
        propertyPurchase: 'Valuation Limit (VL) or purchase price, whichever is lower',
        monthlyInstallment: 'Subject to MSR/TDSR limits and available CPF OA balance',
      },
      accrualInterestRatePct: 2.5,
    },
    specialAccount: {
      annualInterestRatePct: 4.0,
    },
  },

  propertyTax: {
    ownerOccupied: [
      { annualValueMin: 0, annualValueMax: 8000, ownerOccupiedRate: 0, nonOwnerOccupiedRate: 0.10, label: 'First $8,000' },
      { annualValueMin: 8000, annualValueMax: 30000, ownerOccupiedRate: 0.04, nonOwnerOccupiedRate: 0.10, label: '$8,000 to $30,000' },
      { annualValueMin: 30000, annualValueMax: 40000, ownerOccupiedRate: 0.05, nonOwnerOccupiedRate: 0.10, label: '$30,000 to $40,000' },
      { annualValueMin: 40000, annualValueMax: 55000, ownerOccupiedRate: 0.07, nonOwnerOccupiedRate: 0.10, label: '$40,000 to $55,000' },
      { annualValueMin: 55000, annualValueMax: 70000, ownerOccupiedRate: 0.10, nonOwnerOccupiedRate: 0.14, label: '$55,000 to $70,000' },
      { annualValueMin: 70000, annualValueMax: 85000, ownerOccupiedRate: 0.14, nonOwnerOccupiedRate: 0.18, label: '$70,000 to $85,000' },
      { annualValueMin: 85000, annualValueMax: 100000, ownerOccupiedRate: 0.18, nonOwnerOccupiedRate: 0.22, label: '$85,000 to $100,000' },
      { annualValueMin: 100000, annualValueMax: null, ownerOccupiedRate: 0.23, nonOwnerOccupiedRate: 0.27, label: 'Above $100,000' },
    ],
    nonOwnerOccupied: [
      { annualValueMin: 0, annualValueMax: 30000, ownerOccupiedRate: 0, nonOwnerOccupiedRate: 0.10, label: 'First $30,000' },
      { annualValueMin: 30000, annualValueMax: 40000, ownerOccupiedRate: 0, nonOwnerOccupiedRate: 0.12, label: '$30,000 to $40,000' },
      { annualValueMin: 40000, annualValueMax: 55000, ownerOccupiedRate: 0, nonOwnerOccupiedRate: 0.14, label: '$40,000 to $55,000' },
      { annualValueMin: 55000, annualValueMax: 70000, ownerOccupiedRate: 0, nonOwnerOccupiedRate: 0.16, label: '$55,000 to $70,000' },
      { annualValueMin: 70000, annualValueMax: 90000, ownerOccupiedRate: 0, nonOwnerOccupiedRate: 0.18, label: '$70,000 to $90,000' },
      { annualValueMin: 90000, annualValueMax: null, ownerOccupiedRate: 0, nonOwnerOccupiedRate: 0.20, label: 'Above $90,000' },
    ],
    annualValueProxyPct: 0.035, // 3.5% of purchase price used as AV proxy for estimation
    effectiveDateOverride: '2024-01-01',
    sourceUrl: 'https://www.iras.gov.sg/taxes/property-tax/property-owners/property-tax-rates',
    description: 'Progressive property tax rates for owner-occupied and non-owner-occupied residential properties in Singapore (IRAS 2024). Annual Value (AV) is IRAS-assessed; 3.5% of property value is used here as a proxy for estimation only.',
  },

  maintenanceFees: {
    hdbMonthlyRange: { min: 20, max: 90 },
    condoMonthlyPerSqft: { min: 0.30, max: 0.60 },
    landedMonthlyEstimate: 200,
    note: 'Estimated market ranges only — not regulatory figures. Actual fees vary by development, size, and facility tier.',
  },

  misc: {
    legalConveyancingFeesPct: 0.004, // 0.4% estimate (actual varies by firm and transaction complexity)
    legalFeesEstimateRange: { min: 2500, max: 4000 }, // Estimated — varies by firm and complexity
    valuationFeeSGD: 500, // Typical professional valuation fee
    insuranceAnnualRange: { min: 500, max: 1000 }, // Home & fire insurance — estimated
  },

  cpfRates: {
    oaInterestRate: 0.025, // 2.5% p.a. — set by CPF Board
    saInterestRate: 0.04,  // 4.0% p.a. — set by CPF Board
    effectiveDate: '2024-01-01',
    sourceUrl: 'https://www.cpf.gov.sg',
  },
};
