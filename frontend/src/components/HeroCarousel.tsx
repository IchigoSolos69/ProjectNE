import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import gsap from 'gsap';
import { getOptimizedImageUrl, apiRequest } from '../lib/api';
import { Product } from './ProductCard';

interface CarouselSlide {
  id: string;
  name: string;
  tagline: string;
  description: string;
  price: string;
  image: string;
  link: string;
}

export const HeroCarousel: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<any>(null);

  useEffect(() => {
    const fetchLandingProducts = async () => {
      setIsLoading(true);
      try {
        const data = await apiRequest<{ products: Product[] }>('/api/products?landing=true');
        if (data && data.products) {
          setProducts(data.products);
        }
      } catch (err) {
        console.error('Failed to fetch landing products for hero carousel:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLandingProducts();
  }, []);

  const displaySlides = useMemo<CarouselSlide[]>(() => {
    if (products.length > 0) {
      return products.map((prod) => {
        // Find lowest variant price or default to base price if set
        let lowestPrice = 0;
        if (prod.variants && prod.variants.length > 0) {
          lowestPrice = Math.min(
            ...prod.variants.map((v) => (v.discountPrice ? Number(v.discountPrice) : Number(v.price)))
          );
        }

        return {
          id: prod.id,
          name: prod.name,
          tagline: prod.material?.toUpperCase() || 'PREMIUM TEXTILE CREATION',
          description: prod.description,
          price: lowestPrice > 0 ? `₹${lowestPrice.toLocaleString('en-IN')}` : 'Request Price',
          image: prod.images[0] || (prod.variants?.[0]?.imageUrl) || 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200',
          link: `/products/${prod.slug}`,
        };
      });
    }

    return [];
  }, [products]);

  const resetAutoplay = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
    autoPlayRef.current = setInterval(() => {
      handleNext();
    }, 6000);
  };

  useEffect(() => {
    resetAutoplay();
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [activeIndex, displaySlides]);

  // Handle GSAP transitions when slide changes
  useEffect(() => {
    if (displaySlides.length === 0) return;
    
    // Left Image Animation
    if (imageContainerRef.current) {
      const activeImg = imageContainerRef.current.querySelector(`.slide-img-${activeIndex}`);
      const otherImgs = imageContainerRef.current.querySelectorAll(`.slide-img:not(.slide-img-${activeIndex})`);
      
      gsap.to(activeImg, { opacity: 1, scale: 1, duration: 0.8, ease: 'power2.out' });
      gsap.to(otherImgs, { opacity: 0, scale: 1.05, duration: 0.8, ease: 'power2.out' });
    }

    // Right Text Panel Animation
    if (textContainerRef.current) {
      gsap.fromTo(
        textContainerRef.current.children,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power2.out' }
      );
    }
  }, [activeIndex, displaySlides]);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? displaySlides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === displaySlides.length - 1 ? 0 : prev + 1));
  };

  const handleDotClick = (index: number) => {
    setActiveIndex(index);
  };

  if (isLoading) {
    return (
      <div className="w-full h-screen flex flex-col md:flex-row bg-[#F5FAFD]/40 animate-pulse">
        {/* Left Side: Image skeleton */}
        <div className="w-full md:w-[58%] h-[50vh] md:h-full bg-gray-200" />
        {/* Right Side: Info skeleton */}
        <div className="w-full md:w-[42%] h-auto md:h-full flex flex-col justify-center p-8 sm:p-12 md:p-16 space-y-6 bg-white">
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          <div className="h-10 bg-gray-200 rounded w-3/4" />
          <div className="h-6 bg-gray-200 rounded w-5/6" />
          <div className="h-6 bg-gray-200 rounded w-2/3" />
          <div className="h-12 bg-gray-200 rounded-full w-1/3 pt-6" />
        </div>
      </div>
    );
  }

  if (displaySlides.length === 0) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center bg-[#F5FAFD]/40 text-center px-6">
        <h2 className="font-serif text-2xl md:text-3xl text-navy-deep font-bold mb-4">
          Experience Restorative Luxury
        </h2>
        <p className="font-sans text-xs text-muted-gray uppercase tracking-widest max-w-md leading-relaxed">
          Our curated collection showcase is being updated. Explore our full range of cotton products by clicking below.
        </p>
        <Link
          to="/products"
          className="mt-8 inline-block bg-navy-deep text-white font-sans text-xs uppercase tracking-wide font-semibold px-8 py-3.5 rounded-full hover:bg-royal-blue transition-luxury shadow-md"
        >
          Explore All Products
        </Link>
      </div>
    );
  }

  return (
    <section className="relative w-full h-screen flex flex-col md:flex-row bg-[#F5FAFD]/40 overflow-hidden">
      {displaySlides.length > 0 && (
        <Helmet>
          <link
            rel="preload"
            as="image"
            href={getOptimizedImageUrl(displaySlides[0].image, 1200)}
            imageSrcSet={`${getOptimizedImageUrl(displaySlides[0].image, 600)} 600w, ${getOptimizedImageUrl(displaySlides[0].image, 1200)} 1200w, ${getOptimizedImageUrl(displaySlides[0].image, 1800)} 1800w`}
            imageSizes="(max-width: 768px) 100vw, 58vw"
          />
        </Helmet>
      )}
        
        {/* Left Carousel Image Section (~58%) */}
        <div
          ref={imageContainerRef}
          className="relative w-full md:w-[58%] h-[50vh] md:h-full overflow-hidden bg-navy-deep flex-shrink-0 p-0 m-0 border-0"
        >
          {displaySlides.map((slide, idx) => {
            const isFirst = idx === 0;
            return (
              <div
                key={slide.id}
                className={`absolute inset-0 slide-img slide-img-${idx} opacity-0 p-0 m-0 border-0 w-full h-full`}
                style={{ zIndex: idx === activeIndex ? 10 : 1 }}
              >
                <img
                  src={getOptimizedImageUrl(slide.image, 1200)}
                  srcSet={`${getOptimizedImageUrl(slide.image, 600)} 600w, ${getOptimizedImageUrl(slide.image, 1200)} 1200w, ${getOptimizedImageUrl(slide.image, 1800)} 1800w`}
                  sizes="(max-width: 768px) 100vw, 58vw"
                  width="1200"
                  height="800"
                  loading={isFirst ? "eager" : "lazy"}
                  fetchPriority={isFirst ? "high" : "auto"}
                  alt={slide.name}
                  className="w-full h-full object-cover p-0 m-0 border-0"
                />
              </div>
            );
          })}

          {/* Ambient Dark Overlay for Branding & Contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/60 via-transparent to-black/25 z-20 pointer-events-none" />

          {/* Small branding text on bottom-left over image */}
          <div className="absolute bottom-6 left-6 z-30 hidden sm:block">
            <p className="font-serif italic text-white/95 text-lg leading-none">RareComforts</p>
            <p className="font-sans text-[10px] tracking-widest text-[#BDE8F5]/80 mt-1 uppercase">ESTABLISHED 2026</p>
          </div>

          {/* Navigation Arrow buttons over image */}
          <div className="absolute bottom-6 right-6 z-30 flex gap-2">
            <button
              onClick={handlePrev}
              className="p-2 border border-white/40 bg-navy-deep/30 text-white rounded-full hover:bg-white hover:text-navy-deep hover:border-white transition-all"
              aria-label="Previous Slide"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="p-2 border border-white/40 bg-navy-deep/30 text-white rounded-full hover:bg-white hover:text-navy-deep hover:border-white transition-all"
              aria-label="Next Slide"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Synced Info Panel (~42%) */}
        <div className="w-full md:w-[42%] h-auto md:h-full flex flex-col justify-center p-8 sm:p-12 md:p-16 bg-white relative z-10 overflow-y-auto">
          
          {/* Carousel Slide Indicators */}
          <div className="flex gap-1 mb-6 justify-start items-center">
            {displaySlides.map((_, idx) => {
              const isActive = idx === activeIndex;
              return (
                <button
                  key={idx}
                  aria-label={`Go to slide ${idx + 1}`}
                  className="flex items-center justify-center min-w-[44px] min-h-[44px]"
                  onClick={() => handleDotClick(idx)}
                >
                  <span
                    className={`h-1 rounded-full transition-all duration-300 ${
                      isActive ? 'w-6 bg-royal-blue' : 'w-2 bg-[#BDE8F5]'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Content Ref container */}
          {displaySlides.length > activeIndex && (
            <div ref={textContainerRef} className="space-y-4 max-w-md my-auto">
              <p className="font-sans text-xs font-bold tracking-widest text-royal-blue uppercase">
                {displaySlides[activeIndex].tagline}
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl text-navy-deep font-bold leading-tight">
                {displaySlides[activeIndex].name}
              </h2>
              <p className="font-sans text-sm text-muted-gray leading-relaxed pt-2">
                {displaySlides[activeIndex].description}
              </p>
              <div className="pt-3">
                <span className="font-sans text-xs text-muted-gray tracking-wider uppercase block">ESTIMATED PRICE</span>
                <span className="font-sans text-xl font-bold text-navy-deep">
                  From {displaySlides[activeIndex].price}
                </span>
              </div>
              <div className="pt-6">
                <Link
                  to={displaySlides[activeIndex].link}
                  className="inline-block bg-navy-deep text-white font-sans text-xs uppercase tracking-wide font-semibold px-8 py-3.5 rounded-full hover:bg-royal-blue hover:text-white transition-luxury shadow-md"
                >
                  SHOP THE COLLECTION →
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    );
};

export default HeroCarousel;
