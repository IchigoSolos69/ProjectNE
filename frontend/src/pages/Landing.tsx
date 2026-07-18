import React from 'react';
import { HeroCarousel } from '../components/HeroCarousel';
import { BlanketRevealSection } from '../components/BlanketRevealSection';

export const Landing: React.FC = () => {
  return (
    <main className="flex-1 bg-white">
      {/* 1. Hero Carousel Split Layout */}
      <HeroCarousel />

      {/* 2. Blanket Reveal Overlay with Trending Bedding Grid */}
      <BlanketRevealSection />
    </main>
  );
};
export default Landing;
