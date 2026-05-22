"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Heart, User, Search, MapPin, LogOut, Settings, UserCheck } from "lucide-react";
import { BRAND_NAME } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { useCartStore, useCartTotals } from "@/stores/cart-store";
import { useAuthStore } from "@/stores/auth-store";
import { createClient } from "@/utils/supabase/client";

export function Header() {
  const openCart = useCartStore((s) => s.openCart);
  const { itemCount } = useCartTotals();
  const { user, logout } = useAuthStore();
  const pathname = usePathname();
  const [showDropdown, setShowDropdown] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const [categories, setCategories] = React.useState<{ name: string; slug: string }[]>([]);

  // Close dropdown on click outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  React.useEffect(() => {
    async function loadCategories() {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("categories")
          .select("name, slug")
          .is("parent_id", null)
          .order("sort_order", { ascending: true });
        if (data && data.length > 0) {
          setCategories(data);
        }
      } catch (err) {
        console.error("Failed to load header categories:", err);
      }
    }
    loadCategories();
  }, []);

  const navLinks = [
    { label: "NEW ARRIVALS", href: "/shop/beddings" },
    ...categories.map((cat) => ({
      label: cat.name.toUpperCase(),
      href: `/shop/${cat.slug}`,
    })),
    ...(categories.length === 0
      ? [
        { label: "BEDDING", href: "/shop/beddings" },
        { label: "BATH", href: "/shop/bath-towels" },
        { label: "PILLOWS", href: "/shop/pillow-covers" },
      ]
      : []),
    { label: "SALE", href: "/shop/beddings", isSale: true },
  ];


  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-card/95 shadow-sm backdrop-blur-md">
      <div className="h-1 w-full bg-nest-sage" />

      {/* Main Header Container */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Top Row: Track order, Logo, Icons */}
        <div className="flex h-20 items-center justify-between gap-4 border-b border-border/70">

          {/* Left Side: Track order */}
          <div className="flex-1 hidden md:flex items-center">
            <Link
              href="/faq"
              className="flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>Track Your Order</span>
            </Link>
          </div>

          {/* Center Logo */}
          <div className="flex justify-center flex-1 md:flex-initial">
            <Link href="/" className="flex flex-col items-center select-none text-center">
              <div className="flex items-baseline justify-center">
                <span className="mr-1.5 transform -rotate-3 select-none font-serif text-2xl italic leading-none tracking-tight text-nest-tan">
                  nestify
                </span>
                <span className="font-sans text-2xl font-extrabold leading-none tracking-widest text-primary">
                  ESSENTIALS
                </span>
              </div>
              <span className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground/80 mt-1 font-semibold">
                Style Your Space…
              </span>
            </Link>
          </div>

          {/* Right Side: Search, Wishlist, Account, Cart */}
          <div className="flex flex-1 items-center justify-end gap-3 sm:gap-4">

            {/* Search */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted"
              aria-label="Search catalog"
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Wishlist */}
            <Link href="/account/profile" className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted"
                aria-label="Wishlist"
              >
                <Heart className="h-5 w-5" />
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-white">
                  0
                </span>
              </Button>
            </Link>

            {/* Account Icon with Modal/Dropdown */}
            <div className="relative" ref={dropdownRef}>
              {user ? (
                // User is Logged In: Show Account Dropdown Menu
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-primary hover:text-foreground hover:bg-muted"
                    onClick={() => setShowDropdown(!showDropdown)}
                    aria-label="Account menu"
                  >
                    <UserCheck className="h-5 w-5" />
                  </Button>

                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-48 rounded-lg border border-border bg-card py-1 shadow-lg ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-2 border-b border-border/70">
                        <p className="text-xs font-semibold text-foreground truncate">{user.fullName}</p>
                        <p className="text-[10px] text-muted-foreground truncate mt-0.5">{user.email}</p>
                      </div>
                      <Link
                        href="/account/profile"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-foreground/90 hover:bg-muted hover:text-foreground"
                      >
                        <User className="h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                      <Link
                        href="/account/settings"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-foreground/90 hover:bg-muted hover:text-foreground"
                      >
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                      <button
                        onClick={async () => {
                          setShowDropdown(false);
                          await logout();
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign out</span>
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <a href="https://nestifyessentials.pages.dev/login">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted"
                    aria-label="Sign in"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </a>
              )}
            </div>

            {/* Cart Icon */}
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted"
              onClick={openCart}
              aria-label="Open cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-white">
                  {itemCount}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Bottom Row: Navigation Links */}
        <nav className="flex h-12 items-center justify-center gap-6 sm:gap-8 overflow-x-auto scrollbar-none py-1">
          {navLinks.map((link, idx) => (
            <Link
              key={idx}
              href={link.href}
              className={`text-[12px] font-bold tracking-wider transition-colors whitespace-nowrap ${link.isSale
                ? "text-red-600 hover:text-red-800"
                : "text-foreground/90 hover:text-foreground"
                }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

      </div>
    </header>
  );
}
