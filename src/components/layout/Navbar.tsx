"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Menu, X, User } from "lucide-react";
import { useCart } from "@/context/cart-context";

export const Navbar: React.FC = () => {
  const { cartCount, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { href: "/products?category=Bedsheets", label: "Bedsheets" },
    { href: "/products?category=Comforters", label: "Comforters" },
    { href: "/products?category=Cushion Covers", label: "Cushion Covers" },
    { href: "/products?category=Towels", label: "Towels" },
    { href: "/products?category=Door Mats", label: "Door Mats" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 glassmorphism transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-18 items-center justify-between">
          {/* Logo */}
          <div className="flex-1 md:flex-initial">
            <Link href="/" className="inline-block group active:scale-[0.98] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
              <span className="font-serif text-2xl font-semibold tracking-wide text-brand-midnight transition-colors duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:text-brand-royal">
                RareComforts
              </span>
              <span className="block h-[1px] w-0 bg-brand-royal transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-full"></span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex space-x-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative font-sans text-xs font-semibold uppercase tracking-wide hover:text-brand-royal py-2 active:scale-[0.98] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isActive ? "text-brand-royal font-bold" : "text-brand-midnight/70"
                  } group`}
                >
                  {link.label}
                  <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[1px] bg-brand-ocean transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] origin-center ${
                    isActive ? "w-full" : "w-0 group-hover:w-full"
                  }`}></span>
                </Link>
              );
            })}
          </nav>

          {/* Actions (Cart / Menu) */}
          <div className="flex flex-1 items-center justify-end space-x-2 md:flex-initial">
            {/* Account Icon */}
            <Link
              href="/auth"
              className="p-2.5 text-brand-midnight/80 hover:text-brand-royal active:scale-[0.95] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] focus:outline-none rounded-full hover:bg-brand-sky/30"
              aria-label="Account Login"
            >
              <User className="h-5 w-5 stroke-[1.5]" />
            </Link>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 text-brand-midnight/80 hover:text-brand-royal active:scale-[0.95] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] focus:outline-none rounded-full hover:bg-brand-sky/30"
              aria-label="Open Shopping Cart"
            >
              <ShoppingBag className="h-5 w-5 stroke-[1.5]" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-royal text-[10px] font-bold text-white animate-fade-in shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-brand-midnight/80 hover:text-brand-royal active:scale-[0.95] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] md:hidden focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 stroke-[1.5]" />
              ) : (
                <Menu className="h-6 w-6 stroke-[1.5]" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Menu (Drawer Overlay) */}
      <div
        className={`fixed inset-0 top-[72px] z-30 md:hidden bg-[#0F2854]/40 backdrop-blur-md transition-opacity duration-500 ${
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileMenuOpen(false)}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className={`w-4/5 max-w-sm bg-background h-[calc(100vh-72px)] border-r border-brand-sky/40 shadow-2xl flex flex-col px-6 py-8 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex flex-col space-y-6">
            {navLinks.map((link, idx) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-3.5 text-lg font-semibold uppercase tracking-wider text-brand-midnight hover:text-brand-royal active:scale-[0.95] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] font-sans border-b border-brand-sky/20 last:border-0"
                style={{
                  transform: mobileMenuOpen ? "translateY(0)" : "translateY(24px)",
                  opacity: mobileMenuOpen ? 1 : 0,
                  transition: "all 700ms cubic-bezier(0.16, 1, 0.3, 1)",
                  transitionDelay: mobileMenuOpen ? `${(idx + 1) * 80}ms` : "0ms",
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};
