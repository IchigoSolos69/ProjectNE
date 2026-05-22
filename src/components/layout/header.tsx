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


export function Header() {
  const openCart = useCartStore((s) => s.openCart);
  const { itemCount } = useCartTotals();
  const { user, logout } = useAuthStore();
  const pathname = usePathname();
  const [showDropdown, setShowDropdown] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const [categories, setCategories] = React.useState<any[]>([]);
  const [activeDropdown, setActiveDropdown] = React.useState<"categories" | "price" | null>(null);
  const [searchExpanded, setSearchExpanded] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const searchInputRef = React.useRef<HTMLInputElement>(null);

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
          .select("*")
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
    { label: "WHAT'S NEW", href: "/shop/beddings?sort=newest" },
    { label: "BESTSELLERS", href: "/shop/beddings?filter=bestsellers" },
    { label: "SHOP BY CATEGORIES", href: "/shop/beddings", hasDropdown: true, dropdownType: "categories" as const },
    { label: "SHOP BY PRICE", href: "/shop/beddings?price=under-1500", hasDropdown: true, dropdownType: "price" as const },
  ];

  const FALLBACK_CATEGORIES = [
    // Parent categories
    { id: "cat-beddings-001", name: "Beddings", slug: "beddings", parent_id: null },
    { id: "cat-towels-001", name: "Bath Towels", slug: "bath-towels", parent_id: null },
    { id: "cat-pillows-001", name: "Pillow Covers", slug: "pillow-covers", parent_id: null },
    // Beddings subcategories
    { id: "subcat-sheets-001", name: "Sheets", slug: "sheets", parent_id: "cat-beddings-001" },
    { id: "subcat-duvet-001", name: "Duvets", slug: "duvets", parent_id: "cat-beddings-001" },
    { id: "subcat-comforters-001", name: "Comforters", slug: "comforters", parent_id: "cat-beddings-001" },
    // Bath Towels subcategories
    { id: "subcat-hand-001", name: "Hand", slug: "hand", parent_id: "cat-towels-001" },
    { id: "subcat-face-001", name: "Face", slug: "face", parent_id: "cat-towels-001" },
    { id: "subcat-bath-001", name: "Bath", slug: "bath", parent_id: "cat-towels-001" },
    { id: "subcat-mats-001", name: "Mats", slug: "mats", parent_id: "cat-towels-001" },
    // Pillow Covers subcategories
    { id: "subcat-standard-001", name: "Standard", slug: "standard", parent_id: "cat-pillows-001" },
    { id: "subcat-king-001", name: "King", slug: "king", parent_id: "cat-pillows-001" },
    { id: "subcat-euro-001", name: "Euro", slug: "euro", parent_id: "cat-pillows-001" },
  ];

  const activeCategories = categories.length > 0 ? categories : FALLBACK_CATEGORIES;
  const parentCats = activeCategories.filter((c) => c.parent_id === null);

  return (
    <header 
      className="sticky top-0 z-40 w-full border-b border-border/80 bg-card/90 backdrop-blur-md transition-colors duration-300"
      onMouseLeave={() => setActiveDropdown(null)}
    >

      {/* Main Header Container */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top Row: balanced layout grid */}
        <div className="grid grid-cols-3 items-center h-20 border-b border-border/30">

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
                Style Your Space...
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
                <Link href="/login">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full transition-all duration-300 hover:scale-105 hover:-translate-y-0.5"
                    aria-label="Sign in"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
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
            <div
              key={idx}
              onMouseEnter={() => {
                if (link.hasDropdown) {
                  setActiveDropdown(link.dropdownType);
                } else {
                  setActiveDropdown(null);
                }
              }}
              className="relative py-1.5"
            >
              {link.hasDropdown ? (
                <button
                  onClick={() => {
                    setActiveDropdown(activeDropdown === link.dropdownType ? null : link.dropdownType);
                  }}
                  className={`text-[12px] font-bold tracking-widest transition-all duration-300 whitespace-nowrap relative py-1.5 group cursor-pointer ${
                    activeDropdown === link.dropdownType
                      ? "text-primary"
                      : "text-muted-foreground/90 hover:text-foreground"
                  }`}
                >
                  {link.label}
                  <span className={`absolute bottom-0 left-0 w-full h-[1.5px] transition-transform duration-300 origin-left ${
                    activeDropdown === link.dropdownType ? "scale-x-100 bg-primary" : "scale-x-0 group-hover:scale-x-100 bg-primary"
                  }`} />
                </button>
              ) : (
                <Link
                  href={link.href}
                  className="text-[12px] font-bold tracking-widest transition-all duration-300 whitespace-nowrap relative py-1.5 group text-muted-foreground/90 hover:text-foreground"
                >
                  {link.label}
                  <span className="absolute bottom-0 left-0 w-full h-[1.5px] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left bg-primary" />
                </Link>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Dropdown Panels */}
      <AnimatePresence>
        {activeDropdown === "categories" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 right-0 top-full bg-card/95 backdrop-blur-md border-b border-border shadow-lg z-30"
            onMouseEnter={() => setActiveDropdown("categories")}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <div className="mx-auto max-w-7xl px-8 py-10 grid grid-cols-3 gap-8">
              {parentCats.map((parent) => {
                const subCats = activeCategories.filter((c) => c.parent_id === parent.id);
                return (
                  <div key={parent.id} className="flex flex-col gap-3">
                    <Link
                      href={`/shop/${parent.slug}`}
                      className="font-serif text-lg font-bold text-foreground hover:text-primary transition-colors border-b border-border pb-2"
                      onClick={() => setActiveDropdown(null)}
                    >
                      {parent.name.toUpperCase()}
                    </Link>
                    <div className="flex flex-col gap-2">
                      {subCats.map((sub) => (
                        <Link
                          key={sub.id}
                          href={`/shop/${parent.slug}/${sub.slug}`}
                          className="text-xs text-muted-foreground hover:text-foreground font-medium transition-colors hover:translate-x-1 duration-200 inline-block transform"
                          onClick={() => setActiveDropdown(null)}
                        >
                          {sub.name}
                        </Link>
                      ))}
                      <Link
                        href={`/shop/${parent.slug}`}
                        className="text-xs text-primary font-semibold hover:underline mt-1"
                        onClick={() => setActiveDropdown(null)}
                      >
                        Shop All {parent.name} →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {activeDropdown === "price" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 right-0 top-full bg-card/95 backdrop-blur-md border-b border-border shadow-lg z-30"
            onMouseEnter={() => setActiveDropdown("price")}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <div className="mx-auto max-w-2xl px-8 py-8 flex flex-col items-center gap-4 text-center">
              <div className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">Select a Range</div>
              <div className="grid grid-cols-3 gap-4 w-full">
                <Link
                  href="/shop/beddings?price=under-1500"
                  className="flex flex-col items-center justify-center p-5 rounded-xl border border-border/80 bg-muted/20 hover:bg-muted/50 hover:border-primary transition-all duration-300 group"
                  onClick={() => setActiveDropdown(null)}
                >
                  <span className="text-[10px] text-muted-foreground group-hover:text-foreground transition-colors font-semibold uppercase tracking-wider">Under</span>
                  <span className="text-lg font-serif font-bold text-foreground mt-1">₹1,500</span>
                </Link>
                <Link
                  href="/shop/beddings?price=1500-3000"
                  className="flex flex-col items-center justify-center p-5 rounded-xl border border-border/80 bg-muted/20 hover:bg-muted/50 hover:border-primary transition-all duration-300 group"
                  onClick={() => setActiveDropdown(null)}
                >
                  <span className="text-[10px] text-muted-foreground group-hover:text-foreground transition-colors font-semibold uppercase tracking-wider">Range</span>
                  <span className="text-base font-serif font-bold text-foreground mt-1">₹1,500 - ₹3,000</span>
                </Link>
                <Link
                  href="/shop/beddings?price=over-3000"
                  className="flex flex-col items-center justify-center p-5 rounded-xl border border-border/80 bg-muted/20 hover:bg-muted/50 hover:border-primary transition-all duration-300 group"
                  onClick={() => setActiveDropdown(null)}
                >
                  <span className="text-[10px] text-muted-foreground group-hover:text-foreground transition-colors font-semibold uppercase tracking-wider">Over</span>
                  <span className="text-lg font-serif font-bold text-foreground mt-1">₹3,000</span>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
