import React, { useRef } from 'react';
import { createPortal } from 'react-dom';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronDown } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface HeroBlanketProps {
  heroRef: React.RefObject<HTMLElement>;
}

export const HeroBlanket: React.FC<HeroBlanketProps> = React.memo(({ heroRef }) => {
  const blanketRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!blanketRef.current || !heroRef.current) return;

    // Start fully hidden below the viewport
    gsap.set(blanketRef.current, { yPercent: 100, opacity: 1 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: heroRef.current,
        start: 'bottom bottom', // begins right as the hero's bottom edge reaches the viewport's bottom edge
        end: '+=200%',          // two viewport-heights of scroll for the full cover-then-exit motion
        scrub: true,
      },
    });

    tl.to(blanketRef.current, { yPercent: 0, ease: 'none' })   // Phase 1: rises up to fully cover
      .to(blanketRef.current, { yPercent: -100, opacity: 0, ease: 'none' }); // Phase 2: continues rising, exits off-screen top & fades
  }, { dependencies: [heroRef] });

  return createPortal(
    <div
      ref={blanketRef}
      className="fixed inset-0 z-30 pointer-events-none flex flex-col items-center justify-center select-none overflow-hidden"
      style={{ willChange: 'transform, opacity' }}
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
    </div>,
    document.body
  );
});

export default HeroBlanket;
