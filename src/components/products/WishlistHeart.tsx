"use client";

import React, { useState } from "react";
import { Heart } from "lucide-react";
import { API_URL } from "@/lib/api";

interface WishlistHeartProps {
  productId: string;
  userId?: string;
  initialWishlisted?: boolean;
}

export default function WishlistHeart({
  productId,
  userId,
  initialWishlisted = false,
}: WishlistHeartProps) {
  const [isWishlisted, setIsWishlisted] = useState(initialWishlisted);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const nextState = !isWishlisted;
    setIsWishlisted(nextState);

    if (nextState) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 350);
    }

    try {
      const activeUserId = userId || "e578aba7-446b-40f7-8b3e-e6d60b96c862";
      const res = await fetch(`${API_URL}/wishlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, userId: activeUserId }),
      });
      if (!res.ok) throw new Error("Failed to sync wishlist.");
    } catch (err) {
      console.error("Wishlist sync error:", err);
      setIsWishlisted(!nextState); // Rollback state on backend fail
    }
  };

  return (
    <button
      onClick={handleWishlistToggle}
      className="absolute top-4 right-4 z-10 p-2.5 bg-white/90 backdrop-blur-sm rounded-full border border-gray-100 shadow-sm hover:bg-white active:scale-90 transition-all duration-300 cursor-pointer group/heart"
      title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart
        className={`h-4 w-4 stroke-[1.2] transition-all duration-300 ${
          isWishlisted
            ? "fill-[#B32D2D] text-[#B32D2D]"
            : "text-brand-midnight/60 group-hover/heart:text-brand-midnight"
        } ${isAnimating ? "animate-heart-pop" : ""}`}
      />
    </button>
  );
}
