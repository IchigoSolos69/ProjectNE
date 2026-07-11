"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Bed, Cloud, Moon, ChevronLeft, ChevronRight } from "lucide-react";

interface SlideData {
  id: number;
  image: string;
  category: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  href: string;
}

interface EditorialSliderProps {
  /** When true the slider fills the full hero viewport height */
  hero?: boolean;
}

const SLIDES: SlideData[] = [
  {
    id: 1,
    image: "/images/sateen-sheets.jpg",
    category: "EGYPTIAN COTTON",
    title: "Luminous Sateen Set",
    description: "Woven with a silky 500-thread count, our Egyptian cotton sateen sheets offer a lustrous drape and buttery softness for unmatched comfort.",
    icon: Sparkles,
    href: "/products/luxe-sateen-sheet-set",
  },
  {
    id: 2,
    image: "/images/linen-sheets.jpg",
    category: "ORGANIC FLAX LINEN",
    title: "Pure Belgian Linen",
    description: "Crafted from premium Belgian flax, pre-washed for exceptional breathability and structural texture that softens with every wash.",
    icon: Bed,
    href: "/products/organic-linen-core-set",
  },
  {
    id: 3,
    image: "/images/cotton-quilt.jpg",
    category: "ORGANIC COTTON",
    title: "Classic Quilt Set",
    description: "A lightweight, plush organic cotton coverlet featuring a delicate, pick-stitch grid designed for stylish all-season layering.",
    icon: Cloud,
    href: "/products/classic-percale-core-set",
  },
  {
    id: 4,
    image: "/images/down-duvet.jpg",
    category: "INSULATING DOWN",
    title: "All-Season Down Duvet",
    description: "Filled with premium, responsibly sourced European down and encased in a crisp cotton percale shell for fluffy, cloud-like warmth.",
    icon: Moon,
    href: "/products/classic-percale-core-set",
  },
];

export const EditorialSlider: React.FC<EditorialSliderProps> = ({ hero = false }) => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for prev, 1 for next

  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 5000);
    return () => clearInterval(timer);
  }, [current]);

  const handleNext = () => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % SLIDES.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrent((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1));
  };

  const activeSlide = SLIDES[current];
  const IconComponent = activeSlide.icon;

  // Slide Animation Variants
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? "100%" : "-100%",
      opacity: 0.8,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir < 0 ? "100%" : "-100%",
      opacity: 0.8,
    }),
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div
      className={`relative w-full overflow-hidden flex flex-col md:flex-row bg-[#0F2854] ${
        hero
          ? "h-[calc(100vh-4.5rem)] min-h-[600px]"
          : "h-[650px] md:h-[70vh] min-h-[550px]"
      }`}
    >
      {/* Left Panel: Image Column */}
      <div className="relative w-full md:w-1/2 h-[300px] md:h-full overflow-hidden z-0 bg-brand-midnight">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 220, damping: 26 },
              opacity: { duration: 0.3 },
            }}
            className="absolute inset-0 w-full h-full"
          >
            <Image
              src={activeSlide.image}
              alt={activeSlide.title}
              fill
              className="object-cover object-center"
              priority
              unoptimized
            />
            {/* Soft Sky mix-blend tint overlay on mobile to keep stacking readable */}
            <div className="absolute inset-0 bg-[#BDE8F5]/10 mix-blend-multiply md:hidden" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Right Panel: Content Column */}
      <div className="relative w-full md:w-1/2 h-[350px] md:h-full flex flex-col justify-between p-8 sm:p-12 lg:p-16 text-white bg-[#0F2854] z-10 border-t md:border-t-0 md:border-l border-brand-sky/10">
        {/* Navigation Buttons for desktop */}
        <div className="absolute top-8 right-8 hidden md:flex items-center space-x-3 z-30">
          <button
            onClick={handlePrev}
            className="p-2.5 border border-[#BDE8F5]/20 rounded-full hover:bg-[#BDE8F5]/10 hover:border-[#BDE8F5] transition-all duration-300 cursor-pointer"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-4 h-4 text-[#BDE8F5]" />
          </button>
          <button
            onClick={handleNext}
            className="p-2.5 border border-[#BDE8F5]/20 rounded-full hover:bg-[#BDE8F5]/10 hover:border-[#BDE8F5] transition-all duration-300 cursor-pointer"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-4 h-4 text-[#BDE8F5]" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-grow flex flex-col justify-center items-center md:items-start text-center md:text-left max-w-lg mx-auto md:mx-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={contentVariants}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="space-y-4 lg:space-y-6"
            >
              {/* Brand Header */}
              <div className="flex items-center justify-center md:justify-start space-x-2 text-[#BDE8F5]/75">
                <IconComponent className="w-4 h-4 stroke-[1.5]" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.3em] font-sans">
                  RARECOMFORTS
                </span>
              </div>

              {/* Category */}
              <div className="text-[11px] font-semibold uppercase tracking-widest text-[#4988C4] font-sans">
                {activeSlide.category}
              </div>

              {/* Main Title */}
              <h1
                className={`font-serif font-bold tracking-tight text-white leading-tight ${
                  hero
                    ? "text-4xl sm:text-5xl lg:text-6xl"
                    : "text-3xl sm:text-4xl lg:text-5xl"
                }`}
              >
                {activeSlide.title}
              </h1>

              {/* Description */}
              <p className="text-xs sm:text-sm text-[#BDE8F5]/85 leading-relaxed font-sans font-light max-w-md">
                {activeSlide.description}
              </p>

              {/* CTA Button */}
              <div className="pt-2">
                <Link
                  href={activeSlide.href}
                  className="inline-block px-10 py-3.5 bg-[#4988C4] hover:bg-[#1C4D8D] text-white text-xs font-semibold uppercase tracking-widest transition-all duration-300 rounded-[2px] shadow-sm hover:shadow-md cursor-pointer"
                >
                  SHOP NOW
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Pagination Indicators - Horizontal Dashes at the Bottom */}
        <div className="flex justify-center md:justify-start items-center space-x-3 pt-6 border-t border-brand-sky/10">
          {SLIDES.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={() => {
                setDirection(idx > current ? 1 : -1);
                setCurrent(idx);
              }}
              className={`h-[3px] rounded-full transition-all duration-300 cursor-pointer ${
                idx === current 
                  ? "w-12 bg-[#BDE8F5] opacity-100" 
                  : "w-6 bg-[#BDE8F5] opacity-35 hover:opacity-75"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default EditorialSlider;
