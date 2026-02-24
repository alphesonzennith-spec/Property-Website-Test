import type { ResidencyStatus } from './user';
import type { PropertyType } from './property';

// ── Stamp Duty (BSD · ABSD · SSD) ────────────────────────────────────────────

export interface StampDutyInput {
  /** Purchase price in SGD */
  purchasePrice: number;
  buyerResidencyStatus: ResidencyStatus;
  propertyType: PropertyType;
  /** Number of residential properties the buyer currently owns */
  existingPropertiesOwned: number;
  /** True when purchasing under a trust, company or other legal entity */
  isBuyingUnderEntity: boolean;
  /** Months the seller has held the property — required to compute SSD */
  holdingPeriodMonths?: number;
}

export interface ABSDCalculation {
  /** Applicable ABSD rate as a decimal, e.g. 0.20 */
  applicableRate: number;
  /** ABSD amount in SGD */
  amount: number;
  /** Human-readable explanation of which ABSD tier applies */
  rationale: string;
}

export interface StampDutyOutput {
  /** Buyer's Stamp Duty in SGD */
  bsd: number;
  absd: ABSDCalculation;
  /** Seller's Stamp Duty in SGD; 0 when holding period exceeds 3 years */
  ssd: number;
  totalStampDuty: number;
  breakdown: {
    bsdBreakdown: Array<{ tier: string; rate: number; amount: number }>;
    absdRate: number;
    ssdRate: number;
  };
}

// ── TDSR ─────────────────────────────────────────────────────────────────────

export interface TDSRInput {
  /** Monthly fixed income in SGD (salary) */
  fixedMonthlyIncome: number;
  /** Monthly variable income in SGD (bonus, commission) */
  variableMonthlyIncome: number;
  /** Total existing monthly debt repayments in SGD (car loans, personal loans, etc.) */
  existingMonthlyDebts: number;
  /** Proposed new monthly mortgage repayment in SGD */
  proposedMortgageRepayment: number;
  /** Haircut applied to variable income per MAS guidelines; defaults to 30 */
  variableIncomeHaircutPct?: number;
}

export interface TDSROutput {
  /** Total monthly debt obligations inclusive of the proposed mortgage */
  totalMonthlyObligations: number;
  /** Effective monthly income after applicable haircuts */
  effectiveMonthlyIncome: number;
  /** TDSR ratio as a decimal, e.g. 0.42 */
  tdsrRatio: number;
  /** MAS TDSR ceiling (0.55) */
  tdsrLimit: number;
  withinLimit: boolean;
  /** Maximum additional monthly debt the borrower can take on before breaching TDSR */
  remainingCapacitySGD: number;
}

// ── MSR ───────────────────────────────────────────────────────────────────────

export interface MSRInput {
  /** Monthly gross income in SGD */
  grossMonthlyIncome: number;
  /** Proposed HDB or EC monthly mortgage repayment in SGD */
  proposedMortgageRepayment: number;
}

export interface MSROutput {
  /** MSR ratio as a decimal, e.g. 0.28 */
  msrRatio: number;
  /** MAS MSR ceiling of 0.30 applicable to HDB and EC loans */
  msrLimit: number;
  withinLimit: boolean;
  /** Maximum monthly mortgage repayment permitted under MSR */
  maxAllowedRepaymentSGD: number;
}

// ── Mortgage ──────────────────────────────────────────────────────────────────

export interface MortgageInput {
  /** Loan principal in SGD */
  loanAmount: number;
  /** Annual interest rate as a percentage, e.g. 3.5 */
  annualInterestRatePct: number;
  loanTenureYears: number;
  /** "HDB" for the HDB concessionary loan, "bank" for market-rate bank loans */
  loanType: 'HDB' | 'bank';
}

export interface AmortizationEntry {
  month: number;
  /** Total payment in SGD */
  payment: number;
  principalComponent: number;
  interestComponent: number;
  remainingBalance: number;
}

export interface MortgageOutput {
  /** Monthly repayment in SGD */
  monthlyRepayment: number;
  totalRepayment: number;
  totalInterestPaid: number;
  /** Effective interest rate as a percentage */
  effectiveInterestRatePct: number;
  /** Full month-by-month amortization schedule */
  amortizationSchedule: AmortizationEntry[];
}

// ── Affordability ─────────────────────────────────────────────────────────────

export interface AffordabilityInput {
  /** Monthly gross income in SGD */
  grossMonthlyIncome: number;
  /** Total existing monthly debt repayments in SGD */
  existingMonthlyDebts: number;
  /** CPF Ordinary Account balance available for down payment in SGD */
  cpfOABalance: number;
  /** Cash savings available for down payment in SGD */
  cashSavings: number;
  preferredTenureYears: number;
  annualInterestRatePct: number;
  buyerResidencyStatus: ResidencyStatus;
  existingPropertiesOwned: number;
  propertyType: PropertyType;
}

export interface AffordabilityOutput {
  /** Maximum property price the buyer can afford in SGD */
  maxAffordablePrice: number;
  /** Maximum eligible loan amount based on TDSR / MSR limits */
  maxLoanAmount: number;
  /** Minimum cash down payment required at the maximum loan quantum */
  minCashDownPayment: number;
  /** CPF OA amount applicable towards the down payment */
  cpfApplicable: number;
  /** Estimated monthly mortgage repayment at the maximum loan amount */
  estimatedMonthlyRepayment: number;
  /** Estimated stamp duty at the maximum affordable price */
  estimatedStampDuty: number;
  /** Total cash that must be on hand at the point of purchase */
  totalCashRequired: number;
  tdsrAtMaxLoan: number;
  withinTDSRLimit: boolean;
}

// ── CPF Optimizer ─────────────────────────────────────────────────────────────

export interface CPFOptimizerInput {
  purchasePrice: number;
  /** Available CPF Ordinary Account balance in SGD */
  cpfOABalance: number;
  cashAvailable: number;
  loanAmount: number;
  annualInterestRatePct: number;
  loanTenureYears: number;
  /** Buyer's current age in years */
  buyerAge: number;
  /** Projected CPF OA annual accrual interest rate; defaults to 2.5 */
  cpfOAInterestRatePct?: number;
}

export interface CPFOptimizerOutput {
  /** Recommended CPF OA amount to deploy for the purchase */
  recommendedCPFUsage: number;
  /** Recommended cash amount to deploy for the purchase */
  recommendedCashUsage: number;
  /** Projected CPF OA balance at age 55 under the recommended scenario */
  projectedCPFAtAge55: number;
  /** Projected CPF OA balance at age 55 if CPF is not used for the purchase */
  projectedCPFAtAge55IfNotUsed: number;
  /** Net retirement impact in SGD terms (positive = better retirement outcome) */
  netRetirementImpactSGD: number;
  recommendation: string;
  scenarios: Array<{
    label: string;
    cpfUsed: number;
    cashUsed: number;
    /** Projected net retirement impact in SGD for this scenario */
    retirementImpact: number;
  }>;
}

// ── Progressive Payment Schedule (BUC) ────────────────────────────────────────

export interface ProgressivePaymentInput {
  purchasePrice: number;
  loanAmount: number;
  /** CPF OA amount allocated specifically for this purchase */
  cpfAllocated: number;
}

export interface ProgressivePaymentStage {
  /** Stage label, e.g. "OTP Exercise", "Foundation", "Completion" */
  stage: string;
  /** Percentage of the purchase price payable at this stage */
  percentageOfPrice: number;
  /** Amount due at this stage in SGD */
  amountSGD: number;
  /** Whether CPF OA funds may be used to fulfil this stage payment */
  cpfEligible: boolean;
  /** Indicative construction milestone timeline description */
  timelineDescription: string;
}

export interface ProgressivePaymentOutput {
  stages: ProgressivePaymentStage[];
  totalCashOutlay: number;
  totalCPFUsed: number;
  totalLoanDrawdown: number;
}

// ── Total Cost of Ownership ───────────────────────────────────────────────────

export interface TotalCostOwnershipInput {
  purchasePrice: number;
  propertyType: PropertyType;
  /** Floor area in square feet — used for condo maintenance fee estimate */
  floorAreaSqft: number;
  /** "owner-occupied" or "investment" */
  usage: 'owner-occupied' | 'investment';
  loanAmount: number;
  annualInterestRatePct: number;
  loanTenureYears: number;
  /** Intended holding period in years */
  holdingPeriodYears: 5 | 10 | 20;
  buyerResidencyStatus: ResidencyStatus;
  existingPropertiesOwned: number;
  /** Expected monthly rental income in SGD (investment only) */
  monthlyRentalIncome?: number;
}

export interface TotalCostOwnershipOutput {
  // One-time costs
  purchasePrice: number;
  bsd: number;
  absd: number;
  totalStampDuty: number;
  /** Midpoint of the legal fee estimate range */
  legalFeesEstimate: number;
  valuationFee: number;
  totalOneTimeCosts: number;

  // Annual recurring (each year)
  annualPropertyTax: number;
  annualMaintenanceFeesMid: number;
  annualInsuranceMid: number;

  // Total recurring over holding period
  totalPropertyTax: number;
  totalMaintenanceFees: number;
  totalInsurance: number;
  totalMortgageInterest: number;

  // Opportunity cost
  opportunityCostTotal: number;
  /** CPF SA rate used for opportunity cost calculation */
  cpfSaRateUsed: number;

  // Grand totals
  grandTotalCost: number;

  // Investment-only (undefined when owner-occupied)
  totalRentalIncome?: number;
  netCostAfterRental?: number;
  grossRentalYieldPct?: number;
  netRentalYieldPct?: number;
  /** Breakeven sale price to recoup all costs */
  breakevenSalePrice?: number;

  // Per-year data for chart
  yearlyBreakdown: Array<{
    year: number;
    mortgageInterest: number;
    propertyTax: number;
    maintenanceFees: number;
    insurance: number;
    opportunityCost: number;
    rentalIncome: number;
    cumulativeCost: number;
  }>;
}

// ── Property Market Value ─────────────────────────────────────────────────────

export interface PropertyMarketValueInput {
  /** Singapore postal code */
  postalCode: string;
  /** Unit number, e.g. "#12-34" */
  unitNumber?: string;
  propertyType: PropertyType;
  floorAreaSqft: number;
}

export interface MarketValueHistoryEntry {
  /** Month in "YYYY-MM" format, e.g. "2024-03" */
  month: string;
  /** Median transacted price in SGD for comparable units that month */
  medianPrice: number;
  medianPSF: number;
  transactionCount: number;
}

export interface PropertyMarketValueOutput {
  /** AI-assisted estimated current market value in SGD */
  estimatedValue: number;
  estimatedPSF: number;
  /** Lower bound of the 90-day valuation confidence band */
  valuationRangeLow: number;
  /** Upper bound of the 90-day valuation confidence band */
  valuationRangeHigh: number;
  /** Rolling 12 months of historical median transaction data */
  priceHistory: MarketValueHistoryEntry[];
  lastUpdated: Date;
}
