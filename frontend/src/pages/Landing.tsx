import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { HeroCarousel } from '../components/HeroCarousel';
import { TrendingGrid } from '../components/TrendingGrid';
import HeroBlanket from '../components/HeroBlanket';

export const Landing: React.FC = () => {
  const [heroNode, setHeroNode] = useState<HTMLDivElement | null>(null);

  return (
    <main className="flex-1 bg-white relative">
      <Helmet>
        <title>RareComforts | Premium Egyptian Cotton & Bedding</title>
        <meta name="description" content="Shop premium Egyptian cotton and satin bedding — bedsheets, comforters, cushion covers, towels, and door mats crafted for restorative sleep. Free shipping across India." />
        <meta property="og:title" content="RareComforts | Premium Egyptian Cotton & Bedding" />
        <meta property="og:description" content="Shop premium Egyptian cotton and satin bedding — bedsheets, comforters, cushion covers, towels, and door mats crafted for restorative sleep." />
        <meta property="og:image" content="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      {/* 1. Portal-mounted HeroBlanket overlay */}
      <HeroBlanket heroNode={heroNode} />

      {/* 2. Hero Carousel Split Layout */}
      <div ref={setHeroNode} className="hero-container relative z-10 w-full">
        <HeroCarousel />
      </div>

      {/* 3. Featured Bedding Grid */}
      <div id="featured-section" className="relative z-20 w-full bg-white">
        <TrendingGrid />
      </div>
    </main>
  );
};

export default Landing;
