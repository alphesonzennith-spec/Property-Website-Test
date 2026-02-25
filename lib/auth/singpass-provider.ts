// lib/auth/singpass-provider.ts
import type { OAuthConfig } from 'next-auth/providers'
import { SingpassClient } from '../singpass/client'
import { MockSingpassClient } from '../singpass/mock-client'
import { generateCodeVerifier, generateCodeChallenge } from '../singpass/crypto'
import { MyInfoPersonResponse } from '../singpass/types'

export function createSingpassProvider(useMock: boolean): OAuthConfig<MyInfoPersonResponse> {
  // SINGPASS_SWAP: Switch between mock and production client
  const getClient = () => useMock ? new MockSingpassClient() : new SingpassClient()

  return {
    id: 'singpass',
    name: 'Singpass',
    type: 'oauth',

    checks: ['state', 'pkce'],

    authorization: {
      url: async () => {
        // Generate PKCE pair
        const codeVerifier = generateCodeVerifier()
        const codeChallenge = await generateCodeChallenge(codeVerifier)
        const state = generateCodeVerifier() // Reuse for state

        // Store verifier for token exchange (NextAuth handles this internally)
        return {
          url: getClient().getAuthorizationUrl(codeChallenge, state),
          state,
          codeVerifier,
        }
      },
      params: {
        scope: 'openid myinfo-person',
      },
    },

    token: {
      url: async (params: any) => {
        const tokens = await getClient().exchangeCodeForToken(
          params.code,
          params.codeVerifier
        )
        return tokens
      },
    },

    userinfo: {
      url: async (tokens: any) => {
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

        // Validate tokens exist
        if (!tokens.id_token) {
          throw new Error('Missing ID token from Singpass')
        }
        if (!tokens.access_token) {
          throw new Error('Missing access token from Singpass')
        }

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
