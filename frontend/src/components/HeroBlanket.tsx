import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const COTTON_PHRASES = [
  "100% Pure Long-Staple Cotton",
  "Cloud-Like Softness",
  "Ethically Sourced & Woven",
  "Breathable All-Season Comfort",
  "Oeko-Tex® Certified"
];

interface HeroBlanketProps {
  heroNode: HTMLElement | null;
}

export const HeroBlanket: React.FC<HeroBlanketProps> = React.memo(({ heroNode }) => {
  const blanketRef = useRef<HTMLDivElement>(null);
  const [selectedPhrase, setSelectedPhrase] = useState('');

  // Choose a random premium cotton phrase on mount
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * COTTON_PHRASES.length);
    setSelectedPhrase(COTTON_PHRASES[randomIndex]);
  }, []);

  useGSAP(() => {
    if (!blanketRef.current || !heroNode) return;

    // Start fully hidden below the viewport
    gsap.set(blanketRef.current, { yPercent: 100, opacity: 1 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: heroNode,
        start: 'bottom bottom',   // begins right as the hero's bottom edge reaches the viewport's bottom edge
        end: '+=100%',            // exactly one viewport height of scroll
        scrub: true,
        invalidateOnRefresh: true,
      },
    });

    tl.to(blanketRef.current, { yPercent: 0, ease: 'none' })   // phase 1: rises up to fully cover
      .to(blanketRef.current, { yPercent: -100, opacity: 0, ease: 'none' }); // phase 2: continues rising, exits off-screen top & fades
  }, { dependencies: [heroNode] });

  return createPortal(
    <div
      ref={blanketRef}
      className="fixed left-0 right-0 bottom-0 z-30 pointer-events-none select-none overflow-hidden"
      style={{
        height: 'calc(100vh + 120px)',
        borderRadius: '48px 48px 0 0',
        backgroundColor: '#0F2854', // Solid Navy Deep background
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cpath d='M30 0 L60 30 L30 60 L0 30 Z' fill='none' stroke='%231C4D8D' stroke-width='1' stroke-opacity='0.12'/%3E%3Ccircle cx='30' cy='30' r='3' fill='%231C4D8D' fill-opacity='0.12'/%3E%3C/svg%3E")`, // Tone-on-tone Royal Blue pattern
        willChange: 'transform, opacity',
      }}
    >
      {/* Visible Viewport Content Area (Offset below the 120px rounded top) */}
      <div className="absolute inset-x-0 bottom-0 top-[120px] flex flex-col items-center justify-center p-8 text-center">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-8">
          <span className="font-sans text-[11px] tracking-[0.3em] text-[#BDE8F5]/50 uppercase">
            RareComforts · Premium Cotton
          </span>

          {/* Main static, elegant typography banner showing the random phrase */}
          <h2 className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-[#BDE8F5] font-light tracking-tight leading-tight my-2 max-w-3xl">
            {selectedPhrase}
          </h2>

          <div className="w-24 h-[1px] bg-[#BDE8F5]/30 my-2" />

          {/* Responsive static metadata layout */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-12 text-[#BDE8F5]/70 font-sans text-xs tracking-[0.2em] uppercase select-none mt-2">
            <div className="flex flex-col items-center gap-1">
              <span className="text-[10px] text-[#BDE8F5]/40 font-light">Material</span>
              <span className="font-semibold">Long-Staple Cotton</span>
            </div>
            <div className="flex flex-col items-center gap-1 border-t sm:border-t-0 sm:border-x border-[#BDE8F5]/15 pt-4 sm:pt-0 sm:px-12">
              <span className="text-[10px] text-[#BDE8F5]/40 font-light">Origin</span>
              <span className="font-semibold">Ethically Woven</span>
            </div>
            <div className="flex flex-col items-center gap-1 pt-4 sm:pt-0">
              <span className="text-[10px] text-[#BDE8F5]/40 font-light">Certification</span>
              <span className="font-semibold">Oeko-Tex® Certified</span>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
});

export default HeroBlanket;
