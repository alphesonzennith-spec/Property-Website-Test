// lib/auth/singpass-provider.ts
import type { OAuthConfig } from 'next-auth/providers'
import { SingpassClient } from '../singpass/client'
import { MockSingpassClient } from '../singpass/mock-client'
import { MyInfoPersonResponse } from '../singpass/types'

export function createSingpassProvider(useMock: boolean): OAuthConfig<MyInfoPersonResponse> {
  // SINGPASS_SWAP: Switch between mock and production client
  const getClient = () => useMock ? new MockSingpassClient() : new SingpassClient()

  // Auth.js v5 requires authorization.url and token to be strings, not functions.
  // Functions as URL values crash NextAuth(authOptions) at module-load time, causing
  // every /api/auth/* request to return HTML 500 instead of JSON (ClientFetchError).
  // PKCE (code_challenge / code_verifier) is generated internally by Auth.js when
  // checks: ['pkce'] is set — no manual PKCE generation needed here.
  const authUrl = process.env.SINGPASS_AUTH_URL || 'https://stg-id.singpass.gov.sg/authorize'
  const tokenUrl = process.env.SINGPASS_TOKEN_URL || 'https://stg-id.singpass.gov.sg/token'

  return {
    id: 'singpass',
    name: 'Singpass',
    type: 'oauth',

    checks: ['state', 'pkce'],

    authorization: {
      url: authUrl,
      params: { scope: 'openid myinfo-person' },
    },

    // Auth.js v5: token must be a string URL. Custom exchange logic → use conform().
    // SINGPASS_SWAP: token endpoint will receive code + code_verifier from Auth.js PKCE flow.
    token: tokenUrl,

    userinfo: {
      // Auth.js v5: use 'request' (not 'url') for custom userinfo fetching logic.
      async request({ tokens }: any) {
        // In mock mode, return fake MyInfo data without hitting the real API
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

        if (!tokens.id_token) throw new Error('Missing ID token from Singpass')
        if (!tokens.access_token) throw new Error('Missing access token from Singpass')

        const idClaims = await getClient().verifyIdToken(tokens.id_token)
        return fetchMyInfoData(tokens.access_token, idClaims.sub)
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
