"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Star } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { API_URL } from "@/lib/api";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  averageRating: number;
  totalReviews: number;
  sku: string;
}

interface ProductCardProps {
  product: Product;
  userId?: string;
}

export default function ProductCard({ product, userId }: ProductCardProps) {
  const { addToCart } = useCart();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [rating, setRating] = useState(product.averageRating);
  const [totalReviews, setTotalReviews] = useState(product.totalReviews);
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const nextState = !isWishlisted;
    setIsWishlisted(nextState);

    try {
      // Mock UUID fallback if user session is not active
      const activeUserId = userId || "e578aba7-446b-40f7-8b3e-e6d60b96c862";
      const res = await fetch(`${API_URL}/wishlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, userId: activeUserId }),
      });
      if (!res.ok) throw new Error("Failed to sync wishlist.");
    } catch (err) {
      console.error(err);
      setIsWishlisted(!nextState); // Rollback state
    }
  };

  const handleRateSubmit = async (e: React.MouseEvent, starValue: number) => {
    e.preventDefault();
    e.stopPropagation();

    // Optimistic rating adjustment
    const prevRating = rating;
    const prevTotal = totalReviews;
    const optimisticTotal = totalReviews + 1;
    const optimisticAvg = (rating * totalReviews + starValue) / optimisticTotal;

    setRating(parseFloat(optimisticAvg.toFixed(2)));
    setTotalReviews(optimisticTotal);

    try {
      const res = await fetch(`${API_URL}/products/${product.sku}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: starValue }),
      });
      if (!res.ok) throw new Error("Failed to register product rating.");
      const data = await res.json();
      setRating(data.averageRating);
      setTotalReviews(data.totalReviews);
    } catch (err) {
      console.error(err);
      setRating(prevRating);
      setTotalReviews(prevTotal); // Rollback metrics
    }
  };

  return (
    <div className="group relative flex flex-col h-full bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
      {/* Product Image Link Container */}
      <Link
        href={`/products/${product.sku}`}
        className="relative block aspect-[4/5] bg-brand-sky/20 overflow-hidden border-b border-gray-100"
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          unoptimized
        />

        {/* Category Tag (Top-left) */}
        <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/95 backdrop-blur-sm border border-brand-sky/20 text-[9px] font-bold text-brand-midnight uppercase tracking-wider rounded-full font-sans shadow-sm">
          {product.category}
        </span>

        {/* Wishlist Heart Icon (Top-right) */}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-3 right-3 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full border border-gray-100 shadow-sm hover:bg-white active:scale-90 transition-all duration-300 cursor-pointer"
          title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={`h-4 w-4 transition-all duration-300 ${
              isWishlisted
                ? "fill-[#B32D2D] text-[#B32D2D] scale-110"
                : "text-brand-midnight/60 hover:text-brand-midnight"
            }`}
          />
        </button>
      </Link>

      {/* Details Box */}
      <div className="p-5 flex-1 flex flex-col font-sans">
        {/* Interactive Star Rating */}
        <div className="flex items-center gap-1.5 mb-2.5 text-xs">
          <div className="flex items-center" onMouseLeave={() => setHoverRating(null)}>
            {[1, 2, 3, 4, 5].map((star) => {
              const fillActive = hoverRating !== null ? star <= hoverRating : star <= Math.round(rating);
              return (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onClick={(e) => handleRateSubmit(e, star)}
                  className="p-0.5 text-brand-ocean hover:scale-125 transition-transform cursor-pointer"
                  title={`Rate ${star} Stars`}
                >
                  <Star
                    className={`h-3.5 w-3.5 ${
                      fillActive ? "fill-current text-[#D4AF37]" : "text-gray-300"
                    }`}
                  />
                </button>
              );
            })}
          </div>
          <span className="text-[10px] font-bold text-brand-midnight/55 whitespace-nowrap">
            {rating > 0 ? rating.toFixed(1) : "0.0"} ({totalReviews})
          </span>
        </div>

        {/* Product Title */}
        <h3 className="font-serif text-base font-bold text-brand-midnight group-hover:text-brand-royal transition-colors duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] mb-1.5 min-h-[48px] line-clamp-2 leading-snug">
          <Link href={`/products/${product.sku}`}>{product.name}</Link>
        </h3>

        {/* Product Description */}
        <p className="text-xs text-brand-midnight/60 leading-relaxed mb-4 line-clamp-2">
          {product.description}
        </p>

        {/* Footer Actions */}
        <div className="mt-auto pt-2 space-y-4">
          <p className="text-sm font-semibold text-brand-royal mb-0 font-sans tracking-wide">
            {Intl.NumberFormat("en-IN", {
              style: "currency",
              currency: "INR",
              maximumFractionDigits: 0,
            }).format(product.price)}
          </p>

          <button
            onClick={() =>
              addToCart(
                {
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  image: product.image,
                  sku: product.sku,
                },
                "Queen"
              )
            }
            className="w-full py-2.5 bg-brand-royal hover:bg-brand-ocean text-white text-xs font-semibold uppercase tracking-wide rounded-md shadow-sm active:scale-[0.98] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer"
          >
            Quick Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
