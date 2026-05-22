import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicEnv } from "@/utils/supabase/env";
import type { Database } from "../../../types/supabase";

export const createClient = () => {
  const { url, key } = getSupabasePublicEnv();
  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Add them in .env.local (dev) or Cloudflare Pages → Environment variables (production build).",
    );
  }
  return createBrowserClient<Database>(url, key, {
    auth: {
      flowType: "pkce",
      detectSessionInUrl: true,
      persistSession: true,
      autoRefreshToken: true,
    },
  });
};
