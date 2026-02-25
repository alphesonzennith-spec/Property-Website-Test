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
