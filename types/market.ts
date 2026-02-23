/** Raw transaction record from the URA Private Residential Price Index API */
export interface URATransaction {
  /** URA project name */
  project: string;
  street: string;
  /** Transacted price in SGD */
  price: number;
  /** Floor area in sqm */
  areaSqm: number;
  /** Floor area in sqft */
  areaSqft: number;
  /** Price per sqft in SGD */
  psf: number;
  /** Contract date in "MM-YYYY" format as returned by URA */
  contractDate: string;
  propertyType: string;
  tenure: string;
  district: string;
  /** Floor range, e.g. "10-15" */
  floorRange?: string;
  noOfUnits: number;
}

/** Raw transaction record from the HDB Resale Flat Prices dataset */
export interface HDBTransaction {
  town: string;
  flatType: string;
  block: string;
  streetName: string;
  /** Storey range string, e.g. "10 TO 12" */
  storeyRange: string;
  floorAreaSqm: number;
  flatModel: string;
  /** Year the HDB lease commenced */
  leaseCommenceDate: number;
  /** Transaction month in "YYYY-MM" format */
  month: string;
  resalePrice: number;
}

export interface DistrictStats {
  district: string;
  /** Median transacted price in SGD over the reporting period */
  medianPrice: number;
  medianPSF: number;
  totalTransactions: number;
  /** Year-on-year price change as a percentage */
  priceChangeYoYPct: number;
  /** Average number of days a listing is on market before transacting */
  avgDaysOnMarket: number;
  /** ISO 8601 start of the statistics reporting period */
  periodStart: string;
  /** ISO 8601 end of the statistics reporting period */
  periodEnd: string;
}

export interface MarketInsightsResponse {
  /** ISO 8601 timestamp at which the insights were generated */
  generatedAt: string;
  districtStats: DistrictStats[];
  /** AI-generated market narrative summary */
  aiSummary: string;
  /** Market sentiment score from -1 (strongly bearish) to +1 (strongly bullish) */
  sentimentScore: number;
  /** District codes with the highest YoY price appreciation */
  topGainingDistricts: string[];
  /** District codes with the steepest YoY price declines */
  topLosingDistricts: string[];
}
