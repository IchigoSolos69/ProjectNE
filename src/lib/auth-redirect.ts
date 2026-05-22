/** Canonical site URL for OAuth redirects (must match Supabase Auth → URL configuration). */
export function getSiteOrigin(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  return configured || "http://localhost:3000";
}

export function getAuthCallbackUrl(nextPath = "/account/profile"): string {
  const origin = getSiteOrigin();
  const next = nextPath.startsWith("/") ? nextPath : `/${nextPath}`;
  return `${origin}/auth/callback?next=${encodeURIComponent(next)}`;
}
