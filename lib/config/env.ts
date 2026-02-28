/**
 * lib/config/env.ts
 *
 * Typed, validated environment configuration for Space Realty.
 * Import `env` instead of accessing process.env directly anywhere in the app.
 *
 * Design:
 *  - Supabase vars are OPTIONAL — their absence enables automatic mock-data mode.
 *  - All other vars are OPTIONAL in development but throw in production if missing.
 *  - Format validation (url(), regex) runs whenever the var is present.
 *  - `isMockMode()` — true when Supabase URL is not configured.
 *
 * Usage:
 *   import { env, isMockMode } from '@/lib/config/env'
 *   if (isMockMode()) { // use mock data } else { // use env.supabaseUrl }
 */

import { z } from 'zod'

// ── Schemas ───────────────────────────────────────────────────────────────────

/**
 * Client-safe variables (NEXT_PUBLIC_*).
 * These are inlined at build time by Next.js and available in the browser.
 */
const clientSchema = z.object({
  // Optional — absence means mock mode (no Supabase connection)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('Must be a valid URL').optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20, 'Anon key too short').optional(),

  // Maps API
  NEXT_PUBLIC_ONEMAPS_API_KEY: z.string().optional(),

  // App base URL — used for absolute links, OG images, redirects
  NEXT_PUBLIC_APP_URL: z.string().url('Must be a valid URL').default('http://localhost:3000'),
})

/**
 * Server-only variables.
 * Next.js strips non-NEXT_PUBLIC_ vars from the client bundle.
 * Never import serverEnv in a Client Component.
 */
const serverSchema = z.object({
  // Supabase elevated key — optional (absent in mock mode)
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20, 'Service role key too short').optional(),

  // Anthropic — must start with sk-ant- when provided
  ANTHROPIC_API_KEY: z
    .string()
    .regex(/^sk-ant-/, 'Anthropic API key must start with "sk-ant-"')
    .optional(),

  // Singpass OIDC
  SINGPASS_CLIENT_ID: z.string().optional(),
  SINGPASS_CLIENT_SECRET: z.string().optional(),
  SINGPASS_REDIRECT_URI: z.string().url('Must be a valid URL').optional(),

  // Feature flag — 'true' uses mock Singpass flow
  USE_MOCK_SINGPASS: z.string().optional(),

  // Python AI microservice
  PYTHON_AI_SERVICE_URL: z.string().url('Must be a valid URL').default('http://localhost:8000'),

  // Auth.js
  AUTH_SECRET: z.string().optional(),
  NEXTAUTH_SECRET: z.string().optional(),

  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

// ── Parse ─────────────────────────────────────────────────────────────────────

function parseSchema<T>(
  schema: z.ZodType<T>,
  data: NodeJS.ProcessEnv,
  label: string,
): T {
  const result = schema.safeParse(data)
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  • ${i.path.join('.')}: ${i.message}`)
      .join('\n')
    throw new Error(
      `[Space Realty] Invalid ${label} environment variables:\n${issues}\n\nCheck your .env.local file.`,
    )
  }
  return result.data
}

const _client = parseSchema(clientSchema, process.env, 'client')

// Server vars are only available server-side. Parsing them in a browser context
// would fail for any required fields (Next.js strips non-NEXT_PUBLIC_ vars).
// We skip server parsing on the client — serverEnv fields are always undefined there.
const _server =
  typeof window === 'undefined'
    ? parseSchema(serverSchema, process.env, 'server')
    : ({
        SUPABASE_SERVICE_ROLE_KEY: undefined,
        ANTHROPIC_API_KEY: undefined,
        SINGPASS_CLIENT_ID: undefined,
        SINGPASS_CLIENT_SECRET: undefined,
        SINGPASS_REDIRECT_URI: undefined,
        USE_MOCK_SINGPASS: undefined,
        PYTHON_AI_SERVICE_URL: 'http://localhost:8000',
        AUTH_SECRET: undefined,
        NEXTAUTH_SECRET: undefined,
        NODE_ENV: 'development' as const,
      } satisfies z.infer<typeof serverSchema>)

// ── Production guard ──────────────────────────────────────────────────────────
// In production: throw immediately if vars that are required at runtime are absent.
// This surfaces misconfigurations at deploy time rather than at first user request.

if (_server.NODE_ENV === 'production') {
  const missing: string[] = []

  if (!_client.NEXT_PUBLIC_SUPABASE_URL)   missing.push('NEXT_PUBLIC_SUPABASE_URL')
  if (!_client.NEXT_PUBLIC_SUPABASE_ANON_KEY) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  if (!_server.SUPABASE_SERVICE_ROLE_KEY)  missing.push('SUPABASE_SERVICE_ROLE_KEY')
  if (!_server.ANTHROPIC_API_KEY)          missing.push('ANTHROPIC_API_KEY')
  if (!_server.SINGPASS_CLIENT_ID)         missing.push('SINGPASS_CLIENT_ID')
  if (!_server.SINGPASS_CLIENT_SECRET)     missing.push('SINGPASS_CLIENT_SECRET')
  if (!_server.SINGPASS_REDIRECT_URI)      missing.push('SINGPASS_REDIRECT_URI')
  if (!_client.NEXT_PUBLIC_ONEMAPS_API_KEY) missing.push('NEXT_PUBLIC_ONEMAPS_API_KEY')

  if (missing.length > 0) {
    throw new Error(
      `[Space Realty] Missing required environment variables for production:\n` +
        missing.map((v) => `  • ${v}`).join('\n') +
        `\n\nSet these in your hosting provider's environment configuration.`,
    )
  }
}

// ── Exported env object ───────────────────────────────────────────────────────

/**
 * Typed environment configuration.
 * Use this instead of process.env throughout the app.
 *
 * Client-safe fields are available everywhere.
 * Server-only fields are `undefined` in client bundles (Next.js strips them).
 */
export const env = {
  // ── Client-safe (NEXT_PUBLIC_) ──────────────────────────────────────────────
  supabaseUrl:     _client.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: _client.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  onemapsApiKey:   _client.NEXT_PUBLIC_ONEMAPS_API_KEY,
  appUrl:          _client.NEXT_PUBLIC_APP_URL,

  // ── Server-only ─────────────────────────────────────────────────────────────
  // These are undefined in client bundles. Only use in server components,
  // tRPC routers, API routes, and middleware.
  supabaseServiceRoleKey: _server.SUPABASE_SERVICE_ROLE_KEY,
  anthropicApiKey:        _server.ANTHROPIC_API_KEY,
  singpassClientId:       _server.SINGPASS_CLIENT_ID,
  singpassClientSecret:   _server.SINGPASS_CLIENT_SECRET,
  singpassRedirectUri:    _server.SINGPASS_REDIRECT_URI,
  useMockSingpass:        _server.USE_MOCK_SINGPASS === 'true',
  pythonAiServiceUrl:     _server.PYTHON_AI_SERVICE_URL,
  authSecret:             _server.AUTH_SECRET ?? _server.NEXTAUTH_SECRET,
  nodeEnv:                _server.NODE_ENV,
} as const

// ── Named exports for splitting server/client ─────────────────────────────────

/** Client-safe vars only. Safe to import in any component. */
export const clientEnv = {
  supabaseUrl:     _client.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: _client.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  onemapsApiKey:   _client.NEXT_PUBLIC_ONEMAPS_API_KEY,
  appUrl:          _client.NEXT_PUBLIC_APP_URL,
} as const

/** Server-only vars. Only import in server components, API routes, and tRPC routers. */
export const serverEnv = {
  supabaseServiceRoleKey: _server.SUPABASE_SERVICE_ROLE_KEY,
  anthropicApiKey:        _server.ANTHROPIC_API_KEY,
  singpassClientId:       _server.SINGPASS_CLIENT_ID,
  singpassClientSecret:   _server.SINGPASS_CLIENT_SECRET,
  singpassRedirectUri:    _server.SINGPASS_REDIRECT_URI,
  useMockSingpass:        _server.USE_MOCK_SINGPASS === 'true',
  pythonAiServiceUrl:     _server.PYTHON_AI_SERVICE_URL,
  authSecret:             _server.AUTH_SECRET ?? _server.NEXTAUTH_SECRET,
  nodeEnv:                _server.NODE_ENV,
} as const

// ── isMockMode ────────────────────────────────────────────────────────────────

/**
 * Returns true when Supabase is not connected.
 *
 * When true, tRPC routers and data-fetching code automatically fall back to
 * mock data from lib/mock/. No manual toggle needed.
 *
 * When false, the app uses real Supabase queries.
 *
 * @example
 * if (isMockMode()) {
 *   return mockProperties.find(p => p.id === id)
 * }
 * const { data } = await supabase.from('properties').select('*').eq('id', id)
 */
export function isMockMode(): boolean {
  return !env.supabaseUrl
}
