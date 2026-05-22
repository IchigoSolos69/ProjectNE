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
  const headerRef = React.useRef<HTMLElement>(null);

  // Close dropdowns on click outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setShowDropdown(false);
      }
      if (headerRef.current && !headerRef.current.contains(target)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  React.useEffect(() => {
    setActiveDropdown(null);
    setSearchExpanded(false);
  }, [pathname]);

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
      ref={headerRef}
      className="sticky top-0 z-40 w-full border-b border-border/80 bg-card/90 backdrop-blur-md transition-colors duration-300"
      onMouseLeave={() => {
        if (window.matchMedia("(hover: hover)").matches) {
          setActiveDropdown(null);
        }
      }}
    >

      {/* Main Header Container */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top Row: balanced layout grid */}
        <div className="grid grid-cols-3 items-center h-auto py-4 md:h-20 md:py-0 border-b border-border/30 gap-4 md:gap-0">

          {/* Left Column: Spacer to center the logo on desktop */}
          <div className="hidden md:block md:col-span-1" />

          {/* Center Column: Logo */}
          <div className="col-span-3 md:col-span-1 flex justify-center">
            <Link href="/" className="flex flex-col items-center select-none text-center group">
              <div className="flex items-baseline justify-center">
                <span className="font-sans text-xl font-black leading-none tracking-[0.12em] text-foreground transition-colors duration-300 group-hover:text-primary sm:text-2xl sm:tracking-[0.25em]">
                  NESTIFY
                </span>
                <span className="mr-1.5 transform -rotate-3 select-none font-serif text-xl italic leading-none tracking-tight text-primary transition-all duration-300 group-hover:rotate-0 group-hover:text-secondary sm:text-2xl">
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
                    animate={{ width: "min(12rem, calc(100vw - 10rem))", opacity: 1 }}
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
                      className="h-11 w-full rounded-full border border-border bg-background/50 pl-3 pr-10 text-base text-foreground placeholder:text-muted-foreground/60 focus:bg-background focus:outline-none focus:ring-1 focus:ring-primary sm:h-9 sm:text-xs"
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
                      className="touch-target absolute right-1 flex items-center justify-center text-muted-foreground hover:text-foreground"
                      aria-label="Close search"
                    >
                      ✕
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {!searchExpanded && (
                <motion.div whileHover={{ scale: 1.06, y: -1 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 15 }}>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSearchExpanded(true)}
                    className="rounded-full text-muted-foreground transition-all duration-300 hover:bg-muted/50 hover:text-foreground"
                    aria-label="Search catalog"
                  >
                    <Search className="h-5 w-5" />
                  </Button>
                </motion.div>
              )}
            </div>

            {/* Wishlist */}
            <Link href="/account/profile" className="relative font-sans">
              <motion.div whileHover={{ scale: 1.06, y: -1 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 15 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full transition-all duration-300"
                  aria-label="Wishlist"
                >
                  <Heart className="h-5 w-5" />
                  <AnimatePresence mode="popLayout">
                    <motion.span
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.6, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 450, damping: 14 }}
                      className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground shadow-sm"
                    >
                      0
                    </motion.span>
                  </AnimatePresence>
                </Button>
              </motion.div>
            </Link>

            {/* Account Icon with Modal/Dropdown */}
            <div className="relative font-sans" ref={dropdownRef}>
              {user ? (
                <>
                  <motion.div whileHover={{ scale: 1.06, y: -1 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 15 }}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full text-primary transition-all duration-300 hover:bg-muted/50 hover:text-foreground"
                      onClick={() => setShowDropdown(!showDropdown)}
                      aria-label="Account menu"
                    >
                      <UserCheck className="h-5 w-5" />
                    </Button>
                  </motion.div>

                  <AnimatePresence>
                    {showDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                        className="absolute right-0 z-50 mt-2.5 w-[min(13rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-border bg-card py-1.5 shadow-xl ring-1 ring-black/5"
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
                  <motion.div whileHover={{ scale: 1.06, y: -1 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 15 }}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full text-muted-foreground transition-all duration-300 hover:bg-muted/50 hover:text-foreground"
                      aria-label="Sign in"
                    >
                      <User className="h-5 w-5" />
                    </Button>
                  </motion.div>
                </Link>
              )}
            </div>

            {/* Cart Icon */}
            <motion.div whileHover={{ scale: 1.06, y: -1 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 15 }} className="relative font-sans">
              <Button
                variant="ghost"
                size="icon"
                className="relative rounded-full text-muted-foreground transition-all duration-300 hover:bg-muted/50 hover:text-foreground"
                onClick={openCart}
                aria-label="Open cart"
              >
                <ShoppingBag className="h-5 w-5" />
                {itemCount > 0 && (
                  <AnimatePresence mode="popLayout">
                    <motion.span
                      key={itemCount}
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: [0.6, 1.25, 1], opacity: 1 }}
                      exit={{ scale: 0.6, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 450, damping: 14 }}
                      className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground shadow-sm"
                    >
                      {itemCount}
                    </motion.span>
                  </AnimatePresence>
                )}
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Bottom Row: Navigation Links */}
        <nav className="scrollbar-thin overscroll-x-contain flex h-12 items-center justify-center gap-4 overflow-x-auto py-1 sm:gap-8 [-webkit-overflow-scrolling:touch]">
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
              className="relative shrink-0 py-2"
            >
              {link.hasDropdown ? (
                <button
                  onClick={() => {
                    setActiveDropdown(activeDropdown === link.dropdownType ? null : link.dropdownType);
                  }}
                  className={`relative min-h-11 cursor-pointer whitespace-nowrap px-1 py-2 text-[11px] font-bold tracking-wider transition-all duration-300 group sm:text-[12px] sm:tracking-widest ${activeDropdown === link.dropdownType
                      ? "text-primary"
                      : "text-muted-foreground/90 hover:text-foreground"
                    }`}
                >
                  {link.label}
                  <span className={`absolute bottom-0 left-0 w-full h-[1.5px] transition-transform duration-300 origin-left ${activeDropdown === link.dropdownType ? "scale-x-100 bg-primary" : "scale-x-0 group-hover:scale-x-100 bg-primary"
                    }`} />
                </button>
              ) : (
                <Link
                  href={link.href}
                  className="relative min-h-11 whitespace-nowrap px-1 py-2 text-[11px] font-bold tracking-wider text-muted-foreground/90 transition-all duration-300 group hover:text-foreground sm:text-[12px] sm:tracking-widest"
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
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-0 right-0 top-full bg-card/95 backdrop-blur-md border-b border-border shadow-lg z-30"
            onMouseEnter={() => setActiveDropdown("categories")}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.04 }
                }
              }}
              className="mx-auto grid max-h-[70vh] max-w-7xl grid-cols-1 gap-6 overflow-y-auto px-4 py-8 sm:grid-cols-2 sm:gap-8 sm:px-6 lg:grid-cols-3 lg:px-8 lg:py-10"
            >
              {parentCats.map((parent) => {
                const subCats = activeCategories.filter((c) => c.parent_id === parent.id);
                return (
                  <motion.div
                    key={parent.id}
                    variants={{
                      hidden: { opacity: 0, y: 8 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } }
                    }}
                    className="flex flex-col gap-3"
                  >
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
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        )}

        {activeDropdown === "price" && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-0 right-0 top-full bg-card/95 backdrop-blur-md border-b border-border shadow-lg z-30"
            onMouseEnter={() => setActiveDropdown("price")}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <div className="mx-auto max-w-2xl px-8 py-8 flex flex-col items-center gap-4 text-center">
              <div className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">Select a Range</div>
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.05 }
                  }
                }}
                className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4"
              >
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 8 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } }
                  }}
                >
                  <Link
                    href="/shop/beddings?price=under-1500"
                    className="flex flex-col items-center justify-center p-5 rounded-xl border border-border/80 bg-muted/20 hover:bg-muted/50 hover:border-primary transition-all duration-300 group"
                    onClick={() => setActiveDropdown(null)}
                  >
                    <span className="text-[10px] text-muted-foreground group-hover:text-foreground transition-colors font-semibold uppercase tracking-wider">Under</span>
                    <span className="text-lg font-serif font-bold text-foreground mt-1">₹1,500</span>
                  </Link>
                </motion.div>
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 8 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } }
                  }}
                >
                  <Link
                    href="/shop/beddings?price=1500-3000"
                    className="flex flex-col items-center justify-center p-5 rounded-xl border border-border/80 bg-muted/20 hover:bg-muted/50 hover:border-primary transition-all duration-300 group"
                    onClick={() => setActiveDropdown(null)}
                  >
                    <span className="text-[10px] text-muted-foreground group-hover:text-foreground transition-colors font-semibold uppercase tracking-wider">Range</span>
                    <span className="text-base font-serif font-bold text-foreground mt-1">₹1,500 - ₹3,000</span>
                  </Link>
                </motion.div>
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 8 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } }
                  }}
                >
                  <Link
                    href="/shop/beddings?price=over-3000"
                    className="flex flex-col items-center justify-center p-5 rounded-xl border border-border/80 bg-muted/20 hover:bg-muted/50 hover:border-primary transition-all duration-300 group"
                    onClick={() => setActiveDropdown(null)}
                  >
                    <span className="text-[10px] text-muted-foreground group-hover:text-foreground transition-colors font-semibold uppercase tracking-wider">Over</span>
                    <span className="text-lg font-serif font-bold text-foreground mt-1">₹3,000</span>
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
