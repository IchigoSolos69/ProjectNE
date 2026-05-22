"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  shippingAddress?: string;
}

interface AuthState {
  user: User | null;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,

      loginWithGoogle: async () => {
        // Simulate Google sign-in redirect / API call delay
        await new Promise((resolve) => setTimeout(resolve, 800));
        set({
          user: {
            id: "usr-google-123",
            email: "aditi.sharma@gmail.com",
            fullName: "Aditi Sharma",
            phone: "+91 98765 43210",
            shippingAddress: "Flat 4B, 12 Residency Road\nBengaluru, Karnataka 560025\nIndia",
          },
        });
      },

      loginWithEmail: async (email, name) => {
        await new Promise((resolve) => setTimeout(resolve, 600));
        set({
          user: {
            id: `usr-email-${Date.now()}`,
            email: email,
            fullName: name,
            phone: "",
            shippingAddress: "",
          },
        });
      },

      logout: async () => {
        set({ user: null });
      },
    }),
    { name: "nestify-auth" },
  ),
);
