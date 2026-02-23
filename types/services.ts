import type { VerificationBadge } from './user';

export enum ServiceProviderType {
  Lawyer = 'Lawyer',
  MortgageBroker = 'MortgageBroker',
  Agent = 'Agent',
  Handyman = 'Handyman',
  InteriorDesign = 'InteriorDesign',
  Renovation = 'Renovation',
  Storage = 'Storage',
  Logistics = 'Logistics',
  /** AI Digital Avatar service provider */
  AIAgent = 'AIAgent',
}

export interface ServicePricing {
  /** Pricing model description, e.g. "Fixed fee", "Hourly", "Commission %" */
  model: string;
  /** Minimum fee in SGD */
  minFee?: number;
  /** Maximum fee in SGD; omit for uncapped commission-based models */
  maxFee?: number;
  /** Commission rate as a percentage of transaction value, if applicable */
  commissionPct?: number;
  currency: 'SGD';
}

export interface ServiceProvider {
  id: string;
  /** Reference to this provider's UserProfile */
  profileId: string;
  type: ServiceProviderType;
  companyName?: string;
  displayName: string;
  /** Professional bio or service description displayed on the provider's profile */
  description: string;
  verificationBadges: VerificationBadge[];
  ratings: {
    average: number;
    count: number;
    breakdown: Record<1 | 2 | 3 | 4 | 5, number>;
  };
  pricing: ServicePricing;
  /** Geographic areas of operation — districts or HDB town names */
  serviceAreas: string[];
  /** True if the provider has completed active Singpass verification */
  singpassVerified: boolean;
  /** Professional licence or registration number, e.g. lawyer's practising certificate */
  licenceNumber?: string;
  /** URLs to past project portfolio images or case studies */
  portfolioUrls: string[];
  contactEmail: string;
  /** Contact phone number in E.164 format */
  contactPhone: string;
  createdAt: Date;
  updatedAt: Date;
}
