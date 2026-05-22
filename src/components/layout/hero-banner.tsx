"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Slide {
  image: string;
  title: string;
  subtitle: string;
  description: string;
  href: string;
}

const SLIDES: Slide[] = [
  {
    image: "/images/products/bedding-4.jpg",
    title: "Damask Rose Set",
    subtitle: "Linen Bedding",
    description: "Woven from premium long-staple cotton, this set offers a delicate rose pattern with exceptional softness and durability.",
    href: "/shop/beddings",
  },
  {
    image: "/images/products/bedding-1.png",
    title: "Floral Gray Bedding",
    subtitle: "Egyptian Cotton",
    description: "Sleek and sophisticated gray floral jacquard pattern, bringing a modern editorial look to your bedroom.",
    href: "/shop/beddings",
  },
  {
    image: "/images/products/bedding-2.png",
    title: "Feather Blue Collection",
    subtitle: "Sateen Weave",
    description: "Features a rich sateen weave with a light feather pattern, providing a cooling and silky sleeping surface.",
    href: "/shop/beddings",
  },
  {
    image: "/images/products/bedding-3.png",
    title: "Feather Purple Set",
    subtitle: "Luxury Jacquard",
    description: "Deep violet accents with a subtle feather jacquard pattern, offering a royal touch and ultimate cozy rest.",
    href: "/shop/beddings",
  },
];

export function HeroBanner() {
  const [current, setCurrent] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % SLIDES.length);
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  return (
    <div className="relative w-full overflow-hidden bg-stone-50 border-b border-stone-200">
      <div className="mx-auto max-w-7xl px-0 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="relative grid grid-cols-1 md:grid-cols-2 overflow-hidden bg-[#2D251F] text-white shadow-xl min-h-[500px] md:h-[550px]">
          
          {/* Left Side: Product Image Carousel */}
          <div className="relative h-[300px] md:h-full w-full overflow-hidden group">
            {SLIDES.map((slide, idx) => (
              <div
                key={idx}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  idx === current ? "opacity-100 z-10" : "opacity-0 z-0"
                }`}
              >
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  priority={idx === 0}
                  className="object-cover transition-transform duration-10000 ease-linear scale-100 group-hover:scale-105"
                  sizes="(max-w-768px) 100vw, 50vw"
                />
                {/* Subtle visual gradient on the image overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-black/20" />
              </div>
            ))}
            
            {/* Arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors cursor-pointer md:opacity-0 group-hover:opacity-100"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors cursor-pointer md:opacity-0 group-hover:opacity-100"
              aria-label="Next slide"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Right Side: Editorial Info Card */}
          <div className="relative flex flex-col justify-between items-center text-center p-8 sm:p-12 md:p-16 bg-[#2D251F] h-full z-10">
            {/* Ambient gold glow effect behind text */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-[#E2D5C5]/5 blur-3xl pointer-events-none" />

            {/* Top Branding Header */}
            <div className="flex flex-col items-center select-none">
              <div className="border border-white/30 px-4 py-1 text-[10px] tracking-[0.3em] text-white/90 font-medium uppercase mb-3 backdrop-blur-sm bg-white/5">
                ne
              </div>
              <div className="text-[13px] uppercase tracking-[0.25em] text-white/80 font-bold">
                nestify <span className="text-[#E2D5C5]">ESSENTIALS</span>
              </div>
              <span className="text-[8px] uppercase tracking-[0.2em] text-[#E2D5C5] mt-1 font-semibold block">
                my heart for home
              </span>
            </div>

            {/* Middle Title & Description */}
            <div className="my-auto py-6 sm:py-8 max-w-md">
              <span className="text-xs uppercase tracking-[0.25em] text-[#E2D5C5] font-semibold block mb-2">
                {SLIDES[current].subtitle}
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-white tracking-wide leading-tight mb-4 transition-all duration-500">
                {SLIDES[current].title}
              </h2>
              <p className="text-sm text-stone-300 leading-relaxed font-light mb-8 max-w-sm mx-auto">
                {SLIDES[current].description}
              </p>
              
              <Link
                href={SLIDES[current].href}
                className="bg-[#E2D5C5] hover:bg-[#D6C7B5] text-stone-900 font-bold px-10 py-4 text-xs uppercase tracking-[0.25em] transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
              >
                SHOP NOW
              </Link>
            </div>

            {/* Bottom Dots Navigation */}
            <div className="flex items-center gap-2.5 mt-auto pt-4 select-none">
              {SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrent(idx)}
                  className={`h-2.5 transition-all duration-300 rounded-full cursor-pointer ${
                    idx === current ? "w-7 bg-white" : "w-2.5 bg-white/30 hover:bg-white/65"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
