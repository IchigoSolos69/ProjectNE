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
        const data = await apiRequest<{ products: Product[] }>('/api/products?landing=true');
        if (data && data.products) {
          setProducts(data.products);
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
          invalidateOnRefresh: true,
        },
      }
    );
  }, [loading, products]);

  const shimmerStyles = (
    <style>{`
      .skeleton-shimmer {
        position: relative;
        overflow: hidden;
        background-color: #FAF9F6;
      }
      .skeleton-shimmer::after {
        content: '';
        position: absolute;
        inset: 0;
        transform: translateX(-100%);
        background: linear-gradient(
          90deg,
          transparent,
          rgba(255, 255, 255, 0.5),
          transparent
        );
        animation: shimmer-sweep 1.6s ease-in-out infinite;
      }
      @keyframes shimmer-sweep {
        100% { transform: translateX(100%); }
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

      {/* Error or Empty state: elegant fallback message */}
      {!loading && (error || products.length === 0) && (
        <div className="bg-[#F5FAFD]/40 border border-[#BDE8F5]/25 rounded-2xl p-12 text-center max-w-xl mx-auto space-y-3 font-sans">
          <span className="text-3xl block">🪶</span>
          <p className="font-serif text-lg italic text-navy-deep leading-relaxed">
            "We are curating our newest textile collection to offer you the ultimate sleep sanctuary. Please check back shortly."
          </p>
          <p className="text-[10px] text-muted-gray uppercase tracking-widest font-semibold pt-1">
            RareComforts Showcase Curation
          </p>
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
