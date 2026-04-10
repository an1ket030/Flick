import { createClient } from '@supabase/supabase-js';
import { env } from '../config.js';

// Admin client — bypasses RLS. Use ONLY in server-to-server operations.
export const supabaseAdmin = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Anon client — respects RLS. Use when acting on behalf of a user (with their JWT).
export const supabaseAnon = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_ANON_KEY
);

// Create a user-scoped client from a Bearer token
export function createUserClient(accessToken: string) {
  const client = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    global: {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  return client;
}
