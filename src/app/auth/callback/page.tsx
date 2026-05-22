"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { getSupabasePublicEnv } from "@/utils/supabase/env";
import { Suspense } from "react";

function AuthCallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const next = searchParams.get("next") ?? "/account/profile";
    const code = searchParams.get("code");

    async function finish() {
      const isMockPreview = process.env.NEXT_PUBLIC_MOCK_PREVIEW === "true";
      const { url, key } = getSupabasePublicEnv();

      if (isMockPreview || !url || !key) {
        router.replace(next);
        return;
      }

      if (!code) {
        setError("Missing authorization code.");
        return;
      }

      try {
        const supabase = createClient();
        const { error: exchangeError } =
          await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError) {
          setError(exchangeError.message);
          return;
        }

        router.replace(next);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Sign-in failed");
      }
    }

    void finish();
  }, [router, searchParams]);

  if (error) {
    return (
      <div className="text-center">
        <p className="text-sm text-red-600">{error}</p>
        <button
          type="button"
          onClick={() => {
            window.location.href = "https://nestifyessentials.pages.dev/login";
          }}
          className="mt-4 text-sm font-medium text-[#007A78] underline"
        >
          Back to login
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 text-stone-600">
      <Loader2 className="h-8 w-8 animate-spin text-[#007A78]" />
      <p className="text-sm">Completing sign-in…</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4">
      <Suspense
        fallback={
          <div className="flex flex-col items-center gap-3 text-stone-600">
            <Loader2 className="h-8 w-8 animate-spin text-[#007A78]" />
            <p className="text-sm">Loading…</p>
          </div>
        }
      >
        <AuthCallbackHandler />
      </Suspense>
    </div>
  );
}
