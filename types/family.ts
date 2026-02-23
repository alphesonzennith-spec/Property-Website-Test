import type { ABSDCalculation } from './calculator';

export enum FamilyRole {
  Head = 'Head',
  Spouse = 'Spouse',
  Child = 'Child',
  Parent = 'Parent',
  Sibling = 'Sibling',
  Other = 'Other',
}

export interface FamilyMember {
  userId: string;
  role: FamilyRole;
  /** Free-form relationship label, e.g. "Elder son", "Mother-in-law" */
  relationship: string;
  addedAt: Date;
}

export interface FamilyEligibilitySummary {
  /** Total residential properties owned across all family members */
  totalPropertiesOwned: number;
  /** ABSD liability breakdown — one entry per member plus any joint-purchase scenarios */
  absdLiability: ABSDCalculation[];
  /** Maximum combined TDSR-eligible borrowing capacity across all income-earning members, in SGD */
  combinedTDSRCapacity: number;
  /** Sum of CPF Ordinary Account balances across all family members in SGD */
  combinedCPFAvailable: number;
  /** True if at least one member satisfies HDB purchase eligibility criteria */
  canBuyHDB: boolean;
  /** Human-readable notes explaining HDB eligibility conditions or restrictions */
  hdbEligibilityNotes: string[];
}

export interface FamilyGroup {
  id: string;
  /** Display name for the family group, e.g. "The Tan Family" */
  name: string;
  /** User ID of the family head who administers the group */
  headUserId: string;
  members: FamilyMember[];
  /** Property IDs of all properties owned by any member of this family group */
  combinedProperties: string[];
  eligibilitySummary: FamilyEligibilitySummary;
}
