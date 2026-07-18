import React, { useRef } from 'react';
import { createPortal } from 'react-dom';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronDown } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface HeroBlanketProps {
  heroNode: HTMLElement | null;
}

export const HeroBlanket: React.FC<HeroBlanketProps> = React.memo(({ heroNode }) => {
  const blanketRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!blanketRef.current || !heroNode) return;

    // The curtain starts fully covering the hero
    gsap.set(blanketRef.current, { yPercent: 0 });

    ScrollTrigger.create({
      trigger: heroNode,               // Pinned hero container
      endTrigger: '#featured-section', // Syncs ending exactly at the start of featured section
      start: 'top top',
      end: 'top top',
      scrub: true,
      pin: true,                       // Pin the hero content while the blanket slides up
      animation: gsap.to(blanketRef.current, { yPercent: -100, ease: 'none' }), // Pure translation, NO opacity changes
    });
  }, { dependencies: [heroNode] });

  const premiumPhrases = [
    "100% Pure Long-Staple Cotton",
    "Cloud-Like Softness",
    "Ethically Sourced & Woven",
    "Breathable All-Season Comfort",
    "Oeko-Tex® Certified"
  ];

  return createPortal(
    <div
      ref={blanketRef}
      className="fixed left-0 right-0 bottom-0 z-30 pointer-events-none select-none overflow-hidden"
      style={{
        height: 'calc(100vh + 120px)',
        borderRadius: '48px 48px 0 0',
        backgroundColor: '#0F2854', // Solid Navy Deep background
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cpath d='M30 0 L60 30 L30 60 L0 30 Z' fill='none' stroke='%231C4D8D' stroke-width='1' stroke-opacity='0.12'/%3E%3Ccircle cx='30' cy='30' r='3' fill='%231C4D8D' fill-opacity='0.12'/%3E%3C/svg%3E")`, // Low-contrast quatrefoil tiled pattern
        willChange: 'transform',
        boxShadow: '0 -20px 40px -10px rgba(15, 40, 84, 0.3)',
      }}
    >
      {/* Visible Viewport Content Area (Offset below the 120px rounded top) */}
      <div className="absolute inset-x-0 bottom-0 top-[120px] flex flex-col items-center justify-center gap-12 p-8">
        
        {/* Typographic Header */}
        <div className="text-center space-y-3">
          <h3 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white font-medium tracking-tight">
            Woven for stillness.
          </h3>
          <p className="font-serif text-xl sm:text-2xl md:text-3xl text-[#BDE8F5] font-light italic">
            The weight of real rest.
          </p>
        </div>

        {/* Static Premium Cotton Phrases Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-8 max-w-6xl w-full px-6 text-center mt-4">
          {premiumPhrases.map((phrase, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center justify-center space-y-4 py-3 md:py-0 border-b border-[#BDE8F5]/10 md:border-b-0 last:border-b-0"
            >
              <p className="font-serif text-base sm:text-lg md:text-xl text-[#BDE8F5] font-light leading-relaxed">
                {phrase}
              </p>
              <div className="h-1 w-6 bg-[#4988C4]/40 mt-1 md:block hidden rounded-full" />
            </div>
          ))}
        </div>

        {/* Small Branding Badge */}
        <span className="font-sans text-[10px] tracking-[0.25em] text-[#BDE8F5]/40 uppercase mt-4">
          RareComforts · Premium Bedding
        </span>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#BDE8F5]/40 font-sans text-[10px] tracking-[0.18em] uppercase">
          <span>Scroll to reveal</span>
          <ChevronDown className="w-4 h-4 animate-bounce text-[#BDE8F5]/60" />
        </div>
      </div>

      {/* Accent edges stripe */}
      <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-[#BDE8F5] via-[#4988C4] to-[#1C4D8D] rounded-t-full" />
    </div>,
    document.body
  );
});

export default HeroBlanket;
