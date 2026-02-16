import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

/**
 * Creates a Supabase client for use in Server Components, Server Actions, and Route Handlers
 * This client properly handles cookies for auth state management and respects RLS (Row Level Security)
 * 
 * Use this for:
 * - User-authenticated operations
 * - Operations that should respect RLS policies
 * - Reading/writing data that the user has permission to access
 * 
 * @returns {Promise<SupabaseClient>} - Supabase client with user context
 * @throws {Error} - If Supabase keys are not configured
 */
export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment variables.'
    )
  }

  const cookieStore = await cookies()

  // Cookie options for cross-origin iframe support
  // These settings allow cookies to work when app is embedded in an iframe
  const iframeCookieOptions = {
    sameSite: 'none' as const,
    secure: true,
    path: '/',
  }

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              // Merge iframe-compatible options with any existing options
              cookieStore.set(name, value, { ...options, ...iframeCookieOptions })
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

/**
 * Creates an admin Supabase client that bypasses RLS (Row Level Security)
 * This client uses the service role key and should ONLY be used server-side
 * 
 * ⚠️ SECURITY WARNING: Never expose this client to the browser or use it in client components!
 * 
 * Use this for:
 * - Server-side CRUD operations that need to bypass RLS
 * - Admin operations (updating rows that the user doesn't own)
 * - System-level operations
 * - Creating records that should not be restricted by RLS
 * - API routes that need full database access
 * 
 * @returns {SupabaseClient} - Admin Supabase client with service role key
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
  }

  if (!serviceRoleKey) {
    throw new Error(
      'Missing SUPABASE_SERVICE_ROLE_KEY environment variable. ' +
      'This is required for server-side operations that bypass RLS. ' +
      'Get it from Supabase Dashboard > Project Settings > API > service_role key'
    )
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
