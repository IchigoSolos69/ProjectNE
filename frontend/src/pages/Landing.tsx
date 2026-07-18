import React, { useRef } from 'react';
import { HeroCarousel } from '../components/HeroCarousel';
import { TrendingGrid } from '../components/TrendingGrid';
import HeroBlanket from '../components/HeroBlanket';

export const Landing: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);

  return (
    <main className="flex-1 bg-white relative">
      {/* 1. Portal-mounted HeroBlanket overlay */}
      <HeroBlanket heroRef={heroRef} />

      {/* 2. Hero Carousel Split Layout */}
      <div ref={heroRef} className="hero-container relative z-10 w-full">
        <HeroCarousel />
      </div>

      {/* 3. Featured Bedding Grid */}
      <div className="relative z-20 w-full bg-white">
        <TrendingGrid />
      </div>
    </main>
  );
};

export default Landing;
