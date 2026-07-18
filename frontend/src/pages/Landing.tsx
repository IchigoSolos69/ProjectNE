import React, { useRef } from 'react';
import { HeroCarousel } from '../components/HeroCarousel';
import { BlanketSection } from '../components/BlanketSection';
import { TrendingGrid } from '../components/TrendingGrid';

export const Landing: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);

  return (
    <main className="flex-1 bg-white relative">
      {/* 1. Hero Carousel Split Layout */}
      <div ref={heroRef} className="relative z-10 w-full">
        <HeroCarousel />
      </div>

      {/* 2. Checkered Blanket Section (slides up over the pinned Hero) */}
      <div className="relative z-30 w-full shadow-2xl">
        <BlanketSection heroRef={heroRef} />
      </div>

      {/* 3. Featured Bedding Grid */}
      <div className="relative z-20 w-full bg-white">
        <TrendingGrid />
      </div>
    </main>
  );
};

export default Landing;
