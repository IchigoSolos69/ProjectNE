import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicEnv } from "@/utils/supabase/env";

export const createClient = () => {
  const { url, key } = getSupabasePublicEnv();
  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Add them in .env.local (dev) or Cloudflare Pages → Environment variables (production build).",
    );
  }
  return createBrowserClient(url, key, {
    auth: {
      flowType: "pkce",
      detectSessionInUrl: true,
      persistSession: true,
      autoRefreshToken: true,
    },
  });
};
