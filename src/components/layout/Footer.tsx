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
    <footer className="bg-sand/30 border-t border-border/60 font-sans mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          {/* Brand Info & Newsletter */}
          <div className="space-y-8 xl:col-span-1">
            <Link href="/" className="inline-block">
              <span className="font-serif text-2xl font-semibold tracking-wide text-primary">
                SOMNIA
              </span>
            </Link>
            <p className="text-sm text-foreground/75 max-w-xs leading-relaxed">
              Crafting premium, sustainably-made bedding designed for restorative sleep and quiet morning luxury.
            </p>
            {/* Newsletter form */}
            <div className="max-w-md">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-primary">
                Join our Sleep Circle
              </h3>
              <p className="mt-2 text-sm text-foreground/60">
                Receive sleep wellness articles, product updates, and early sale access.
              </p>
              <form onSubmit={handleSubmit} className="mt-4 flex max-w-md border-b border-primary/20 pb-1">
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent px-2 py-1 text-sm text-foreground placeholder-foreground/45 focus:outline-none"
                />
                <button
                  type="submit"
                  className="p-1 text-primary hover:text-accent transition-colors duration-200"
                  aria-label="Subscribe to newsletter"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
              {subscribed && (
                <p className="mt-2 text-xs text-primary font-medium animate-fade-in">
                  Thank you! You are now subscribed.
                </p>
              )}
            </div>
          </div>

          {/* Navigation Grids */}
          <div className="mt-12 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0 sm:grid-cols-3">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-primary">
                Shop
              </h3>
              <ul className="mt-4 space-y-3">
                <li>
                  <Link href="/products?category=Bedsheets" className="text-sm text-foreground/75 hover:text-primary transition-colors">
                    Bedsheets
                  </Link>
                </li>
                <li>
                  <Link href="/products?category=Comforters" className="text-sm text-foreground/75 hover:text-primary transition-colors">
                    Comforters
                  </Link>
                </li>
                <li>
                  <Link href="/products?category=Pillows" className="text-sm text-foreground/75 hover:text-primary transition-colors">
                    Pillows
                  </Link>
                </li>
                <li>
                  <Link href="/products" className="text-sm text-foreground/75 hover:text-primary transition-colors">
                    Shop All Products
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-primary">
                Our Brand
              </h3>
              <ul className="mt-4 space-y-3">
                <li>
                  <span className="text-sm text-foreground/50 cursor-not-allowed">
                    Our Story
                  </span>
                </li>
                <li>
                  <span className="text-sm text-foreground/50 cursor-not-allowed">
                    Sustainability
                  </span>
                </li>
                <li>
                  <span className="text-sm text-foreground/50 cursor-not-allowed">
                    Materials Guide
                  </span>
                </li>
                <li>
                  <span className="text-sm text-foreground/50 cursor-not-allowed">
                    Ethical Sourcing
                  </span>
                </li>
              </ul>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-primary">
                Support
              </h3>
              <ul className="mt-4 space-y-3">
                <li>
                  <span className="text-sm text-foreground/50 cursor-not-allowed">
                    FAQs & Help
                  </span>
                </li>
                <li>
                  <span className="text-sm text-foreground/50 cursor-not-allowed">
                    Shipping & Returns
                  </span>
                </li>
                <li>
                  <span className="text-sm text-foreground/50 cursor-not-allowed">
                    Bedding Care Guide
                  </span>
                </li>
                <li>
                  <span className="text-sm text-foreground/50 cursor-not-allowed">
                    Contact Us
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 border-t border-border/40 pt-8 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-foreground/50">
            &copy; {new Date().getFullYear()} Somnia Inc. All rights reserved. Made with love for premium sleep.
          </p>
          <div className="flex items-center space-x-6">
            <span className="text-foreground/50 hover:text-primary transition-colors cursor-pointer" aria-label="Instagram">
              <Instagram className="h-4 w-4 stroke-[1.5]" />
            </span>
            <span className="text-foreground/50 hover:text-primary transition-colors cursor-pointer" aria-label="Facebook">
              <Facebook className="h-4 w-4 stroke-[1.5]" />
            </span>
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1.5 text-xs text-foreground/60 hover:text-primary transition-colors group"
            >
              Back to top
              <ArrowUp className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
