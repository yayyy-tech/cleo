import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl) {
  console.warn("Warning: SUPABASE_URL not set.");
}

/**
 * Admin client — uses SERVICE_ROLE key.
 * Bypasses Row Level Security. Use ONLY in backend services.
 */
export const supabaseAdmin: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseServiceKey || "placeholder-key",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/**
 * Public client — uses ANON key.
 * Respects Row Level Security. Use for user-scoped queries.
 */
export const supabaseClient: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-key"
);

// Backward compat — existing code imports `supabase`
export const supabase = supabaseAdmin;
