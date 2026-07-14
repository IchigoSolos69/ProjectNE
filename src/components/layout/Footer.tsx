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

        {/* Secured & Trusted Checkout */}
        <div className="mt-12 border-t border-brand-sky/20 pt-8 flex flex-col md:flex-row items-center justify-between gap-6 font-sans">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white">
              Accepted Payment Methods
            </span>
            <div className="flex items-center gap-3 text-brand-sky/60">
              {/* Visa Badge */}
              <svg className="h-4 w-auto fill-current" viewBox="0 0 30 10" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.8 1.1L8.3 8.7H6.3L4.2 2.4c-.2-.7-.4-.9-1-.9h-1.5V1.1h4.2l1.1 5.3L9 1.1h1.8zm4.7 5.7c.4-.7.6-1.5.6-2.4 0-1.8-1-2.3-2.5-2.3-1.6 0-2.4.9-2.4 2.1 0 1.5.9 2 2.1 2.2.7.1 1 .2 1 .5 0 .3-.4.5-.9.5-.7 0-1.1-.3-1.3-.6l-.3 1.9c.4.2 1 .3 1.6.3 2.1 0 2.7-1.1 2.7-2.2zm4.1-5.7l-1.6 7.6h-1.8l1.6-7.6h1.8zm3.5 2c-.4-.5-1-.7-1.8-.7-1.7 0-3 1.3-3 3.3 0 1.9 1.2 3.1 2.9 3.1.6 0 1.1-.1 1.5-.4l.3-1.3c-.3.2-.7.3-1.1.3-1 0-1.7-.6-1.8-1.5h4.6c.1-.8 0-2.8-.6-2.8zm-2.8 1.2c.7 0 1.1.4 1.1.9h-2.1c.1-.5.5-.9 1-.9z"/>
              </svg>
              {/* Mastercard Badge */}
              <svg className="h-4 w-auto fill-current" viewBox="0 0 24 15" xmlns="http://www.w3.org/2000/svg">
                <circle cx="7" cy="7.5" r="7" opacity="0.6"/>
                <circle cx="15" cy="7.5" r="7" opacity="0.6"/>
              </svg>
              {/* UPI */}
              <span className="text-[10px] font-bold border border-brand-sky/30 px-1.5 py-0.5 rounded-sm tracking-widest text-brand-sky/80">UPI</span>
              {/* Razorpay */}
              <span className="text-[10px] font-bold border border-brand-sky/30 px-1.5 py-0.5 rounded-sm tracking-widest text-brand-sky/80">RAZORPAY</span>
              {/* PayPal Badge */}
              <svg className="h-4 w-auto fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.076 2.133C7.57 1.488 8.33 1.127 9.176 1.127h5.955c.784 0 1.455.518 1.637 1.268l1.492 6.13c.25 1.02-.303 2.05-1.258 2.378l-7.398 2.545c-.244.084-.447-.1-.453-.357L8.528 3.864c-.03-.186-.16-.339-.338-.396L7.076 2.133zm4.512 11.236l-.37 1.522c-.066.27-.306.458-.584.458H7.319c-.382 0-.665-.365-.568-.73l1.834-6.845a.584.584 0 01.568-.458h2.09c.382 0 .665.365.568.73l-1.127 4.21c-.097.365.186.73.568.73h.364c.278 0 .518-.188.584-.458l.182-.68a.584.584 0 01.568-.458h.001c.382 0 .665.365.568.73l-.703 2.628a.584.584 0 01-.568.458z"/>
              </svg>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-emerald-400">
            <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
            </svg>
            <span>SSL SECURE CHECKOUT • 256-BIT ENCRYPTION</span>
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
