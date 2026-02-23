export interface PropertyTransaction {
  transactionDate: Date;
  /** Transaction price in SGD */
  price: number;
  /** Price per square foot in SGD */
  psf: number;
  propertyId: string;
  buyerId: string;
  sellerId: string;
}

export interface PriceHistory {
  propertyId: string;
  /** Recorded price in SGD */
  price: number;
  recordedAt: Date;
  /** Data source, e.g. "URA", "HDB", "manual" */
  source: string;
}
