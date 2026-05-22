import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { getSupabasePublicEnv } from "@/utils/supabase/env";

export const createClient = (request: NextRequest) => {
  const { url, key } = getSupabasePublicEnv();

  // Preview / static deploy: skip auth cookie refresh when Supabase is not configured
  if (
    process.env.NEXT_PUBLIC_MOCK_PREVIEW === "true" ||
    !url ||
    !key
  ) {
    return NextResponse.next({ request: { headers: request.headers } });
  }

  let supabaseResponse = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  // Refresh session if expired (no-op when not logged in)
  void supabase.auth.getUser();

  return supabaseResponse;
};
