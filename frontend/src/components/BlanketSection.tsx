import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronDown } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface BlanketSectionProps {
  heroRef: React.RefObject<HTMLElement>;
}

export const BlanketSection: React.FC<BlanketSectionProps> = React.memo(({ heroRef }) => {
  const blanketRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!heroRef.current || !blanketRef.current) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return; // Scroll naturally on reduced-motion profiles

    // Pin the Hero container while the Blanket scrolls naturally over it in normal flow
    ScrollTrigger.create({
      trigger: heroRef.current,
      start: 'top top',
      end: '+=100%',
      pin: true,
      pinSpacing: false,
      invalidateOnRefresh: true,
    });
  }, { scope: blanketRef, dependencies: [heroRef] });

  return (
    <div
      ref={blanketRef}
      className="relative w-full flex flex-col items-center justify-center select-none overflow-hidden"
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
  );
});

export default BlanketSection;
