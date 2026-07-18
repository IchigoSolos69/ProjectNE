import React, { useEffect, useState, useRef } from 'react';
import { apiRequest } from '../lib/api';
import { ProductCard, Product } from './ProductCard';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const TrendingGrid: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchTrending = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiRequest<{ products: Product[] }>('/api/products?trending=true');
        if (data && data.products && data.products.length > 0) {
          setProducts(data.products.slice(0, 4)); // Show top 4 trending products
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error('Error fetching trending products:', err);
        setError('Failed to retrieve trending collections.');
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, []);

  useEffect(() => {
    if (loading || products.length === 0 || !gridRef.current) return;

    const cards = gridRef.current.querySelectorAll('.trending-card');
    
    // Staggered reveal trigger - only plays once
    gsap.fromTo(
      cards,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: gridRef.current,
          start: 'top 85%',
          once: true, // Fire once so re-scroll does not trigger re-play
        },
      }
    );
  }, [loading, products]);

  // Shimmer keyframes style tag
  const shimmerStyles = (
    <style>{`
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
      .skeleton-shimmer {
        background: linear-gradient(90deg, #BDE8F5 25%, #fff 50%, #BDE8F5 75%);
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite linear;
      }
    `}</style>
  );

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto space-y-12 bg-white">
      {shimmerStyles}
      
      {/* Section Header: Serif H2 left-aligned on desktop, center-aligned on mobile */}
      <div className="text-center md:text-left space-y-2">
        <h2 className="font-serif text-3xl sm:text-4xl text-navy-deep font-bold leading-tight">
          Trending This Season
        </h2>
        <p className="font-sans text-xs text-muted-gray uppercase tracking-wider font-semibold">
          Our most-loved pieces, curated for you.
        </p>
      </div>

      {/* Loading state skeleton shimmer grid */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col space-y-4">
              <div className="aspect-[4/5] skeleton-shimmer rounded-lg" />
              <div className="h-4 skeleton-shimmer rounded w-2/3" />
              <div className="h-3 skeleton-shimmer rounded w-1/2" />
              <div className="h-4 skeleton-shimmer rounded w-1/3" />
            </div>
          ))}
        </div>
      )}

      {/* Error or Empty state: 4 brand-themed "Coming Soon" placeholders */}
      {!loading && (error || products.length === 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="border border-[#BDE8F5]/60 rounded-xl p-6 bg-[#0F2854] text-white flex flex-col justify-between aspect-[4/5] shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="space-y-2">
                <p className="text-[9px] font-sans font-bold tracking-widest text-[#BDE8F5] uppercase">RARECOMFORTS</p>
                <h3 className="font-serif text-lg font-bold">Cotton Showcase</h3>
                <p className="text-[11px] text-[#BDE8F5]/70 font-sans leading-relaxed">
                  A signature textile creation currently being unrolled for the seasonal catalogs.
                </p>
              </div>
              <div className="border-t border-[#BDE8F5]/10 pt-4 flex justify-between items-center">
                <span className="font-serif italic text-xs text-[#BDE8F5]/85">Coming Soon</span>
                <span className="text-[8px] font-sans text-[#BDE8F5]/50 tracking-wider">EST. 2026</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Actual products grid */}
      {!loading && !error && products.length > 0 && (
        <div
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {products.map((product) => (
            <div key={product.id} className="trending-card opacity-0">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default TrendingGrid;
