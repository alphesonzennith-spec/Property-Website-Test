import type { PropertyType } from './property';

export enum AgentTier {
  Free = 'Free',
  Premium = 'Premium',
  Enterprise = 'Enterprise',
}

export enum CEAStatus {
  Active = 'Active',
  Suspended = 'Suspended',
  Revoked = 'Revoked',
  Expired = 'Expired',
}

export interface AgentTransaction {
  propertyId: string;
  transactionDate: Date;
  /** Transaction price in SGD */
  price: number;
  /** Role the agent played in this transaction */
  role: 'seller_agent' | 'buyer_agent' | 'dual';
  /** Commission earned in SGD */
  commissionEarned: number;
  /** Latitude of the transacted property — used for portfolio map rendering */
  latitude: number;
  /** Longitude of the transacted property — used for portfolio map rendering */
  longitude: number;
  district: string;
}

export interface Agent {
  id: string;
  /** Reference to the agent's UserProfile */
  profileId: string;
  /**
   * CEA registration number.
   * Format: "R" followed by 6 digits for individual salespersons,
   *         "L" followed by 6 digits for estate agency licences.
   * Example: "R012345" or "L012345"
   */
  ceaNumber: string;
  ceaStatus: CEAStatus;
  ceaVerifiedAt?: Date;
  agencyName: string;
  agencyLicenseNumber: string;
  specializations: PropertyType[];
  yearsExperience: number;
  totalTransactions: number;
  /** Cumulative commission earned across all transactions in SGD */
  totalCommission: number;
  activeListings: number;
  ratings: {
    /** Mean rating on a 1–5 scale */
    average: number;
    /** Total number of reviews received */
    count: number;
    /** Count of reviews per star rating (keys are integer star values 1–5) */
    breakdown: Record<1 | 2 | 3 | 4 | 5, number>;
  };
  tier: AgentTier;
  subscriptionExpiry: Date;
  /** Historical transaction data used to render the agent's interactive portfolio map */
  portfolioMapData: AgentTransaction[];
}
