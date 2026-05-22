"use client";

import { create } from "zustand";
import { getAuthCallbackUrl } from "@/lib/auth-redirect";
import { useCartStore } from "@/stores/cart-store";
import { createClient } from "@/utils/supabase/client";
import { getSupabasePublicEnv } from "@/utils/supabase/env";

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  shippingAddress?: string;
}

function isAuthDisabled(): boolean {
  if (process.env.NEXT_PUBLIC_MOCK_PREVIEW === "true") return true;
  const { url, key } = getSupabasePublicEnv();
  return !url || !key;
}

async function mapUserFromSession(
  supabase: ReturnType<typeof createClient>,
  authUser: { id: string; email?: string | null; user_metadata?: Record<string, unknown> },
) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", authUser.id)
    .maybeSingle();

  return {
    id: authUser.id,
    email: authUser.email || "",
    fullName:
      (profile?.full_name as string | undefined) ||
      (authUser.user_metadata?.full_name as string | undefined) ||
      "",
    phone: (profile?.phone as string | undefined) || "",
    shippingAddress: (profile?.shipping_address as string | undefined) || "",
  };
}

interface AuthState {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (
    email: string,
    password?: string,
    name?: string,
  ) => Promise<"signed_in" | "confirm_email">;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  setUser: (user) => set({ user }),

  loginWithGoogle: async () => {
    if (isAuthDisabled()) {
      throw new Error(
        "Sign-in is disabled on this deploy. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY on Cloudflare, rebuild without NEXT_PUBLIC_MOCK_PREVIEW=true, and add your site URL in Supabase Auth settings.",
      );
    }

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: getAuthCallbackUrl(),
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) throw error;

    if (data?.url) {
      window.location.assign(data.url);
      return;
    }

    throw new Error(
      "Google sign-in did not return a redirect URL. In Supabase: Authentication → Providers → Google — enable the provider and save Client ID/Secret.",
    );
  },

  loginWithEmail: async (email, password, name) => {
    if (isAuthDisabled()) {
      throw new Error(
        "Email sign-in is disabled on this deploy. Configure Supabase environment variables and rebuild.",
      );
    }

    const supabase = createClient();

    if (name && password) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: getAuthCallbackUrl(),
          data: { full_name: name },
        },
      });
      if (error) throw error;

      if (data.session?.user) {
        const user = await mapUserFromSession(supabase, data.session.user);
        set({ user });
        await useCartStore.getState().bindUser(user.id);
        return "signed_in";
      }

      if (data.user) {
        return "confirm_email";
      }

      throw new Error("Account could not be created. Try again or use Google sign-in.");
    }

    if (password) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      if (data.user) {
        const user = await mapUserFromSession(supabase, data.user);
        set({ user });
        await useCartStore.getState().bindUser(user.id);
        return "signed_in";
      }

      throw new Error("Sign-in failed. Check your email and password.");
    }

    throw new Error("Password is required.");
  },

  logout: async () => {
    if (!isAuthDisabled()) {
      const supabase = createClient();
      await supabase.auth.signOut();
    }
    set({ user: null });
    await useCartStore.getState().bindUser(null);
  },
}));

if (typeof window !== "undefined") {
  const syncSession = async () => {
    if (isAuthDisabled()) {
      useAuthStore.setState({ loading: false });
      return;
    }

    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const user = await mapUserFromSession(supabase, session.user);
        useAuthStore.setState({ user, loading: false });
        await useCartStore.getState().bindUser(user.id);
      } else {
        useAuthStore.setState({ user: null, loading: false });
        await useCartStore.getState().bindUser(null);
      }

      supabase.auth.onAuthStateChange(async (event, currentSession) => {
        if (currentSession?.user) {
          const user = await mapUserFromSession(supabase, currentSession.user);
          useAuthStore.setState({ user, loading: false });
          if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
            await useCartStore.getState().bindUser(user.id);
          }
        } else {
          useAuthStore.setState({ user: null, loading: false });
          await useCartStore.getState().bindUser(null);
        }
      });
    } catch (err) {
      console.error("Auth state synchronization error:", err);
      useAuthStore.setState({ loading: false });
    }
  };

  syncSession();
}
