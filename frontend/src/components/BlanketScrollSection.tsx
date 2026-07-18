import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronDown } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export const BlanketScrollSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Layer refs
  const blanketContainerRef = useRef<HTMLDivElement>(null);
  const blanketBaseRef = useRef<HTMLDivElement>(null);
  const blanketTopRef = useRef<HTMLDivElement>(null);
  
  // Text refs
  const text1Ref = useRef<HTMLDivElement>(null);
  const text2Ref = useRef<HTMLDivElement>(null);
  const text3Ref = useRef<HTMLDivElement>(null);
  const text4Ref = useRef<HTMLDivElement>(null);
  const text5Ref = useRef<HTMLDivElement>(null);
  
  // Indicator ref
  const indicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      if (!containerRef.current || !blanketContainerRef.current) return;

      const isMobile = window.innerWidth < 768;
      const pinDistance = isMobile ? '+=120%' : '+=200%';

      // 1. Create Pinned Scrub Timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: pinDistance,
          pin: true,
          scrub: 1.5, // Physical weighted scrub lag
          invalidateOnRefresh: true,
        },
      });

      // Fade out scroll indicator immediately upon scroll
      tl.to(indicatorRef.current, { opacity: 0, duration: 0.1 }, 0);

      // 2. Animate Background Color: Navy (#0F2854) to Ice Blue (#BDE8F5)
      tl.fromTo(
        containerRef.current,
        { backgroundColor: '#0F2854' },
        { backgroundColor: '#BDE8F5', ease: 'power1.inOut', duration: 1.0 },
        0
      );

      // 3. Unfurl the blanket container (scale Y and X)
      // origin-bottom is set in styles so it expands upward
      tl.fromTo(
        blanketContainerRef.current,
        {
          scaleY: 0.15,
          scaleX: 0.6,
        },
        {
          scaleY: 1.0,
          scaleX: 1.0,
          ease: 'power2.inOut',
          duration: 1.0,
        },
        0
      );

      // Gentle skew wobble settling to 0
      tl.fromTo(
        blanketContainerRef.current,
        { skewX: 0 },
        {
          keyframes: [
            { skewX: 5, duration: 0.25, ease: 'sine.inOut' },
            { skewX: -4, duration: 0.25, ease: 'sine.inOut' },
            { skewX: 2, duration: 0.25, ease: 'sine.inOut' },
            { skewX: 0, duration: 0.25, ease: 'sine.out' }
          ],
        },
        0
      );

      // Animate secondary lagging fabric layer to create folds separation
      if (blanketTopRef.current) {
        tl.fromTo(
          blanketTopRef.current,
          {
            y: '20%',
            scaleY: 0.85,
            opacity: 0.9,
          },
          {
            y: '0%',
            scaleY: 1.0,
            opacity: 1,
            ease: 'power1.out',
            duration: 0.95,
          },
          0.05 // slightly delayed start
        );
      }

      // 4. Parallax Floating Phrases Animations
      // Phrase 1: top-left
      tl.fromTo(text1Ref.current, { opacity: 0, y: 40 }, { opacity: 1, y: -20, duration: 0.25 }, 0.08)
        .to(text1Ref.current, { opacity: 0, y: -50, duration: 0.2 }, 0.35);

      // Phrase 2: middle-right
      tl.fromTo(text2Ref.current, { opacity: 0, y: 50 }, { opacity: 1, y: -30, duration: 0.25 }, 0.22)
        .to(text2Ref.current, { opacity: 0, y: -60, duration: 0.2 }, 0.5);

      // Phrase 3: bottom-left
      tl.fromTo(text3Ref.current, { opacity: 0, y: 45 }, { opacity: 1, y: -25, duration: 0.25 }, 0.38)
        .to(text3Ref.current, { opacity: 0, y: -55, duration: 0.2 }, 0.65);

      // Phrase 4: center-left
      tl.fromTo(text4Ref.current, { opacity: 0, y: 55 }, { opacity: 1, y: -35, duration: 0.25 }, 0.52)
        .to(text4Ref.current, { opacity: 0, y: -70, duration: 0.2 }, 0.8);

      // Phrase 5: bottom-right
      tl.fromTo(text5Ref.current, { opacity: 0, y: 40 }, { opacity: 1, y: -40, duration: 0.25 }, 0.68)
        .to(text5Ref.current, { opacity: 0, y: -80, duration: 0.2 }, 0.95);

    }, containerRef);

    // Sync scroll layout
    ScrollTrigger.refresh();

    return () => ctx.revert();
  }, []);

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Statically show fully unfurled layout for users preferring reduced motion
  if (prefersReducedMotion) {
    return (
      <div className="relative w-full min-h-screen bg-[#BDE8F5] flex flex-col items-center justify-end overflow-hidden py-16 px-6">
        <div className="text-center space-y-4 max-w-xl mb-12">
          <h2 className="font-serif text-3xl md:text-5xl text-navy-deep font-bold leading-tight">
            Woven for stillness.
          </h2>
          <p className="font-sans text-sm text-muted-gray leading-relaxed">
            Thread by thread, night by night. Experience the weight of real rest crafted to last a lifetime of mornings.
          </p>
        </div>
        <div className="w-full max-w-4xl h-[50vh] relative rounded-t-[4rem] overflow-hidden shadow-xl bg-[#1C4D8D]">
          <div className="absolute inset-0 w-full h-full bg-[#1C4D8D] flex items-center justify-center">
            <svg viewBox="0 0 800 600" preserveAspectRatio="none" className="w-full h-full opacity-60">
              <defs>
                <pattern id="reduced-pattern" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                  <line x1="0" y1="0" x2="0" y2="20" stroke="#0F2854" strokeWidth="2" opacity="0.15" />
                  <line x1="0" y1="0" x2="20" y2="0" stroke="#0F2854" strokeWidth="2" opacity="0.15" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#reduced-pattern)" />
            </svg>
            <span className="font-serif italic text-white/80 text-lg absolute bottom-8">RareComforts</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden flex items-center justify-center transition-colors duration-700 bg-[#0F2854] select-none"
    >
      {/* 2D GRAPHIC BLANKET CANVAS CONTAINER */}
      <div
        ref={blanketContainerRef}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[75vh] md:h-[80vh] flex flex-col justify-end origin-bottom z-10"
        style={{ willChange: 'transform' }}
      >
        {/* Layer 1: Base Blanket layer */}
        <div
          ref={blanketBaseRef}
          className="absolute inset-0 w-full h-full bg-[#1C4D8D] rounded-t-[3rem] md:rounded-t-[6rem] overflow-hidden shadow-2xl flex items-end justify-center"
        >
          <svg viewBox="0 0 800 600" preserveAspectRatio="none" className="w-full h-full absolute inset-0">
            <defs>
              <pattern id="fabric-stripe" width="24" height="24" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="24" stroke="#0F2854" strokeWidth="2.5" opacity="0.18" />
                <line x1="0" y1="0" x2="24" y2="0" stroke="#0F2854" strokeWidth="2.5" opacity="0.18" />
              </pattern>
            </defs>
            {/* Draw layered textile shadows */}
            <rect width="100%" height="100%" fill="url(#fabric-stripe)" />
            <path d="M 100 600 C 100 200, 200 100, 400 100 C 600 100, 700 200, 700 600" fill="none" stroke="#4988C4" strokeWidth="8" opacity="0.3" />
            <path d="M 220 600 C 220 320, 280 200, 400 200 C 520 200, 580 320, 580 600" fill="none" stroke="#BDE8F5" strokeWidth="4" opacity="0.25" />
          </svg>
        </div>

        {/* Layer 2: Top Overlaid Fold layer (lags slightly for depth) */}
        <div
          ref={blanketTopRef}
          className="absolute inset-x-4 top-12 bottom-0 bg-[#4988C4] rounded-t-[2.5rem] md:rounded-t-[5.5rem] overflow-hidden shadow-lg border-t border-white/10"
          style={{ willChange: 'transform, opacity' }}
        >
          <svg viewBox="0 0 800 600" preserveAspectRatio="none" className="w-full h-full absolute inset-0">
            <rect width="100%" height="100%" fill="url(#fabric-stripe)" />
            <path d="M 150 600 C 150 250, 220 140, 400 140 C 580 140, 650 250, 650 600" fill="none" stroke="#BDE8F5" strokeWidth="6" opacity="0.45" />
          </svg>
          <div className="absolute bottom-6 left-6 font-serif italic text-[#BDE8F5]/80 text-sm md:text-base tracking-wide z-10">
            RareComforts
          </div>
        </div>
      </div>

      {/* FLOATING TEXT LAYER (Z-index 20 keeps it above fabric layers) */}
      <div className="absolute inset-0 z-20 pointer-events-none p-6 sm:p-16 flex flex-col justify-between">
        
        {/* Phrase 1: Top Left */}
        <div
          ref={text1Ref}
          className="absolute top-[18%] left-[8%] max-w-xs md:max-w-md opacity-0"
        >
          <h3 className="font-serif text-2xl md:text-[2.8rem] text-white font-medium leading-tight">
            Woven for stillness.
          </h3>
        </div>

        {/* Phrase 2: Middle Right */}
        <div
          ref={text2Ref}
          className="absolute top-[32%] right-[10%] max-w-xs md:max-w-md text-right opacity-0"
        >
          <h3 className="font-serif text-2xl md:text-[2.8rem] text-[#BDE8F5] font-medium leading-tight">
            The weight of real rest.
          </h3>
        </div>

        {/* Phrase 3: Bottom Left */}
        <div
          ref={text3Ref}
          className="absolute bottom-[36%] left-[6%] max-w-xs md:max-w-md opacity-0"
        >
          <h3 className="font-serif text-2xl md:text-[2.8rem] text-white font-medium leading-tight">
            Thread by thread, night by night.
          </h3>
        </div>

        {/* Phrase 4: Center Left */}
        <div
          ref={text4Ref}
          className="absolute top-[52%] left-[12%] max-w-xs md:max-w-md opacity-0"
        >
          <h3 className="font-serif text-2xl md:text-[2.8rem] text-[#BDE8F5] font-medium leading-tight">
            Egyptian fields. Your bedroom.
          </h3>
        </div>

        {/* Phrase 5: Bottom Right */}
        <div
          ref={text5Ref}
          className="absolute bottom-[16%] right-[8%] max-w-xs md:max-w-md text-right opacity-0"
        >
          <h3 className="font-serif text-2xl md:text-[2.8rem] text-white font-medium leading-tight">
            Crafted to last a lifetime of mornings.
          </h3>
        </div>
      </div>

      {/* DYNAMIC SCROLL DOWN INDICATOR */}
      <div
        ref={indicatorRef}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 text-[#BDE8F5] text-[10px] font-sans tracking-widest uppercase flex flex-col items-center gap-1.5 transition-all duration-300"
      >
        <span>SCROLL DOWN TO UNFURL</span>
        <ChevronDown className="w-4 h-4 animate-bounce text-[#BDE8F5]" />
      </div>
    </div>
  );
};

export default BlanketScrollSection;
