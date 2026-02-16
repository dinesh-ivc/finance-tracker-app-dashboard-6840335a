import { createBrowserClient } from '@supabase/ssr'

/**
 * Creates a Supabase client for use in client components and client-side operations
 * This client automatically handles auth state and token refresh
 * 
 * If Supabase keys are not configured, this will throw an error.
 * Make sure to check if Supabase is configured before using this function.
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment variables.'
    )
  }

  // Configure with iframe-compatible cookie options
  // SameSite=None and Secure are required for cookies to work in cross-origin iframes
  return createBrowserClient(supabaseUrl, supabaseAnonKey, {
    cookieOptions: {
      sameSite: 'none',
      secure: true,
      path: '/',
    },
  })
}
