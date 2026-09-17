// No "server-only": the proxy (middleware runtime) reads this too.
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/** Narrows both values at once, so callers get strings instead of `!` assertions. */
export function supabaseEnv(): { url: string; key: string } | null {
  return supabaseUrl && supabaseKey
    ? { url: supabaseUrl, key: supabaseKey }
    : null;
}

export function isSupabaseConfigured() {
  return supabaseEnv() !== null;
}
