/**
 * Returns a display URL for a property image.
 *
 * MOCK:    Passes through absolute placehold.co URLs unchanged.
 * SUPABASE: Replace the return in the else branch with:
 *           return supabase.storage.from('property-images').getPublicUrl(path).data.publicUrl
 */
export function getPropertyImageUrl(path: string | null | undefined): string {
  if (!path) return ''
  if (path.startsWith('https://')) return path
  // SUPABASE: return supabase.storage.from('property-images').getPublicUrl(path).data.publicUrl
  // MOCK: Relative paths returned as-is (never occurs while all mock URLs are absolute)
  return path
}

/**
 * Returns a display URL for a user or agent avatar.
 *
 * MOCK:    Passes through absolute URLs unchanged.
 * SUPABASE: Replace the return in the else branch with:
 *           return supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl
 */
export function getAvatarUrl(path: string | null | undefined): string {
  if (!path) return ''
  if (path.startsWith('https://')) return path
  // SUPABASE: return supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl
  // MOCK: Relative paths returned as-is (never occurs while all mock URLs are absolute)
  return path
}
