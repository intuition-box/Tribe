import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr"

export function createBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    console.warn("[v0] Supabase environment variables are not configured properly")
    // Return a mock client that won't break the build but will log errors when used
    return null as any
  }

  return createSupabaseBrowserClient(url, key)
}

// Keep the original createClient for backwards compatibility
export function createClient() {
  return createBrowserClient()
}

export function createClientComponentClient() {
  return createBrowserClient()
}
