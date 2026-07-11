"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useCart } from "@/context/cart-context";

export const Navbar: React.FC = () => {
  const { cartCount, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: "/products?category=Bedsheets", label: "Bedsheets" },
    { href: "/products?category=Comforters", label: "Comforters" },
    { href: "/products?category=Pillows", label: "Pillows" },
    { href: "/products", label: "Shop All" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 glassmorphism transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-18 items-center justify-between">
          {/* Logo */}
          <div className="flex-1 md:flex-initial">
            <Link href="/" className="inline-block group">
              <span className="font-serif text-2xl font-semibold tracking-wide text-primary transition-colors group-hover:text-primary-light">
                SOMNIA
              </span>
              <span className="block h-[1px] w-0 bg-accent transition-all duration-300 group-hover:w-full"></span>
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
                  className={`relative font-sans text-sm font-medium tracking-wide transition-colors hover:text-primary py-2 ${
                    isActive ? "text-primary font-semibold" : "text-foreground/70"
                  } group`}
                >
                  {link.label}
                  <span className={`absolute bottom-0 left-0 h-[2px] bg-primary-light transition-all duration-300 ${
                    isActive ? "w-full" : "w-0 group-hover:w-full"
                  }`}></span>
                </Link>
              );
            })}
          </nav>

          {/* Actions (Cart / Menu) */}
          <div className="flex flex-1 items-center justify-end space-x-4 md:flex-initial">
            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 text-foreground/80 hover:text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-full hover:bg-sand/60"
              aria-label="Open Shopping Cart"
            >
              <ShoppingBag className="h-5 w-5 stroke-[1.5]" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white animate-fade-in shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-foreground/80 hover:text-primary transition-colors duration-200 md:hidden focus:outline-none"
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

      {/* Mobile Nav Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border/40 bg-background/98 animate-fade-in">
          <div className="space-y-1 px-4 py-4 sm:px-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-3 text-base font-medium text-foreground/80 hover:text-primary transition-colors hover:bg-sand/30 px-3 rounded-lg"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
