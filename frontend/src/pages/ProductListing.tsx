import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { apiRequest } from '../lib/api';
import { ProductCard, Product } from '../components/ProductCard';
import { SlidersHorizontal, ArrowUpDown } from 'lucide-react';

export const ProductListing: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  
  // Local Filter States
  const currentCategory = searchParams.get('category') || '';
  const currentSort = searchParams.get('sort') || 'newest';
  const [priceMax, setPriceMax] = useState<number>(30000);
  const [showFilters, setShowFilters] = useState(false);

  // Pagination states
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Fetch Categories
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const data = await apiRequest<{ id: string; name: string; slug: string }[]>('/api/categories');
        setCategories(data);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    fetchCats();
  }, []);

  // Fetch Products when filters or page changes
  const fetchProducts = async (isNewQuery: boolean) => {
    const activePage = isNewQuery ? 1 : page;
    if (isNewQuery) {
      setLoading(true);
      setPage(1);
    } else {
      setLoadingMore(true);
    }

    try {
      let queryStr = `/api/products?page=${activePage}&limit=6`;
      if (currentCategory) queryStr += `&category=${currentCategory}`;
      if (currentSort) queryStr += `&sort=${currentSort}`;

      const data = await apiRequest<{
        products: Product[];
        pagination: { page: number; pages: number };
      }>(queryStr);
      if (data && data.products) {
        // Filter price client-side to make interactions smoother
        const filtered = data.products.filter((p: Product) => {
          const price = p.lowestPrice !== undefined ? Number(p.lowestPrice) : 0;
          return price <= priceMax;
        });

        if (isNewQuery) {
          setProducts(filtered);
        } else {
          setProducts((prev) => [...prev, ...filtered]);
        }

        setHasMore(data.pagination.page < data.pagination.pages);
      }
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchProducts(true);
  }, [currentCategory, currentSort, priceMax]);

  useEffect(() => {
    if (page > 1) {
      fetchProducts(false);
    }
  }, [page]);

  const handleCategorySelect = (slug: string) => {
    setSearchParams((prev) => {
      if (slug) {
        prev.set('category', slug);
      } else {
        prev.delete('category');
      }
      return prev;
    });
  };

  const handleSortSelect = (sortVal: string) => {
    setSearchParams((prev) => {
      prev.set('sort', sortVal);
      return prev;
    });
  };

  const clearAllFilters = () => {
    setPriceMax(30000);
    setSearchParams({});
  };

  const activeCategoryObj = categories.find((c) => c.slug === currentCategory);
  const categoryTitle = activeCategoryObj ? activeCategoryObj.name : 'Pure Cotton Bedding';

  return (
    <main className="flex-1 mt-[80px] bg-[#FAF9F6] min-h-screen py-16 px-8 md:px-12 max-w-7xl mx-auto transition-colors duration-500">
      <Helmet>
        <title>{`${categoryTitle} | RareComforts Bedding`}</title>
        <meta name="description" content={`Explore our curated ${categoryTitle.toLowerCase()} collection. Shop premium Egyptian cotton and satin sheets, covers, and towels designed for quiet morning luxury.`} />
        <meta property="og:title" content={`${categoryTitle} | RareComforts Bedding`} />
        <meta property="og:description" content={`Explore our curated ${categoryTitle.toLowerCase()} collection. Shop premium Egyptian cotton and satin sheets, covers, and towels.`} />
        <meta property="og:type" content="website" />
      </Helmet>
      {/* Page Header */}
      <div className="border-b border-[#0F2854]/10 pb-8 mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <span className="font-sans text-[10px] tracking-[0.25em] text-[#0F2854]/60 uppercase">
            RareComforts Collections
          </span>
          <h1 className="font-serif text-4xl md:text-5xl text-navy-deep font-normal tracking-tight mt-2 capitalize">
            {currentCategory ? currentCategory.replace('-', ' ') : 'Pure Cotton Bedding'}
          </h1>
          <p className="text-[10px] text-muted-gray tracking-[0.18em] mt-3 uppercase font-sans">
            {products.length} {products.length === 1 ? 'Cotton Product' : 'Cotton Products'} available
          </p>
        </div>

        {/* Filter controls row */}
        <div className="flex gap-4 w-full md:w-auto">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center gap-2 px-6 py-3 border border-[#0F2854]/20 rounded-full text-xs font-semibold text-navy-deep hover:bg-[#0F2854]/5 transition-luxury flex-1 md:flex-none"
          >
            <SlidersHorizontal className="w-4 h-4" />
            FILTERS
          </button>
          
          <div className="relative flex-1 md:flex-none">
            <select
              value={currentSort}
              onChange={(e) => handleSortSelect(e.target.value)}
              className="appearance-none bg-[#FAF9F6] border border-[#0F2854]/20 rounded-full px-6 py-3 pr-12 text-xs font-semibold text-navy-deep focus:outline-none focus:border-navy-deep cursor-pointer w-full tracking-wider"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="trending">Most Popular</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 text-navy-deep absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-16 items-start">
        {/* Left Sidebar Filter Section */}
        <aside
          className={`w-full lg:w-64 space-y-10 flex-shrink-0 lg:block ${
            showFilters ? 'block' : 'hidden'
          }`}
        >
          {/* Categories select list */}
          <div className="space-y-5">
            <h3 className="font-sans text-[10px] font-bold tracking-[0.2em] text-[#0F2854]/80 uppercase border-b border-[#0F2854]/10 pb-2">Categories</h3>
            <div className="flex flex-wrap lg:flex-col gap-2.5">
              <button
                onClick={() => handleCategorySelect('')}
                className={`px-5 py-2.5 text-left text-xs font-medium tracking-wider uppercase rounded-full transition-luxury ${
                  currentCategory === ''
                    ? 'bg-navy-deep text-white shadow-sm'
                    : 'bg-[#0F2854]/5 text-navy-deep hover:bg-[#0F2854]/10'
                }`}
              >
                All Collections
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.slug)}
                  className={`px-5 py-2.5 text-left text-xs font-medium tracking-wider uppercase rounded-full transition-luxury ${
                    currentCategory === cat.slug
                      ? 'bg-navy-deep text-white shadow-sm'
                      : 'bg-[#0F2854]/5 text-navy-deep hover:bg-[#0F2854]/10'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Pricing range filter */}
          <div className="space-y-5">
            <div className="flex justify-between items-baseline border-b border-[#0F2854]/10 pb-2">
              <h3 className="font-sans text-[10px] font-bold tracking-[0.2em] text-[#0F2854]/80 uppercase">Max Price</h3>
              <span className="text-xs font-bold text-royal-blue">₹{priceMax.toLocaleString('en-IN')}</span>
            </div>
            <input
              type="range"
              min="1000"
              max="30000"
              step="500"
              value={priceMax}
              onChange={(e) => setPriceMax(Number(e.target.value))}
              className="w-full h-1 bg-[#0F2854]/10 rounded-lg appearance-none cursor-pointer accent-navy-deep"
            />
            <div className="flex justify-between text-[10px] text-muted-gray font-semibold tracking-wider">
              <span>₹1,000</span>
              <span>₹30,000</span>
            </div>
          </div>

          {/* Clear Filters Button */}
          <button
            onClick={clearAllFilters}
            className="w-full py-3 border border-dashed border-[#0F2854]/35 text-navy-deep hover:border-navy-deep hover:text-navy-deep transition-colors text-xs font-semibold uppercase tracking-[0.15em] rounded-none"
          >
            Clear Active Filters
          </button>
        </aside>

        {/* Main Grid Content Area */}
        <div className="flex-1 w-full">
          {loading ? (
            /* Skeleton Loading Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-16 gap-y-24">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex flex-col space-y-4">
                  <div className="aspect-[3/4] bg-gray-100 animate-pulse rounded-none" />
                  <div className="h-5 bg-gray-100 rounded w-2/3 animate-pulse" />
                  <div className="h-4 bg-gray-50 rounded w-1/2 animate-pulse" />
                  <div className="h-5 bg-gray-100 rounded w-1/3 animate-pulse" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            /* Empty State */
            <div className="py-32 text-center space-y-6 border border-dashed border-[#0F2854]/20 rounded-none bg-transparent">
              <span className="text-4xl block">🏺</span>
              <h2 className="font-serif text-2xl text-navy-deep font-normal tracking-tight">Collection Curating</h2>
              <p className="text-muted-gray text-sm max-w-sm mx-auto leading-relaxed font-light">
                This beautiful segment of our pure cotton collections is currently being curated. Check back soon for hand-crafted releases.
              </p>
              <button
                onClick={clearAllFilters}
                className="mt-2 px-8 py-3 bg-navy-deep text-white font-sans text-xs uppercase tracking-[0.2em] font-semibold rounded-full hover:bg-royal-blue transition-luxury"
              >
                SHOW ALL PRODUCTS
              </button>
            </div>
          ) : (
            /* Actual Grid */
            <div className="space-y-20">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-16 gap-y-24">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Infinite Scroll Load More Button */}
              {hasMore && (
                <div className="text-center pt-8">
                  <button
                    onClick={() => setPage((prev) => prev + 1)}
                    disabled={loadingMore}
                    className="px-10 py-3.5 border border-[#0F2854] text-navy-deep font-sans text-xs uppercase tracking-[0.2em] font-semibold hover:bg-navy-deep hover:text-white transition-luxury rounded-full disabled:opacity-40"
                  >
                    {loadingMore ? 'UNROLLING ITEMS...' : 'LOAD MORE COLLECTIONS'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
};
export default ProductListing;
