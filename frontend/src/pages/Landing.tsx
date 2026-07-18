import React from 'react';
import { HeroCarousel } from '../components/HeroCarousel';
import { TrendingGrid } from '../components/TrendingGrid';
import HeroBlanket from '../components/HeroBlanket';

export const Landing: React.FC = () => {
  return (
    <main className="flex-1 bg-white relative">
      {/* 1. Portal-mounted HeroBlanket overlay */}
      <HeroBlanket />

      {/* 2. Hero Carousel Split Layout */}
      <div className="hero-container relative z-40 w-full">
        <HeroCarousel />
      </div>

      {/* 3. Featured Bedding Grid */}
      <div className="relative z-30 w-full bg-white">
        <TrendingGrid />
      </div>
    </main>
  );
};

export default Landing;
