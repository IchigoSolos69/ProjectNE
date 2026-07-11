"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Plus, Minus, ArrowLeft, Heart, ChevronDown, CheckCircle2 } from "lucide-react";
import { Product, products } from "@/data/products";
import { useCart } from "@/context/cart-context";

interface ProductDetailClientProps {
  product: Product;
}

export const ProductDetailClient: React.FC<ProductDetailClientProps> = ({ product }) => {
  const { addToCart } = useCart();

  // Gallery state
  const [activeImage, setActiveImage] = useState(product.image);

  // Configuration state
  const [selectedSize, setSelectedSize] = useState<"Twin" | "Queen" | "King">("Queen");
  const [quantity, setQuantity] = useState(1);
  const [wishlist, setWishlist] = useState(false);

  // Accordion drawer states
  const [accordionOpen, setAccordionOpen] = useState({
    materials: true,
    care: false,
    shipping: false,
  });

  const toggleAccordion = (tab: "materials" | "care" | "shipping") => {
    setAccordionOpen((prev) => ({
      ...prev,
      [tab]: !prev[tab],
    }));
  };

  // Get related products (same category or others, excluding current)
  const relatedProducts = useMemo(() => {
    return products
      .filter((p) => p.id !== product.id)
      .slice(0, 3);
  }, [product]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      {/* Back link */}
      <div className="mb-8">
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-foreground/60 hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to bedding collection
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Left Column: Image Gallery Showcase */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Image */}
          <div className="relative aspect-square w-full bg-sand rounded-2xl overflow-hidden border border-border/40 shadow-sm">
            <Image
              src={activeImage}
              alt={product.name}
              fill
              priority
              className="object-cover transition-all duration-300"
              sizes="(max-width: 1024px) 100vw, 60vw"
              unoptimized
            />
          </div>
          {/* Gallery Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-4">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`relative h-20 w-20 bg-sand rounded-lg overflow-hidden border transition-all ${
                    activeImage === img
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-border hover:border-primary-light"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} preview ${idx + 1}`}
                    fill
                    sizes="80px"
                    className="object-cover"
                    unoptimized
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Configurations and Add-to-Cart */}
        <div className="lg:col-span-5 space-y-8">
          <div>
            {/* Category */}
            <span className="text-xs font-semibold uppercase tracking-widest text-accent">
              {product.category}
            </span>
            {/* Title */}
            <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-primary mt-2">
              {product.name}
            </h1>
            
            {/* Ratings & Price */}
            <div className="flex items-center justify-between mt-4 pb-6 border-b border-border/40">
              <div className="flex items-center gap-1.5">
                <div className="flex text-accent">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(product.rating) ? "fill-current" : "opacity-35"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-foreground/60">
                  {product.rating} ({product.reviewsCount} reviews)
                </span>
              </div>
              <span className="text-xl font-bold text-primary">${product.price}</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-foreground/75 leading-relaxed">
            {product.description}
          </p>

          {/* Size Selector */}
          <div className="space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Select Bed Size
              </span>
              <span className="text-xs text-foreground/50">Standard dimensions apply</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`py-3 rounded-md text-xs font-semibold uppercase tracking-wider border transition-all duration-200 ${
                    selectedSize === size
                      ? "border-primary bg-primary text-white shadow-sm"
                      : "border-border hover:border-primary-light text-primary bg-transparent"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity and Cart Actions */}
          <div className="flex gap-4 items-stretch">
            {/* Quantity */}
            <div className="flex items-center border border-border rounded-md bg-sand/20">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-3 text-foreground/60 hover:text-primary transition-colors"
                aria-label="Decrease product count"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="text-sm font-semibold w-8 text-center text-primary">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="px-3 text-foreground/60 hover:text-primary transition-colors"
                aria-label="Increase product count"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {/* Add to Cart */}
            <button
              onClick={() => addToCart(product, selectedSize, quantity)}
              className="flex-1 py-4 bg-primary hover:bg-primary-light text-white text-xs font-semibold uppercase tracking-widest rounded-md shadow-sm transition-colors duration-200"
            >
              Add to Shopping Cart
            </button>

            {/* Wishlist Button */}
            <button
              onClick={() => setWishlist(!wishlist)}
              className={`px-4 border rounded-md transition-colors flex items-center justify-center ${
                wishlist
                  ? "border-accent text-accent bg-accent/5"
                  : "border-border hover:border-primary-light text-foreground/60 hover:text-primary"
              }`}
              aria-label="Toggle wishlist"
            >
              <Heart className={`h-5 w-5 ${wishlist ? "fill-current" : "stroke-[1.5]"}`} />
            </button>
          </div>

          {/* Product Highlights Checkmarks */}
          <div className="bg-sand/25 p-4 rounded-xl border border-border/30 space-y-3">
            {product.features.map((feature, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-foreground/85">
                <CheckCircle2 className="h-4 w-4 text-secondary flex-shrink-0 mt-0.5" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          {/* Premium Accordions */}
          <div className="border-t border-border/40 divide-y divide-border/40">
            {/* Accordion 1: Details */}
            <div className="py-4">
              <button
                onClick={() => toggleAccordion("materials")}
                className="w-full flex items-center justify-between text-left text-xs font-bold uppercase tracking-wider text-primary"
              >
                <span>Details & Materials</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-250 ${
                    accordionOpen.materials ? "rotate-180" : ""
                  }`}
                />
              </button>
              {accordionOpen.materials && (
                <div className="mt-3 text-xs text-foreground/75 leading-relaxed pl-1">
                  {product.details}
                </div>
              )}
            </div>

            {/* Accordion 2: Care */}
            <div className="py-4">
              <button
                onClick={() => toggleAccordion("care")}
                className="w-full flex items-center justify-between text-left text-xs font-bold uppercase tracking-wider text-primary"
              >
                <span>Care Instructions</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-250 ${
                    accordionOpen.care ? "rotate-180" : ""
                  }`}
                />
              </button>
              {accordionOpen.care && (
                <div className="mt-3 text-xs text-foreground/75 leading-relaxed pl-1 space-y-2">
                  <p>Machine wash cold on gentle cycle with similar colors. We recommend using a mild, liquid biodegradable detergent.</p>
                  <p>Tumble dry low or line dry to preserve fabric longevity. Avoid chlorine bleaches, fabric softeners, and harsh dryer sheets.</p>
                </div>
              )}
            </div>

            {/* Accordion 3: Shipping */}
            <div className="py-4">
              <button
                onClick={() => toggleAccordion("shipping")}
                className="w-full flex items-center justify-between text-left text-xs font-bold uppercase tracking-wider text-primary"
              >
                <span>Shipping & Returns</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-250 ${
                    accordionOpen.shipping ? "rotate-180" : ""
                  }`}
                />
              </button>
              {accordionOpen.shipping && (
                <div className="mt-3 text-xs text-foreground/75 leading-relaxed pl-1 space-y-2">
                  <p><strong>Free carbon-neutral shipping</strong> on all continental orders. Shipments arrive within 3–7 business days.</p>
                  <p><strong>100-Night Sleep Guarantee:</strong> If you aren't completely content with your sleep experience, request a full refund within 100 days. We provide free prepaid return labels.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Grid */}
      <div className="mt-24 pt-16 border-t border-border/40">
        <h2 className="font-serif text-2xl font-bold tracking-tight text-primary text-center mb-12">
          Complete your bedroom sanctuary
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {relatedProducts.map((p) => (
            <div
              key={p.id}
              className="group relative flex flex-col bg-background rounded-xl overflow-hidden border border-border/40 shadow-sm transition-all duration-300 hover:shadow-md"
            >
              <Link href={`/products/${p.id}`} className="relative block aspect-square bg-sand overflow-hidden border-b border-border/30">
                <Image
                  src={p.image}
                  alt={p.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  unoptimized
                />
              </Link>
              <div className="p-5 flex-grow flex flex-col">
                <h3 className="font-serif text-sm font-bold text-primary group-hover:text-primary-light transition-colors mb-1 truncate">
                  <Link href={`/products/${p.id}`}>{p.name}</Link>
                </h3>
                <p className="text-xs text-foreground/50 mb-3">{p.category}</p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xs font-semibold text-primary-light">${p.price}</span>
                  <button
                    onClick={() => addToCart(p, "Queen")}
                    className="text-[10px] font-bold uppercase tracking-wider text-primary border-b border-primary/20 hover:border-primary transition-colors pb-0.5"
                  >
                    Quick Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
