"use client";

import React, { useState, useMemo, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Star, SlidersHorizontal, Search, RotateCcw } from "lucide-react";
import { products, Product } from "@/data/products";
import { useCart } from "@/context/cart-context";

// Inner component that reads query params
const CatalogContent: React.FC = () => {
  const { addToCart } = useCart();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Filters state
  const activeCategory = searchParams.get("category") || "All";
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("featured");

  const categories = ["All", "Bedsheets", "Comforters", "Pillows"];

  // Handle category change (updates URL search parameter)
  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (category === "All") {
      params.delete("category");
    } else {
      params.set("category", category);
    }
    router.push(`/products?${params.toString()}`);
  };

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    // 1. Category Filter
    if (activeCategory !== "All") {
      result = result.filter((p) => p.category === activeCategory);
    }

    // 2. Search query filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      );
    }

    // 3. Sorting
    if (sortBy === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [activeCategory, searchQuery, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSortBy("featured");
    router.push("/products");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      {/* Page Title */}
      <div className="text-center md:text-left space-y-4 mb-12">
        <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-primary">
          Explore the Bedroom Collection
        </h1>
        <p className="text-sm md:text-base text-foreground/75 max-w-2xl leading-relaxed">
          Wrap yourself in premium sleep. Browse our ethically sourced sheets, weightless quilts, and adaptive supportive pillows.
        </p>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col lg:flex-row gap-6 items-stretch lg:items-center justify-between pb-8 border-b border-border/40 mb-10">
        {/* Category Buttons */}
        <div className="flex flex-wrap gap-2 items-center">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-5 py-2 text-xs font-semibold uppercase tracking-wider rounded-md transition-all duration-200 ${
                activeCategory === cat
                  ? "bg-primary text-white shadow-sm"
                  : "bg-sand/35 hover:bg-sand text-primary border border-border/30"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search & Sort Panel */}
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
          {/* Search bar */}
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              placeholder="Search bedding..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-sand/20 border border-border focus:border-primary-light rounded-md py-2 pl-9 pr-4 text-xs font-medium text-primary focus:outline-none transition-colors"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-foreground/40 stroke-[1.5]" />
          </div>

          {/* Sort dropdown */}
          <div className="flex items-center gap-2 border border-border rounded-md bg-sand/10 px-3 py-2">
            <SlidersHorizontal className="h-4 w-4 text-primary-light stroke-[1.5]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent border-none text-xs font-semibold text-primary focus:outline-none cursor-pointer"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Catalog Results Grid */}
      {filteredAndSortedProducts.length === 0 ? (
        <div className="text-center py-20 bg-sand/15 rounded-2xl border border-border/30 max-w-xl mx-auto space-y-4">
          <p className="font-serif text-lg font-semibold text-primary">No products found</p>
          <p className="text-sm text-foreground/60 max-w-sm mx-auto">
            We couldn't find any bedding items matching "{searchQuery}" or selected category.
          </p>
          <button
            onClick={handleResetFilters}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-light text-white text-xs font-semibold uppercase tracking-wider rounded-md transition-colors duration-200"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredAndSortedProducts.map((product) => (
            <div
              key={product.id}
              className="group relative flex flex-col bg-background rounded-xl overflow-hidden border border-border/40 shadow-sm transition-all duration-300 hover:shadow-md"
            >
              {/* Product Image */}
              <Link
                href={`/products/${product.id}`}
                className="relative block aspect-square bg-sand overflow-hidden border-b border-border/30"
              >
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

              {/* Product Details */}
              <div className="p-5 flex-1 flex flex-col">
                {/* Review Stars */}
                <div className="flex items-center gap-1 text-accent mb-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < Math.floor(product.rating)
                            ? "fill-current"
                            : "opacity-35"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-foreground/50">
                    ({product.reviewsCount})
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-serif text-base font-bold text-primary group-hover:text-primary-light transition-colors mb-1 min-h-[48px] line-clamp-2">
                  <Link href={`/products/${product.id}`}>{product.name}</Link>
                </h3>

                {/* Short description */}
                <p className="text-xs text-foreground/60 leading-relaxed mb-4 line-clamp-2">
                  {product.description}
                </p>

                {/* Price */}
                <p className="text-sm font-semibold text-primary-light mb-4">
                  ${product.price}
                </p>

                {/* Add to Cart CTA */}
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
      )}
    </div>
  );
};

// Fallback skeleton loader
const CatalogFallback = () => (
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center">
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-sand w-1/3 mx-auto rounded"></div>
      <div className="h-4 bg-sand w-1/2 mx-auto rounded"></div>
      <div className="h-12 bg-sand rounded mt-8"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="aspect-square bg-sand rounded-xl"></div>
        ))}
      </div>
    </div>
  </div>
);

// Main page container with Suspense wrapper
export default function ProductsPage() {
  return (
    <Suspense fallback={<CatalogFallback />}>
      <CatalogContent />
    </Suspense>
  );
}
