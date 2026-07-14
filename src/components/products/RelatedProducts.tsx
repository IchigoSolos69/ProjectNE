"use client";

import React, { useEffect, useState } from "react";
import ProductCard, { Product } from "./ProductCard";
import { API_URL } from "@/lib/api";

interface RelatedProductsProps {
  category: string;
  excludeSku: string;
}

export default function RelatedProducts({ category, excludeSku }: RelatedProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`${API_URL}/products`);
        if (res.ok) {
          const data = await res.json();
          // Filter by category, active status, and exclude current SKU
          const filtered = data
            .filter(
              (p: any) =>
                p.category === category &&
                p.sku !== excludeSku &&
                p.isActive !== false
            )
            .slice(0, 4)
            .map((p: any) => ({
              id: p.id,
              name: p.name,
              description: p.description,
              price: p.price / 100, // convert paise to rupees
              category: p.category,
              image: p.imageUrl,
              averageRating: p.averageRating ?? 0,
              totalReviews: p.totalReviews ?? 0,
              sku: p.sku,
              sizes: p.sizes,
              badges: p.badges,
            }));
          setProducts(filtered);
        }
      } catch (err) {
        console.error("Failed to fetch related products:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRelated();
  }, [category, excludeSku]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="aspect-[4/5] bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
