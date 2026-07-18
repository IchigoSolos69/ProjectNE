import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronDown } from 'lucide-react';
import { TrendingGrid } from './TrendingGrid';

gsap.registerPlugin(ScrollTrigger);

export const BlanketRevealSection: React.FC = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const blanketRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!wrapperRef.current || !blanketRef.current) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      // Hide the blanket immediately without motion
      gsap.set(blanketRef.current, { display: 'none' });
      return;
    }

    // Pin the relative wrapper and slide the absolute blanket up
    gsap.to(blanketRef.current, {
      yPercent: -100,
      ease: 'none',
      scrollTrigger: {
        trigger: wrapperRef.current,
        start: 'top top',
        end: '+=100%',
        pin: true,
        scrub: true,
        invalidateOnRefresh: true,
      },
    });
  }, { scope: wrapperRef });

  return (
    <div ref={wrapperRef} className="relative w-full overflow-hidden">
      {/* 1. The Blanket Overlay (covers the viewport inside pinned wrapper) */}
      <div
        ref={blanketRef}
        className="absolute inset-0 z-30 flex flex-col items-center justify-center select-none"
        style={{ height: '100vh', width: '100%' }}
        aria-hidden="true"
      >
        {/* Navy base with premium checkered texture pattern */}
        <div className="absolute inset-0 bg-[#0F2854] z-0" />
        
        {/* Woven diagonal stripe overlay */}
        <div
          className="absolute inset-0 z-10"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 18px,
              rgba(28, 77, 141, 0.45) 18px,
              rgba(28, 77, 141, 0.45) 36px
            )`,
          }}
        />
        
        {/* Cross-weave accent */}
        <div
          className="absolute inset-0 z-10"
          style={{
            backgroundImage: `repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 22px,
              rgba(73, 136, 196, 0.15) 22px,
              rgba(73, 136, 196, 0.15) 44px
            )`,
          }}
        />

        {/* Centered brand text */}
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 p-8">
          <h3 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white font-medium text-center tracking-tight leading-tight">
            Woven for stillness.
          </h3>
          <p className="font-serif text-2xl sm:text-3xl md:text-4xl text-[#BDE8F5] font-light italic text-center leading-relaxed">
            The weight of real rest.
          </p>
          <span className="font-sans text-[10px] tracking-[0.2em] text-[#BDE8F5]/50 uppercase mt-4">
            RareComforts · Premium Bedding
          </span>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 text-[#BDE8F5]/60 font-sans text-[10px] tracking-[0.18em] uppercase">
          <span>Scroll to reveal</span>
          <ChevronDown className="w-4 h-4 animate-bounce text-[#BDE8F5]/80" />
        </div>

        {/* Accent edges stripes */}
        <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-[#BDE8F5] via-[#4988C4] to-[#1C4D8D]" />
        <div className="absolute bottom-0 left-0 right-0 h-[4px] bg-gradient-to-r from-[#1C4D8D] via-[#4988C4] to-[#BDE8F5]" />
      </div>

      {/* 2. The Featured Section Content (revealed as blanket slides up) */}
      <div className="relative z-10 w-full min-h-screen">
        <TrendingGrid />
      </div>
    </div>
  );
};

export default BlanketRevealSection;
