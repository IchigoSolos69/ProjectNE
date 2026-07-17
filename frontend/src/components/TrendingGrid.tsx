import React, { useEffect, useState, useRef } from 'react';
import { apiRequest } from '../lib/api';
import { ProductCard, Product } from './ProductCard';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const TrendingGrid: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const data = await apiRequest('/api/products?trending=true');
        if (data && data.products) {
          setProducts(data.products.slice(0, 4)); // Show top 4 trending products
        }
      } catch (err) {
        console.error('Error fetching trending products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, []);

  useEffect(() => {
    if (loading || products.length === 0 || !gridRef.current) return;

    const cards = gridRef.current.querySelectorAll('.trending-card');
    
    // Staggered reveal trigger
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
          start: 'top 80%',
          toggleActions: 'play none none none', // play once
        },
      }
    );
  }, [loading, products]);

  if (loading) {
    return (
      <section className="py-20 px-6 max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <div className="h-6 w-24 bg-gray-100 rounded mx-auto animate-pulse" />
          <div className="h-10 w-64 bg-gray-200 rounded mx-auto animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-[4/5] bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto space-y-12 bg-white">
      {/* Section Header */}
      <div className="text-center space-y-3">
        <p className="font-sans text-xs font-bold tracking-widest text-sky-blue uppercase">
          CURATED ESSENTIALS
        </p>
        <h2 className="font-serif text-3xl sm:text-4xl text-navy-deep font-bold leading-tight">
          Trending Linens
        </h2>
        <div className="w-12 h-0.5 bg-royal-blue mx-auto mt-4" />
      </div>

      {/* Grid Container */}
      <div
        ref={gridRef}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {products.map((product) => (
          <div key={product.id} className="trending-card opacity-0">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
};
