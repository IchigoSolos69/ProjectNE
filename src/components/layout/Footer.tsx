"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Instagram, Facebook, ArrowUp } from "lucide-react";

export const Footer: React.FC = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-brand-midnight text-brand-sky border-t border-brand-royal/40 font-sans mt-auto transition-colors duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          {/* Brand Info & Newsletter */}
          <div className="space-y-8 xl:col-span-1">
            <Link href="/" className="inline-block group active:scale-[0.98] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
              <span className="font-serif text-2xl font-semibold tracking-wide text-white group-hover:text-brand-sky transition-colors duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
                RareComforts
              </span>
            </Link>
            <p className="text-sm text-brand-sky/85 max-w-xs leading-relaxed font-sans">
              Crafting premium, sustainably-made bedding designed for restorative sleep and quiet morning luxury.
            </p>
            {/* Newsletter form */}
            <div className="max-w-md">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-white font-sans">
                Join our Sleep Circle
              </h3>
              <p className="mt-2 text-sm text-brand-sky/70 font-sans">
                Receive sleep wellness articles, product updates, and early sale access.
              </p>
              <form onSubmit={handleSubmit} className="mt-4 flex max-w-md border-b border-brand-sky/30 pb-1">
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent px-2 py-1 text-sm text-white placeholder-brand-sky/45 focus:outline-none font-sans"
                />
                <button
                  type="submit"
                  className="p-1 text-brand-sky hover:text-white active:scale-[0.9] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  aria-label="Subscribe to newsletter"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
              {subscribed && (
                <p className="mt-2 text-xs text-brand-sky font-medium animate-fade-in font-sans">
                  Thank you! You are now subscribed.
                </p>
              )}
            </div>
          </div>

          {/* Navigation Grids */}
          <div className="mt-12 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0 sm:grid-cols-3 font-sans">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-white">
                Shop
              </h3>
              <ul className="mt-4 space-y-3">
                <li>
                  <Link href="/products?category=Bedsheets" className="text-sm text-brand-sky/75 hover:text-white active:scale-[0.98] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
                    Bedsheets
                  </Link>
                </li>
                <li>
                  <Link href="/products?category=Comforters" className="text-sm text-brand-sky/75 hover:text-white active:scale-[0.98] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
                    Comforters
                  </Link>
                </li>
                <li>
                  <Link href="/products?category=Cushion Covers" className="text-sm text-brand-sky/75 hover:text-white active:scale-[0.98] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
                    Cushion Covers
                  </Link>
                </li>
                <li>
                  <Link href="/products?category=Towels" className="text-sm text-brand-sky/75 hover:text-white active:scale-[0.98] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
                    Towels
                  </Link>
                </li>
                <li>
                  <Link href="/products?category=Door Mats" className="text-sm text-brand-sky/75 hover:text-white active:scale-[0.98] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
                    Door Mats
                  </Link>
                </li>
                <li>
                  <Link href="/products" className="text-sm text-brand-sky/75 hover:text-white active:scale-[0.98] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
                    Shop All Products
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-white">
                Our Brand
              </h3>
              <ul className="mt-4 space-y-3 text-sm text-brand-sky/40">
                <li>
                  <span className="cursor-not-allowed">
                    Our Story
                  </span>
                </li>
                <li>
                  <span className="cursor-not-allowed">
                    Sustainability
                  </span>
                </li>
                <li>
                  <span className="cursor-not-allowed">
                    Materials Guide
                  </span>
                </li>
                <li>
                  <span className="cursor-not-allowed">
                    Ethical Sourcing
                  </span>
                </li>
              </ul>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-white">
                Support
              </h3>
              <ul className="mt-4 space-y-3 text-sm text-brand-sky/40">
                <li>
                  <span className="cursor-not-allowed">
                    FAQs & Help
                  </span>
                </li>
                <li>
                  <span className="cursor-not-allowed">
                    Shipping & Returns
                  </span>
                </li>
                <li>
                  <span className="cursor-not-allowed">
                    Bedding Care Guide
                  </span>
                </li>
                <li>
                  <span className="cursor-not-allowed">
                    Contact Us
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 border-t border-brand-sky/20 pt-8 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-brand-sky/50 font-sans">
            &copy; {new Date().getFullYear()} RareComforts Inc. All rights reserved. Made with love for premium sleep.
          </p>
          <div className="flex items-center space-x-6">
            <span className="text-brand-sky/50 hover:text-white active:scale-[0.9] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer" aria-label="Instagram">
              <Instagram className="h-4 w-4 stroke-[1.5]" />
            </span>
            <span className="text-brand-sky/50 hover:text-white active:scale-[0.9] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer" aria-label="Facebook">
              <Facebook className="h-4 w-4 stroke-[1.5]" />
            </span>
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1.5 text-xs text-brand-sky/60 hover:text-white active:scale-[0.95] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group font-sans"
            >
              Back to top
              <ArrowUp className="h-3.5 w-3.5 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-0.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
