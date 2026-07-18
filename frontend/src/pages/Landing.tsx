import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { HeroCarousel } from '../components/HeroCarousel';
import { BlanketSection } from '../components/BlanketSection';
import { TrendingGrid } from '../components/TrendingGrid';

gsap.registerPlugin(ScrollTrigger);

export const Landing: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const blanketRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!heroRef.current || !blanketRef.current) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return; // Let it scroll naturally on reduced-motion profiles

    // Pin the Hero container, let the Blanket scroll natively over it
    ScrollTrigger.create({
      trigger: heroRef.current,
      start: 'top top',
      end: '+=100%',
      pin: true,
      pinSpacing: false,
      invalidateOnRefresh: true,
    });
  }, []);

  return (
    <main className="flex-1 bg-white relative">
      {/* 1. Hero Carousel Split Layout */}
      <div ref={heroRef} className="relative z-10 w-full">
        <HeroCarousel />
      </div>

      {/* 2. Checkered Blanket Section (slides up over the pinned Hero) */}
      <div ref={blanketRef} className="relative z-30 w-full shadow-2xl">
        <BlanketSection />
      </div>

      {/* 3. Featured Bedding Grid */}
      <div className="relative z-20 w-full bg-white">
        <TrendingGrid />
      </div>
    </main>
  );
};

export default Landing;
