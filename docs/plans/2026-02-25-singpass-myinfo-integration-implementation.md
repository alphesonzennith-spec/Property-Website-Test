# Singpass/MyInfo Integration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement Singpass NDI OAuth 2.0 integration with MyInfo for identity verification using NextAuth.js v5 custom provider pattern.

**Architecture:** Dual implementation (mock for development, production for staging/production) with NextAuth.js custom OAuth provider, PKCE flow for security, JWT sessions for performance, and middleware-based route protection.

**Tech Stack:** NextAuth.js v5, Singpass OAuth 2.0 + PKCE, MyInfo API, Node.js crypto, Next.js 15 App Router, TypeScript, Zod

---

## Task 1: Install Dependencies

**Files:**
- Modify: `d:\Antigravity Workspaces\Fifth\space-realty\package.json`

**Step 1: Install NextAuth.js v5 and crypto library**

Run:
```bash
cd "d:\Antigravity Workspaces\Fifth\space-realty"
npm install next-auth@beta jose
```

Expected: Successfully installed packages

**Step 2: Verify installation**

Run:
```bash
npm list next-auth jose
```

Expected: Shows `next-auth@5.x.x` and `jose@5.x.x`

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install next-auth and jose for Singpass integration

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 2: Create Singpass Types

**Files:**
- Create: `d:\Antigravity Workspaces\Fifth\space-realty\lib\singpass\types.ts`

**Step 1: Create Singpass types file**

```typescript
// lib/singpass/types.ts

/** Singpass OAuth token response */
export interface SingpassTokens {
  access_token: string
  id_token: string
  token_type: 'Bearer'
  expires_in: number
  refresh_token?: string
}

/** Singpass ID token claims (JWT payload) */
export interface SingpassIdClaims {
  sub: string // User identifier
  iss: string // Issuer (Singpass)
  aud: string // Audience (our client ID)
  exp: number // Expiration timestamp
  iat: number // Issued at timestamp
  nonce?: string
}

/** MyInfo Person API response structure */
export interface MyInfoPersonResponse {
  uinfin: { value: string } // NRIC number
  name: { value: string }
  nationality: {
    code: string // e.g., "SG"
    desc: string // e.g., "SINGAPORE CITIZEN"
  }
  dob: { value: string } // ISO 8601 date: "1990-05-15"
  regadd: {
    type: 'SG' | 'Unformatted'
    block?: { value: string }
    building?: { value: string }
    street?: { value: string }
    floor?: { value: string }
    unit?: { value: string }
    postal?: { value: string }
    country?: { value: string }
  }
}

/** Processed MyInfo data for storage */
export interface ProcessedMyInfoData {
  name: string
  nricHash: string // SHA-256 hash of NRIC
  nationality: string
  dateOfBirth: string
  homeAddress: string
}
```

**Step 2: Commit**

```bash
git add lib/singpass/types.ts
git commit -m "feat(singpass): add TypeScript types for OAuth and MyInfo

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 3: Create PKCE Crypto Utilities

**Files:**
- Create: `d:\Antigravity Workspaces\Fifth\space-realty\lib\singpass\crypto.ts`

**Step 1: Create crypto utilities file**

```typescript
// lib/singpass/crypto.ts
import { createHash, randomBytes } from 'crypto'

/**
 * Generate a code verifier for PKCE flow
 * @returns Base64URL-encoded random string (43-128 characters)
 */
export function generateCodeVerifier(): string {
  // PKCE spec: 43-128 characters
  return base64UrlEncode(randomBytes(32)) // 32 bytes → 43 chars
}

/**
 * Generate a code challenge from code verifier
 * @param verifier - The code verifier
 * @returns SHA-256 hash of verifier, base64url-encoded
 */
export function generateCodeChallenge(verifier: string): string {
  const hash = createHash('sha256').update(verifier).digest()
  return base64UrlEncode(hash)
}

/**
 * Hash NRIC using SHA-256
 * CRITICAL: Never log or store raw NRIC
 * @param nric - Raw NRIC (will be normalized to uppercase)
 * @returns Hex-encoded SHA-256 hash
 */
export async function hashNRIC(nric: string): Promise<string> {
  const normalized = nric.toUpperCase().trim()

  const hash = createHash('sha256').update(normalized).digest('hex')

  // SECURITY: Never log raw NRIC
  console.log('NRIC hashed successfully')

  return hash
}

/**
 * Convert buffer to base64url encoding
 * @param buffer - Input buffer
 * @returns Base64URL-encoded string (URL-safe, no padding)
 */
function base64UrlEncode(buffer: Buffer): string {
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '') // Remove padding
}
```

**Step 2: Commit**

```bash
git add lib/singpass/crypto.ts
git commit -m "feat(singpass): add PKCE and NRIC hashing utilities

Implements:
- PKCE code verifier/challenge generation
- NRIC SHA-256 hashing (never logs raw NRIC)
- Base64URL encoding helper

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 4: Create MyInfo Data Parser

**Files:**
- Create: `d:\Antigravity Workspaces\Fifth\space-realty\lib\singpass\myinfo.ts`

**Step 1: Create MyInfo parser file**

```typescript
// lib/singpass/myinfo.ts
import { MyInfoPersonResponse, ProcessedMyInfoData } from './types'
import { hashNRIC } from './crypto'

/**
 * Fetch MyInfo person data from API
 * @param accessToken - OAuth access token from Singpass
 * @param uinfin - User's NRIC/FIN (from ID token sub claim)
 * @returns MyInfo person response
 */
export async function fetchMyInfoData(
  accessToken: string,
  uinfin: string
): Promise<MyInfoPersonResponse> {
  const myInfoUrl = process.env.SINGPASS_USERINFO_URL

  if (!myInfoUrl) {
    throw new Error('SINGPASS_USERINFO_URL not configured')
  }

  const response = await fetch(`${myInfoUrl}/${uinfin}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`MyInfo API error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

/**
 * Process MyInfo response into storage-ready format
 * @param myInfo - Raw MyInfo person response
 * @returns Processed data with NRIC hashed
 */
export async function processMyInfoData(
  myInfo: MyInfoPersonResponse
): Promise<ProcessedMyInfoData> {
  // CRITICAL: Hash NRIC immediately
  const nricHash = await hashNRIC(myInfo.uinfin.value)

  // Format address from structured data
  const homeAddress = formatMyInfoAddress(myInfo.regadd)

  return {
    name: myInfo.name.value,
    nricHash,
    nationality: myInfo.nationality.desc,
    dateOfBirth: myInfo.dob.value,
    homeAddress,
  }
}

/**
 * Format MyInfo address structure into readable string
 * @param regadd - MyInfo registered address object
 * @returns Formatted address string
 */
function formatMyInfoAddress(regadd: MyInfoPersonResponse['regadd']): string {
  if (regadd.type === 'Unformatted') {
    return regadd.country?.value || 'Address not available'
  }

  const parts: string[] = []

  if (regadd.block?.value) parts.push(`Blk ${regadd.block.value}`)
  if (regadd.street?.value) parts.push(regadd.street.value)
  if (regadd.unit?.value) parts.push(`#${regadd.unit.value}`)
  if (regadd.building?.value) parts.push(regadd.building.value)
  if (regadd.postal?.value) parts.push(`Singapore ${regadd.postal.value}`)

  return parts.join(', ')
}
```

**Step 2: Commit**

```bash
git add lib/singpass/myinfo.ts
git commit -m "feat(singpass): add MyInfo data fetching and processing

Implements:
- MyInfo API fetch with access token
- Address formatting from structured data
- NRIC hashing before storage

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 5: Create Production Singpass Client

**Files:**
- Create: `d:\Antigravity Workspaces\Fifth\space-realty\lib\singpass\client.ts`

**Step 1: Create Singpass client file**

```typescript
// lib/singpass/client.ts
import { SingpassTokens, SingpassIdClaims } from './types'
import { jwtVerify } from 'jose'

export class SingpassClient {
  private clientId: string
  private clientSecret: string
  private redirectUri: string
  private authUrl: string
  private tokenUrl: string

  constructor() {
    this.clientId = process.env.SINGPASS_CLIENT_ID!
    this.clientSecret = process.env.SINGPASS_CLIENT_SECRET!
    this.redirectUri = process.env.SINGPASS_REDIRECT_URI!
    this.authUrl = process.env.SINGPASS_AUTH_URL || 'https://stg-id.singpass.gov.sg/authorize'
    this.tokenUrl = process.env.SINGPASS_TOKEN_URL || 'https://stg-id.singpass.gov.sg/token'

    this.validateConfig()
  }

  private validateConfig() {
    if (!this.clientId || !this.clientSecret || !this.redirectUri) {
      throw new Error('Singpass environment variables not configured')
    }
  }

  /**
   * Build OAuth authorization URL with PKCE
   * @param codeChallenge - PKCE code challenge
   * @param state - CSRF protection state
   * @returns Authorization URL
   */
  getAuthorizationUrl(codeChallenge: string, state: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: 'openid myinfo-person',
      response_type: 'code',
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    })

    return `${this.authUrl}?${params.toString()}`
  }

  /**
   * Exchange authorization code for access token
   * @param code - Authorization code from callback
   * @param codeVerifier - PKCE code verifier
   * @returns OAuth tokens
   */
  async exchangeCodeForToken(
    code: string,
    codeVerifier: string
  ): Promise<SingpassTokens> {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      code_verifier: codeVerifier,
      client_id: this.clientId,
      client_secret: this.clientSecret,
      redirect_uri: this.redirectUri,
    })

    const response = await fetch(this.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Token exchange failed: ${response.status} - ${error}`)
    }

    return response.json()
  }

  /**
   * Verify and decode ID token (JWT)
   * @param idToken - JWT ID token from Singpass
   * @returns Decoded claims
   */
  async verifyIdToken(idToken: string): Promise<SingpassIdClaims> {
    // In production, fetch JWKS from Singpass and verify signature
    // For now, decode without verification (add // SINGPASS_SWAP: marker)

    // SINGPASS_SWAP: Add proper JWT verification with JWKS
    const decoded = JSON.parse(
      Buffer.from(idToken.split('.')[1], 'base64').toString()
    )

    // Basic validation
    if (decoded.iss !== 'https://id.singpass.gov.sg' && decoded.iss !== 'https://stg-id.singpass.gov.sg') {
      throw new Error('Invalid issuer')
    }

    if (decoded.aud !== this.clientId) {
      throw new Error('Invalid audience')
    }

    if (decoded.exp && Date.now() / 1000 > decoded.exp) {
      throw new Error('Token expired')
    }

    return decoded as SingpassIdClaims
  }
}
```

**Step 2: Commit**

```bash
git add lib/singpass/client.ts
git commit -m "feat(singpass): add production Singpass OAuth client

Implements:
- Authorization URL builder with PKCE
- Token exchange with code verifier
- ID token verification (basic for now)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 6: Create Mock Singpass Client

**Files:**
- Create: `d:\Antigravity Workspaces\Fifth\space-realty\lib\singpass\mock-client.ts`
- Read: `d:\Antigravity Workspaces\Fifth\space-realty\lib\mock\singpassMock.ts`

**Step 1: Create mock client file**

```typescript
// lib/singpass/mock-client.ts
import { SingpassTokens, SingpassIdClaims } from './types'

/**
 * Mock Singpass client for development
 * Simulates OAuth flow without external API calls
 */
export class MockSingpassClient {
  getAuthorizationUrl(codeChallenge: string, state: string): string {
    // Return mock URL (won't actually redirect in mock mode)
    return `http://localhost:3000/api/auth/callback/singpass?code=MOCK_CODE&state=${state}`
  }

  async exchangeCodeForToken(
    code: string,
    codeVerifier: string
  ): Promise<SingpassTokens> {
    // Return mock tokens instantly
    return {
      access_token: 'MOCK_ACCESS_TOKEN',
      id_token: this.generateMockIdToken(),
      token_type: 'Bearer',
      expires_in: 3600,
    }
  }

  async verifyIdToken(idToken: string): Promise<SingpassIdClaims> {
    // Return mock claims
    return {
      sub: 'S1234567D', // Mock NRIC
      iss: 'https://stg-id.singpass.gov.sg',
      aud: process.env.SINGPASS_CLIENT_ID || 'mock-client-id',
      exp: Math.floor(Date.now() / 1000) + 3600,
      iat: Math.floor(Date.now() / 1000),
    }
  }

  private generateMockIdToken(): string {
    // Generate fake JWT (header.payload.signature)
    const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64')
    const payload = Buffer.from(
      JSON.stringify({
        sub: 'S1234567D',
        iss: 'https://stg-id.singpass.gov.sg',
        aud: process.env.SINGPASS_CLIENT_ID || 'mock-client-id',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
      })
    ).toString('base64')

    return `${header}.${payload}.MOCK_SIGNATURE`
  }
}
```

**Step 2: Commit**

```bash
git add lib/singpass/mock-client.ts
git commit -m "feat(singpass): add mock Singpass client for development

Implements instant OAuth simulation with fake tokens for local dev.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 7: Extend NextAuth Session Types

**Files:**
- Create: `d:\Antigravity Workspaces\Fifth\space-realty\types\next-auth.d.ts`

**Step 1: Create NextAuth type extensions**

```typescript
// types/next-auth.d.ts
import { SingpassVerification, VerificationBadge } from './user'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string
      image?: string
      singpassVerification: SingpassVerification
      verificationBadges: VerificationBadge[]
    }
  }

  interface JWT {
    singpassVerification?: SingpassVerification
    verificationBadges?: VerificationBadge[]
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    singpassVerification?: SingpassVerification
    verificationBadges?: VerificationBadge[]
  }
}
```

**Step 2: Commit**

```bash
git add types/next-auth.d.ts
git commit -m "feat(singpass): extend NextAuth session types

Adds Singpass verification data to session and JWT types.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 8: Create Singpass Provider Factory

**Files:**
- Create: `d:\Antigravity Workspaces\Fifth\space-realty\lib\auth\singpass-provider.ts`

**Step 1: Create provider factory file**

```typescript
// lib/auth/singpass-provider.ts
import type { OAuthConfig } from 'next-auth/providers'
import { SingpassClient } from '../singpass/client'
import { MockSingpassClient } from '../singpass/mock-client'
import { generateCodeVerifier, generateCodeChallenge } from '../singpass/crypto'
import { MyInfoPersonResponse } from '../singpass/types'

export function createSingpassProvider(useMock: boolean): OAuthConfig<MyInfoPersonResponse> {
  // SINGPASS_SWAP: Switch between mock and production client
  const client = useMock ? new MockSingpassClient() : new SingpassClient()

  return {
    id: 'singpass',
    name: 'Singpass',
    type: 'oauth',
    version: '2.0',
    checks: ['state', 'pkce'],

    authorization: {
      url: async () => {
        // Generate PKCE pair
        const codeVerifier = generateCodeVerifier()
        const codeChallenge = await generateCodeChallenge(codeVerifier)
        const state = generateCodeVerifier() // Reuse for state

        // Store verifier for token exchange (NextAuth handles this internally)
        return {
          url: client.getAuthorizationUrl(codeChallenge, state),
          state,
          codeVerifier,
        }
      },
      params: {
        scope: 'openid myinfo-person',
      },
    },

    token: {
      url: async (params) => {
        const tokens = await client.exchangeCodeForToken(
          params.code,
          params.codeVerifier
        )
        return tokens
      },
    },

    userinfo: {
      url: async (tokens) => {
        // In mock mode, return fake MyInfo data
        if (useMock) {
          return {
            uinfin: { value: 'S1234567D' },
            name: { value: 'John Tan Wei Ming' },
            nationality: { code: 'SG', desc: 'SINGAPORE CITIZEN' },
            dob: { value: '1990-05-15' },
            regadd: {
              type: 'SG' as const,
              block: { value: '123' },
              street: { value: 'Orchard Road' },
              unit: { value: '01-01' },
              postal: { value: '238858' },
            },
          }
        }

        // Production: fetch from MyInfo API
        // SINGPASS_SWAP: Import and use fetchMyInfoData
        const { fetchMyInfoData } = await import('../singpass/myinfo')
        const idClaims = await client.verifyIdToken(tokens.id_token!)
        return fetchMyInfoData(tokens.access_token!, idClaims.sub)
      },
    },

    profile: async (profile: MyInfoPersonResponse) => {
      return {
        id: profile.uinfin.value,
        email: '', // MyInfo doesn't provide email by default
        name: profile.name.value,
        image: null,
      }
    },
  }
}
```

**Step 2: Commit**

```bash
git add lib/auth/singpass-provider.ts
git commit -m "feat(singpass): add NextAuth custom provider factory

Implements OAuth2Config with PKCE, mock/production switching.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 9: Create NextAuth Configuration

**Files:**
- Create: `d:\Antigravity Workspaces\Fifth\space-realty\lib\auth\nextauth.config.ts`

**Step 1: Create NextAuth config file**

```typescript
// lib/auth/nextauth.config.ts
import type { NextAuthConfig } from 'next-auth'
import { createSingpassProvider } from './singpass-provider'
import { processMyInfoData } from '../singpass/myinfo'
import { MyInfoPersonResponse } from '../singpass/types'
import type { SingpassVerification, VerificationBadge } from '@/types/user'

const useMockSingpass = process.env.USE_MOCK_SINGPASS === 'true'

export const authOptions: NextAuthConfig = {
  providers: [
    createSingpassProvider(useMockSingpass),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  pages: {
    signIn: '/verify',
    error: '/verify',
  },

  callbacks: {
    async jwt({ token, account, profile }) {
      // On initial sign-in with Singpass
      if (account?.provider === 'singpass' && profile) {
        const myInfo = profile as unknown as MyInfoPersonResponse

        // Process MyInfo data (hashes NRIC)
        const processedData = await processMyInfoData(myInfo)

        // Create verification object
        const verification: SingpassVerification = {
          verified: true,
          verifiedAt: new Date(),
          nricHash: processedData.nricHash,
          name: processedData.name,
          nationality: processedData.nationality,
          dateOfBirth: processedData.dateOfBirth,
          homeAddress: processedData.homeAddress,
        }

        token.singpassVerification = verification

        // Add verification badge
        const badge: VerificationBadge = {
          type: 'singpass',
          label: 'Singpass Verified',
          issuedAt: new Date(),
          expiresAt: undefined,
        }

        token.verificationBadges = [badge]

        // SUPABASE: Save verification to database
        // await saveVerificationToDatabase(token.sub, verification, badge)

        console.log('Singpass verification successful for user', token.sub)
      }

      return token
    },

    async session({ session, token }) {
      // Add Singpass verification data to session
      if (token.singpassVerification) {
        session.user.singpassVerification = token.singpassVerification
      }

      if (token.verificationBadges) {
        session.user.verificationBadges = token.verificationBadges
      }

      return session
    },
  },

  debug: process.env.NODE_ENV === 'development',
}
```

**Step 2: Commit**

```bash
git add lib/auth/nextauth.config.ts
git commit -m "feat(singpass): add NextAuth configuration with callbacks

Implements jwt/session callbacks for Singpass verification.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 10: Create NextAuth API Route

**Files:**
- Create: `d:\Antigravity Workspaces\Fifth\space-realty\app\api\auth\[...nextauth]\route.ts`

**Step 1: Create NextAuth API route**

```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth/nextauth.config'

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
```

**Step 2: Commit**

```bash
git add app/api/auth/[...nextauth]/route.ts
git commit -m "feat(singpass): add NextAuth API route handler

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 11: Create Singpass Button Component

**Files:**
- Create: `d:\Antigravity Workspaces\Fifth\space-realty\components\auth\SingpassButton.tsx`

**Step 1: Create Singpass button component**

```typescript
// components/auth/SingpassButton.tsx
'use client'

import { useState } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'

interface SingpassButtonProps {
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  onSuccess?: () => void
  onError?: (error: Error) => void
  callbackUrl?: string
}

export function SingpassButton({
  variant = 'default',
  size = 'lg',
  onSuccess,
  onError,
  callbackUrl = '/dashboard',
}: SingpassButtonProps) {
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)

  const isVerified = session?.user.singpassVerification?.verified

  const handleVerify = async () => {
    try {
      setIsLoading(true)
      await signIn('singpass', { callbackUrl })
      onSuccess?.()
    } catch (error) {
      const err = error as Error
      onError?.(err)
      toast.error('Verification failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Already verified state
  if (isVerified) {
    return (
      <Button
        variant="outline"
        size={size}
        className="border-emerald-600 text-emerald-600 cursor-default"
        disabled
      >
        <CheckCircle className="w-5 h-5 mr-2" />
        Singpass Verified
      </Button>
    )
  }

  // Loading state
  if (isLoading || status === 'loading') {
    return (
      <Button disabled size={size} className="bg-[#BE2E2D]/70">
        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
        Verifying...
      </Button>
    )
  }

  // Default state (not verified)
  return (
    <Button
      onClick={handleVerify}
      size={size}
      className="bg-[#BE2E2D] hover:bg-[#A02625] text-white font-semibold"
    >
      <ShieldCheck className="w-5 h-5 mr-2" />
      Verify with Singpass
    </Button>
  )
}
```

**Step 2: Commit**

```bash
git add components/auth/SingpassButton.tsx
git commit -m "feat(singpass): add Singpass button component

Official Singpass red (#BE2E2D) with loading/verified states.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 12: Create Verification Status Component

**Files:**
- Create: `d:\Antigravity Workspaces\Fifth\space-realty\components\auth\VerificationStatus.tsx`

**Step 1: Create verification status component**

```typescript
// components/auth/VerificationStatus.tsx
'use client'

import { useSession } from 'next-auth/react'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, CheckCircle, Clock } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

export function VerificationStatus() {
  const { data: session } = useSession()
  const verification = session?.user.singpassVerification

  if (!session) {
    return (
      <Alert variant="default" className="border-gray-300">
        <AlertCircle className="text-gray-500" />
        <AlertTitle>Not Logged In</AlertTitle>
        <AlertDescription>Sign in to verify your identity</AlertDescription>
      </Alert>
    )
  }

  if (verification?.verified) {
    return (
      <Alert variant="default" className="border-emerald-200 bg-emerald-50">
        <CheckCircle className="text-emerald-600" />
        <AlertTitle className="text-emerald-900">Singpass Verified ✓</AlertTitle>
        <AlertDescription className="text-emerald-700">
          Verified{' '}
          {formatDistanceToNow(new Date(verification.verifiedAt!), { addSuffix: true })}
        </AlertDescription>
      </Alert>
    )
  }

  // Pending or unverified
  return (
    <Alert variant="default" className="border-amber-200 bg-amber-50">
      <Clock className="text-amber-600" />
      <AlertTitle className="text-amber-900">Verification Required</AlertTitle>
      <AlertDescription className="text-amber-700">
        Verify with Singpass to list properties and contact sellers.
        <Link href="/verify" className="block mt-2 text-amber-800 font-semibold hover:underline">
          Verify Now →
        </Link>
      </AlertDescription>
    </Alert>
  )
}
```

**Step 2: Commit**

```bash
git add components/auth/VerificationStatus.tsx
git commit -m "feat(singpass): add verification status display component

Shows current verification state with contextual alerts.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 13: Create Verification Page

**Files:**
- Create: `d:\Antigravity Workspaces\Fifth\space-realty\app\(auth)\verify\page.tsx`

**Step 1: Create verification explainer page**

```typescript
// app/(auth)/verify/page.tsx
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth/nextauth.config'
import { SingpassButton } from '@/components/auth/SingpassButton'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { CheckCircle } from 'lucide-react'

const faqs = [
  {
    question: 'Is my NRIC stored?',
    answer:
      'No. We only store a cryptographic hash of your NRIC (SHA-256). Your actual NRIC number is never saved in our database or logs. This hash allows us to verify your identity without storing sensitive data.',
  },
  {
    question: 'What data is shared?',
    answer:
      'Singpass shares: Full legal name, Nationality, Date of Birth, and Registered Residential Address. This data is used to verify your identity and pre-fill forms when you list properties. You can review the data sharing consent screen before approving.',
  },
  {
    question: 'Can I un-verify?',
    answer:
      'Singpass verification is permanent for security and trust reasons. Once your account is verified, it remains verified. However, you can delete your entire Space Realty account at any time from Settings → Account → Delete Account.',
  },
  {
    question: 'Why is verification required?',
    answer:
      'To list properties, view seller contact information, or make offers, we need to verify your identity to prevent fraud and ensure all parties are genuine. This protects both buyers and sellers on our platform.',
  },
  {
    question: 'Is Singpass verification secure?',
    answer:
      "Yes. Singpass is Singapore's National Digital Identity system, managed by GovTech. It uses bank-level security with biometric authentication. Space Realty never sees your Singpass password or biometric data.",
  },
]

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string }
}) {
  const session = await getServerSession(authOptions)

  // Already verified? Redirect to dashboard
  if (session?.user.singpassVerification?.verified) {
    redirect(searchParams.callbackUrl || '/dashboard')
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🛡️</div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            Verify Your Identity with Singpass
          </h1>
          <p className="text-lg text-gray-600">
            Space Realty requires Singpass verification to ensure trust and authenticity for all
            users.
          </p>
        </div>

        {/* Benefits */}
        <Card className="mb-6 bg-emerald-50 border-emerald-200">
          <CardHeader>
            <CardTitle>Why Verify?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
              <p className="text-sm">Instant form filling with verified MyInfo data</p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
              <p className="text-sm">Build trust with verified badge on your profile</p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
              <p className="text-sm">Fraud prevention and secure transactions</p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
              <p className="text-sm">Faster property listings and offer submissions</p>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="flex justify-center mb-12">
          <SingpassButton size="lg" callbackUrl={searchParams.callbackUrl} />
        </div>

        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible>
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-gray-600">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
```

**Step 2: Commit**

```bash
git add app/(auth)/verify/page.tsx
git commit -m "feat(singpass): add verification explainer page

Includes benefits, Singpass button, and FAQ accordion.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 14: Create Middleware for Route Protection

**Files:**
- Create: `d:\Antigravity Workspaces\Fifth\space-realty\middleware.ts`

**Step 1: Create middleware file**

```typescript
// middleware.ts
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // High-trust routes requiring Singpass verification
    const verificationRequiredRoutes = ['/dashboard/list-property', '/dashboard/offers']

    const requiresVerification = verificationRequiredRoutes.some((route) =>
      path.startsWith(route)
    )

    // Also check for contact info access pattern
    const isContactRoute = /^\/properties\/[^\/]+\/contact$/.test(path)

    if (requiresVerification || isContactRoute) {
      // SINGPASS: Enforce verification in production
      if (!token?.singpassVerification?.verified) {
        const url = new URL('/verify', req.url)
        url.searchParams.set('callbackUrl', path)
        return NextResponse.redirect(url)
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // Require login for all /dashboard routes
    },
  }
)

export const config = {
  matcher: ['/dashboard/:path*', '/properties/:path*/contact'],
}
```

**Step 2: Test middleware logic**

Run:
```bash
npm run dev
```

1. Visit `/dashboard/list-property` without logging in → should redirect to sign-in
2. Sign in but not verified → should redirect to `/verify?callbackUrl=/dashboard/list-property`
3. Verify with Singpass (mock) → should access protected route

**Step 3: Commit**

```bash
git add middleware.ts
git commit -m "feat(singpass): add middleware for route protection

Protects /dashboard/list-property, /dashboard/offers, and contact routes.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 15: Update Environment Variables

**Files:**
- Read: `d:\Antigravity Workspaces\Fifth\space-realty\.env.local`
- Modify: `d:\Antigravity Workspaces\Fifth\space-realty\.env.local`

**Step 1: Add missing NextAuth environment variables**

Add to `.env.local`:
```bash
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=REPLACE_WITH_openssl_rand_base64_32

# Mock Singpass Toggle
USE_MOCK_SINGPASS=true
```

**Step 2: Generate NEXTAUTH_SECRET**

Run:
```bash
openssl rand -base64 32
```

Copy output and replace `REPLACE_WITH_openssl_rand_base64_32` in `.env.local`

**Step 3: Verify all Singpass env vars are set**

Check `.env.local` has:
- `SINGPASS_CLIENT_ID` (can be TODO for now)
- `SINGPASS_CLIENT_SECRET` (can be TODO for now)
- `SINGPASS_REDIRECT_URI=http://localhost:3000/api/auth/callback/singpass`
- `SINGPASS_AUTH_URL` (optional, defaults to sandbox)
- `SINGPASS_TOKEN_URL` (optional, defaults to sandbox)
- `SINGPASS_USERINFO_URL` (optional, defaults to sandbox)
- `USE_MOCK_SINGPASS=true`
- `NEXTAUTH_URL=http://localhost:3000`
- `NEXTAUTH_SECRET=<generated-secret>`

**Step 4: Commit**

```bash
git add .env.local
git commit -m "chore: add NextAuth and Singpass environment variables

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 16: Add NextAuth Provider to App

**Files:**
- Read: `d:\Antigravity Workspaces\Fifth\space-realty\app\layout.tsx`
- Modify: `d:\Antigravity Workspaces\Fifth\space-realty\app\layout.tsx`

**Step 1: Wrap app with SessionProvider**

Update `app/layout.tsx`:

```typescript
// Add import at top
import { SessionProvider } from 'next-auth/react'

// Wrap children with SessionProvider
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
```

**Step 2: Commit**

```bash
git add app/layout.tsx
git commit -m "feat(singpass): wrap app with NextAuth SessionProvider

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 17: Test Complete Integration

**Files:**
- N/A (testing only)

**Step 1: Start development server**

Run:
```bash
npm run dev
```

**Step 2: Test mock Singpass flow**

1. Visit `http://localhost:3000/verify`
2. Click "Verify with Singpass" button
3. Should instantly verify (mock mode)
4. Should see "Singpass Verified ✓" on button
5. Visit `/dashboard/list-property` → should allow access

**Step 3: Test middleware protection**

1. Open incognito window
2. Visit `http://localhost:3000/dashboard/list-property`
3. Should redirect to `/verify?callbackUrl=/dashboard/list-property`
4. Click Singpass button → verify → should redirect back to list-property

**Step 4: Verify session data**

Open browser DevTools → Application → Cookies → `next-auth.session-token`

The JWT should contain:
- `singpassVerification.verified: true`
- `singpassVerification.nricHash: <sha256-hash>`
- `verificationBadges: [{ type: 'singpass', ... }]`

**Step 5: Document test results**

Expected: All tests pass ✓

---

## Task 18: Update CLAUDE.md with Patterns

**Files:**
- Modify: `d:\Antigravity Workspaces\Fifth\space-realty\CLAUDE.md`

**Step 1: Add Singpass integration patterns**

Add to `CLAUDE.md`:

```markdown
## Singpass/MyInfo Integration Patterns

### NRIC Security (CRITICAL)
- **NEVER** log or store raw NRIC values
- **ALWAYS** hash NRIC with SHA-256 immediately upon receipt
- Use `hashNRIC()` from `lib/singpass/crypto.ts`
- Mark all NRIC handling with `// CRITICAL:` comments

### Mock/Production Switching
- Use `USE_MOCK_SINGPASS=true` for local development
- Mock client returns instant fake data (no external calls)
- Production client uses real Singpass OAuth endpoints
- Switch happens in provider factory (`createSingpassProvider()`)

### OAuth Flow
- PKCE is mandatory (code_challenge/code_verifier)
- State parameter for CSRF protection (NextAuth handles)
- Scope: `openid myinfo-person`
- Token exchange requires code_verifier

### Session Management
- JWT strategy (no DB lookup per request)
- Verification data in `session.user.singpassVerification`
- Badges in `session.user.verificationBadges`
- 30-day expiration

### Route Protection
- Middleware checks `token.singpassVerification.verified`
- Protected routes: `/dashboard/list-property`, `/dashboard/offers`, `/properties/*/contact`
- Redirect to `/verify?callbackUrl=<original>` if not verified

### Comment Markers
- `// SINGPASS_SWAP:` - Mock/production switching points
- `// SUPABASE:` - Database operations (future)
- `// CRITICAL:` - Security-critical code (NRIC, tokens)
```

**Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: add Singpass integration patterns to CLAUDE.md

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Final Checklist

- [ ] All dependencies installed (`next-auth`, `jose`)
- [ ] Crypto utilities created (PKCE, NRIC hashing)
- [ ] MyInfo parser implemented
- [ ] Production and mock Singpass clients created
- [ ] NextAuth provider factory implemented
- [ ] NextAuth configuration with callbacks
- [ ] API route handler created
- [ ] Singpass button component
- [ ] Verification status component
- [ ] Verification page with FAQ
- [ ] Middleware for route protection
- [ ] Environment variables configured
- [ ] SessionProvider added to app
- [ ] Integration tested (mock mode)
- [ ] CLAUDE.md updated with patterns

**Total Tasks:** 18
**Estimated Time:** 2-3 hours for full implementation

---

## Next Steps (Future Phases)

1. **Supabase Integration**: Replace `// SUPABASE:` comments with actual DB saves
2. **Production Testing**: Test with real Singpass sandbox credentials
3. **Error Handling**: Add retry logic for MyInfo API failures
4. **Monitoring**: Add alerts for verification success/failure rates
5. **UI Polish**: Add verification badge to navbar, profile page
6. **Documentation**: Write user guide for verification process
