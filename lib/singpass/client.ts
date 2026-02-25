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
