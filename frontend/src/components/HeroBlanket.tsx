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

    // Start fully hidden below the viewport
    gsap.set(blanketRef.current, { yPercent: 100 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: heroNode,
        start: 'bottom bottom',   // begins right as the hero's bottom edge reaches the viewport's bottom edge
        end: '+=200%',            // two viewport-heights of scroll for the full cover-then-exit motion
        scrub: true,
      },
    });

    tl.to(blanketRef.current, { yPercent: 0, ease: 'none' })   // phase 1: rises up to fully cover
      .to(blanketRef.current, { yPercent: -100, opacity: 0, ease: 'none' }); // phase 2: continues rising, exits off-screen top & fades
  }, { dependencies: [heroNode] });

  return createPortal(
    <>
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-marquee-loop {
          display: inline-block;
          animation: marquee 18s linear infinite;
        }
      `}</style>
      
      <div
        ref={blanketRef}
        className="fixed left-0 right-0 bottom-0 z-30 pointer-events-none select-none overflow-hidden"
        style={{
          height: 'calc(100vh + 120px)',
          borderRadius: '48px 48px 0 0',
          backgroundColor: '#BDE8F5',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cpath d='M30 0 L60 30 L30 60 L0 30 Z' fill='none' stroke='%230F2854' stroke-width='1' stroke-opacity='0.08'/%3E%3Ccircle cx='30' cy='30' r='3' fill='%230F2854' fill-opacity='0.08'/%3E%3C/svg%3E")`,
          willChange: 'transform, opacity',
          boxShadow: '0 -20px 40px -10px rgba(15, 40, 84, 0.15)',
        }}
      >
        {/* Visible Viewport Content Area (Offset below the 120px rounded top) */}
        <div className="absolute inset-x-0 bottom-0 top-[120px] flex flex-col items-center justify-center gap-8">
          
          {/* Marquee Ticker */}
          <div className="w-full overflow-hidden whitespace-nowrap py-6 border-y border-[#0F2854]/15">
            <div className="animate-marquee-loop whitespace-nowrap font-serif font-bold text-[#0F2854] text-xl sm:text-2xl md:text-3xl lg:text-4xl tracking-widest uppercase">
              EXQUISITELY WOVEN &nbsp;&nbsp;•&nbsp;&nbsp; ETHICALLY SOURCED &nbsp;&nbsp;•&nbsp;&nbsp;
              EXQUISITELY WOVEN &nbsp;&nbsp;•&nbsp;&nbsp; ETHICALLY SOURCED &nbsp;&nbsp;•&nbsp;&nbsp;
            </div>
          </div>

          {/* Small Branding Badge */}
          <span className="font-sans text-[10px] tracking-[0.25em] text-[#0F2854]/60 uppercase">
            RareComforts · Premium Bedding
          </span>

          {/* Scroll Indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#0F2854]/60 font-sans text-[10px] tracking-[0.18em] uppercase">
            <span>Scroll to reveal</span>
            <ChevronDown className="w-4 h-4 animate-bounce text-[#0F2854]/80" />
          </div>
        </div>

        {/* Accent edges stripe */}
        <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-[#BDE8F5] via-[#4988C4] to-[#1C4D8D] rounded-t-full" />
      </div>
    </>,
    document.body
  );
});

export default HeroBlanket;
