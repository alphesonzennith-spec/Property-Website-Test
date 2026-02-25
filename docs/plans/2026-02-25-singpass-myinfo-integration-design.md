# Singpass/MyInfo Integration Design

**Date:** 2026-02-25
**Status:** Design Approved
**Author:** Claude Code (Brainstorming Skill)

## Overview

Integration of Singapore's Singpass National Digital Identity (NDI) with MyInfo for user verification. This is Space Realty's core trust differentiator - all users performing high-trust actions must verify via Singpass.

**Technology Stack:**
- Singpass OAuth 2.0 with PKCE (Proof Key for Code Exchange)
- NextAuth.js v5 for session management
- MyInfo API for identity data fetching
- Dual implementation (mock for development, production for staging/prod)

**Environment:**
- Sandbox: `https://stg-id.singpass.gov.sg`
- Production: `https://id.singpass.gov.sg`

---

## 1. Architecture Overview

### High-Level Architecture

The Singpass integration uses **NextAuth.js v5** with a custom OAuth provider pattern. The system maintains two parallel implementations:

**Production Path:**
- Real Singpass OAuth 2.0 with PKCE flow
- Connects to Singpass staging (`stg-id.singpass.gov.sg`) or production (`id.singpass.gov.sg`)
- Fetches real MyInfo data: name, NRIC (hashed), nationality, date of birth, home address

**Development Path:**
- Mock Singpass provider that simulates OAuth flow locally
- Uses existing `lib/mock/singpassMock.ts` for fake MyInfo data
- No external API calls, instant "verification"
- Same interface as production for seamless switching

**Environment-Based Switching:**
```typescript
const useMockSingpass = process.env.USE_MOCK_SINGPASS === 'true'
const provider = useMockSingpass ? createMockSingpassProvider() : createSingpassProvider()
```

### Core Authentication Flow

1. User clicks "Verify with Singpass" → triggers NextAuth `signIn('singpass')`
2. NextAuth redirects to Singpass (or mock) with PKCE challenge
3. User authenticates with Singpass and consents to MyInfo data sharing
4. Singpass redirects back to `/api/auth/callback/singpass`
5. NextAuth exchanges authorization code for tokens
6. Fetch MyInfo data using access token
7. Hash NRIC (SHA-256), store verification data in session + database
8. Add "Singpass Verified" badge to user's verification badges
9. Redirect to dashboard with success toast

### Key Design Decisions

- **NextAuth Provider Pattern**: Use NextAuth's custom provider instead of separate API routes for cleaner integration
- **NRIC Security**: Store NRIC as SHA-256 hash immediately, **never** log or persist raw NRIC
- **JWT Sessions**: Use JWT strategy (no database lookup per request) for performance
- **Verification Badge**: Add badge to `session.user.verificationBadges[]` for UI display
- **Middleware-Based Protection**: Check `session.user.singpassVerification.verified` in middleware (fast, no DB query)

---

## 2. Component Structure

### File Organization

```
lib/
├── auth/
│   ├── nextauth.config.ts         # NextAuth configuration with Singpass provider
│   ├── singpass-provider.ts       # Custom Singpass OAuth provider factory
│   └── session-helpers.ts         # Utility functions for session access
│
├── singpass/
│   ├── client.ts                  # Production Singpass OAuth client
│   ├── mock-client.ts             # Mock Singpass client (simulates OAuth)
│   ├── myinfo.ts                  # MyInfo data fetching & parsing
│   ├── crypto.ts                  # PKCE generation, NRIC hashing (SHA-256)
│   └── types.ts                   # Singpass-specific TypeScript types
│
└── mock/
    └── singpassMock.ts            # (existing) Enhanced with OAuth simulation

app/
├── api/
│   └── auth/
│       └── [...nextauth]/
│           └── route.ts           # NextAuth API route handler
│
├── (auth)/
│   └── verify/
│       └── page.tsx               # Verification explainer page with Singpass button
│
└── middleware.ts                  # Route protection middleware

components/
└── auth/
    ├── SingpassButton.tsx         # Official Singpass button component
    └── VerificationStatus.tsx     # Shows current verification state

types/
└── next-auth.d.ts                 # Extend NextAuth session types
```

### Key Files Breakdown

**`lib/auth/singpass-provider.ts`**
- Factory function: `createSingpassProvider(useMock: boolean)`
- Returns `OAuth2Config` for NextAuth
- Configures authorization URL, token URL, userinfo endpoint
- Implements PKCE flow with `code_challenge`/`code_verifier`

**`lib/singpass/client.ts`** (Production Implementation)
- `SingpassClient` class with methods:
  - `getAuthorizationUrl(codeChallenge, state)` - builds OAuth URL with PKCE
  - `exchangeCodeForToken(code, codeVerifier)` - exchanges authorization code for access token
  - `getMyInfoData(accessToken)` - fetches user data from MyInfo API
  - `verifyIdToken(idToken)` - validates JWT ID token from Singpass
- All methods throw typed errors for proper error handling

**`lib/singpass/mock-client.ts`** (Development Implementation)
- Same interface as production client
- Returns fake data instantly (no async delays needed, NextAuth handles that)
- Simulates OAuth redirects without external calls
- Uses data from `lib/mock/singpassMock.ts`

**`lib/singpass/crypto.ts`**
- PKCE utilities:
  - `generateCodeVerifier()` - generates 43-128 char random string (base64url)
  - `generateCodeChallenge(verifier)` - SHA-256 hash of verifier
- NRIC hashing:
  - `hashNRIC(nric)` - SHA-256 hash, **never logs raw NRIC**

**`middleware.ts`**
- Checks `session.user.singpassVerification.verified` for protected routes
- Protected route patterns:
  - `/dashboard/list-property/*` - listing properties
  - `/dashboard/offers/*` - making/viewing offers
  - `/properties/*/contact` - viewing seller contact info
- Redirects to `/verify?callbackUrl={original}` if not verified
- Public routes (browsing, searching) have no restrictions

---

## 3. OAuth Flow & Data Flow

### Complete OAuth 2.0 PKCE Flow

**Step 1: Initiation (User clicks Singpass button)**
```
User → SingpassButton.tsx → signIn('singpass') → NextAuth
```
- NextAuth calls `singpass-provider.ts` `authorization()` method
- Generate PKCE pair:
  - `code_verifier` (random 32-byte base64url string)
  - `code_challenge` (SHA-256 hash of verifier, base64url encoded)
- Store `code_verifier` in NextAuth internal state
- Redirect to Singpass with parameters:
  - `client_id` - from `SINGPASS_CLIENT_ID`
  - `redirect_uri` - from `SINGPASS_REDIRECT_URI`
  - `scope` - `openid myinfo-person`
  - `code_challenge`, `code_challenge_method: S256`
  - `state` - CSRF protection token (auto-generated by NextAuth)
  - `response_type: code`

**Step 2: User Authentication at Singpass**
```
User → Singpass Login → Consent Screen → Approve MyInfo Sharing
```
- User authenticates with Singpass (biometrics/password/2FA)
- Singpass shows consent screen:
  - "Space Realty wants to access: Name, NRIC, Date of Birth, Nationality, Address"
- User approves or denies

**Step 3: Callback (Singpass redirects back)**
```
Singpass → /api/auth/callback/singpass?code=ABC&state=XYZ
```
- NextAuth receives callback
- Validates `state` parameter (CSRF protection)
- Retrieves stored `code_verifier` from internal state
- Calls `singpass-provider.ts` `token()` method

**Step 4: Token Exchange**
```http
POST https://id.singpass.gov.sg/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code
&code=ABC
&code_verifier=<original verifier>
&client_id={SINGPASS_CLIENT_ID}
&client_secret={SINGPASS_CLIENT_SECRET}
&redirect_uri={SINGPASS_REDIRECT_URI}

Response:
{
  "access_token": "xxx",
  "id_token": "yyy.zzz",  // JWT
  "token_type": "Bearer",
  "expires_in": 3600
}
```

**Step 5: Fetch MyInfo Data**
```http
GET https://api.myinfo.gov.sg/person-basic/v2/person/<uinfin>
Authorization: Bearer xxx

Response:
{
  "uinfin": { "value": "S1234567D" },
  "name": { "value": "John Tan Wei Ming" },
  "nationality": { "value": "SG", "desc": "SINGAPORE CITIZEN" },
  "dob": { "value": "1990-05-15" },
  "regadd": {
    "type": "SG",
    "block": { "value": "123" },
    "street": { "value": "Orchard Road" },
    "unit": { "value": "01-01" },
    "postal": { "value": "238858" }
  }
}
```

**Step 6: Process & Store (NextAuth callbacks)**
```typescript
// In lib/auth/nextauth.config.ts

jwt: async ({ token, account, profile }) => {
  if (account?.provider === 'singpass' && profile) {
    // CRITICAL: Hash NRIC immediately, never store raw value
    const nricHash = await hashNRIC(profile.uinfin.value)

    // Parse MyInfo data
    const verificationData: SingpassVerification = {
      verified: true,
      verifiedAt: new Date(),
      nricHash,
      name: profile.name.value,
      nationality: profile.nationality.desc,
      dateOfBirth: profile.dob.value,
      homeAddress: formatMyInfoAddress(profile.regadd)
    }

    token.singpassVerification = verificationData

    // Add verification badge
    const badge: VerificationBadge = {
      type: 'singpass',
      label: 'Singpass Verified',
      issuedAt: new Date(),
      expiresAt: undefined // Singpass verification doesn't expire
    }

    token.verificationBadges = [
      ...(token.verificationBadges || []),
      badge
    ]

    // SUPABASE: Save to database (placeholder for now)
    // await saveVerificationToDatabase(token.sub, verificationData, badge)
  }

  return token
},

session: async ({ session, token }) => {
  // Expose verification data to client-side session
  session.user.singpassVerification = token.singpassVerification
  session.user.verificationBadges = token.verificationBadges
  return session
}
```

**Step 7: Redirect to Dashboard**
- NextAuth redirects to `/dashboard` (or original `callbackUrl` if specified)
- Show success toast: "✓ Singpass Verification Complete"
- User can now access protected routes

### Mock Flow (Development Mode)

When `USE_MOCK_SINGPASS=true`:
- Skip Steps 1-4 (no external redirects)
- Mock provider returns fake authorization URL (doesn't actually redirect)
- Instantly return fake MyInfo data from `lib/mock/singpassMock.ts`
- Same session structure, different data source
- Allows full local development without Singpass sandbox credentials

---

## 4. Session Management & Middleware

### NextAuth Session Structure

**Extended Session Type:**
```typescript
// types/next-auth.d.ts
import { SingpassVerification, VerificationBadge } from '@/types/user'

declare module "next-auth" {
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
```

**Session Configuration:**
- **Strategy**: JWT (no database required for session lookup)
- **Cookie Name**: `next-auth.session-token`
- **Cookie Attributes**:
  - `httpOnly: true` - prevents XSS attacks
  - `secure: true` - HTTPS only (disabled in development)
  - `sameSite: 'lax'` - CSRF protection
- **Max Age**: 30 days (2,592,000 seconds)
- **Encryption**: NextAuth built-in JWE (JSON Web Encryption)

**Session Access Patterns:**

```typescript
// Server Components (app directory)
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/nextauth.config'

const session = await getServerSession(authOptions)
if (!session?.user.singpassVerification.verified) {
  redirect('/verify')
}

// Client Components
'use client'
import { useSession } from 'next-auth/react'

const { data: session, status } = useSession()
const isVerified = session?.user.singpassVerification.verified

// API Routes / Server Actions
import { getServerSession } from 'next-auth'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  // SINGPASS: Enforce verification for high-trust actions
  if (!session?.user.singpassVerification.verified) {
    return new Response('Singpass verification required', { status: 403 })
  }

  // ... rest of API logic
}
```

### Middleware Implementation

**File: `app/middleware.ts`**

```typescript
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // High-trust routes requiring Singpass verification
    const verificationRequiredRoutes = [
      '/dashboard/list-property',
      '/dashboard/offers',
    ]

    const requiresVerification = verificationRequiredRoutes.some(route =>
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
  matcher: [
    '/dashboard/:path*',
    '/properties/:path*/contact',
  ]
}
```

**Redirect Behavior:**
- Unverified user visits `/dashboard/list-property`
  → redirect to `/verify?callbackUrl=/dashboard/list-property`
- After successful verification
  → redirect back to `/dashboard/list-property` (original route)
- Verified user → access granted immediately (no redirect)
- Public routes (`/residential`, `/commercial`, etc.) → no auth/verification required

### Verification Badge Management

When Singpass verification succeeds, automatically add badge to user's profile:

```typescript
const badge: VerificationBadge = {
  type: 'singpass',
  label: 'Singpass Verified',
  issuedAt: new Date(),
  expiresAt: undefined // Singpass verification doesn't expire
}

// Add to session
token.verificationBadges = [
  ...(token.verificationBadges || []),
  badge
]

// SUPABASE: Also persist to database for profile display
// await db.verificationBadges.create({ userId, badge })
```

**Badge Display in UI:**
```typescript
{session?.user.verificationBadges.map(badge => (
  <Badge key={badge.type} variant="outline" className="gap-1">
    <ShieldCheck className="w-3 h-3 text-emerald-600" />
    {badge.label}
  </Badge>
))}
```

---

## 5. Error Handling & Security

### Error Scenarios & Handling

**1. User Denies Consent**
- **Trigger**: User clicks "Cancel" on Singpass consent screen
- **Singpass Response**: Redirect with `?error=access_denied`
- **NextAuth Handling**: Catches error in callbacks
- **User Experience**:
  - Show toast: "⚠️ Verification cancelled. You can try again anytime."
  - Redirect to `/verify` page (not dashboard)
  - No partial data stored

**2. Token Exchange Fails**
- **Causes**: Network timeout, invalid code, expired code (>10 minutes old)
- **Retry Strategy**: Retry once automatically with exponential backoff
- **If still fails**:
  - Log error with sanitized details (no tokens/codes)
  - Show user-friendly message: "⚠️ Verification failed. Please try again."
  - "Try Again" button on `/verify` page
- **Developer Action**: Check Singpass API logs, verify client credentials

**3. MyInfo API Fails**
- **Causes**: Token valid but MyInfo endpoint returns 500/503
- **Handling**:
  - Mark verification as `Pending` (not `Verified`)
  - Store partial data (what we got from ID token: email, sub)
  - Show: "🔄 Verification in progress. We're fetching your details."
  - Background job to retry (future enhancement - Phase 6)
- **User Impact**: Cannot access protected routes until MyInfo fetch succeeds

**4. NRIC Missing from MyInfo Response**
- **Cause**: MyInfo API returns incomplete data (rare edge case)
- **Handling**:
  - Cannot complete verification without NRIC
  - Mark as `Failed` with reason in logs
  - Show: "❌ Unable to verify identity. Please contact support."
  - Support ticket auto-created (future enhancement)

**5. Duplicate Verification Attempt**
- **Trigger**: User already verified tries to verify again
- **Prevention**: Check `session.user.singpassVerification.verified` before starting OAuth
- **User Experience**:
  - Show: "✓ You're already verified!" with verified date
  - Display verification details (name, verified date)
  - Skip OAuth flow entirely
  - Option to "Re-verify" if needed (admin only)

### Security Best Practices

#### NRIC Hashing (Critical)

```typescript
// lib/singpass/crypto.ts
import { createHash } from 'crypto'

export async function hashNRIC(nric: string): Promise<string> {
  // CRITICAL: Use SHA-256, NEVER store raw NRIC
  // NRIC is PII (Personally Identifiable Information) and must be protected

  const hash = createHash('sha256')
    .update(nric.toUpperCase()) // Normalize to uppercase
    .digest('hex')

  // SECURITY: Never log raw NRIC
  console.log('NRIC hashed successfully') // ✓ Safe
  // console.log('NRIC:', nric) // ✗ NEVER DO THIS - GDPR/PDPA violation

  return hash
}

// Usage verification
function verifyNRIC(inputNric: string, storedHash: string): boolean {
  const inputHash = hashNRIC(inputNric)
  return inputHash === storedHash
}
```

**Why hash NRIC?**
- NRIC is highly sensitive PII in Singapore
- PDPA (Personal Data Protection Act) requires protection
- Irreversible hash allows verification without storing actual NRIC
- SHA-256 is cryptographically secure (collision-resistant)

#### PKCE Implementation

```typescript
// lib/singpass/crypto.ts
import { randomBytes } from 'crypto'

export function generateCodeVerifier(): string {
  // OAuth 2.0 PKCE spec: 43-128 characters, base64url encoded
  return base64UrlEncode(randomBytes(32)) // 32 bytes → 43 chars base64url
}

export function generateCodeChallenge(verifier: string): string {
  // SHA-256 hash of verifier, base64url encoded
  const hash = createHash('sha256')
    .update(verifier)
    .digest()

  return base64UrlEncode(hash)
}

function base64UrlEncode(buffer: Buffer): string {
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '') // Remove padding
}
```

**Why PKCE?**
- Prevents authorization code interception attacks
- Required for public clients (SPAs, mobile apps)
- Best practice even for confidential clients (Next.js)
- Singpass NDI mandates PKCE for all OAuth flows

#### State Parameter (CSRF Protection)

- **Purpose**: Prevent Cross-Site Request Forgery attacks
- **NextAuth Handling**: Automatically generates and validates `state` parameter
- **No manual implementation needed**
- **Flow**:
  1. Generate random state: `crypto.randomBytes(32).toString('hex')`
  2. Store in session/cookie
  3. Send to Singpass as `?state=xyz`
  4. Validate on callback: `req.query.state === storedState`
  5. If mismatch: abort OAuth, log suspicious activity

#### Token Security

- **Access Tokens**: Store in NextAuth session (encrypted JWT), never expose to client
- **Refresh Tokens** (if Singpass provides): Store encrypted in database, rotate on use
- **ID Tokens**: Validate signature, verify issuer/audience claims
- **Never log tokens**: Use placeholders in logs (`access_token: ***`)

#### Rate Limiting

```typescript
// lib/auth/rate-limit.ts
import { RateLimiter } from 'limiter'

const verificationLimiter = new RateLimiter({
  tokensPerInterval: 5,
  interval: 'hour',
  fireImmediately: true
})

export async function checkVerificationRateLimit(userId: string): Promise<boolean> {
  const remaining = await verificationLimiter.removeTokens(1)

  if (remaining < 0) {
    // SECURITY: Log suspicious activity
    console.warn(`Rate limit exceeded for user ${userId}`)
    return false
  }

  return true
}
```

**Rate Limits:**
- OAuth initiation: 5 attempts per user per hour
- MyInfo fetch: 10 requests per user per day
- Prevents abuse of Singpass API
- Protects against automated attacks

#### Logging & Monitoring

**What to log (✓ Safe):**
```typescript
// Verification attempts
console.log('Singpass verification started', {
  userId,
  timestamp: new Date(),
  provider: 'singpass'
})

// OAuth errors (sanitized)
console.error('OAuth error', {
  error: error.message, // Generic message only
  userId,
  timestamp: new Date()
})

// MyInfo API response status
console.log('MyInfo API response', {
  status: response.status,
  userId
})
```

**What NOT to log (✗ Dangerous - PII/Secrets):**
```typescript
// ✗ Raw NRIC
console.log('NRIC:', profile.uinfin) // NEVER

// ✗ Access tokens
console.log('Access token:', accessToken) // NEVER

// ✗ Authorization codes
console.log('OAuth code:', code) // NEVER

// ✗ User's MyInfo data
console.log('MyInfo data:', profile) // NEVER

// ✗ Full address
console.log('Address:', homeAddress) // NEVER
```

**Monitoring Alerts:**
- Rate limit exceeded → alert security team
- Multiple failed verifications (>3 in 10 minutes) → flag account
- MyInfo API errors (>5% error rate) → alert engineering
- Unexpected OAuth errors → investigate immediately

#### Comment Markers (Integration Points)

Every line that will be swapped from mock to production gets marked with `// SINGPASS_SWAP:`:

```typescript
// SINGPASS_SWAP: Replace with real Singpass client
const client = useMock ? new MockSingpassClient() : new SingpassClient()

// SINGPASS_SWAP: Use real OAuth endpoints
const authUrl = useMock
  ? 'http://localhost:3000/mock/singpass/auth'
  : 'https://id.singpass.gov.sg/authorize'

// SUPABASE: Save verification to database
await saveVerificationToDatabase(userId, verificationData)
```

**Comment Standards:**
- `// SINGPASS_SWAP:` - Mock/production switching points
- `// SUPABASE:` - Database operations (currently using mock data)
- `// CRITICAL:` - Security-critical code (NRIC hashing, token validation)
- `// TODO:` - Future enhancements (retry logic, background jobs)

---

## 6. UI Components & User Experience

### SingpassButton Component

**Design Guidelines:**
- Follow official Singpass NDI design guidelines (https://api.singpass.gov.sg/library/login/developers)
- Official Singpass red: `#BE2E2D`
- White Singpass logo icon (from NDI assets)
- Button must be clearly identifiable as Singpass-branded

**Component Interface:**
```typescript
// components/auth/SingpassButton.tsx
'use client'

import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle } from 'lucide-react'

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
  callbackUrl = '/dashboard'
}: SingpassButtonProps) {
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)

  const isVerified = session?.user.singpassVerification.verified

  const handleVerify = async () => {
    try {
      setIsLoading(true)
      await signIn('singpass', { callbackUrl })
      onSuccess?.()
    } catch (error) {
      onError?.(error as Error)
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
      <Button
        disabled
        size={size}
        className="bg-[#BE2E2D]/70"
      >
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
      <SingpassIcon className="w-5 h-5 mr-2" />
      Verify with Singpass
    </Button>
  )
}
```

**Visual States:**
1. **Default (Not Verified)**: Red button with Singpass logo
2. **Hover**: Darker red (#A02625)
3. **Loading**: Disabled, spinner animation, semi-transparent
4. **Verified**: Green outline, checkmark, disabled (read-only)

### Verification Page

**Route:** `/app/(auth)/verify/page.tsx`

**Layout Structure:**
```
┌─────────────────────────────────────────┐
│  [← Back to Dashboard]                  │
│                                         │
│  🛡️ Verify Your Identity with Singpass │
│                                         │
│  Space Realty requires Singpass        │
│  verification to ensure trust and       │
│  authenticity for all users.            │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ WHY VERIFY?                     │   │
│  │ ✓ Instant form filling          │   │
│  │ ✓ Trusted listings              │   │
│  │ ✓ Fraud prevention              │   │
│  │ ✓ Faster transactions           │   │
│  │ ✓ Verified badge on profile     │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [🔴 Verify with Singpass Button]      │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ FREQUENTLY ASKED QUESTIONS      │   │
│  │                                 │   │
│  │ ▼ Is my NRIC stored?            │   │
│  │ ▼ What data is shared?          │   │
│  │ ▼ Can I un-verify?              │   │
│  │ ▼ Why is verification required? │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

**FAQ Content:**
```typescript
const faqs = [
  {
    question: "Is my NRIC stored?",
    answer: "No. We only store a cryptographic hash of your NRIC (SHA-256). Your actual NRIC number is never saved in our database or logs. This hash allows us to verify your identity without storing sensitive data."
  },
  {
    question: "What data is shared?",
    answer: "Singpass shares: Full legal name, Nationality, Date of Birth, and Registered Residential Address. This data is used to verify your identity and pre-fill forms when you list properties. You can review the data sharing consent screen before approving."
  },
  {
    question: "Can I un-verify?",
    answer: "Singpass verification is permanent for security and trust reasons. Once your account is verified, it remains verified. However, you can delete your entire Space Realty account at any time from Settings → Account → Delete Account."
  },
  {
    question: "Why is verification required?",
    answer: "To list properties, view seller contact information, or make offers, we need to verify your identity to prevent fraud and ensure all parties are genuine. This protects both buyers and sellers on our platform."
  },
  {
    question: "Is Singpass verification secure?",
    answer: "Yes. Singpass is Singapore's National Digital Identity system, managed by GovTech. It uses bank-level security with biometric authentication. Space Realty never sees your Singpass password or biometric data."
  }
]
```

**Page Implementation:**
```typescript
// app/(auth)/verify/page.tsx
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { SingpassButton } from '@/components/auth/SingpassButton'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'

export default async function VerifyPage({
  searchParams
}: {
  searchParams: { callbackUrl?: string }
}) {
  const session = await getServerSession()

  // Already verified? Redirect to dashboard
  if (session?.user.singpassVerification.verified) {
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
            Space Realty requires Singpass verification to ensure trust and
            authenticity for all users.
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
          <SingpassButton
            size="lg"
            callbackUrl={searchParams.callbackUrl}
          />
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
                  <AccordionContent className="text-gray-600">
                    {faq.answer}
                  </AccordionContent>
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

### VerificationStatus Component

**Usage:** Display verification status in navbar, profile page, settings

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

  if (!verification) {
    return (
      <Alert variant="default" className="border-gray-300">
        <AlertCircle className="text-gray-500" />
        <AlertTitle>Not Logged In</AlertTitle>
        <AlertDescription>
          Sign in to verify your identity
        </AlertDescription>
      </Alert>
    )
  }

  if (verification.verified) {
    return (
      <Alert variant="default" className="border-emerald-200 bg-emerald-50">
        <CheckCircle className="text-emerald-600" />
        <AlertTitle className="text-emerald-900">
          Singpass Verified ✓
        </AlertTitle>
        <AlertDescription className="text-emerald-700">
          Verified {formatDistanceToNow(new Date(verification.verifiedAt!), { addSuffix: true })}
        </AlertDescription>
      </Alert>
    )
  }

  // Pending or unverified
  return (
    <Alert variant="default" className="border-amber-200 bg-amber-50">
      <Clock className="text-amber-600" />
      <AlertTitle className="text-amber-900">
        Verification Required
      </AlertTitle>
      <AlertDescription className="text-amber-700">
        Verify with Singpass to list properties and contact sellers.
        <Link
          href="/verify"
          className="block mt-2 text-amber-800 font-semibold hover:underline"
        >
          Verify Now →
        </Link>
      </AlertDescription>
    </Alert>
  )
}
```

### Toast Notifications

**Success:**
```typescript
import { toast } from 'sonner'

toast.success("Singpass Verification Complete! ✓", {
  description: "Your identity has been verified. You can now list properties and contact sellers.",
  duration: 5000
})
```

**Error:**
```typescript
toast.error("Verification Failed", {
  description: "Could not verify your identity. Please try again or contact support.",
  action: {
    label: "Retry",
    onClick: () => signIn('singpass')
  }
})
```

**Info (when accessing protected route without verification):**
```typescript
toast.info("Verification Required", {
  description: "You need to verify with Singpass to access this feature.",
  action: {
    label: "Verify Now",
    onClick: () => router.push('/verify')
  }
})
```

**Warning (user cancelled verification):**
```typescript
toast.warning("Verification Cancelled", {
  description: "You can try again anytime from your dashboard.",
  duration: 4000
})
```

### Badge Display

**In User Profile / Navbar:**
```typescript
<div className="flex items-center gap-2">
  <span className="text-sm font-medium">{session.user.name}</span>
  {session.user.verificationBadges.map(badge => (
    <Badge
      key={badge.type}
      variant="outline"
      className="gap-1 border-emerald-600 text-emerald-700"
    >
      <ShieldCheck className="w-3 h-3" />
      {badge.label}
    </Badge>
  ))}
</div>
```

**In Property Listings (show verified sellers):**
```typescript
<div className="flex items-center gap-1 text-xs text-emerald-600">
  <ShieldCheck className="w-4 h-4" />
  <span>Verified Seller</span>
</div>
```

---

## 7. Dependencies & Environment Variables

### NPM Dependencies

**Required Installations:**
```bash
npm install next-auth@beta  # NextAuth.js v5 (beta as of 2026-02)
npm install jose            # JWT verification and encryption
npm install @types/node     # TypeScript types for Node.js crypto
```

**Existing Dependencies (already in project):**
- `react-hot-toast` or `sonner` - Toast notifications
- `lucide-react` - Icons (ShieldCheck, CheckCircle, etc.)
- `@/components/ui/*` - Shadcn UI components (Button, Card, Alert, etc.)

### Environment Variables

**Add to `.env.local`:**
```bash
# Singpass OAuth Configuration
SINGPASS_CLIENT_ID=TODO_ADD_ID
SINGPASS_CLIENT_SECRET=TODO_ADD_SECRET
SINGPASS_REDIRECT_URI=http://localhost:3000/api/auth/callback/singpass

# Singpass Environment
SINGPASS_ENV=sandbox  # "sandbox" | "production"
SINGPASS_AUTH_URL=https://stg-id.singpass.gov.sg/authorize
SINGPASS_TOKEN_URL=https://stg-id.singpass.gov.sg/token
SINGPASS_USERINFO_URL=https://stg-myinfo.singpass.gov.sg/person-basic/v2/person

# Mock Singpass (for development)
USE_MOCK_SINGPASS=true  # Set to "false" in staging/production

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>

# Supabase (for database persistence - future)
NEXT_PUBLIC_SUPABASE_URL=TODO_ADD_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=TODO_ADD_KEY
```

**Production Environment Variables:**
```bash
# Production Singpass
SINGPASS_ENV=production
SINGPASS_AUTH_URL=https://id.singpass.gov.sg/authorize
SINGPASS_TOKEN_URL=https://id.singpass.gov.sg/token
SINGPASS_USERINFO_URL=https://api.myinfo.gov.sg/person-basic/v2/person

USE_MOCK_SINGPASS=false
NEXTAUTH_URL=https://spacerealty.sg
```

**Environment Variable Validation:**
```typescript
// lib/auth/env.ts
import { z } from 'zod'

const envSchema = z.object({
  SINGPASS_CLIENT_ID: z.string().min(1),
  SINGPASS_CLIENT_SECRET: z.string().min(1),
  SINGPASS_REDIRECT_URI: z.string().url(),
  SINGPASS_ENV: z.enum(['sandbox', 'production']).default('sandbox'),
  USE_MOCK_SINGPASS: z.string().transform(val => val === 'true').default('true'),
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
})

export const env = envSchema.parse(process.env)
```

---

## 8. Testing Strategy

### Unit Tests

**PKCE Utilities (`lib/singpass/crypto.test.ts`):**
- `generateCodeVerifier()` produces 43+ char string
- `generateCodeChallenge()` produces valid SHA-256 hash
- NRIC hashing produces consistent hashes
- NRIC hashing normalizes to uppercase

**MyInfo Parser (`lib/singpass/myinfo.test.ts`):**
- Correctly parses MyInfo JSON response
- Handles missing optional fields gracefully
- Formats address correctly (block, street, unit, postal)

### Integration Tests

**Mock Singpass Flow:**
```typescript
describe('Singpass Mock Flow', () => {
  it('completes verification with mock provider', async () => {
    const session = await signIn('singpass', { redirect: false })
    expect(session.user.singpassVerification.verified).toBe(true)
    expect(session.user.verificationBadges).toContainEqual({
      type: 'singpass',
      label: 'Singpass Verified'
    })
  })
})
```

**Middleware Protection:**
```typescript
describe('Middleware Protection', () => {
  it('redirects unverified user from list-property', async () => {
    const response = await fetch('/dashboard/list-property')
    expect(response.status).toBe(307) // Redirect
    expect(response.headers.get('location')).toContain('/verify')
  })

  it('allows verified user to access list-property', async () => {
    const session = { user: { singpassVerification: { verified: true } } }
    const response = await fetch('/dashboard/list-property', {
      headers: { Cookie: serializeSession(session) }
    })
    expect(response.status).toBe(200)
  })
})
```

### Manual Testing Checklist

**Development (Mock):**
- [ ] Click "Verify with Singpass" button
- [ ] Mock flow completes instantly
- [ ] Verification data appears in session
- [ ] Badge shows on profile
- [ ] Can access `/dashboard/list-property`

**Staging (Singpass Sandbox):**
- [ ] OAuth redirects to Singpass sandbox
- [ ] Can authenticate with test credentials
- [ ] MyInfo consent screen appears
- [ ] Data fetched correctly from MyInfo API
- [ ] NRIC hashed properly (check database)
- [ ] Redirects back to callbackUrl

**Error Scenarios:**
- [ ] User denies consent → shows "cancelled" message
- [ ] Network timeout → shows error toast
- [ ] Invalid credentials → shows error message
- [ ] Rate limit exceeded → shows "too many attempts" message

---

## 9. Deployment Checklist

### Pre-Production

- [ ] Obtain Singpass sandbox credentials from GovTech
- [ ] Register OAuth redirect URI with Singpass
- [ ] Set `USE_MOCK_SINGPASS=false` in staging
- [ ] Test full OAuth flow in staging
- [ ] Verify NRIC hashing works correctly
- [ ] Test middleware protection on all protected routes
- [ ] Load test with concurrent users
- [ ] Security audit of token handling

### Production Deployment

- [ ] Obtain Singpass production credentials
- [ ] Update environment variables for production
- [ ] Set `SINGPASS_ENV=production`
- [ ] Test production OAuth flow with real Singpass account
- [ ] Monitor error rates and performance
- [ ] Set up alerts for OAuth failures
- [ ] Document runbook for common issues
- [ ] Train support team on verification issues

### Monitoring

**Metrics to Track:**
- Verification success rate
- OAuth error rate (by error type)
- MyInfo API latency and error rate
- Middleware redirect rate
- User drop-off rate (started vs completed verification)

**Alerts:**
- OAuth error rate > 5%
- MyInfo API latency > 2 seconds
- Verification success rate < 90%
- Rate limit exceeded (indicates possible attack)

---

## 10. Future Enhancements

### Phase 2 (Post-Launch)

- **Retry Logic**: Background job to retry failed MyInfo fetches
- **Re-verification**: Allow users to update MyInfo data (e.g., address change)
- **Verification History**: Log all verification attempts in database
- **Admin Dashboard**: View verification status, error logs, success rate

### Phase 3 (Advanced Features)

- **Multiple Identities**: Support for corporate entities (CorpPass integration)
- **Partial Verification**: Allow some features without full Singpass verification
- **Verification Expiry**: Optional re-verification after 1 year for high-security actions
- **Custom MyInfo Scopes**: Request additional fields (employment, vehicles, etc.)

---

## Appendix

### Singpass NDI Resources

- **Developer Portal**: https://api.singpass.gov.sg
- **OAuth Documentation**: https://api.singpass.gov.sg/library/login/developers
- **MyInfo API**: https://api.myinfo.gov.sg/myinfo-data
- **Design Guidelines**: https://api.singpass.gov.sg/library/login/designers

### MyInfo Data Fields

**Available Fields (we're using):**
- `uinfin` (NRIC) - Hashed for storage
- `name` - Full legal name
- `nationality` - Citizenship status
- `dob` - Date of birth (YYYY-MM-DD)
- `regadd` - Registered residential address

**Other Available Fields (future use):**
- `mobileno` - Mobile phone number
- `email` - Email address
- `marital` - Marital status
- `employment` - Employment status
- `cpfcontributions` - CPF contribution history
- `vehicles` - Registered vehicles

### Comment Marker Reference

- `// SINGPASS_SWAP:` - Mock/production switching points
- `// SUPABASE:` - Database operations (future)
- `// CRITICAL:` - Security-critical code
- `// TODO:` - Future enhancements
- `// SECURITY:` - Security-related comments (logging, validation)

---

**End of Design Document**
