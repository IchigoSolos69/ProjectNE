import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import HeroBlanket from './HeroBlanket';

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

export const HeroCarousel: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const heroContainerRef = useRef<HTMLElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<any>(null);

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
    // Left Image Animation
    if (imageContainerRef.current) {
      const activeImg = imageContainerRef.current.querySelector(`.slide-img-${activeIndex}`);
      const otherImgs = imageContainerRef.current.querySelectorAll(`.slide-img:not(.slide-img-${activeIndex})`);
      
      gsap.to(activeImg, { opacity: 1, scale: 1, duration: 0.8, ease: 'power2.out' });
      gsap.to(otherImgs, { opacity: 0, scale: 1.05, duration: 0.8, ease: 'power2.out' });
    }

    // Right Text Panel Animation
    if (textContainerRef.current) {
      gsap.fromTo(
        textContainerRef.current.children,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power2.out' }
      );
    }
  }, [activeIndex]);

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
    <>
      <HeroBlanket heroRef={heroContainerRef} />
      <section ref={heroContainerRef} className="relative w-full h-screen flex flex-col md:flex-row bg-[#F5FAFD]/40 overflow-hidden">
        
        {/* Left Carousel Image Section (~58%) */}
        <div
          ref={imageContainerRef}
          className="relative w-full md:w-[58%] h-[50vh] md:h-full overflow-hidden bg-navy-deep flex-shrink-0 p-0 m-0 border-0"
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
    </>
  );
};

export default HeroCarousel;
