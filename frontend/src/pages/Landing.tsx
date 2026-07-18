import React from 'react';
import { HeroCarousel } from '../components/HeroCarousel';
import { BlanketScrollSection } from '../components/BlanketScrollSection';
import { TrendingGrid } from '../components/TrendingGrid';

export const Landing: React.FC = () => {
  return (
    <main className="flex-1 bg-white">
      {/* 1. Hero Carousel Split Layout */}
      <HeroCarousel />

      {/* 2. Signature Blanket Scrub Unfurling Section */}
      <BlanketScrollSection />

      {/* 3. Curator-Selected Trending Bedding Grid */}
      <TrendingGrid />
    </main>
  );
};
export default Landing;
