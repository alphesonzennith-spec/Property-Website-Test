// ============================================================
// useAuth.ts — Space Realty Authentication Hook
// ============================================================
// SINGPASS_SWAP: This file is the ONLY file that needs to change
// when Phase 5.1 Singpass backend is integrated.
//
// Current: Returns mock data from /lib/mock/singpassMock.ts
// Phase 5.1 replacement steps:
//   1. Replace getMockSession() with Supabase createServerClient() session
//   2. Replace getMockMyInfo() with real MyInfo API data from Supabase table
//   3. Replace loginWithSingpass() with router.push('/api/singpass/authorize')
//   4. Replace logout() with supabase.auth.signOut()
//   5. Delete the import from /lib/mock/singpassMock.ts
//
// Search codebase for "SINGPASS_SWAP" to find all related swap points.
// ============================================================

import { useState, useEffect } from 'react';
import { UserRole } from '@/types/user';
import {
    ACTIVE_MOCK_USER_ID,
    getMockSession,
    getMockMyInfo,
} from '../mock/singpassMock';

export interface AuthState {
    // User identity
    userId: string | null;
    email: string | null;
    role: UserRole | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    // Singpass verification
    isSingpassVerified: boolean;
    verificationStatus: 'none' | 'pending' | 'verified' | 'failed';
    verifiedAt: Date | null;
    failureReason: string | undefined;

    // MyInfo data (populated after Singpass verification)
    // These fields are null until user verifies with Singpass
    legalName: string | null;
    nationality: string | null;
    dateOfBirth: string | null;
    residentialStatus: 'CITIZEN' | 'PR' | 'FOREIGNER' | 'UNKNOWN' | null;
    homeAddress: string | null;
    ownsPrivateProperty: boolean | null;
    hdbFlatType: string | null;

    // Derived eligibility flags (computed from MyInfo data)
    // Used throughout the app to show/hide features
    canBuyHDB: boolean | null;
    isSubjectToABSD: boolean | null;
    absdTier: number | null;

    // Auth actions
    // SINGPASS_SWAP: These functions trigger real OAuth in Phase 5.1
    loginWithSingpass: () => void;
    loginWithEmail: (email: string, password: string) => Promise<void>;
    loginWithGoogle: () => void;
    logout: () => void;
    refreshVerificationStatus: () => void;
}

// Simple global pub/sub for mock auth state so Navbar and Pages sync instantly
let globalMockUserId = ACTIVE_MOCK_USER_ID;
const mockAuthListeners = new Set<() => void>();

function setGlobalMockUserId(id: string) {
    if (globalMockUserId !== id) {
        globalMockUserId = id;
        mockAuthListeners.forEach(listener => listener());
    }
}

export function useAuth(): AuthState {
    const [userId, setUserId] = useState<string>(globalMockUserId);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // Sync instance state with global mock state
    useEffect(() => {
        const listener = () => setUserId(globalMockUserId);
        mockAuthListeners.add(listener);
        return () => { mockAuthListeners.delete(listener); };
    }, []);

    // Derive everything from mock session
    const session = getMockSession(userId);
    const myInfo = getMockMyInfo(userId);

    // Format home address
    let homeAddress: string | null = null;
    if (myInfo && myInfo.regadd) {
        const { block, street, floor, unit, postal } = myInfo.regadd;
        const blockStr = block ? `Block ${block} ` : '';
        const floorUnitStr = floor && unit ? `, #${floor}-${unit}` : '';
        homeAddress = `${blockStr}${street}${floorUnitStr}, Singapore ${postal}`;
    }

    // Derive eligibility
    const resStatus = myInfo?.residentialStatus ?? null;
    const ownsPrivateProperty = myInfo?.ownerprivate ?? null;
    const hdbFlatType = myInfo?.hdbtype ?? null;

    let canBuyHDB: boolean | null = null;
    if (resStatus === 'CITIZEN' && ownsPrivateProperty === false) {
        canBuyHDB = true;
    } else if (resStatus === 'PR' && ownsPrivateProperty === false && !hdbFlatType) {
        canBuyHDB = true;
    } else if (resStatus) {
        canBuyHDB = false;
    }

    // Derive ABSD Tier
    let absdTier: number | null = null;
    let isSubjectToABSD: boolean | null = null;

    if (resStatus) {
        let propCount = 0;
        if (ownsPrivateProperty) propCount++;
        if (hdbFlatType) propCount++;

        if (resStatus === 'CITIZEN') {
            if (propCount === 0) absdTier = 0;
            else if (propCount === 1) absdTier = 20;
            else absdTier = 30;
        } else if (resStatus === 'PR') {
            if (propCount === 0) absdTier = 5;
            else absdTier = 30;
        } else if (resStatus === 'FOREIGNER' || resStatus === 'UNKNOWN') {
            absdTier = 60;
        }

        if (absdTier !== null) {
            isSubjectToABSD = absdTier > 0;
        }
    }

    // Verification status mapping
    let vStatus: 'none' | 'pending' | 'verified' | 'failed' = 'none';
    if (session.singpassVerification.verified) {
        vStatus = 'verified';
    } else if (session.singpassVerification.failureReason) {
        vStatus = 'failed';
    } else if (session.singpassVerification.verificationMethod === 'pending') {
        vStatus = 'pending';
    }

    // Auth actions
    const loginWithSingpass = () => {
        console.log("SINGPASS_SWAP: Would redirect to /api/singpass/authorize");
        // SUPABASE (uncomment when Singpass backend is connected):
        // router.push('/api/singpass/authorize');
        // The /api/singpass/authorize route handles PKCE initiation:
        //   1. Generate code_verifier + code_challenge (crypto.subtle)
        //   2. Store code_verifier in a secure httpOnly session cookie
        //   3. Build Singpass authorization URL with client_id, redirect_uri, scope, code_challenge
        //   4. Redirect browser to Singpass authorization server
        // See: docs/plans/2026-02-25-singpass-myinfo-integration-design.md
        console.log("Phase 5.1 will implement the real PKCE OAuth flow here");
        setGlobalMockUserId(ACTIVE_MOCK_USER_ID === "user_logged_out" ? "user-001" : ACTIVE_MOCK_USER_ID); // Mock successful singpass login
    };

    const loginWithEmail = async (email: string, password: string) => {
        console.log("SINGPASS_SWAP: Would call supabase.auth.signInWithPassword");
        // SUPABASE (uncomment when Supabase Auth is connected):
        // setIsLoading(true);
        // const { error } = await supabase.auth.signInWithPassword({ email, password });
        // setIsLoading(false);
        // if (error) throw new Error(error.message);
        // Session state will be updated automatically via supabase.auth.onAuthStateChange listener.
        console.log("Phase 5.1 will implement the real email login here");
        setGlobalMockUserId(ACTIVE_MOCK_USER_ID === "user_logged_out" ? "user-001" : ACTIVE_MOCK_USER_ID); // Mock successful login
    };

    const loginWithGoogle = () => {
        console.log("SINGPASS_SWAP: Would redirect to Google OAuth");
        // SUPABASE (uncomment when Supabase Auth is connected):
        // await supabase.auth.signInWithOAuth({
        //   provider: 'google',
        //   options: {
        //     redirectTo: `${window.location.origin}/auth/callback`,
        //     scopes: 'openid email profile',
        //   },
        // });
        // Profile picture from Google is available at session.user.user_metadata.avatar_url
        // (lh3.googleusercontent.com — already whitelisted in next.config.ts remotePatterns)
        console.log("Phase 5.1 will implement the real Google login here");
        setGlobalMockUserId(ACTIVE_MOCK_USER_ID === "user_logged_out" ? "user-001" : ACTIVE_MOCK_USER_ID); // Mock successful login
    };

    const logout = () => {
        console.log("SINGPASS_SWAP: Would call supabase.auth.signOut()");
        // SUPABASE (uncomment when Supabase Auth is connected):
        // await supabase.auth.signOut();
        // onAuthStateChange fires with event='SIGNED_OUT', clearing session state across all components.
        // Remove the setGlobalMockUserId call and the global pub/sub mechanism entirely.
        console.log("Phase 5.1 will implement the real logout here");
        setGlobalMockUserId("user_logged_out"); // synchronize logout across all components
    };

    const refreshVerificationStatus = () => {
        console.log("SINGPASS_SWAP: Would refresh user session from Supabase to get latest verification status");
        // SUPABASE (uncomment when Supabase Auth is connected):
        // const { data: { session } } = await supabase.auth.refreshSession();
        // if (!session?.user) return;
        //
        // const { data: verification } = await supabase
        //   .from('singpass_verifications')
        //   .select('verified, verified_at, verification_method, failure_reason, name, nationality, date_of_birth, home_address, myinfo_snapshot')
        //   .eq('user_id', session.user.id)
        //   .maybeSingle();
        //
        // Update local state with the fresh verification row to re-derive
        // isSingpassVerified, verificationStatus, legalName, residentialStatus, etc.
        // This is called by the Singpass callback page after the OAuth flow completes.
        console.log("Phase 5.1 will implement real token refresh here");
    };

    return {
        userId: session.userId,
        email: session.email,
        role: session.role,
        isAuthenticated: session.isAuthenticated,
        isLoading,

        isSingpassVerified: session.singpassVerification.verified,
        verificationStatus: vStatus,
        verifiedAt: session.singpassVerification.verifiedAt,
        failureReason: session.singpassVerification.failureReason,

        legalName: myInfo?.name ?? null,
        nationality: myInfo?.nationality ?? null,
        dateOfBirth: myInfo?.dob ?? null,
        residentialStatus: resStatus,
        homeAddress,
        ownsPrivateProperty,
        hdbFlatType,

        canBuyHDB,
        isSubjectToABSD,
        absdTier,

        loginWithSingpass,
        loginWithEmail,
        loginWithGoogle,
        logout,
        refreshVerificationStatus
    };
}
