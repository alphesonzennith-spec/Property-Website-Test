import type { PropertyTransaction } from './financial';

export enum UserRole {
  Buyer = 'Buyer',
  Seller = 'Seller',
  Renter = 'Renter',
  Agent = 'Agent',
  Owner = 'Owner',
  Admin = 'Admin',
}

export enum ResidencyStatus {
  Singaporean = 'Singaporean',
  PR = 'PR',
  Foreigner = 'Foreigner',
}

export enum VerificationStatus {
  Unverified = 'Unverified',
  Pending = 'Pending',
  Verified = 'Verified',
  Failed = 'Failed',
}

export type MBTIType =
  | 'INTJ' | 'INTP' | 'ENTJ' | 'ENTP'
  | 'INFJ' | 'INFP' | 'ENFJ' | 'ENFP'
  | 'ISTJ' | 'ISFJ' | 'ESTJ' | 'ESFJ'
  | 'ISTP' | 'ISFP' | 'ESTP' | 'ESFP';

export interface BaZiReading {
  /** Time of birth in 24-hour HH:MM format */
  timeOfBirth: string;
  locationOfBirth: string;
  /** ISO 8601 date of birth, e.g. "1990-05-15" */
  dateOfBirth: string;
  gender: 'male' | 'female';
  /** Calculated Day Master pillar from the birth chart, e.g. "Yin Water", "Yang Wood" */
  dayMaster?: string;
  /** AI-generated Ba Zi interpretation narrative */
  reading?: string;
}

export interface PersonalPreferences {
  mbti?: MBTIType;
  baZiReading?: BaZiReading;
  /** Free-form property feature preferences, e.g. ["near MRT", "good schools", "quiet"] */
  propertyPreferences: string[];
  likesHighFloor: boolean;
  petFriendlyRequired: boolean;
  /** Ordered list of proximity priorities, e.g. ["school", "mrt", "mall"] */
  proximityPriorities: string[];
}

/** A platform-issued badge certifying a particular aspect of a user's identity or credentials */
export interface VerificationBadge {
  /** Badge type identifier, e.g. "singpass", "cea", "homeowner", "developer" */
  type: string;
  label: string;
  issuedAt: Date;
  expiresAt?: Date;
}

export interface SingpassVerification {
  verified: boolean;
  verifiedAt?: Date;
  /** SHA-256 hash of the NRIC — the raw NRIC must never be stored or logged */
  nricHash?: string;
  /** Full legal name as returned by MyInfo */
  name?: string;
  /** Nationality string as returned by MyInfo */
  nationality?: string;
  /** ISO 8601 date of birth sourced from MyInfo */
  dateOfBirth?: string;
  /** Registered residential address from MyInfo; used for ownership verification */
  homeAddress?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  /** Contact number in E.164 format, e.g. "+6591234567" */
  phone: string;
  role: UserRole;
  residencyStatus: ResidencyStatus;
  singpassVerification: SingpassVerification;
  preferences: PersonalPreferences;
  /** Platform-issued verification badges (Singpass, CEA, homeowner, etc.) */
  verificationBadges: VerificationBadge[];
  /** Reference to a FamilyGroup for multi-generational portfolio planning; absent if not in a group */
  familyGroupId?: string;
  buyHistory: PropertyTransaction[];
  sellHistory: PropertyTransaction[];
  rentHistory: PropertyTransaction[];
  createdAt: Date;
  updatedAt: Date;
}
