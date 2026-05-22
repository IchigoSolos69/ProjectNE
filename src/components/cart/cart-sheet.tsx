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
import { motion, AnimatePresence } from "framer-motion";

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
          <AnimatePresence mode="wait">
            {items.length === 0 ? (
              <motion.div
                key="empty-cart"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="py-8 flex flex-col h-full justify-between"
              >
                <div>
                  <h3 className="font-serif text-2xl font-bold text-foreground leading-tight">
                    Your Bag is empty.
                  </h3>
                  
                  {user ? (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Welcome back, {user.fullName}! Explore our collections to add items to your bag.
                    </p>
                  ) : (
                    <p className="mt-2 text-sm text-muted-foreground">
                      <a
                        href="/login"
                        onClick={closeCart}
                        className="text-primary hover:underline font-semibold cursor-pointer text-left bg-transparent border-none p-0 inline-flex items-center"
                      >
                        Sign in
                      </a>{" "}
                      to see if you have any saved items
                    </p>
                  )}

                  <div className="mt-12">
                    <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/80 mb-4">
                      My Profile
                    </h4>
                    <ul className="space-y-1">
                      <li>
                        <Link
                          href="/account/profile"
                          onClick={closeCart}
                          className="flex min-h-11 items-center gap-3 rounded px-3 py-3 text-sm font-medium text-foreground/90 transition-colors hover:bg-muted hover:text-foreground"
                        >
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span>Orders</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/account/profile"
                          onClick={closeCart}
                          className="flex min-h-11 items-center gap-3 rounded px-3 py-3 text-sm font-medium text-foreground/90 transition-colors hover:bg-muted hover:text-foreground"
                        >
                          <Bookmark className="h-4 w-4 text-muted-foreground" />
                          <span>Your Saves</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/account/profile"
                          onClick={closeCart}
                          className="flex min-h-11 items-center gap-3 rounded px-3 py-3 text-sm font-medium text-foreground/90 transition-colors hover:bg-muted hover:text-foreground"
                        >
                          <Settings className="h-4 w-4 text-muted-foreground" />
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
                            href="/login"
                            onClick={closeCart}
                            className="w-full flex items-center gap-3 py-3 px-1 text-sm font-medium text-foreground/90 hover:text-foreground hover:bg-muted rounded transition-colors text-left"
                          >
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>Sign in</span>
                          </a>
                        )}
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="cart-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="w-full"
              >
                <ul className="space-y-6 overflow-x-hidden pr-1">
                  {items.map((item) => (
                      <li
                        key={item.productId}
                        className="flex gap-4 py-2"
                      >
                        <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded bg-muted">
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
                            className="text-sm font-medium text-foreground hover:text-primary transition-colors duration-200"
                            onClick={closeCart}
                          >
                            {item.name}
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            {formatINR(item.pricePaise)}
                          </p>
                          <div className="mt-2 flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="shrink-0"
                              onClick={() =>
                                updateQuantity(item.productId, item.quantity - 1)
                              }
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm tabular-nums">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="shrink-0"
                              onClick={() =>
                                updateQuantity(item.productId, item.quantity + 1)
                              }
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="ml-auto shrink-0 text-muted-foreground/75 hover:text-red-600"
                              onClick={() => removeItem(item.productId)}
                              aria-label="Remove item"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </li>
                    ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {items.length > 0 && (
          <div className="border-t border-border/70 p-4 pb-safe sm:p-6">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatINR(subtotalPaise)}</span>
            </div>
            <Separator className="my-4" />
            <Button className="min-h-11 w-full" asChild>
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
