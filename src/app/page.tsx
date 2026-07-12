"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { products } from "@/data/products";
import { useCart } from "@/context/cart-context";
import BlanketTransition from "@/components/BlanketTransition";
import EditorialSlider from "@/components/EditorialSlider";

export default function Home() {
  const { addToCart } = useCart();

  // Get 4 featured products for the homepage grid
  const featuredProducts = products.slice(0, 4);

  return (
    <div className="flex flex-col w-full">
      {/* Hero & Blanket Transition Section */}
      <div
        id="hero-transition-container"
        className="relative w-full h-[calc(100dvh-4.5rem)] min-h-screen lg:min-h-[800px] overflow-hidden bg-brand-sky/35"
      >
        <section id="hero-section" className="absolute inset-0 w-full h-full z-10">
          <EditorialSlider />
        </section>
        <BlanketTransition triggerId="hero-transition-container" />
      </div>

      {/* Featured Products Grid */}
      <section className="bg-brand-sky/15 py-20 border-t border-brand-sky/30 transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-baseline justify-between mb-12 gap-4">
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-brand-royal">
                Customer Favorites
              </span>
              <h2 className="font-serif text-3xl font-bold tracking-tight text-brand-midnight">
                Featured bedding essentials
              </h2>
            </div>
            <Link
              href="/products"
              className="text-xs font-semibold uppercase tracking-wider text-brand-royal hover:text-brand-ocean flex items-center gap-1.5 font-sans active:scale-[0.98] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
            >
              View all products
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <div key={product.id} className="group relative flex flex-col bg-background rounded-xl overflow-hidden border border-brand-sky/40 shadow-sm transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:shadow-md">
                {/* Image Container with Soft Brand Sky Placeholder Background */}
                <Link href={`/products/${product.id}`} className="relative block aspect-square bg-brand-sky/30 overflow-hidden border-b border-brand-sky/20">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    unoptimized
                  />
                  {/* Category tag */}
                  <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/95 backdrop-blur-sm border border-brand-sky/20 text-[10px] font-bold text-brand-midnight uppercase tracking-wider rounded-full font-sans">
                    {product.category}
                  </span>
                </Link>

                {/* Details */}
                <div className="p-5 flex-1 flex flex-col">
                  {/* Rating with brand-ocean accents */}
                  <div className="flex items-center gap-1 text-brand-ocean mb-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-3 w-3 ${i < Math.floor(product.rating) ? "fill-current" : "opacity-35"}`} />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold text-brand-midnight/50 font-sans">({product.reviewsCount})</span>
                  </div>

                  {/* Title & Price */}
                  <h3 className="font-serif text-base font-bold text-brand-midnight group-hover:text-brand-royal transition-colors duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] mb-1 min-h-[48px] line-clamp-2">
                    <Link href={`/products/${product.id}`}>
                      {product.name}
                    </Link>
                  </h3>
                  <p className="text-sm font-semibold text-brand-royal mb-4 font-sans tracking-wide">
                    {Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(product.price)}
                  </p>

                  {/* Quick Add Button with brand-royal and hover transition */}
                  <button
                    onClick={() => addToCart(product, "Queen")}
                    className="w-full mt-auto py-2.5 bg-brand-royal hover:bg-brand-ocean text-white text-xs font-semibold uppercase tracking-wide rounded-md shadow-sm active:scale-[0.98] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] font-sans"
                  >
                    Quick Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Editorial Philosophy */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative h-[300px] sm:h-[400px] lg:h-[450px] rounded-xl overflow-hidden shadow-lg order-last lg:order-first">
            <Image
              src="/images/linen-sheets-detail.jpg"
              alt="Close up of organic natural bedding texture"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              unoptimized
            />
          </div>
          <div className="space-y-6 lg:pl-6">
            <span className="text-xs font-semibold uppercase tracking-widest text-brand-royal">
              Our Material Philosophy
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-brand-midnight leading-tight">
              Sustainably sourced, ethically crafted.
            </h2>
            <div className="h-[2px] w-12 bg-brand-royal/40"></div>
            <p className="text-sm text-brand-midnight/75 leading-relaxed">
              We believe a restful night shouldn&apos;t cost the Earth. Every product in our catalog is crafted from 100% GOTS-certified organic cotton or sustainably farmed European flax linen, ensuring no harsh chemical chemicals or pesticides make their way into your sheets.
            </p>
            <p className="text-sm text-brand-midnight/75 leading-relaxed">
              Our partners include family-owned mills in Portugal and Italy, operating under Fair Trade standards. We design bedding that is made to last, reducing bedroom waste and bringing premium hotel comfort directly into your home.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center text-xs font-semibold uppercase tracking-widest text-brand-royal border-b border-brand-royal/20 pb-0.5 cursor-not-allowed">
                Read our transparency report
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
