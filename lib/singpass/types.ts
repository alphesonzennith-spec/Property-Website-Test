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
