import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const BlanketScrollSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const blanketRef = useRef<HTMLDivElement>(null);
  const text1Ref = useRef<HTMLDivElement>(null);
  const text2Ref = useRef<HTMLDivElement>(null);
  const text3Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!containerRef.current || !blanketRef.current) return;

      // Check if user prefers reduced motion
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (prefersReducedMotion) {
        // Simple fade-in animation instead of pinning/scrubbing
        gsap.fromTo(blanketRef.current, { opacity: 0 }, { opacity: 1, duration: 1.5, scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 60%',
        }});
        return;
      }

      // Create Scrubbed Timeline for Unfurling
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '+=150%', // Scroll distance (1.5x viewport height)
          pin: true,
          scrub: 1, // Smooth scrub delay
          invalidateOnRefresh: true,
        },
      });

      // 1. Unfold/unfurl the blanket (from folded clip-path to full bleed)
      tl.fromTo(
        blanketRef.current,
        {
          clipPath: 'inset(30% 25% 30% 25% round 16px)',
          scale: 0.8,
          rotationX: 18,
          transformPerspective: 1000,
        },
        {
          clipPath: 'inset(0% 0% 0% 0% round 0px)',
          scale: 1,
          rotationX: 0,
          ease: 'power1.inOut',
        },
        0 // starts at beginning
      );

      // 2. Background vignette shift (Radial overlay changes opacity)
      tl.fromTo(
        containerRef.current,
        { backgroundColor: '#BDE8F5' },
        { backgroundColor: '#0F2854', ease: 'power1.inOut' },
        0
      );

      // 3. Parallax Floating Phrases
      // Phrase 1: "Woven for stillness." (moves from left to right, rises and fades out)
      tl.fromTo(
        text1Ref.current,
        { x: '-10%', y: '10%', opacity: 0 },
        { x: '10%', y: '-10%', opacity: 1, ease: 'sine.out', duration: 0.5 },
        0.1
      ).to(text1Ref.current, { opacity: 0, y: '-20%', duration: 0.3 }, 0.6);

      // Phrase 2: "The weight of real rest." (moves from right to left, drifts and fades out)
      tl.fromTo(
        text2Ref.current,
        { x: '10%', y: '20%', opacity: 0 },
        { x: '-10%', y: '-5%', opacity: 1, ease: 'sine.out', duration: 0.5 },
        0.3
      ).to(text2Ref.current, { opacity: 0, y: '-15%', duration: 0.3 }, 0.8);

      // Phrase 3: "A quiet morning luxury." (centers at the end over the fully unfurled blanket)
      tl.fromTo(
        text3Ref.current,
        { scale: 0.95, opacity: 0, y: '30%' },
        { scale: 1, opacity: 1, y: '0%', ease: 'power2.out', duration: 0.5 },
        0.6
      );
    }, containerRef);

    // Refresh ScrollTrigger to align layouts
    ScrollTrigger.refresh();

    return () => ctx.revert(); // clean up GSAP animations
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden flex items-center justify-center transition-colors duration-500 bg-[#BDE8F5] select-none"
    >
      {/* Blanket Canvas Element */}
      <div
        ref={blanketRef}
        className="absolute inset-0 w-full h-full overflow-hidden shadow-2xl"
        style={{ willChange: 'clip-path, transform' }}
      >
        <img
          src="https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=1800"
          alt="Premium Bed Blanket Unfurling"
          className="w-full h-full object-cover"
        />
        {/* Dark radial shade that appears on blanket when section turns dark */}
        <div className="absolute inset-0 bg-navy-deep/20 mix-blend-multiply" />
      </div>

      {/* Floating Copy Layer */}
      <div className="absolute inset-0 pointer-events-none z-30 flex flex-col justify-between p-12 sm:p-24">
        
        {/* Text 1: Top-Left floating */}
        <div
          ref={text1Ref}
          className="self-start text-left max-w-sm"
        >
          <span className="font-serif italic text-2xl sm:text-4xl text-navy-deep leading-tight block">
            Woven for stillness.
          </span>
          <span className="font-sans text-[10px] tracking-widest text-[#0F2854]/60 uppercase mt-2 block">
            100% ORGANIC LINENS
          </span>
        </div>

        {/* Text 2: Bottom-Right floating */}
        <div
          ref={text2Ref}
          className="self-end text-right max-w-sm"
        >
          <span className="font-serif italic text-2xl sm:text-4xl text-white leading-tight block">
            The weight of real rest.
          </span>
          <span className="font-sans text-[10px] tracking-widest text-[#BDE8F5]/80 uppercase mt-2 block">
            ETHICALLY CRAFTED
          </span>
        </div>
      </div>

      {/* Text 3: Center Finale Floating Banner */}
      <div
        ref={text3Ref}
        className="absolute inset-0 z-35 flex flex-col items-center justify-center text-center p-6 bg-black/15 pointer-events-none"
      >
        <p className="font-sans text-xs font-bold tracking-widest text-sky-blue uppercase mb-3">
          EXPERIENCE COMFORT
        </p>
        <h3 className="font-serif text-4xl sm:text-6xl text-white font-semibold tracking-wide drop-shadow-md">
          A Quiet Morning Luxury
        </h3>
        <p className="font-sans text-sm text-[#BDE8F5] max-w-md mt-4 drop-shadow">
          Slip into linens woven from Egyptian fields, tailored to breathe, designed to soothe.
        </p>
      </div>

      {/* Dynamic light overlay indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 text-white/50 text-[10px] font-sans tracking-widest uppercase flex flex-col items-center animate-bounce">
        <span>SCROLL DOWN TO UNFURL</span>
        <div className="w-0.5 h-6 bg-white/40 mt-1" />
      </div>
    </div>
  );
};
