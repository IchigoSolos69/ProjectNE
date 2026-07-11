"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Leaf, ShieldCheck, Moon, Truck, Star } from "lucide-react";
import { products } from "@/data/products";
import { useCart } from "@/context/cart-context";
import BlanketTransition from "@/components/BlanketTransition";
import EditorialSlider from "@/components/EditorialSlider";

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
      {/* Hero & Blanket Transition Section */}
      <div
        id="hero-transition-container"
        className="relative w-full h-[calc(100vh-4.5rem)] min-h-[650px] lg:min-h-[800px] overflow-hidden bg-brand-sky/35"
      >
        <section id="hero-section" className="absolute inset-0 w-full h-full z-10">
          <EditorialSlider />
        </section>
        <BlanketTransition triggerId="hero-transition-container" />
      </div>

      {/* 2. USP Banner */}
      <section className="border-y border-brand-sky/30 bg-background py-10 lg:py-16 transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {usps.map((usp, idx) => (
              <div key={idx} className="flex flex-col items-center text-center space-y-3 p-2">
                <div className="p-3 bg-brand-sky/45 rounded-full text-brand-midnight">
                  <usp.icon className="h-5 w-5 stroke-[1.5]" />
                </div>
                <h3 className="font-serif text-sm font-semibold text-brand-midnight">{usp.title}</h3>
                <p className="text-xs text-brand-midnight/60 leading-relaxed max-w-[240px]">
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
          <span className="text-xs font-semibold uppercase tracking-widest text-brand-royal">
            Curated Categories
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-brand-midnight">
            Build your dream sleep system
          </h2>
          <div className="h-[2px] w-12 bg-brand-royal/40 mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((cat, idx) => (
            <Link key={idx} href={cat.href} className="group relative flex flex-col h-[400px] rounded-xl overflow-hidden shadow-md border border-brand-sky/30">
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
                <div className="flex items-center text-xs font-semibold uppercase tracking-widest text-brand-sky group-hover:text-white pt-2 transition-colors duration-300">
                  <span>Explore products</span>
                  <ArrowRight className="ml-1 h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Featured Products Grid */}
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
              className="text-xs font-semibold uppercase tracking-wider text-brand-royal hover:text-brand-ocean transition-colors duration-300 flex items-center gap-1.5"
            >
              View all products
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <div key={product.id} className="group relative flex flex-col bg-background rounded-xl overflow-hidden border border-brand-sky/40 shadow-sm transition-all duration-300 hover:shadow-md">
                {/* Image Container with Soft Brand Sky Placeholder Background */}
                <Link href={`/products/${product.id}`} className="relative block aspect-square bg-brand-sky/30 overflow-hidden border-b border-brand-sky/20">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    unoptimized
                  />
                  {/* Category tag */}
                  <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/95 backdrop-blur-sm border border-brand-sky/20 text-[10px] font-bold text-brand-midnight uppercase tracking-wider rounded-full">
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
                    <span className="text-[10px] font-bold text-brand-midnight/50">({product.reviewsCount})</span>
                  </div>

                  {/* Title & Price */}
                  <h3 className="font-serif text-base font-bold text-brand-midnight group-hover:text-brand-royal transition-colors duration-300 mb-1 min-h-[48px] line-clamp-2">
                    <Link href={`/products/${product.id}`}>
                      {product.name}
                    </Link>
                  </h3>
                  <p className="text-sm font-semibold text-brand-royal mb-4">
                    ${product.price}
                  </p>

                  {/* Quick Add Button with brand-royal and hover transition */}
                  <button
                    onClick={() => addToCart(product, "Queen")}
                    className="w-full mt-auto py-2.5 bg-brand-royal hover:bg-brand-ocean text-white text-xs font-semibold uppercase tracking-wider rounded-md shadow-sm transition-all duration-300"
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
              We believe a restful night shouldn't cost the Earth. Every product in our catalog is crafted from 100% GOTS-certified organic cotton or sustainably farmed European flax linen, ensuring no harsh chemical chemicals or pesticides make their way into your sheets.
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

