"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Star, Plus, Minus, ArrowLeft, Heart, ShoppingCart } from "lucide-react";
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
}

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { addToCart } = useCart();

  const [product, setProduct] = useState<DatabaseProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [wishlist, setWishlist] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`${API_URL}/products/${id}`, {
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
  }, [id]);

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

  // Convert price from paise to rupees for display
  const displayPrice = product.price / 100;

  // Map product to cart-compatible format
  const cartProduct = {
    id: product.id,
    name: product.name,
    description: product.description,
    price: displayPrice,
    category: product.category as "Bedsheets" | "Comforters" | "Cushion Covers" | "Towels" | "Door Mats",
    image: product.imageUrl,
    images: [product.imageUrl],
    sizes: ["Twin", "Queen", "King"] as ("Twin" | "Queen" | "King")[],
    rating: 4.8,
    reviewsCount: 0,
    features: [],
    details: product.description,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      {/* Back link */}
      <div className="mb-8 font-sans">
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brand-midnight/60 hover:text-brand-royal active:scale-[0.98] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to bedding collection
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Left Column: Premium Image Display */}
        <div className="lg:col-span-7">
          <div className="relative aspect-square w-full bg-brand-sky/30 rounded-2xl overflow-hidden border border-brand-sky/40 shadow-lg">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              priority
              className="object-cover transition-all duration-300"
              sizes="(max-width: 1024px) 100vw, 60vw"
              unoptimized
            />
            {/* Category badge */}
            <span className="absolute top-4 left-4 px-3 py-1.5 bg-white/95 backdrop-blur-sm border border-brand-sky/20 text-[10px] font-bold text-brand-midnight uppercase tracking-wider rounded-full font-sans shadow-sm">
              {product.category}
            </span>
          </div>
        </div>

        {/* Right Column: Product Details & Actions */}
        <div className="lg:col-span-5 space-y-8">
          <div>
            {/* Category */}
            <span className="text-xs font-semibold uppercase tracking-widest text-brand-royal font-sans">
              {product.category}
            </span>
            {/* Title */}
            <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-brand-midnight mt-2 leading-tight">
              {product.name}
            </h1>

            {/* Price & Stock Info */}
            <div className="flex items-center justify-between mt-6 pb-6 border-b border-brand-sky/40">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-brand-royal font-sans">
                  {Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                    maximumFractionDigits: 0,
                  }).format(displayPrice)}
                </span>
                {product.inventoryCount > 0 ? (
                  <span className="text-xs text-brand-midnight/60 font-sans">
                    {product.inventoryCount} in stock
                  </span>
                ) : (
                  <span className="text-xs text-red-600 font-semibold font-sans">Out of Stock</span>
                )}
              </div>
              {/* Rating Stars */}
              <div className="flex items-center gap-1.5">
                <div className="flex text-brand-ocean">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < 4 ? "fill-current" : "opacity-35"}`} />
                  ))}
                </div>
                <span className="text-xs font-bold text-brand-midnight/60 font-sans">(4.8)</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wide text-brand-midnight font-sans">
              Product Description
            </h2>
            <p className="text-sm text-brand-midnight/75 leading-relaxed">{product.description}</p>
          </div>

          {/* SKU Info */}
          <div className="bg-brand-sky/15 p-4 rounded-xl border border-brand-sky/40">
            <div className="flex items-center justify-between text-xs">
              <span className="text-brand-midnight/60 font-sans">Product SKU:</span>
              <span className="font-semibold text-brand-midnight font-mono">{product.sku}</span>
            </div>
          </div>

          {/* Quantity and Cart Actions */}
          <div className="space-y-4 font-sans">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wide text-brand-midnight">
                Quantity
              </span>
              {/* Quantity controls */}
              <div className="flex items-center border border-brand-sky/40 rounded-md bg-brand-sky/20">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-4 py-2 text-brand-midnight/60 hover:text-brand-royal active:scale-[0.9] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="text-sm font-semibold w-12 text-center text-brand-midnight">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity((q) => (product.inventoryCount > 0 ? Math.min(product.inventoryCount, q + 1) : q + 1))
                  }
                  className="px-4 py-2 text-brand-midnight/60 hover:text-brand-royal active:scale-[0.9] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 items-stretch">
              {/* Add to Cart */}
              <button
                onClick={() => addToCart(cartProduct, "Queen", quantity)}
                disabled={product.inventoryCount === 0}
                className="flex-1 py-4 bg-brand-royal hover:bg-brand-ocean text-white text-sm font-semibold uppercase tracking-wide rounded-md shadow-sm active:scale-[0.98] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <ShoppingCart className="h-4 w-4" />
                {product.inventoryCount === 0 ? "Out of Stock" : "Add to Cart"}
              </button>

              {/* Wishlist Button */}
              <button
                onClick={() => setWishlist(!wishlist)}
                className={`px-5 border rounded-md active:scale-[0.95] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center justify-center ${
                  wishlist
                    ? "border-brand-royal text-brand-royal bg-brand-royal/5"
                    : "border-brand-sky hover:border-brand-royal text-brand-midnight/60 hover:text-brand-royal"
                }`}
                aria-label="Toggle wishlist"
              >
                <Heart className={`h-5 w-5 ${wishlist ? "fill-current" : "stroke-[1.5]"}`} />
              </button>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-brand-sky/30">
            <div className="text-center p-4 bg-brand-sky/10 rounded-lg">
              <p className="text-xs font-bold text-brand-midnight uppercase tracking-wide">
                Free Shipping
              </p>
              <p className="text-[10px] text-brand-midnight/60 mt-1">On all orders</p>
            </div>
            <div className="text-center p-4 bg-brand-sky/10 rounded-lg">
              <p className="text-xs font-bold text-brand-midnight uppercase tracking-wide">
                100-Night Trial
              </p>
              <p className="text-[10px] text-brand-midnight/60 mt-1">Sleep guarantee</p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Product Information */}
      <div className="mt-16 pt-12 border-t border-brand-sky/30">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wide text-brand-midnight font-sans">
              Premium Quality
            </h3>
            <p className="text-xs text-brand-midnight/70 leading-relaxed">
              Ethically sourced materials crafted with meticulous attention to detail for the ultimate
              sleep experience.
            </p>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wide text-brand-midnight font-sans">
              Care Instructions
            </h3>
            <p className="text-xs text-brand-midnight/70 leading-relaxed">
              Machine wash cold on gentle cycle. Tumble dry low or line dry to preserve fabric longevity.
            </p>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wide text-brand-midnight font-sans">
              Free Returns
            </h3>
            <p className="text-xs text-brand-midnight/70 leading-relaxed">
              Not completely satisfied? Request a full refund within 100 days with free prepaid return
              labels.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
