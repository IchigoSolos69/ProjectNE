import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ChevronDown } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface CarouselSlide {
  id: string;
  name: string;
  tagline: string;
  description: string;
  price: string;
  image: string;
  link: string;
}

const slides: CarouselSlide[] = [
  {
    id: '1',
    name: 'Royal Egyptian Cotton Sheet Set',
    tagline: 'THE GOLD STANDARD OF SLEEP',
    description: 'Woven from hand-harvested, 100% long-staple Egyptian cotton. Offering 1000 Thread Count weight and a sateen sheen that grows softer with every wash.',
    price: '₹12,999',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200',
    link: '/products/royal-egyptian-cotton-sheet-set',
  },
  {
    id: '2',
    name: 'Imperial Satin Linens Collection',
    tagline: 'A REVOLUTION IN HAIR & SKINCARE',
    description: 'Liquid-smooth organic satin silk engineered for friction-free nights. Keeps temperatures balanced while preserving hair and skin moisture.',
    price: '₹18,500',
    image: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?q=80&w=1200',
    link: '/products/imperial-satin-linens-collection',
  },
  {
    id: '3',
    name: 'Mulberry Silk Comforter',
    tagline: 'WEIGHTLESS ALL-SEASON INSULATION',
    description: 'Stuffed with 100% organic long-strand mulberry silk. It gently breathes to dissipate humidity while creating a heavy-lofted shield of warmth.',
    price: '₹22,000',
    image: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=1200',
    link: '/products/all-season-mulberry-silk-comforter',
  },
];

export const HeroCarousel: React.FC = React.memo(() => {
  const [activeIndex, setActiveIndex] = useState(0);
  const heroContainerRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<any>(null);

  // Overlay Refs
  const blanketOverlayRef = useRef<HTMLDivElement>(null);
  const blanketBaseRef = useRef<HTMLDivElement>(null);
  const blanketTopRef = useRef<HTMLDivElement>(null);
  const overlayTextRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);

  const resetAutoplay = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
    autoPlayRef.current = setInterval(() => {
      handleNext();
    }, 6000);
  };

  useEffect(() => {
    resetAutoplay();
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [activeIndex]);

  // Handle GSAP transitions when slide changes
  useEffect(() => {
    if (imageContainerRef.current) {
      const activeImg = imageContainerRef.current.querySelector(`.slide-img-${activeIndex}`);
      const otherImgs = imageContainerRef.current.querySelectorAll(`.slide-img:not(.slide-img-${activeIndex})`);
      
      gsap.to(activeImg, { opacity: 1, scale: 1, duration: 0.8, ease: 'power2.out' });
      gsap.to(otherImgs, { opacity: 0, scale: 1.05, duration: 0.8, ease: 'power2.out' });
    }

    if (textContainerRef.current) {
      gsap.fromTo(
        textContainerRef.current.children,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power2.out' }
      );
    }
  }, [activeIndex]);

  // Blanket reveal animation setup using useGSAP
  useGSAP(() => {
    try {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduceMotion) {
        // Create simple fade-only scroll trigger timeline for accessibility profiles
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: heroContainerRef.current,
            start: 'top top',
            end: '+=60%',
            scrub: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              if (blanketOverlayRef.current) {
                if (self.progress > 0.05) {
                  blanketOverlayRef.current.style.pointerEvents = 'none';
                } else {
                  blanketOverlayRef.current.style.pointerEvents = 'auto';
                }
              }
            }
          },
        });
        tl.to(blanketOverlayRef.current, { opacity: 0, ease: 'power1.out', duration: 1.0 });
        return;
      }

      if (!heroContainerRef.current || !blanketOverlayRef.current) return;

      // Create Scroll-linked reveal timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: heroContainerRef.current,
          start: 'top top',
          end: '+=60%',
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (blanketOverlayRef.current) {
              // Instantly clear pointer interactions as soon as user begins to scroll down
              if (self.progress > 0.05) {
                blanketOverlayRef.current.style.pointerEvents = 'none';
              } else {
                blanketOverlayRef.current.style.pointerEvents = 'auto';
              }
            }
          }
        },
      });

      // 1. Fade out the overlay wrapper background & container opacity
      tl.fromTo(blanketOverlayRef.current, 
        { opacity: 1 }, 
        { opacity: 0, ease: 'power2.inOut', duration: 1.0 }, 
        0
      );

      // 2. Animate the blanket comforter layers sweeping down and scaling out
      if (blanketBaseRef.current) {
        tl.fromTo(blanketBaseRef.current,
          { scaleY: 1, scaleX: 1, y: '0%' },
          { scaleY: 0.6, scaleX: 0.7, y: '80%', ease: 'power2.inOut', duration: 1.0 },
          0
        );
      }

      if (blanketTopRef.current) {
        tl.fromTo(blanketTopRef.current,
          { scaleY: 1, scaleX: 1, y: '0%' },
          { scaleY: 0.5, scaleX: 0.6, y: '100%', ease: 'power2.inOut', duration: 0.95 },
          0
        );
      }

      // 3. Fade out overlay elements
      if (overlayTextRef.current) {
        tl.to(overlayTextRef.current, { opacity: 0, y: -40, duration: 0.5, ease: 'power1.out' }, 0);
      }
      if (indicatorRef.current) {
        tl.to(indicatorRef.current, { opacity: 0, duration: 0.2 }, 0);
      }
    } catch (err: any) {
      console.log('ERROR IN useGSAP:', err.message || err);
    }

  }, { scope: heroContainerRef, revertOnUpdate: true });

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const handleDotClick = (index: number) => {
    setActiveIndex(index);
  };

  return (
    <section ref={heroContainerRef} className="relative w-full h-screen flex flex-col md:flex-row bg-[#F5FAFD]/40 overflow-hidden">
      
      {/* 2D Blanket Reveal Overlay (sits above images/panels but below text once scrolled) */}
      <div
        ref={blanketOverlayRef}
        className="absolute inset-0 z-25 bg-[#0F2854] flex items-end justify-center pointer-events-auto overflow-hidden select-none"
      >
        {/* Fabric pattern definition */}
        <svg className="hidden">
          <defs>
            <pattern id="reveal-stripe" width="24" height="24" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="24" stroke="#0F2854" strokeWidth="2.5" opacity="0.18" />
              <line x1="0" y1="0" x2="24" y2="0" stroke="#0F2854" strokeWidth="2.5" opacity="0.18" />
            </pattern>
          </defs>
        </svg>

        {/* 2D Graphic Blanket */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[75vh] md:h-[80vh] flex flex-col justify-end origin-bottom z-10">
          
          {/* Base Layer */}
          <div
            ref={blanketBaseRef}
            className="absolute inset-0 w-full h-full bg-[#1C4D8D] rounded-t-[3rem] md:rounded-t-[6rem] overflow-hidden shadow-2xl"
            style={{ transformOrigin: 'bottom center' }}
          >
            <div
              className="w-full h-full"
              style={{
                background: 'repeating-linear-gradient(45deg, #1C4D8D, #1C4D8D 12px, #0F2854 12px, #0F2854 24px)',
                opacity: 0.85,
              }}
            />
          </div>

          {/* Top Layer */}
          <div
            ref={blanketTopRef}
            className="absolute inset-x-4 top-12 bottom-0 bg-[#4988C4] rounded-t-[2.5rem] md:rounded-t-[5.5rem] overflow-hidden shadow-lg border-t border-white/10"
            style={{ transformOrigin: 'bottom center' }}
          >
            <div
              className="w-full h-full"
              style={{
                background: 'repeating-linear-gradient(-45deg, #4988C4, #4988C4 10px, #1C4D8D 10px, #1C4D8D 20px)',
                opacity: 0.9,
              }}
            />
            <div className="absolute bottom-6 left-6 font-serif italic text-[#BDE8F5]/80 text-sm md:text-base tracking-wide z-10">
              RareComforts
            </div>
          </div>
        </div>

        {/* Floating text on overlay */}
        <div
          ref={overlayTextRef}
          className="absolute inset-0 z-20 pointer-events-none p-6 sm:p-16 flex flex-col justify-between"
        >
          <div className="self-start text-left max-w-xs md:max-w-md mt-20">
            <h3 className="font-serif text-3xl md:text-5xl text-white font-medium leading-tight">
              Woven for stillness.
            </h3>
            <span className="font-sans text-[10px] tracking-widest text-[#BDE8F5]/65 uppercase mt-2 block">
              RareComforts Premium
            </span>
          </div>
          <div className="self-end text-right max-w-xs md:max-w-md mb-20">
            <h3 className="font-serif text-3xl md:text-5xl text-[#BDE8F5] font-medium leading-tight">
              The weight of real rest.
            </h3>
          </div>
        </div>

        {/* Scroll down indicator */}
        <div
          ref={indicatorRef}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 text-[#BDE8F5] text-[10px] font-sans tracking-widest uppercase flex flex-col items-center gap-1.5"
        >
          <span>SCROLL TO UNFURL & REVEAL</span>
          <ChevronDown className="w-4 h-4 animate-bounce text-[#BDE8F5]" />
        </div>
      </div>

      {/* Left Carousel Image Section (~58%) */}
      <div
        ref={imageContainerRef}
        className="relative w-full md:w-[58%] h-[50vh] md:h-full overflow-hidden bg-navy-deep flex-shrink-0 p-0 m-0 border-0 z-10"
      >
        {slides.map((slide, idx) => (
          <div
            key={slide.id}
            className={`absolute inset-0 slide-img slide-img-${idx} opacity-0 p-0 m-0 border-0 w-full h-full`}
            style={{ zIndex: idx === activeIndex ? 10 : 1 }}
          >
            <img
              src={slide.image}
              alt={slide.name}
              className="w-full h-full object-cover p-0 m-0 border-0"
            />
          </div>
        ))}

        {/* Ambient Dark Overlay for Branding & Contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/60 via-transparent to-black/25 z-20 pointer-events-none" />

        {/* Small branding text on bottom-left over image */}
        <div className="absolute bottom-6 left-6 z-30 hidden sm:block">
          <p className="font-serif italic text-white/95 text-lg leading-none">RareComforts</p>
          <p className="font-sans text-[10px] tracking-widest text-[#BDE8F5]/80 mt-1 uppercase">ESTABLISHED 2026</p>
        </div>

        {/* Navigation Arrow buttons over image */}
        <div className="absolute bottom-6 right-6 z-30 flex gap-2">
          <button
            onClick={handlePrev}
            className="p-2 border border-white/40 bg-navy-deep/30 text-white rounded-full hover:bg-white hover:text-navy-deep hover:border-white transition-all"
            aria-label="Previous Slide"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            className="p-2 border border-white/40 bg-navy-deep/30 text-white rounded-full hover:bg-white hover:text-navy-deep hover:border-white transition-all"
            aria-label="Next Slide"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Right Synced Info Panel (~42%) */}
      <div className="w-full md:w-[42%] h-auto md:h-full flex flex-col justify-center p-8 sm:p-12 md:p-16 bg-white relative z-10 overflow-y-auto">
        
        {/* Carousel Slide Indicators */}
        <div className="flex gap-2.5 mb-8 justify-start">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => handleDotClick(idx)}
              className={`h-1 rounded-full transition-all duration-300 ${
                idx === activeIndex ? 'w-8 bg-royal-blue' : 'w-2 bg-[#BDE8F5]'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Content Ref container */}
        <div ref={textContainerRef} className="space-y-4 max-w-md my-auto">
          <p className="font-sans text-xs font-bold tracking-widest text-sky-blue uppercase">
            {slides[activeIndex].tagline}
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl text-navy-deep font-bold leading-tight">
            {slides[activeIndex].name}
          </h2>
          <p className="font-sans text-sm text-muted-gray leading-relaxed pt-2">
            {slides[activeIndex].description}
          </p>
          <div className="pt-3">
            <span className="font-sans text-xs text-muted-gray tracking-wider uppercase block">ESTIMATED PRICE</span>
            <span className="font-sans text-xl font-bold text-navy-deep">
              From {slides[activeIndex].price}
            </span>
          </div>
          <div className="pt-6">
            <Link
              to={slides[activeIndex].link}
              className="inline-block bg-navy-deep text-white font-sans text-xs uppercase tracking-wide font-semibold px-8 py-3.5 rounded-full hover:bg-royal-blue hover:text-white transition-luxury shadow-md"
            >
              SHOP THE COLLECTION →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
});

export default HeroCarousel;
