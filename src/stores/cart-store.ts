"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  fetchUserCart,
  mergeCartItems,
  saveUserCart,
} from "@/lib/cart-sync";
import type { CartItem } from "@/types/database";

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  syncUserId: string | null;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  setItems: (items: CartItem[]) => void;
  bindUser: (userId: string | null) => Promise<void>;
}

function computeTotals(items: CartItem[]) {
  const subtotalPaise = items.reduce(
    (sum, i) => sum + i.pricePaise * i.quantity,
    0,
  );
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  return { subtotalPaise, itemCount };
}

let syncTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleRemoteSync(userId: string | null, items: CartItem[]) {
  if (!userId || process.env.NEXT_PUBLIC_MOCK_PREVIEW === "true") return;
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    void saveUserCart(userId, items);
  }, 400);
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      syncUserId: null,

      setItems: (items) => {
        set({ items });
        scheduleRemoteSync(get().syncUserId, items);
      },

      bindUser: async (userId) => {
        const previousUserId = get().syncUserId;
        set({ syncUserId: userId });

        if (!userId || process.env.NEXT_PUBLIC_MOCK_PREVIEW === "true") {
          return;
        }

        if (previousUserId === userId) return;

        const localItems = get().items;
        const remoteItems = await fetchUserCart(userId);
        const merged = mergeCartItems(localItems, remoteItems);
        set({ items: merged });
        await saveUserCart(userId, merged);
      },

      addItem: (item, quantity = 1) => {
        set((state) => {
          const existing = state.items.find((i) => i.productId === item.productId);
          const items = existing
            ? state.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantity: i.quantity + quantity }
                  : i,
              )
            : [...state.items, { ...item, quantity }];
          scheduleRemoteSync(state.syncUserId, items);
          return { items, isOpen: true };
        });
      },

      removeItem: (productId) => {
        set((state) => {
          const items = state.items.filter((i) => i.productId !== productId);
          scheduleRemoteSync(state.syncUserId, items);
          return { items };
        });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity < 1) {
          get().removeItem(productId);
          return;
        }
        set((state) => {
          const items = state.items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i,
          );
          scheduleRemoteSync(state.syncUserId, items);
          return { items };
        });
      },

      clearCart: () => {
        set({ items: [] });
        scheduleRemoteSync(get().syncUserId, []);
      },
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),
    }),
    {
      name: "nestify-cart",
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

export function useCartTotals() {
  const items = useCartStore((s) => s.items);
  return computeTotals(items);
}
