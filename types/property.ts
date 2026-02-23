export enum PropertyType {
  HDB = 'HDB',
  Condo = 'Condo',
  Landed = 'Landed',
  EC = 'EC',
  Commercial = 'Commercial',
  Industrial = 'Industrial',
}

export enum HDBRoomType {
  OneRoom = '1-Room',
  TwoRoom = '2-Room',
  ThreeRoom = '3-Room',
  FourRoom = '4-Room',
  FiveRoom = '5-Room',
  ThreeGen = '3Gen',
  Executive = 'Executive',
}

export enum ListingType {
  Sale = 'Sale',
  Rent = 'Rent',
}

export enum Tenure {
  Freehold = 'Freehold',
  Leasehold99 = 'Leasehold99',
  Leasehold999 = 'Leasehold999',
  Leasehold30 = 'Leasehold30',
}

export enum Furnishing {
  Unfurnished = 'Unfurnished',
  PartialFurnished = 'PartialFurnished',
  FullyFurnished = 'FullyFurnished',
}

export enum PropertyStatus {
  Active = 'Active',
  Pending = 'Pending',
  UnderOffer = 'UnderOffer',
  Sold = 'Sold',
  Rented = 'Rented',
  Withdrawn = 'Withdrawn',
}

export enum ListingSource {
  OwnerDirect = 'OwnerDirect',
  Agent = 'Agent',
  Developer = 'Developer',
  Platform = 'Platform',
}

export enum VerificationLevel {
  Unverified = 'Unverified',
  OwnershipVerified = 'OwnershipVerified',
  LegalDocsVerified = 'LegalDocsVerified',
  FullyVerified = 'FullyVerified',
}

export type District =
  | 'D01' | 'D02' | 'D03' | 'D04' | 'D05' | 'D06' | 'D07'
  | 'D08' | 'D09' | 'D10' | 'D11' | 'D12' | 'D13' | 'D14'
  | 'D15' | 'D16' | 'D17' | 'D18' | 'D19' | 'D20' | 'D21'
  | 'D22' | 'D23' | 'D24' | 'D25' | 'D26' | 'D27' | 'D28';

export type HDBTown =
  | 'Ang Mo Kio'
  | 'Bedok'
  | 'Bishan'
  | 'Bukit Batok'
  | 'Bukit Merah'
  | 'Bukit Panjang'
  | 'Bukit Timah'
  | 'Central Area'
  | 'Choa Chu Kang'
  | 'Clementi'
  | 'Geylang'
  | 'Hougang'
  | 'Jurong East'
  | 'Jurong West'
  | 'Kallang / Whampoa'
  | 'Marine Parade'
  | 'Pasir Ris'
  | 'Punggol'
  | 'Queenstown'
  | 'Sembawang'
  | 'Sengkang'
  | 'Serangoon'
  | 'Tampines'
  | 'Toa Payoh'
  | 'Woodlands'
  | 'Yishun';

export enum MRTLine {
  NSL = 'NSL',
  EWL = 'EWL',
  NEL = 'NEL',
  CCL = 'CCL',
  DTL = 'DTL',
  TEL = 'TEL',
  JRL = 'JRL',
  /** Cross Island Line — upcoming */
  CRL = 'CRL',
}

export interface PropertyImage {
  id: string;
  url: string;
  isPrimary: boolean;
  /** Display order index; lower values appear first */
  orderIndex: number;
  type: 'photo' | 'floorplan' | '360tour';
}

export interface PropertyLayout {
  has2DFloorplan: boolean;
  has3DModel: boolean;
  has360Tour: boolean;
  floorplanUrl?: string;
  modelUrl?: string;
  tourUrl?: string;
}

export interface NearbyAmenity {
  name: string;
  /** Amenity category, e.g. "school", "supermarket", "park", "clinic" */
  type: string;
  distanceMeters: number;
  walkingMinutes: number;
}

export interface MRTProximity {
  /** MRT / LRT station name, e.g. "Bishan" */
  station: string;
  line: MRTLine;
  distanceMeters: number;
}

export interface Property {
  id: string;
  listingType: ListingType;
  propertyType: PropertyType;

  // ── Singapore-specific ────────────────────────────────────────────────────
  district: District;
  /** HDB town classification; only set when propertyType is HDB */
  hdbTown?: HDBTown;
  /** HDB flat type; only set when propertyType is HDB */
  hdbRoomType?: HDBRoomType;
  /** HDB block number, e.g. "123A" */
  hdbBlock?: string;
  tenure: Tenure;
  postalCode: string;
  /** Full unit number, e.g. "#12-34" */
  unitNumber?: string;
  floorLevel?: number;
  totalFloors?: number;

  // ── Financials ────────────────────────────────────────────────────────────
  /** Asking price in SGD */
  price: number;
  /** Price per square foot in SGD */
  psf?: number;
  priceNegotiable: boolean;
  /** Gross annual rental yield as a percentage; applicable to sale listings */
  rentalYield?: number;

  // ── Details ───────────────────────────────────────────────────────────────
  bedrooms: number;
  bathrooms: number;
  floorAreaSqft: number;
  builtUpAreaSqft?: number;
  /** Land area in sqft; only applicable to Landed properties */
  landAreaSqft?: number;
  furnishing: Furnishing;
  /** Calendar year the development received its TOP */
  completionYear?: number;
  /** Expected TOP date for under-construction projects (ISO 8601) */
  topDate?: string;

  // ── Verification ──────────────────────────────────────────────────────────
  verificationLevel: VerificationLevel;
  /** Presigned URL to the official title deed / ownership document */
  ownershipDocUrl?: string;
  /** Presigned URLs to supporting legal documents (e.g. SPA, conveyancing letters) */
  legalDocUrls: string[];

  // ── Layout & Media ────────────────────────────────────────────────────────
  layout: PropertyLayout;
  images: PropertyImage[];

  // ── Location ──────────────────────────────────────────────────────────────
  address: string;
  latitude: number;
  longitude: number;
  nearbyMRT: MRTProximity[];
  nearbyAmenities: NearbyAmenity[];

  // ── Listing meta ──────────────────────────────────────────────────────────
  listingSource: ListingSource;
  /** CEA-registered agent user ID; absent for owner-direct listings */
  agentId?: string;
  /** Verified owner's user ID, confirmed via Singpass MyInfo */
  ownerId: string;
  status: PropertyStatus;
  /** Whether the listing is featured / promoted on the platform */
  featured: boolean;
  viewsCount: number;

  // ── AI-generated fields ───────────────────────────────────────────────────
  /** AI-generated marketing description */
  aiGeneratedDescription?: string;
  /** 0–100 quality score assigned by the listing AI grader */
  listingQualityScore?: number;
  /** Short AI-generated highlights, e.g. ["Corner unit", "Unblocked city view"] */
  aiHighlights: string[];

  // ── Metadata ──────────────────────────────────────────────────────────────
  createdAt: Date;
  updatedAt: Date;
  /** Date the property was sold or tenancy commenced */
  soldAt?: Date;
  /** Final transacted price in SGD */
  transactedPrice?: number;
}
