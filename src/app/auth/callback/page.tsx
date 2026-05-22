"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { getSupabasePublicEnv } from "@/utils/supabase/env";

function AuthCallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const next = searchParams.get("next") ?? "/account/profile";
    const code = searchParams.get("code");
    const oauthError = searchParams.get("error");
    const oauthDescription = searchParams.get("error_description");

    async function finish() {
      if (oauthError) {
        setError(
          oauthDescription
            ? decodeURIComponent(oauthDescription.replace(/\+/g, " "))
            : oauthError,
        );
        return;
      }

      const isMockPreview = process.env.NEXT_PUBLIC_MOCK_PREVIEW === "true";
      const { url, key } = getSupabasePublicEnv();

      if (isMockPreview || !url || !key) {
        setError(
          "Auth is disabled on this build. On Cloudflare Pages: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, remove NEXT_PUBLIC_MOCK_PREVIEW=true, and redeploy.",
        );
        return;
      }

      try {
        const supabase = createClient();

        if (code) {
          const { error: exchangeError } =
            await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) {
            setError(exchangeError.message);
            return;
          }
        }

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          setError(sessionError.message);
          return;
        }

        if (!session) {
          setError(
            "No session after sign-in. Add this exact URL under Supabase → Authentication → URL configuration → Redirect URLs: " +
              `${window.location.origin}/auth/callback`,
          );
          return;
        }

        router.replace(next);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Sign-in failed");
      }
    }

    void finish();
  }, [router, searchParams]);

  if (error) {
    return (
      <div className="mx-auto max-w-md text-center">
        <p className="text-sm font-medium text-red-600">Sign-in failed</p>
        <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        <Link
          href="/login"
          className="mt-4 inline-block text-sm font-medium text-primary underline"
        >
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 text-muted-foreground">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm">Completing sign-in…</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4">
      <Suspense
        fallback={
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm">Loading…</p>
          </div>
        }
      >
        <AuthCallbackHandler />
      </Suspense>
    </div>
  );
}
