"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { API_URL } from "@/lib/api";
import WishlistHeart from "./WishlistHeart";

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
  sizes?: string[];
  badges?: string[];
}

interface ProductCardProps {
  product: Product;
  userId?: string;
}

export default function ProductCard({ product, userId }: ProductCardProps) {
  const { addToCart } = useCart();
  const [rating, setRating] = useState(product.averageRating);
  const [totalReviews, setTotalReviews] = useState(product.totalReviews);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

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

  const handleQuickAddClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.sizes && product.sizes.length > 1) {
      setIsQuickAddOpen(true);
    } else {
      const defaultSize = (product.sizes && product.sizes[0]) || "Queen";
      addToCart(
        {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          sku: product.sku,
          category: product.category,
        },
        defaultSize as any
      );
      alert(`Added ${product.name} (${defaultSize}) to cart.`);
    }
  };

  return (
    <div className="group relative flex flex-col h-full bg-white border border-gray-100 hover:border-brand-midnight/20 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] rounded-none">
      {/* Product Image Link Container */}
      <Link
        href={`/products/${product.sku}`}
        className="relative block aspect-[4/5] bg-brand-sky/10 overflow-hidden border-b border-gray-100"
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          unoptimized
        />

        {/* Category & Badge Chips (Top-left) */}
        <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-1.5 max-w-[calc(100%-4rem)]">
          <span className="px-2.5 py-1 bg-white/95 backdrop-blur-sm border border-brand-sky/20 text-[9px] font-semibold text-brand-midnight uppercase tracking-wider rounded-none font-sans shadow-sm">
            {product.category}
          </span>
          {product.badges?.map((badge) => {
            let bgClass = "bg-blue-50 text-blue-800 border-blue-200/50";
            if (badge === "ORGANIC") bgClass = "bg-emerald-50 text-emerald-800 border-emerald-200/50";
            else if (badge === "SALE") bgClass = "bg-red-50 text-red-800 border-red-200/50";
            else if (badge === "BESTSELLER") bgClass = "bg-amber-50 text-amber-800 border-amber-200/50";
            else if (badge === "LIMITED") bgClass = "bg-purple-50 text-purple-800 border-purple-200/50";
            else if (badge === "NEW") bgClass = "bg-sky-50 text-sky-800 border-sky-200/50";

            return (
              <span
                key={badge}
                className={`px-2.5 py-1 backdrop-blur-sm border text-[9px] font-semibold uppercase tracking-wider rounded-none font-sans shadow-sm ${bgClass}`}
              >
                {badge}
              </span>
            );
          })}
        </div>

        {/* Wishlist Heart Icon (Top-right) */}
        <WishlistHeart productId={product.id} userId={userId} />
      </Link>

      {/* Details Box */}
      <div className="p-6 flex-1 flex flex-col font-sans">
        {/* Product Title */}
        <h3 className="font-serif text-base font-semibold text-brand-midnight group-hover:text-brand-royal transition-colors duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] mb-1.5 line-clamp-1 leading-snug">
          <Link href={`/products/${product.sku}`}>{product.name}</Link>
        </h3>

        {/* Interactive Star Rating */}
        <div className="flex items-center gap-1.5 mb-3 text-xs">
          <div className="flex items-center" onMouseLeave={() => setHoverRating(null)}>
            {[1, 2, 3, 4, 5].map((star) => {
              const fillActive = hoverRating !== null ? star <= hoverRating : star <= Math.round(rating);
              return (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onClick={(e) => handleRateSubmit(e, star)}
                  className="p-0.5 hover:scale-125 transition-transform duration-200 cursor-pointer"
                  title={`Rate ${star} Stars`}
                >
                  <Star
                    className={`h-3.5 w-3.5 stroke-[1.2] transition-colors duration-200 ${
                      fillActive ? "fill-[#D4AF37] text-[#D4AF37]" : "text-gray-300"
                    }`}
                  />
                </button>
              );
            })}
          </div>
          <span className="text-[10px] font-semibold text-brand-midnight/55 tracking-wider">
            {rating > 0 ? rating.toFixed(1) : "0.0"} <span className="text-brand-midnight/40 font-light">({totalReviews})</span>
          </span>
        </div>

        {/* Product Description */}
        <p className="text-xs text-brand-midnight/60 leading-relaxed mb-5 line-clamp-2">
          {product.description}
        </p>

        {/* Footer Actions */}
        <div className="mt-auto pt-2 space-y-4">
          <p className="text-sm font-medium text-brand-midnight font-sans tracking-wide mb-0">
            {Intl.NumberFormat("en-IN", {
              style: "currency",
              currency: "INR",
              maximumFractionDigits: 0,
            }).format(product.price)}
          </p>

          <button
            onClick={handleQuickAddClick}
            className="w-full py-3 bg-brand-midnight hover:bg-brand-royal text-white text-xs font-semibold uppercase tracking-widest rounded-none active:scale-[0.99] transition-all duration-300 cursor-pointer"
          >
            Quick Add
          </button>
        </div>
      </div>

      {/* Quick Add Size Modal Popup */}
      {isQuickAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white max-w-sm w-full p-6 border border-gray-100 shadow-2xl relative flex flex-col font-sans">
            <h4 className="font-serif text-lg font-bold text-brand-midnight mb-1">
              Select Size
            </h4>
            <p className="text-xs text-brand-midnight/60 mb-5">
              {product.name}
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {product.sizes?.map((size) => (
                <button
                  key={size}
                  onClick={() => {
                    addToCart(
                      {
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        image: product.image,
                        sku: product.sku,
                        category: product.category,
                      },
                      size as any
                    );
                    alert(`Added ${product.name} (${size}) to cart.`);
                    setIsQuickAddOpen(false);
                  }}
                  className="w-full py-3 border border-gray-200 text-xs font-medium text-brand-midnight hover:border-brand-midnight hover:bg-brand-sky/10 transition-all cursor-pointer"
                >
                  {size}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsQuickAddOpen(false)}
              className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-brand-midnight text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
