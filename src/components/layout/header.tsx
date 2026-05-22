"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Heart, User, Search, LogOut, Settings, UserCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BRAND_NAME } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { useCartStore, useCartTotals } from "@/stores/cart-store";
import { useAuthStore } from "@/stores/auth-store";
import { createClient } from "@/utils/supabase/client";

const ANNOUNCEMENTS = [
  "✨ FREE SHIPPING ON ORDERS OVER $150",
  "🌿 ECO-FRIENDLY & ORGANIC MATERIALS",
  "🛌 EXPERIENCE ULTIMATE SLEEP COMFORT",
  "💫 SPECIAL LAUNCH OFFER: USE CODE 'RESTFUL' FOR 15% OFF"
];

export function Header() {
  const openCart = useCartStore((s) => s.openCart);
  const { itemCount } = useCartTotals();
  const { user, logout } = useAuthStore();
  const pathname = usePathname();
  const [showDropdown, setShowDropdown] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const [categories, setCategories] = React.useState<{ name: string; slug: string }[]>([]);
  const [announcementIndex, setAnnouncementIndex] = React.useState(0);
  const [searchExpanded, setSearchExpanded] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // Rotate announcements
  React.useEffect(() => {
    const interval = setInterval(() => {
      setAnnouncementIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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

  // Focus search input when expanded
  React.useEffect(() => {
    if (searchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchExpanded]);

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
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-card/90 backdrop-blur-md transition-colors duration-300">
      {/* Top Announcement Bar */}
      <div className="bg-nest-brown-dark text-[10px] font-bold tracking-[0.2em] text-nest-cream py-2 text-center h-8 flex items-center justify-center overflow-hidden relative w-full border-b border-border/20">
        <AnimatePresence mode="wait">
          <motion.span
            key={announcementIndex}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="inline-block"
          >
            {ANNOUNCEMENTS[announcementIndex]}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Main Header Container */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top Row: balanced layout grid */}
        <div className="grid grid-cols-3 items-center h-20 border-b border-border/30">
          
          {/* Left Column: EST / Brand details (Desktop only) */}
          <div className="hidden md:flex items-center justify-start text-[10px] tracking-[0.25em] text-muted-foreground uppercase font-bold select-none">
            <span>Style Your Space</span>
          </div>

          {/* Center Column: Logo */}
          <div className="col-span-3 md:col-span-1 flex justify-center">
            <Link href="/" className="flex flex-col items-center select-none text-center group">
              <div className="flex items-baseline justify-center">
                <span className="font-sans font-black text-2xl text-foreground tracking-[0.25em] leading-none transition-colors duration-300 group-hover:text-primary">
                  NESTIFY
                </span>
                <span className="font-serif italic text-2xl text-primary tracking-tight leading-none mr-1.5 transform -rotate-3 select-none transition-all duration-300 group-hover:rotate-0 group-hover:text-secondary">
                  essentials
                </span>
              </div>
              <span className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground mt-1 font-semibold group-hover:text-foreground transition-colors duration-300">
                my heart for home
              </span>
            </Link>
          </div>

          {/* Right Column: Search, Wishlist, Account, Cart */}
          <div className="col-span-3 md:col-span-1 flex items-center justify-end gap-1.5 sm:gap-2.5">
            {/* Search Input and Toggle */}
            <div className="relative flex items-center">
              <AnimatePresence>
                {searchExpanded && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 180, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="relative flex items-center mr-1"
                  >
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-9 pl-3 pr-8 rounded-full border border-border bg-background/50 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:bg-background transition-all"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && searchQuery.trim()) {
                          window.location.href = `/shop/beddings?q=${encodeURIComponent(searchQuery.trim())}`;
                        } else if (e.key === "Escape") {
                          setSearchExpanded(false);
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setSearchExpanded(false);
                      }}
                      className="absolute right-2.5 text-muted-foreground hover:text-foreground text-xs"
                      aria-label="Close search"
                    >
                      ✕
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {!searchExpanded && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearchExpanded(true)}
                  className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full transition-all duration-300 hover:scale-105 hover:-translate-y-0.5"
                  aria-label="Search catalog"
                >
                  <Search className="h-5 w-5" />
                </Button>
              )}
            </div>

            {/* Wishlist */}
            <Link href="/account/profile" className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full transition-all duration-300 hover:scale-105 hover:-translate-y-0.5"
                aria-label="Wishlist"
              >
                <Heart className="h-5 w-5" />
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground shadow-sm transition-transform duration-300 hover:scale-110">
                  0
                </span>
              </Button>
            </Link>

            {/* Account Icon with Modal/Dropdown */}
            <div className="relative" ref={dropdownRef}>
              {user ? (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-primary hover:text-foreground hover:bg-muted/50 rounded-full transition-all duration-300 hover:scale-105 hover:-translate-y-0.5"
                    onClick={() => setShowDropdown(!showDropdown)}
                    aria-label="Account menu"
                  >
                    <UserCheck className="h-5 w-5" />
                  </Button>

                  <AnimatePresence>
                    {showDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2.5 w-52 rounded-xl border border-border bg-card py-1.5 shadow-xl ring-1 ring-black/5 z-50 overflow-hidden"
                      >
                        <div className="px-4 py-2.5 border-b border-border/50 bg-muted/20">
                          <p className="text-xs font-bold text-foreground truncate">{user.fullName}</p>
                          <p className="text-[10px] text-muted-foreground truncate mt-0.5">{user.email}</p>
                        </div>
                        <div className="p-1">
                          <Link
                            href="/account/profile"
                            onClick={() => setShowDropdown(false)}
                            className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-muted-foreground rounded-lg hover:bg-muted/50 hover:text-foreground transition-colors"
                          >
                            <User className="h-4 w-4" />
                            <span>Profile</span>
                          </Link>
                          <Link
                            href="/account/settings"
                            onClick={() => setShowDropdown(false)}
                            className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-muted-foreground rounded-lg hover:bg-muted/50 hover:text-foreground transition-colors"
                          >
                            <Settings className="h-4 w-4" />
                            <span>Settings</span>
                          </Link>
                          <button
                            onClick={async () => {
                              setShowDropdown(false);
                              await logout();
                            }}
                            className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-600 rounded-lg hover:bg-red-50 hover:text-red-700 transition-colors"
                          >
                            <LogOut className="h-4 w-4" />
                            <span>Sign out</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <a href="https://nestifyessentials.pages.dev/login">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full transition-all duration-300 hover:scale-105 hover:-translate-y-0.5"
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
              className="relative h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full transition-all duration-300 hover:scale-105 hover:-translate-y-0.5"
              onClick={openCart}
              aria-label="Open cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground shadow-sm transition-transform duration-300 hover:scale-110">
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
              className={`text-[12px] font-bold tracking-widest transition-all duration-300 whitespace-nowrap relative py-1.5 group ${
                link.isSale
                  ? "text-red-600 hover:text-red-800"
                  : "text-muted-foreground/90 hover:text-foreground"
              }`}
            >
              {link.label}
              <span className={`absolute bottom-0 left-0 w-full h-[1.5px] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left ${
                link.isSale ? "bg-red-600" : "bg-primary"
              }`} />
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
