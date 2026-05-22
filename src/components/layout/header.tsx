"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { BRAND_NAME, TOP_CATEGORIES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { useCartStore, useCartTotals } from "@/stores/cart-store";

export function Header() {
  const openCart = useCartStore((s) => s.openCart);
  const { itemCount } = useCartTotals();

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="font-serif text-xl tracking-tight text-stone-900">
          {BRAND_NAME}
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {TOP_CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/shop/${cat.slug}`}
              className="text-sm text-stone-600 transition-colors hover:text-stone-900"
            >
              {cat.label}
            </Link>
          ))}
          <Link
            href="/faq"
            className="text-sm text-stone-600 transition-colors hover:text-stone-900"
          >
            FAQ
          </Link>
          <Link
            href="/account/profile"
            className="text-sm text-stone-600 transition-colors hover:text-stone-900"
          >
            Account
          </Link>
        </nav>

        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={openCart}
          aria-label="Open cart"
        >
          <ShoppingBag className="h-5 w-5" />
          {itemCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-stone-900 px-1 text-[10px] font-medium text-white">
              {itemCount}
            </span>
          )}
        </Button>
      </div>
    </header>
  );
}
