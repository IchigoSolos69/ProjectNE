"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Crown, ChevronLeft, ChevronRight } from "lucide-react";

interface EditorialSlide {
  id: string;
  category: string;
  title: string;
  description: string;
  image: string;
  href: string;
}

const SLIDES: EditorialSlide[] = [
  {
    id: "luxe-satin",
    category: "PREMIUM LINEN",
    title: "Egyptian Cotton satin",
    description:
      "Woven in a luminous 480-thread-count satin, this set drapes like liquid silk—buttery against the skin, with a subtle sheen that elevates every bedroom into a sanctuary of quiet luxury.",
    image:
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1600&q=80",
    href: "/products/luxe-satin-sheet-set",
  },
  {
    id: "damask-rose",
    category: "SIGNATURE WEAVE",
    title: "Damask Rose Set",
    description:
      "A jacquard-woven masterpiece in blush and ivory tones. The intricate damask pattern catches light with every fold, offering hotel-grade opulence and breathable comfort night after night.",
    image:
      "https://images.unsplash.com/photo-1616627561839-074385245ff6?auto=format&fit=crop&w=1600&q=80",
    href: "/products/classic-percale-core-set",
  },
  {
    id: "organic-linen",
    category: "EUROPEAN FLAX",
    title: "Organic Linen Core",
    description:
      "Garment-washed French and Belgian flax, naturally moisture-wicking and endlessly breathable. Relaxed texture, effortless drape—a lived-in elegance that only grows softer with time.",
    image:
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1600&q=80",
    href: "/products/organic-linen-core-set",
  },
  {
    id: "cloud-quilt",
    category: "LAYERED COMFORT",
    title: "Cloud Cotton Quilt",
    description:
      "Four layers of Turkish Aegean gauze create a weightless, lofted warmth. Textured, crinkled, and impossibly soft—the perfect finishing layer for a bed that feels like a cloud.",
    image:
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1600&q=80",
    href: "/products/cloud-cotton-quilt",
  },
];

const AUTOPLAY_MS = 6000;

export default function EditorialSlider() {
  const [activeIndex, setActiveIndex] = useState(0);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null);

  const goToSlide = (index: number) => {
    const targetIndex = (index + SLIDES.length) % SLIDES.length;
    setActiveIndex(targetIndex);

    // Scroll image track to corresponding index on mobile viewports
    if (imageContainerRef.current) {
      const container = imageContainerRef.current;
      const width = container.offsetWidth;
      container.scrollTo({
        left: targetIndex * width,
        behavior: "smooth",
      });
    }
  };

  const goNext = () => goToSlide(activeIndex + 1);
  const goPrev = () => goToSlide(activeIndex - 1);

  // Synchronize swiping scroll positions with active state indices on touch devices
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (window.innerWidth >= 1024) return; // Only process mobile touch-swipes
    const container = e.currentTarget;
    const scrollLeft = container.scrollLeft;
    const width = container.offsetWidth;
    if (width > 0) {
      const newIndex = Math.round(scrollLeft / width);
      if (newIndex !== activeIndex && newIndex >= 0 && newIndex < SLIDES.length) {
        setActiveIndex(newIndex);
      }
    }
  };

  // Autoplay cycle configuration
  useEffect(() => {
    autoplayTimerRef.current = setInterval(() => {
      // Don't auto-scroll if user is currently swiping on mobile
      if (window.innerWidth < 1024) return;
      goToSlide((activeIndex + 1) % SLIDES.length);
    }, AUTOPLAY_MS);

    return () => {
      if (autoplayTimerRef.current) {
        clearInterval(autoplayTimerRef.current);
      }
    };
  }, [activeIndex]);

  // Adjust scroll positions on browser resize to avoid offset slide alignments
  useEffect(() => {
    const handleResize = () => {
      if (imageContainerRef.current && window.innerWidth < 1024) {
        const container = imageContainerRef.current;
        const width = container.offsetWidth;
        container.scrollLeft = activeIndex * width;
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [activeIndex]);

  return (
    <section
      className="relative w-full h-[100vh] lg:h-screen flex flex-col lg:flex-row overflow-hidden bg-brand-midnight"
      aria-roledescription="carousel"
      aria-label="Featured products"
    >
      {/* Image Panel (Left) — Native snap carousel on mobile, absolute crossfade on desktop */}
      <div
        ref={imageContainerRef}
        onScroll={handleScroll}
        className="relative w-full lg:w-1/2 h-[50vh] lg:h-full bg-neutral-900 flex lg:block overflow-x-auto lg:overflow-visible snap-x snap-mandatory scroll-smooth hide-scrollbar"
      >
        {SLIDES.map((s, index) => {
          const isActive = index === activeIndex;
          return (
            <div
              key={s.id}
              className={`w-full h-full shrink-0 snap-center relative lg:absolute lg:inset-0 transition-opacity duration-[1000ms] ease-[cubic-bezier(0.25,1,0.5,1)] ${
                isActive ? "opacity-100 z-10" : "opacity-100 lg:opacity-0 lg:z-0 lg:pointer-events-none"
              }`}
            >
              <Image
                src={s.image}
                alt={s.title}
                fill
                priority={index === 0}
                className="object-cover"
                sizes="(max-width: 1023px) 100vw, 50vw"
                unoptimized
              />
            </div>
          );
        })}

        {/* Prev Arrow — Hidden on mobile, visible on desktop */}
        <button
          type="button"
          onClick={goPrev}
          aria-label="Previous slide"
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-brand-midnight/50 hover:bg-brand-midnight/75 text-brand-sky backdrop-blur-sm active:scale-[0.9] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hidden lg:inline-flex cursor-pointer"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      </div>

      {/* Editorial Content Panel (Right) */}
      <div className="relative w-full lg:w-1/2 h-[50vh] lg:h-full bg-brand-midnight flex items-center justify-center">
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 sm:px-12 lg:px-16 py-8 lg:py-12 max-w-xl w-full">
          {SLIDES.map((s, index) => {
            const isActive = index === activeIndex;
            return (
              <div
                key={s.id}
                className={`flex flex-col items-center space-y-4 sm:space-y-6 transition-all duration-[800ms] ease-[cubic-bezier(0.25,1,0.5,1)] ${
                  isActive
                    ? "opacity-100 translate-y-0 scale-100 z-10 pointer-events-auto"
                    : "absolute opacity-0 translate-y-4 scale-95 z-0 pointer-events-none"
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <Crown className="h-4 w-4 text-brand-sky stroke-[1.5]" aria-hidden="true" />
                  <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.35em] text-brand-sky font-sans">
                    RARECOMFORTS
                  </span>
                </div>

                <span className="text-[10px] sm:text-xs font-medium uppercase tracking-[0.25em] text-brand-sky/70 font-sans">
                  {s.category}
                </span>

                <h2 className="font-serif text-3xl sm:text-4xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight">
                  {s.title}
                </h2>

                <p className="text-xs sm:text-sm lg:text-base text-brand-sky/90 leading-relaxed max-w-md font-sans">
                  {s.description}
                </p>

                <div>
                  <Link
                    href={s.href}
                    className="inline-flex items-center justify-center px-8 lg:px-10 py-3 lg:py-3.5 bg-brand-ocean hover:bg-brand-royal text-white text-xs font-semibold uppercase tracking-[0.2em] rounded-sm active:scale-[0.98] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] font-sans"
                  >
                    Shop Now
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Next Arrow — Hidden on mobile, visible on desktop */}
        <button
          type="button"
          onClick={goNext}
          aria-label="Next slide"
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-brand-ocean/80 hover:bg-brand-ocean text-white active:scale-[0.9] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hidden lg:inline-flex cursor-pointer"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Pagination Dashes */}
        <div
          className="absolute bottom-6 lg:bottom-10 left-0 right-0 flex items-center justify-center gap-2.5 z-20"
          role="tablist"
          aria-label="Slide navigation"
        >
          {SLIDES.map((s, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`Go to slide ${index + 1}: ${s.title}`}
                onClick={() => goToSlide(index)}
                className={`h-[2px] rounded-full transition-all duration-300 ${
                  isActive ? "w-10 bg-brand-sky opacity-100" : "w-6 bg-brand-sky opacity-35 hover:opacity-60"
                }`}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
