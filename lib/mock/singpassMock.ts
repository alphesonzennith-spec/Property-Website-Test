import { UserRole } from '@/types/user';

// SINGPASS_SWAP: MyInfo API field definitions
// Real values come from MyInfo API after OAuth callback
// Docs: https://api.singpass.gov.sg/library/myinfo/developers/overview

export interface MyInfoData {
    sub: string;
    name: string;
    nationality: string;
    dob: string;
    residentialStatus: 'CITIZEN' | 'PR' | 'FOREIGNER' | 'UNKNOWN';
    regadd: {
        block: string;
        building: string;
        street: string;
        floor: string;
        unit: string;
        postal: string;
        country: string;
        type: 'SG' | 'UNFORMATTED';
    };
    email?: string;
    mobileno?: string;
    sex: 'M' | 'F' | 'U';
    marital: 'SINGLE' | 'MARRIED' | 'WIDOWED' | 'DIVORCED' | 'SEPARATED';
    ownerprivate: boolean;
    hdbtype?: string;
    housingtype?: string;
}

export interface SingpassTokens {
    accessToken: string;
    tokenType: string;
    expiresIn: number;
    scope: string;
    sub: string;
}

export interface SingpassVerificationRecord {
    verified: boolean;
    verifiedAt: Date | null;
    sub: string | null;
    myInfoSnapshot: MyInfoData | null;
    verificationMethod: 'singpass' | 'manual' | 'pending' | 'none';
    failureReason?: string;
}

// SINGPASS_SWAP: Mock MyInfo profiles simulating API responses - replace with real MyInfo API
// Each profile maps to a user in /lib/mock/users.ts by userId

export const MOCK_MYINFO_PROFILES: Record<string, MyInfoData> = {
    "user_sc_first_time": {
        sub: "S9512345A_UUID",
        name: "Tan Wei Ming",
        nationality: "SINGAPOREAN",
        dob: "1995-06-15",
        residentialStatus: "CITIZEN",
        regadd: {
            block: "123",
            building: "ANG MO KIO AVENUE 3",
            street: "ANG MO KIO AVENUE 3",
            floor: "05",
            unit: "112",
            postal: "560123",
            country: "SG",
            type: "SG"
        },
        sex: "M",
        marital: "SINGLE",
        ownerprivate: false,
        hdbtype: undefined
    },
    "user_sc_hdb_owner": {
        sub: "S8812345B_UUID",
        name: "Lim Mei Xin",
        nationality: "SINGAPOREAN",
        dob: "1988-03-22",
        residentialStatus: "CITIZEN",
        regadd: {
            block: "456",
            building: "CLEMENTI AVENUE 3",
            street: "CLEMENTI AVENUE 3",
            floor: "10",
            unit: "223",
            postal: "120456",
            country: "SG",
            type: "SG"
        },
        sex: "F",
        marital: "MARRIED",
        ownerprivate: false,
        hdbtype: "4-ROOM"
    },
    "user_sc_private_owner": {
        sub: "S8212345C_UUID",
        name: "Wong Jian Hao",
        nationality: "SINGAPOREAN",
        dob: "1982-11-08",
        residentialStatus: "CITIZEN",
        regadd: {
            block: "88",
            building: "ORCHARD BOULEVARD",
            street: "ORCHARD BOULEVARD",
            floor: "15",
            unit: "88",
            postal: "248656",
            country: "SG",
            type: "SG"
        },
        sex: "M",
        marital: "MARRIED",
        ownerprivate: true,
        hdbtype: undefined
    },
    "user_pr_first_time": {
        sub: "F9112345D_UUID",
        name: "Rajesh Kumar",
        nationality: "INDIAN",
        dob: "1991-09-30",
        residentialStatus: "PR",
        regadd: {
            block: "789",
            building: "TAMPINES STREET 81",
            street: "TAMPINES STREET 81",
            floor: "08",
            unit: "45",
            postal: "520789",
            country: "SG",
            type: "SG"
        },
        sex: "M",
        marital: "SINGLE",
        ownerprivate: false
    },
    "user_foreigner": {
        sub: "G9512345E_UUID",
        name: "Ahmad Faizal",
        nationality: "MALAYSIAN",
        dob: "1995-12-01",
        residentialStatus: "FOREIGNER",
        regadd: {
            block: "10A",
            building: "RIVER VALLEY ROAD",
            street: "RIVER VALLEY ROAD",
            floor: "03",
            unit: "12",
            postal: "238275",
            country: "SG",
            type: "SG"
        },
        sex: "M",
        marital: "SINGLE",
        ownerprivate: false
    },
    "user_agent_01": {
        sub: "S8512345F_UUID",
        name: "Sarah Tan",
        nationality: "SINGAPOREAN",
        dob: "1985-04-12",
        residentialStatus: "CITIZEN",
        regadd: {
            block: "55",
            building: "BISHAN STREET 11",
            street: "BISHAN STREET 11",
            floor: "12",
            unit: "34",
            postal: "570055",
            country: "SG",
            type: "SG"
        },
        sex: "F",
        marital: "SINGLE",
        ownerprivate: true
    },
    "user_sc_hdb_eligible_joint": {
        sub: "S9012345G_UUID",
        name: "Chen Li Ying",
        nationality: "SINGAPOREAN",
        dob: "1990-07-07",
        residentialStatus: "CITIZEN",
        regadd: {
            block: "234",
            building: "JURONG EAST STREET 21",
            street: "JURONG EAST STREET 21",
            floor: "06",
            unit: "78",
            postal: "600234",
            country: "SG",
            type: "SG"
        },
        sex: "F",
        marital: "MARRIED",
        ownerprivate: false
    },
    "user-001": {
        sub: "S9512345A_USER001",
        name: "Tan Wei Ming",
        nationality: "SINGAPOREAN",
        dob: "1985-04-12",
        residentialStatus: "CITIZEN",
        regadd: { block: "123", building: "TAMPINES STREET 11", street: "TAMPINES STREET 11", floor: "08", unit: "45", postal: "521123", country: "SG", type: "SG" },
        sex: "M",
        marital: "MARRIED",
        ownerprivate: false,
        hdbtype: "4-ROOM"
    },
    "user-005": {
        sub: "S8512345B_USER005",
        name: "Lee Wei Ling",
        nationality: "SINGAPOREAN",
        dob: "1985-11-20",
        residentialStatus: "CITIZEN",
        regadd: { block: "101", building: "PASIR RIS STREET 12", street: "PASIR RIS STREET 12", floor: "12", unit: "34", postal: "510101", country: "SG", type: "SG" },
        sex: "F",
        marital: "MARRIED",
        ownerprivate: false,
        hdbtype: "5-ROOM"
    }
};

// SINGPASS_SWAP: Mock verification states for testing all UI states
// SUPABASE: Real verification states written after Singpass OAuth callback
// SUPABASE: Create user_singpass_verification table schema

export const MOCK_VERIFICATION_STATES: Record<string, SingpassVerificationRecord> = {
    "user_sc_first_time": {
        verified: true,
        verifiedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 3 months ago
        sub: "S9512345A_UUID",
        myInfoSnapshot: MOCK_MYINFO_PROFILES["user_sc_first_time"],
        verificationMethod: 'singpass'
    },
    "user_sc_hdb_owner": {
        verified: true,
        verifiedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 1 month ago
        sub: "S8812345B_UUID",
        myInfoSnapshot: MOCK_MYINFO_PROFILES["user_sc_hdb_owner"],
        verificationMethod: 'singpass'
    },
    "user_sc_private_owner": {
        verified: true,
        verifiedAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), // 6 months ago
        sub: "S8212345C_UUID",
        myInfoSnapshot: MOCK_MYINFO_PROFILES["user_sc_private_owner"],
        verificationMethod: 'singpass'
    },
    "user_pr_first_time": {
        verified: true,
        verifiedAt: new Date(),
        sub: "F9112345D_UUID",
        myInfoSnapshot: MOCK_MYINFO_PROFILES["user_pr_first_time"],
        verificationMethod: 'singpass'
    },
    "user_foreigner": {
        verified: true,
        verifiedAt: new Date(),
        sub: "G9512345E_UUID",
        myInfoSnapshot: MOCK_MYINFO_PROFILES["user_foreigner"],
        verificationMethod: 'singpass'
    },
    "user_agent_01": {
        verified: true,
        verifiedAt: new Date(),
        sub: "S8512345F_UUID",
        myInfoSnapshot: MOCK_MYINFO_PROFILES["user_agent_01"],
        verificationMethod: 'singpass'
    },
    "user_unverified": {
        verified: false,
        verifiedAt: null,
        sub: null,
        myInfoSnapshot: null,
        verificationMethod: 'none'
    },
    "user_pending": {
        verified: false,
        verifiedAt: null,
        sub: null,
        myInfoSnapshot: null,
        verificationMethod: 'pending'
    },
    "user_failed": {
        verified: false,
        verifiedAt: null,
        sub: null,
        myInfoSnapshot: null,
        verificationMethod: 'none',
        failureReason: 'Identity document mismatch'
    },
    "user-001": {
        verified: true,
        verifiedAt: new Date('2023-03-15'),
        sub: "S9512345A_USER001",
        myInfoSnapshot: MOCK_MYINFO_PROFILES["user-001"],
        verificationMethod: 'singpass'
    },
    "user-005": {
        verified: true,
        verifiedAt: new Date('2023-05-10'),
        sub: "S8512345B_USER005",
        myInfoSnapshot: MOCK_MYINFO_PROFILES["user-005"],
        verificationMethod: 'singpass'
    }
};

// SINGPASS_SWAP: Mock session — replaces Supabase Auth session
// Real session comes from @supabase/ssr createServerClient()
// See Phase 5.1 implementation in /lib/supabase/server.ts

export interface MockSession {
    userId: string;
    email: string;
    role: UserRole;
    isAuthenticated: boolean;
    singpassVerification: SingpassVerificationRecord;
}

export const MOCK_SESSIONS: Record<string, MockSession> = {
    "user_sc_first_time": {
        userId: "user_sc_first_time",
        email: "wei.ming@example.com",
        role: UserRole.Buyer,
        isAuthenticated: true,
        singpassVerification: MOCK_VERIFICATION_STATES["user_sc_first_time"]
    },
    "user_sc_hdb_owner": {
        userId: "user_sc_hdb_owner",
        email: "meixin.lim@example.com",
        role: UserRole.Owner,
        isAuthenticated: true,
        singpassVerification: MOCK_VERIFICATION_STATES["user_sc_hdb_owner"]
    },
    "user_sc_private_owner": {
        userId: "user_sc_private_owner",
        email: "jianhao.wong@example.com",
        role: UserRole.Owner,
        isAuthenticated: true,
        singpassVerification: MOCK_VERIFICATION_STATES["user_sc_private_owner"]
    },
    "user_pr_first_time": {
        userId: "user_pr_first_time",
        email: "rajesh.kumar@example.com",
        role: UserRole.Buyer,
        isAuthenticated: true,
        singpassVerification: MOCK_VERIFICATION_STATES["user_pr_first_time"]
    },
    "user_foreigner": {
        userId: "user_foreigner",
        email: "ahmad.faizal@example.com",
        role: UserRole.Renter,
        isAuthenticated: true,
        singpassVerification: MOCK_VERIFICATION_STATES["user_foreigner"]
    },
    "user_agent_01": {
        userId: "user_agent_01",
        email: "sarah.tan@example.com",
        role: UserRole.Agent,
        isAuthenticated: true,
        singpassVerification: MOCK_VERIFICATION_STATES["user_agent_01"]
    },
    "user_sc_hdb_eligible_joint": {
        userId: "user_sc_hdb_eligible_joint",
        email: "liying.chen@example.com",
        role: UserRole.Buyer,
        isAuthenticated: true,
        singpassVerification: {
            verified: true,
            verifiedAt: new Date(),
            sub: "S9012345G_UUID",
            myInfoSnapshot: MOCK_MYINFO_PROFILES["user_sc_hdb_eligible_joint"],
            verificationMethod: 'singpass'
        }
    },
    "user_unverified": {
        userId: "user_unverified",
        email: "unverified@example.com",
        role: UserRole.Buyer,
        isAuthenticated: true,
        singpassVerification: MOCK_VERIFICATION_STATES["user_unverified"]
    },
    "user_pending": {
        userId: "user_pending",
        email: "pending@example.com",
        role: UserRole.Buyer,
        isAuthenticated: true,
        singpassVerification: MOCK_VERIFICATION_STATES["user_pending"]
    },
    "user_failed": {
        userId: "user_failed",
        email: "failed@example.com",
        role: UserRole.Buyer,
        isAuthenticated: true,
        singpassVerification: MOCK_VERIFICATION_STATES["user_failed"]
    },
    "user_logged_out": {
        userId: "user_logged_out",
        email: "",
        role: UserRole.Buyer,
        isAuthenticated: false,
        singpassVerification: MOCK_VERIFICATION_STATES["user_unverified"]
    },
    "user-001": {
        userId: "user-001",
        email: "tan.weiming@gmail.com",
        role: UserRole.Buyer,
        isAuthenticated: true,
        singpassVerification: MOCK_VERIFICATION_STATES["user-001"]
    },
    "user-005": {
        userId: "user-005",
        email: "lee.weiling@gmail.com",
        role: UserRole.Buyer,
        isAuthenticated: true,
        singpassVerification: MOCK_VERIFICATION_STATES["user-005"]
    }
};

export function getMockSession(userId: string): MockSession {
    return MOCK_SESSIONS[userId] || MOCK_SESSIONS["user_logged_out"];
}

// SINGPASS_SWAP: Change this value to test different user states
// "user_logged_out" → default logged out state
// "user_unverified" → tests unverified flow
// "user_pending" → tests pending verification flow  
// "user_failed" → tests failed verification flow
// "user_sc_private_owner" → tests ABSD warning flows
// "user_sc_first_time" → tests standard verified flow
// "user_foreigner" → tests restricted access flows
// "user-001" → tests Family Dashboard (The Tan Family)
// "user-005" → tests Family Dashboard (The Lee Family)
export const ACTIVE_MOCK_USER_ID: string = "user-001";

export function getMockMyInfo(userId: string): MyInfoData | null {
    return MOCK_MYINFO_PROFILES[userId] || null;
}
