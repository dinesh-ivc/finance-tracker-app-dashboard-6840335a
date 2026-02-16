/**
 * Server-side database client factory
 * Automatically selects the appropriate database client based on environment
 * 
 * For base apps (Aurora): Uses Aurora PostgreSQL (lib/database/aurora)
 * For client apps (Supabase): Uses Supabase (lib/supabase/server)
 * 
 * IMPORTANT: This file should NOT be copied to Aurora-only apps.
 * Aurora apps should directly import from './aurora' instead.
 */

// Check which database provider is configured
const isAurora = !!process.env.DATABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL;
const isSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL;

/**
 * Get the appropriate database client based on configuration
 * @returns {Promise<any>} - Database client (Aurora Pool or Supabase Client)
 */
export async function getDatabaseClient() {
  if (isAurora) {
    // Use Aurora PostgreSQL - dynamic import to avoid requiring Supabase in Aurora-only apps
    // This import will only execute for Aurora apps, so it's safe even if aurora.ts doesn't exist in Supabase apps
    try {
      // @ts-expect-error - Dynamic import may not exist in Supabase apps (aurora.ts is excluded)
      // This is safe because this code path only executes when isAurora is true
      const { getPool } = await import('./aurora');
      return getPool();
    } catch (error: any) {
      // If aurora.ts doesn't exist (e.g., in Supabase apps), this should never execute
      // But we handle it gracefully just in case
      throw new Error(
        'Aurora database module not found. ' +
        'Please ensure lib/database/aurora.ts exists for Aurora apps. ' +
        `Original error: ${error?.message || 'Unknown error'}`
      );
    }
  } else if (isSupabase) {
    // Use Supabase - dynamic import to avoid errors if Supabase files don't exist
    // This import will only execute for Supabase apps
    try {
      const { createClient } = await import('../supabase/server');
      return await createClient();
    } catch (error: any) {
      throw new Error(
        'Supabase client module not found. ' +
        'Please ensure lib/supabase/server.ts exists for Supabase apps. ' +
        `Original error: ${error?.message || 'Unknown error'}`
      );
    }
  } else {
    throw new Error(
      'No database configuration found. ' +
      'Please set either DATABASE_URL (for Aurora) or NEXT_PUBLIC_SUPABASE_URL (for Supabase).'
    );
  }
}

/**
 * Get database type
 * @returns {'aurora' | 'supabase' | 'unknown'}
 */
export function getDatabaseType(): 'aurora' | 'supabase' | 'unknown' {
  if (isAurora) return 'aurora';
  if (isSupabase) return 'supabase';
  return 'unknown';
}
