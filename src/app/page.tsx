"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Leaf, ShieldCheck, Moon, Truck, Star } from "lucide-react";
import { products } from "@/data/products";
import { useCart } from "@/context/cart-context";

export default function Home() {
  const { addToCart } = useCart();
  
  // Get 4 featured products for the homepage grid
  const featuredProducts = products.slice(0, 4);

  const categories = [
    {
      name: "Bedsheets",
      description: "Crisp percale, buttery sateen, and relaxed linen sets.",
      image: "/images/linen-sheets.jpg",
      href: "/products?category=Bedsheets",
    },
    {
      name: "Comforters & Quilts",
      description: "Cloud-like down alternative and textured gauze blankets.",
      image: "/images/cotton-quilt.jpg",
      href: "/products?category=Comforters",
    },
    {
      name: "Premium Pillows",
      description: "Ergonomic foam, natural latex, and plush down fills.",
      image: "/images/down-pillow.jpg",
      href: "/products?category=Pillows",
    },
  ];

  const usps = [
    {
      icon: Leaf,
      title: "100% Organic Cotton",
      desc: "GOTS certified long-staple cotton and European flax linen.",
    },
    {
      icon: ShieldCheck,
      title: "Oeko-Tex Certified",
      desc: "Woven free from harmful chemicals, toxins, and synthetic dyes.",
    },
    {
      icon: Moon,
      title: "100-Night Sleep Trial",
      desc: "Sleep on them, wash them. If you don't love them, return for free.",
    },
    {
      icon: Truck,
      title: "Free Shipping & Returns",
      desc: "Complimentary carbon-neutral shipping on all domestic orders.",
    },
  ];

  return (
    <div className="flex flex-col w-full">
      {/* 1. Hero Section */}
      <section className="relative bg-sand/30 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Hero Copy */}
            <div className="lg:col-span-6 space-y-6 lg:pr-8 text-center lg:text-left z-10">
              <span className="text-xs font-semibold uppercase tracking-widest text-primary-light">
                Quiet Luxury for Your Bedroom
              </span>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-primary leading-tight">
                Sleep in pure, organic comfort
              </h1>
              <p className="text-base sm:text-lg text-foreground/75 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Woven from the finest natural fibers, our bedding collection is designed to breathe, drape, and soften with every wash.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="/products"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 bg-primary hover:bg-primary-light text-white text-xs font-semibold uppercase tracking-widest rounded-md shadow-sm transition-all duration-200"
                >
                  Shop the Collection
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  href="/products?category=Bedsheets"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 border border-primary/20 hover:border-primary/80 text-primary text-xs font-semibold uppercase tracking-widest rounded-md transition-all duration-200"
                >
                  Explore Sheets
                </Link>
              </div>
            </div>

            {/* Hero Image Block */}
            <div className="lg:col-span-6 relative h-[350px] sm:h-[450px] lg:h-[550px] rounded-2xl overflow-hidden shadow-xl border border-border/20">
              <Image
                src="/images/percale-sheets.jpg"
                alt="Premium organic cotton sheets layered beautifully"
                fill
                priority
                className="object-cover transition-transform duration-700 hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 50vw"
                unoptimized
              />
              {/* Floating aesthetic label */}
              <div className="absolute bottom-6 left-6 bg-white/80 backdrop-blur-md border border-white/40 p-4 rounded-xl max-w-xs hidden sm:block">
                <p className="text-xs text-foreground/50 uppercase tracking-widest">Featured Set</p>
                <p className="text-sm font-serif font-bold text-primary">Classic Percale Core Set</p>
                <p className="text-xs text-primary-light mt-0.5">Crisp, cool, 100% long-staple cotton.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. USP Banner */}
      <section className="border-y border-border/40 bg-background py-10 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {usps.map((usp, idx) => (
              <div key={idx} className="flex flex-col items-center text-center space-y-3 p-2">
                <div className="p-3 bg-sand/50 rounded-full text-primary">
                  <usp.icon className="h-5 w-5 stroke-[1.5]" />
                </div>
                <h3 className="font-serif text-sm font-semibold text-primary">{usp.title}</h3>
                <p className="text-xs text-foreground/60 leading-relaxed max-w-[240px]">
                  {usp.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Category Spotlights */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-4 mb-16">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">
            Curated Categories
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-primary">
            Build your dream sleep system
          </h2>
          <div className="h-[2px] w-12 bg-accent/40 mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((cat, idx) => (
            <Link key={idx} href={cat.href} className="group relative flex flex-col h-[400px] rounded-xl overflow-hidden shadow-md border border-border/30">
              {/* Image */}
              <div className="absolute inset-0 bg-neutral-900">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover opacity-80 transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  unoptimized
                />
              </div>
              {/* Dark Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
              {/* Content */}
              <div className="absolute inset-x-0 bottom-0 p-6 text-white space-y-2">
                <h3 className="font-serif text-xl font-bold tracking-wide">{cat.name}</h3>
                <p className="text-xs text-white/80 leading-relaxed max-w-xs">
                  {cat.description}
                </p>
                <div className="flex items-center text-xs font-semibold uppercase tracking-widest text-accent group-hover:text-white pt-2 transition-colors">
                  <span>Explore products</span>
                  <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Featured Products Grid */}
      <section className="bg-sand/15 py-20 border-t border-border/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-baseline justify-between mb-12 gap-4">
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-primary-light">
                Customer Favorites
              </span>
              <h2 className="font-serif text-3xl font-bold tracking-tight text-primary">
                Featured bedding essentials
              </h2>
            </div>
            <Link
              href="/products"
              className="text-xs font-semibold uppercase tracking-wider text-primary hover:text-accent transition-colors flex items-center gap-1.5"
            >
              View all products
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <div key={product.id} className="group relative flex flex-col bg-background rounded-xl overflow-hidden border border-border/40 shadow-sm transition-all duration-300 hover:shadow-md">
                {/* Image Container */}
                <Link href={`/products/${product.id}`} className="relative block aspect-square bg-sand overflow-hidden border-b border-border/30">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    unoptimized
                  />
                  {/* Category tag */}
                  <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm border border-border/20 text-[10px] font-bold text-primary uppercase tracking-wider rounded-full">
                    {product.category}
                  </span>
                </Link>

                {/* Details */}
                <div className="p-5 flex-1 flex flex-col">
                  {/* Rating */}
                  <div className="flex items-center gap-1 text-accent mb-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-3 w-3 ${i < Math.floor(product.rating) ? "fill-current" : "opacity-35"}`} />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold text-foreground/50">({product.reviewsCount})</span>
                  </div>

                  {/* Title & Price */}
                  <h3 className="font-serif text-base font-bold text-primary group-hover:text-primary-light transition-colors mb-1 min-h-[48px] line-clamp-2">
                    <Link href={`/products/${product.id}`}>
                      {product.name}
                    </Link>
                  </h3>
                  <p className="text-sm font-semibold text-primary-light mb-4">
                    ${product.price}
                  </p>

                  {/* Quick Add Button */}
                  <button
                    onClick={() => addToCart(product, "Queen")}
                    className="w-full mt-auto py-2.5 bg-sand/50 hover:bg-primary hover:text-white border border-primary/10 hover:border-primary text-primary text-xs font-semibold uppercase tracking-wider rounded-md transition-all duration-200"
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
            <span className="text-xs font-semibold uppercase tracking-widest text-accent">
              Our Material Philosophy
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-primary leading-tight">
              Sustainably sourced, ethically crafted.
            </h2>
            <div className="h-[2px] w-12 bg-accent/40"></div>
            <p className="text-sm text-foreground/75 leading-relaxed">
              We believe a restful night shouldn't cost the Earth. Every product in our catalog is crafted from 100% GOTS-certified organic cotton or sustainably farmed European flax linen, ensuring no harsh chemical chemicals or pesticides make their way into your sheets.
            </p>
            <p className="text-sm text-foreground/75 leading-relaxed">
              Our partners include family-owned mills in Portugal and Italy, operating under Fair Trade standards. We design bedding that is made to last, reducing bedroom waste and bringing premium hotel comfort directly into your home.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center text-xs font-semibold uppercase tracking-widest text-primary border-b border-primary/20 pb-0.5 cursor-not-allowed">
                Read our transparency report
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

