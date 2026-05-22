import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client for webhooks and server-only mutations.
 * Never import this in client components.
 * Fallback to mock credentials for preview builds.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mock.supabase.co";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "mock_service_role_key_placeholder";

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
