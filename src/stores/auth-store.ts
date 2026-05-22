"use client";

import { create } from "zustand";
import { useCartStore } from "@/stores/cart-store";
import { createClient } from "@/utils/supabase/client";

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  shippingAddress?: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password?: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  setUser: (user) => set({ user }),

  loginWithGoogle: async () => {
    const supabase = createClient();
    const origin =
      typeof window !== "undefined" ? window.location.origin : "https://nestifyessentials.pages.dev";
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    });
    if (error) throw error;
  },

  loginWithEmail: async (email, password, name) => {
    const supabase = createClient();
    if (name && password) {
      // Sign Up flow
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });
      if (error) throw error;

      if (data.user) {
        const user = {
          id: data.user.id,
          email: data.user.email || email,
          fullName: name,
          phone: "",
          shippingAddress: "",
        };
        set({ user });
        await useCartStore.getState().bindUser(user.id);
      }
    } else if (password) {
      // Sign In flow
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      if (data.user) {
        // Fetch profile details from public.profiles table
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .maybeSingle();

        const user = {
          id: data.user.id,
          email: data.user.email || email,
          fullName: profile?.full_name || data.user.user_metadata?.full_name || "",
          phone: profile?.phone || "",
          shippingAddress: profile?.shipping_address || "",
        };
        set({ user });
        await useCartStore.getState().bindUser(user.id);
      }
    }
  },

  logout: async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    set({ user: null });
    await useCartStore.getState().bindUser(null);
  },
}));

// Initialize active session and subscribe to auth state changes in browser environments
if (typeof window !== "undefined") {
  const syncSession = async () => {
    const isMockPreview = process.env.NEXT_PUBLIC_MOCK_PREVIEW === "true";
    const { getSupabasePublicEnv } = await import("@/utils/supabase/env");
    const { url, key } = getSupabasePublicEnv();

    if (isMockPreview || !url || !key) {
      useAuthStore.setState({ loading: false });
      return;
    }

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle();

        const user = {
          id: session.user.id,
          email: session.user.email || "",
          fullName: profile?.full_name || session.user.user_metadata?.full_name || "",
          phone: profile?.phone || "",
          shippingAddress: profile?.shipping_address || "",
        };
        useAuthStore.setState({ user, loading: false });
        await useCartStore.getState().bindUser(user.id);
      } else {
        useAuthStore.setState({ user: null, loading: false });
        await useCartStore.getState().bindUser(null);
      }

      // Listen for auth state changes
      supabase.auth.onAuthStateChange(async (event, currentSession) => {
        if (currentSession?.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", currentSession.user.id)
            .maybeSingle();

          const user = {
            id: currentSession.user.id,
            email: currentSession.user.email || "",
            fullName:
              profile?.full_name ||
              currentSession.user.user_metadata?.full_name ||
              "",
            phone: profile?.phone || "",
            shippingAddress: profile?.shipping_address || "",
          };
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
