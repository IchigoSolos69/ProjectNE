"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Plus, Minus, ArrowLeft, Heart, ShoppingCart, ChevronDown, ChevronUp } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { API_URL } from "@/lib/api";

interface DatabaseProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  sku: string;
  inventoryCount: number;
  isActive: boolean;
  sizes: string[];
  features: string[];
  materials?: string;
  careInstructions?: string;
}

export default function ProductClient({ sku }: { sku: string }) {
  const { addToCart } = useCart();

  const [product, setProduct] = useState<DatabaseProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [wishlist, setWishlist] = useState(false);

  // Custom configuration state
  const [selectedSize, setSelectedSize] = useState<string>("Queen");
  const [activeAccordion, setActiveAccordion] = useState<string | null>("details");

  useEffect(() => {
    const controller = new AbortController();

    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/products/sku/${sku}`, {
          signal: controller.signal,
        });

        if (response.status === 404) {
          setError("Product not found");
          setIsLoading(false);
          return;
        }

        if (!response.ok) {
          throw new Error(`Failed to fetch product with status ${response.status}`);
        }

        const data: DatabaseProduct = await response.json();
        setProduct(data);

        // Pre-select first size option if available
        if (data.sizes && data.sizes.length > 0) {
          setSelectedSize(data.sizes[0]);
        }
      } catch (fetchError) {
        if ((fetchError as Error).name === "AbortError") {
          return;
        }

        console.error("Failed to fetch product:", fetchError);
        setError("Unable to load product details. Please try again.");
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void fetchProduct();

    return () => controller.abort();
  }, [sku]);

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <div className="animate-pulse">
          <div className="h-4 bg-brand-sky/40 w-32 rounded mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            <div className="lg:col-span-7">
              <div className="aspect-square bg-brand-sky/40 rounded-2xl"></div>
            </div>
            <div className="lg:col-span-5 space-y-6">
              <div className="h-8 bg-brand-sky/40 w-3/4 rounded"></div>
              <div className="h-12 bg-brand-sky/40 w-full rounded"></div>
              <div className="h-20 bg-brand-sky/40 w-full rounded"></div>
              <div className="h-12 bg-brand-sky/40 w-full rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center py-12 px-6 bg-red-50 rounded-2xl border border-red-200 max-w-xl mx-auto">
          <p className="font-serif text-2xl font-semibold text-brand-midnight mb-4">
            {error === "Product not found" ? "Product Not Found" : "Unable to Load Product"}
          </p>
          <p className="text-sm text-brand-midnight/65 mb-6">
            {error === "Product not found"
              ? "The product you're looking for doesn't exist or has been removed."
              : error}
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-royal hover:bg-brand-ocean text-white text-xs font-semibold uppercase tracking-wide rounded-md active:scale-[0.98] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Collection
          </Link>
        </div>
      </div>
    );
  }

  const displayPrice = product.price / 100;
  const sizes = product.sizes && product.sizes.length > 0 ? product.sizes : ["Twin", "Queen", "King"];
  const features = product.features || [];

  // Map product to cart-compatible format
  const cartProduct = {
    id: product.id,
    name: product.name,
    price: displayPrice,
    image: product.imageUrl,
    sku: product.sku,
  };

  const toggleAccordion = (section: string) => {
    setActiveAccordion(activeAccordion === section ? null : section);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      {/* Back link */}
      <div className="mb-8 font-sans">
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brand-midnight/60 hover:text-[#0F2854] active:scale-[0.98] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Bedding Collection
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Left Column: Premium Image Display */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[4/5] w-full bg-[#F6FAFC] rounded-2xl overflow-hidden border border-brand-sky/40 shadow-md">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              priority
              className="object-cover transition-all duration-300"
              sizes="(max-width: 1024px) 100vw, 60vw"
              unoptimized
            />
          </div>

          {/* Image Thumbnail strip */}
          <div className="flex gap-3">
            <div className="relative h-20 w-16 bg-[#F6FAFC] rounded-lg overflow-hidden border-2 border-[#0F2854] cursor-pointer">
              <Image
                src={product.imageUrl}
                alt="Product thumbnail main"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          </div>
        </div>

        {/* Right Column: Product Details & Actions */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            {/* Category tag */}
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#0F2854]/60 font-sans block mb-2">
              {product.category.toUpperCase()}
            </span>

            {/* Name & Price */}
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
              <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#0F2854] leading-tight">
                {product.name}
              </h1>
              <span className="text-2xl font-bold text-[#0F2854] font-sans whitespace-nowrap">
                {Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                  maximumFractionDigits: 0,
                }).format(displayPrice)}
              </span>
            </div>

            {/* Stock indicator & Rating */}
            <div className="flex items-center justify-between mt-4 pb-4 border-b border-brand-sky/30">
              {product.inventoryCount > 0 ? (
                <span className="text-xs text-brand-midnight/60 font-sans">
                  {product.inventoryCount} units available in stock
                </span>
              ) : (
                <span className="text-xs text-red-600 font-semibold font-sans">Out of Stock</span>
              )}

              {/* Rating Stars */}
              <div className="flex items-center gap-1.5">
                <div className="flex text-brand-ocean">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-3.5 w-3.5 ${i < 4 ? "fill-current" : "opacity-35"}`} />
                  ))}
                </div>
                <span className="text-[10px] font-bold text-brand-midnight/60 font-sans">(4.8 / 5)</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-[#0F2854]/80 leading-relaxed font-sans">{product.description}</p>

          {/* Size Selector */}
          <div className="space-y-2.5 font-sans">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#0F2854]/70">
              SELECT BED SIZE
            </span>
            <div className="flex flex-wrap gap-2.5">
              {sizes.map((size) => {
                const isActive = selectedSize === size;
                return (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-5 py-2 text-xs font-semibold uppercase tracking-wider border rounded-md transition-all duration-300 ${
                      isActive
                        ? "bg-[#0F2854] text-white border-[#0F2854]"
                        : "bg-white text-[#0F2854] border-[#0F2854] hover:bg-[#F6FAFC]"
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Add to Cart Actions row */}
          <div className="flex gap-3 items-stretch font-sans pt-2">
            {/* Quantity controls */}
            <div className="flex items-center border border-brand-sky/40 rounded-md bg-[#F6FAFC]">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-3.5 py-2 text-brand-midnight/60 hover:text-[#0F2854] active:scale-[0.9] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                aria-label="Decrease quantity"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="text-sm font-semibold w-10 text-center text-[#0F2854]">
                {quantity}
              </span>
              <button
                onClick={() =>
                  setQuantity((q) => (product.inventoryCount > 0 ? Math.min(product.inventoryCount, q + 1) : q + 1))
                }
                className="px-3.5 py-2 text-brand-midnight/60 hover:text-[#0F2854] active:scale-[0.9] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                aria-label="Increase quantity"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Add to Cart */}
            <button
              onClick={() => addToCart(cartProduct, selectedSize as any, quantity)}
              disabled={product.inventoryCount === 0}
              className="flex-1 py-3.5 bg-[#0F2854] hover:bg-[#1C4D8D] text-white text-xs font-semibold uppercase tracking-[0.15em] rounded-md shadow-sm active:scale-[0.98] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShoppingCart className="h-4 w-4" />
              {product.inventoryCount === 0 ? "Out of Stock" : "ADD TO SHOPPING CART"}
            </button>

            {/* Wishlist Button */}
            <button
              onClick={() => setWishlist(!wishlist)}
              className={`px-4 border rounded-md active:scale-[0.95] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center justify-center ${
                wishlist
                  ? "border-[#0F2854] text-[#0F2854] bg-[#0F2854]/5"
                  : "border-brand-sky hover:border-[#0F2854] text-brand-midnight/60 hover:text-[#0F2854]"
              }`}
              aria-label="Toggle wishlist"
            >
              <Heart className={`h-4.5 w-4.5 ${wishlist ? "fill-[#0F2854] text-[#0F2854]" : "stroke-[1.5]"}`} />
            </button>
          </div>

          {/* Features Box */}
          {features.length > 0 && (
            <div className="bg-[#F0F8FF] p-5 rounded-xl border border-brand-sky/20 space-y-3 font-sans">
              <h3 className="text-xs font-bold uppercase tracking-wide text-[#0F2854]">Key Features</h3>
              <ul className="space-y-2">
                {features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-[#0F2854]/80 leading-relaxed">
                    <svg className="h-4 w-4 text-[#4988C4] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Accordion system */}
          <div className="border-t border-brand-sky/40 pt-2 font-sans text-xs">
            {/* Accordion 1: Details & Materials */}
            <div className="border-b border-brand-sky/40">
              <button
                onClick={() => toggleAccordion("details")}
                className="w-full py-4 flex items-center justify-between text-left font-bold uppercase tracking-wider text-[#0F2854]"
              >
                <span>Details & Materials</span>
                {activeAccordion === "details" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {activeAccordion === "details" && (
                <div className="pb-4 text-[#0F2854]/80 leading-relaxed">
                  {product.materials || "Woven from 100% GOTS-certified organic cotton or French flax, meeting strict criteria for ethical production and low environmental impact."}
                </div>
              )}
            </div>

            {/* Accordion 2: Care Instructions */}
            <div className="border-b border-brand-sky/40">
              <button
                onClick={() => toggleAccordion("care")}
                className="w-full py-4 flex items-center justify-between text-left font-bold uppercase tracking-wider text-[#0F2854]"
              >
                <span>Care Instructions</span>
                {activeAccordion === "care" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {activeAccordion === "care" && (
                <div className="pb-4 text-[#0F2854]/80 leading-relaxed">
                  {product.careInstructions || "Machine wash warm on gentle cycle. Use natural, mild detergent. Tumble dry low or line dry to preserve fabric durability."}
                </div>
              )}
            </div>

            {/* Accordion 3: Shipping & Returns */}
            <div className="border-b border-brand-sky/40">
              <button
                onClick={() => toggleAccordion("shipping")}
                className="w-full py-4 flex items-center justify-between text-left font-bold uppercase tracking-wider text-[#0F2854]"
              >
                <span>Shipping & Returns</span>
                {activeAccordion === "shipping" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {activeAccordion === "shipping" && (
                <div className="pb-4 text-[#0F2854]/80 leading-relaxed">
                  Enjoy free shipping across India. Orders are typically processed within 24-48 hours and delivered within 3-5 business days. Returns or size exchanges are accepted within 100 days of purchase.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
