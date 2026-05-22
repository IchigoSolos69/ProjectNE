"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, Package, Bookmark, Settings, User } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCartStore, useCartTotals } from "@/stores/cart-store";
import { useAuthStore } from "@/stores/auth-store";
import { formatINR } from "@/lib/currency";

export function CartSheet() {
  const { items, isOpen, closeCart, updateQuantity, removeItem } = useCartStore();
  const { subtotalPaise, itemCount } = useCartTotals();
  const { user, logout } = useAuthStore();

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent className="flex flex-col h-full">
        <SheetHeader>
          <SheetTitle className="font-serif">Your cart ({itemCount})</SheetTitle>
        </SheetHeader>

        <div className="flex flex-1 flex-col overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="py-8 flex flex-col h-full justify-between">
              <div>
                <h3 className="font-serif text-2xl font-bold text-stone-900 leading-tight">
                  Your Bag is empty.
                </h3>
                
                {user ? (
                  <p className="mt-2 text-sm text-stone-500">
                    Welcome back, {user.fullName}! Explore our collections to add items to your bag.
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-stone-500">
                    <a
                      href="https://nestifyessentials.pages.dev/login"
                      onClick={closeCart}
                      className="text-[#007A78] hover:underline font-semibold cursor-pointer text-left bg-transparent border-none p-0 inline-flex items-center"
                    >
                      Sign in
                    </a>{" "}
                    to see if you have any saved items
                  </p>
                )}

                <div className="mt-12">
                  <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-stone-400 mb-4">
                    My Profile
                  </h4>
                  <ul className="space-y-1">
                    <li>
                      <Link
                        href="/account/profile"
                        onClick={closeCart}
                        className="flex items-center gap-3 py-3 px-1 text-sm font-medium text-stone-700 hover:text-stone-950 hover:bg-stone-50 rounded transition-colors"
                      >
                        <Package className="h-4 w-4 text-stone-500" />
                        <span>Orders</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/account/profile"
                        onClick={closeCart}
                        className="flex items-center gap-3 py-3 px-1 text-sm font-medium text-stone-700 hover:text-stone-950 hover:bg-stone-50 rounded transition-colors"
                      >
                        <Bookmark className="h-4 w-4 text-stone-500" />
                        <span>Your Saves</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/account/profile"
                        onClick={closeCart}
                        className="flex items-center gap-3 py-3 px-1 text-sm font-medium text-stone-700 hover:text-stone-950 hover:bg-stone-50 rounded transition-colors"
                      >
                        <Settings className="h-4 w-4 text-stone-500" />
                        <span>Account</span>
                      </Link>
                    </li>
                    <li>
                      {user ? (
                        <button
                          onClick={async () => {
                            closeCart();
                            await logout();
                          }}
                          className="w-full flex items-center gap-3 py-3 px-1 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50/50 rounded transition-colors text-left cursor-pointer"
                        >
                          <User className="h-4 w-4 text-red-500" />
                          <span>Sign out</span>
                        </button>
                      ) : (
                        <a
                          href="https://nestifyessentials.pages.dev/login"
                          onClick={closeCart}
                          className="w-full flex items-center gap-3 py-3 px-1 text-sm font-medium text-stone-700 hover:text-stone-950 hover:bg-stone-50 rounded transition-colors text-left"
                        >
                          <User className="h-4 w-4 text-stone-500" />
                          <span>Sign in</span>
                        </a>
                      )}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <ul className="space-y-6">
              {items.map((item) => (
                <li key={item.productId} className="flex gap-4">
                  <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded bg-stone-100">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <Link
                      href={`/product/${item.slug}`}
                      className="text-sm font-medium text-stone-900"
                      onClick={closeCart}
                    >
                      {item.name}
                    </Link>
                    <p className="text-sm text-stone-600">
                      {formatINR(item.pricePaise)}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity - 1)
                        }
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-6 text-center text-sm">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity + 1)
                        }
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-auto h-8 w-8"
                        onClick={() => removeItem(item.productId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-stone-100 p-6">
            <div className="flex justify-between text-sm">
              <span className="text-stone-600">Subtotal</span>
              <span className="font-medium">{formatINR(subtotalPaise)}</span>
            </div>
            <Separator className="my-4" />
            <Button className="w-full" asChild>
              <Link href="/checkout" onClick={closeCart}>
                Checkout
              </Link>
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
