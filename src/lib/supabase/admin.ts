import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only admin client with service_role key.
 * DO NOT expose to client components.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required on server for admin operations");
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {

    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
