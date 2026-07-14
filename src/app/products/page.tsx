"use client";

import React, { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SlidersHorizontal, Search, RotateCcw } from "lucide-react";
import ProductSkeleton from "@/components/products/ProductSkeleton";
import ProductCard from "@/components/products/ProductCard";
import { API_URL } from "@/lib/api";

interface DatabaseProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  sku: string;
  isActive: boolean;
  averageRating: number;
  totalReviews: number;
  sizes?: string[];
  badges?: string[];
}

interface CatalogProduct {
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

const mapDatabaseProduct = (product: DatabaseProduct): CatalogProduct => ({
  id: product.id,
  name: product.name,
  description: product.description ?? "",
  price: product.price / 100, // Convert paise to rupees
  category: product.category,
  image: product.imageUrl,
  averageRating: product.averageRating ?? 0,
  totalReviews: product.totalReviews ?? 0,
  sku: product.sku,
  sizes: product.sizes ?? [],
  badges: product.badges ?? [],
});

const CatalogContent: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const activeCategory = searchParams.get("category") || "All";
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("featured");

  useEffect(() => {
    const controller = new AbortController();

    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`${API_URL}/products`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Products request failed with status ${response.status}`);
        }

        const data: unknown = await response.json();
        if (!Array.isArray(data)) {
          throw new Error("Products response was not an array.");
        }

        const activeProducts = (data as DatabaseProduct[])
          .filter((product) => product.isActive !== false)
          .map(mapDatabaseProduct);

        setProducts(activeProducts);
      } catch (fetchError) {
        if ((fetchError as Error).name === "AbortError") {
          return;
        }

        console.error("Failed to fetch catalog products:", fetchError);
        setError("We couldn't load the bedroom collection. Please refresh and try again.");
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void fetchProducts();

    return () => controller.abort();
  }, []);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(products.map((product) => product.category)))],
    [products]
  );

  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (category === "All") {
      params.delete("category");
    } else {
      params.set("category", category);
    }
    router.push(`/products?${params.toString()}`);
  };

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
      result.sort((a, b) => b.averageRating - a.averageRating);
    }

    return result;
  }, [activeCategory, products, searchQuery, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSortBy("featured");
    router.push("/products");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      {/* Page Title */}
      <div className="text-center md:text-left space-y-4 mb-12">
        <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-brand-midnight">
          Explore the Bedroom Collection
        </h1>
        <p className="text-sm md:text-base text-brand-midnight/75 max-w-2xl leading-relaxed">
          Wrap yourself in premium sleep. Browse our ethically sourced sheets, weightless quilts, and adaptive supportive pillows.
        </p>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col lg:flex-row gap-6 items-stretch lg:items-center justify-between pb-8 border-b border-brand-sky/40 mb-10">
        {/* Category Buttons */}
        <div className="flex flex-wrap gap-2 items-center font-sans">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-5 py-2 text-xs font-semibold uppercase tracking-wide rounded-md active:scale-[0.98] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                activeCategory === cat
                  ? "bg-brand-royal text-white shadow-sm"
                  : "bg-brand-sky/25 hover:bg-brand-sky/60 text-brand-midnight border border-brand-sky/40"
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
              className="w-full bg-brand-sky/15 border border-brand-sky/40 focus:border-brand-royal focus:ring-1 focus:ring-brand-royal rounded-md py-2 pl-9 pr-4 text-xs font-medium text-brand-midnight focus:outline-none transition-all duration-300"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-brand-midnight/40 stroke-[1.5]" />
          </div>

          {/* Sort dropdown */}
          <div className="flex items-center gap-2 border border-brand-sky/40 rounded-md bg-brand-sky/15 px-3 py-2">
            <SlidersHorizontal className="h-4 w-4 text-brand-royal stroke-[1.5]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent border-none text-xs font-semibold text-brand-midnight focus:outline-none cursor-pointer"
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
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {Array.from({ length: 8 }).map((_, index) => (
            <ProductSkeleton key={index} />
          ))}
        </div>
      ) : error ? (
        <div
          role="alert"
          className="text-center py-12 px-6 bg-red-50 rounded-2xl border border-red-200 max-w-xl mx-auto"
        >
          <p className="font-serif text-lg font-semibold text-brand-midnight">Unable to load products</p>
          <p className="mt-2 text-sm text-brand-midnight/65">{error}</p>
        </div>
      ) : filteredAndSortedProducts.length === 0 ? (
        <div className="text-center py-20 bg-brand-sky/15 rounded-2xl border border-brand-sky/30 max-w-xl mx-auto space-y-4">
          <p className="font-serif text-lg font-semibold text-brand-midnight leading-relaxed">
            Our signature collections are currently being updated.
          </p>
          <p className="text-sm text-brand-midnight/60 max-w-sm mx-auto font-sans">
            Return shortly to explore our premium linens and rest sanctuaries.
          </p>
          <button
            onClick={handleResetFilters}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-royal hover:bg-brand-ocean text-white text-xs font-semibold uppercase tracking-wide rounded-md active:scale-[0.98] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] font-sans"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredAndSortedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

const CatalogFallback = () => (
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center">
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-brand-sky/40 w-1/3 mx-auto rounded"></div>
      <div className="h-4 bg-brand-sky/40 w-1/2 mx-auto rounded"></div>
      <div className="h-12 bg-brand-sky/40 rounded mt-8"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="aspect-square bg-brand-sky/40 rounded-xl"></div>
        ))}
      </div>
    </div>
  </div>
);

export default function ProductsPage() {
  return (
    <Suspense fallback={<CatalogFallback />}>
      <CatalogContent />
    </Suspense>
  );
}
