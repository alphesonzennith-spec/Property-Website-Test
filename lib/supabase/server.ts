/**
 * lib/supabase/server.ts
 *
 * Server-side Supabase client using @supabase/ssr.
 * Use in Server Components, Route Handlers, Server Actions, and tRPC routers.
 *
 * Returns null when Supabase is not configured (mock mode).
 * Callers must handle null:
 *
 *   const supabase = await createClient()
 *   if (!supabase) { // fall back to mock data }
 *
 * Two clients are available:
 *  - createClient()          → anon key, respects RLS (use for user-facing queries)
 *  - createServiceClient()   → service role key, bypasses RLS (use for admin/seeding)
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { env, serverEnv } from '@/lib/config/env'

// ── Anon client (respects RLS) ────────────────────────────────────────────────

/**
 * Creates a server-side Supabase client using the anon key.
 * Reads and writes cookies so sessions are passed correctly between
 * Server Components and Route Handlers.
 *
 * Returns null if Supabase is not configured.
 */
export async function createClient() {
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    return null
  }

  const cookieStore = await cookies()

  return createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch {
          // Server Components cannot set cookies.
          // Route Handlers and Server Actions can — this catch is safe to ignore
          // when called from a Server Component context.
        }
      },
    },
  })
}

// ── Service role client (bypasses RLS) ───────────────────────────────────────

/**
 * Creates a server-side Supabase client using the service role key.
 * Bypasses Row Level Security — use only for:
 *  - Admin operations
 *  - Seeding / migrations
 *  - Background jobs
 *  - Reading data that RLS would block for unauthenticated users
 *
 * NEVER expose this client or its key to the browser.
 * Returns null if Supabase is not configured.
 */
export async function createServiceClient() {
  if (!env.supabaseUrl || !serverEnv.supabaseServiceRoleKey) {
    return null
  }

  const cookieStore = await cookies()

  return createServerClient(env.supabaseUrl, serverEnv.supabaseServiceRoleKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch {
          // See note in createClient above.
        }
      },
    },
  })
}
