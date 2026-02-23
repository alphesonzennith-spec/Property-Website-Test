import { FamilyGroup, FamilyRole } from '../../types';

export const mockFamilies: FamilyGroup[] = [
  // fam-001: The Tan Family
  {
    id: 'fam-001',
    name: 'The Tan Family',
    headUserId: 'user-001',
    members: [
      { userId: 'user-001', role: FamilyRole.Head, relationship: 'Husband', addedAt: new Date('2023-03-15') },
      { userId: 'user-002', role: FamilyRole.Spouse, relationship: 'Wife', addedAt: new Date('2023-03-16') },
    ],
    combinedProperties: ['prop-001'],
    eligibilitySummary: {
      totalPropertiesOwned: 1,
      absdLiability: [
        { applicableRate: 0.20, amount: 136000, rationale: 'Singapore Citizen buying 2nd property: 20% ABSD on 680,000 SGD' },
      ],
      combinedTDSRCapacity: 4785000,
      combinedCPFAvailable: 180000,
      canBuyHDB: false,
      hdbEligibilityNotes: ['Already own one HDB flat — must dispose before buying another'],
    },
  },
  // fam-002: The Lim-Rashid Family
  {
    id: 'fam-002',
    name: 'The Lim-Rashid Family',
    headUserId: 'user-003',
    members: [
      { userId: 'user-003', role: FamilyRole.Head, relationship: 'Fiancee', addedAt: new Date('2023-04-20') },
      { userId: 'user-004', role: FamilyRole.Spouse, relationship: 'Fiance', addedAt: new Date('2023-04-21') },
    ],
    combinedProperties: [],
    eligibilitySummary: {
      totalPropertiesOwned: 0,
      absdLiability: [
        { applicableRate: 0, amount: 0, rationale: 'First-time buyers: 0% ABSD' },
      ],
      combinedTDSRCapacity: 2970000,
      combinedCPFAvailable: 65000,
      canBuyHDB: true,
      hdbEligibilityNotes: [
        'Eligible under Fiance/Fiancee Scheme',
        'Must register marriage within 3 months of key collection',
      ],
    },
  },
  // fam-003: The Mehta Family
  {
    id: 'fam-003',
    name: 'The Mehta Family',
    headUserId: 'user-005',
    members: [
      { userId: 'user-005', role: FamilyRole.Head, relationship: 'Father', addedAt: new Date('2023-05-10') },
      { userId: 'user-010', role: FamilyRole.Spouse, relationship: 'Mother', addedAt: new Date('2023-05-10') },
      { userId: 'user-013', role: FamilyRole.Child, relationship: 'Son', addedAt: new Date('2023-05-11') },
    ],
    combinedProperties: ['prop-010', 'prop-020', 'prop-030'],
    eligibilitySummary: {
      totalPropertiesOwned: 3,
      absdLiability: [
        { applicableRate: 0.30, amount: 450000, rationale: 'Singapore PR buying 3rd+ property: 30% ABSD' },
      ],
      combinedTDSRCapacity: 14850000,
      combinedCPFAvailable: 420000,
      canBuyHDB: false,
      hdbEligibilityNotes: ['HDB not eligible — multiple private properties owned'],
    },
  },
  // fam-004: The Wong Multi-Gen Family
  {
    id: 'fam-004',
    name: 'The Wong Multi-Gen Family',
    headUserId: 'user-006',
    members: [
      { userId: 'user-006', role: FamilyRole.Head, relationship: 'Husband', addedAt: new Date('2023-06-01') },
      { userId: 'user-007', role: FamilyRole.Spouse, relationship: 'Wife', addedAt: new Date('2023-06-02') },
      { userId: 'user-011', role: FamilyRole.Parent, relationship: 'Father-in-law', addedAt: new Date('2023-06-05') },
      { userId: 'user-008', role: FamilyRole.Child, relationship: 'Son', addedAt: new Date('2023-06-03') },
    ],
    combinedProperties: ['prop-005'],
    eligibilitySummary: {
      totalPropertiesOwned: 1,
      absdLiability: [
        { applicableRate: 0.20, amount: 240000, rationale: 'SC buying 2nd property: 20% ABSD on 1.2M condo' },
      ],
      combinedTDSRCapacity: 7260000,
      combinedCPFAvailable: 310000,
      canBuyHDB: true,
      hdbEligibilityNotes: [
        'Eligible for 3Gen HDB flat if seniors are direct family',
        'Must include at least one child aged 21+ with parent/grandparent',
      ],
    },
  },
  // fam-005: The Mitchell Family
  {
    id: 'fam-005',
    name: 'The Mitchell Family',
    headUserId: 'user-009',
    members: [
      { userId: 'user-009', role: FamilyRole.Head, relationship: 'Primary applicant', addedAt: new Date('2023-07-10') },
      { userId: 'user-014', role: FamilyRole.Spouse, relationship: 'Spouse', addedAt: new Date('2023-07-10') },
    ],
    combinedProperties: [],
    eligibilitySummary: {
      totalPropertiesOwned: 0,
      absdLiability: [
        { applicableRate: 0.60, amount: 0, rationale: 'Foreigner: 60% ABSD applies if purchasing residential property in Singapore' },
      ],
      combinedTDSRCapacity: 5940000,
      combinedCPFAvailable: 0,
      canBuyHDB: false,
      hdbEligibilityNotes: [
        'Foreigners are not eligible to purchase HDB flats',
        'EP holders may rent HDB rooms with owner approval',
      ],
    },
  },
];
