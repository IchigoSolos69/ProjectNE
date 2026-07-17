import React from 'react';
import { HeroCarousel } from '../components/HeroCarousel';
import { TrendingGrid } from '../components/TrendingGrid';

export const Landing: React.FC = () => {
  return (
    <main className="flex-1 bg-white">
      {/* 1. Hero Carousel Split Layout with reveal overlay */}
      <HeroCarousel />

      {/* 2. Curator-Selected Trending Bedding Grid */}
      <TrendingGrid />
    </main>
  );
};
export default Landing;
