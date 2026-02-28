/**
 * lib/supabase/client.ts
 *
 * Browser-side Supabase client using @supabase/ssr.
 * Use in Client Components ('use client').
 *
 * Returns null when Supabase is not configured (mock mode).
 * Components that call createClient() must handle null gracefully:
 *
 *   const supabase = createClient()
 *   if (!supabase) return  // mock mode — handled upstream by tRPC routers
 */

import { createBrowserClient } from '@supabase/ssr'
import { clientEnv } from '@/lib/config/env'

export function createClient() {
  if (!clientEnv.supabaseUrl || !clientEnv.supabaseAnonKey) {
    return null
  }

  return createBrowserClient(clientEnv.supabaseUrl, clientEnv.supabaseAnonKey)
}
