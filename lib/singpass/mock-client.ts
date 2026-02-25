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
