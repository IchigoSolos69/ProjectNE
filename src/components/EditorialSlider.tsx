"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Crown, ChevronLeft, ChevronRight } from "lucide-react";

interface EditorialSlide {
  id: string;
  category: string;
  title: string;
  description: string;
  image: string;
  href: string;
}

const SLIDES: EditorialSlide[] = [
  {
    id: "luxe-sateen",
    category: "PREMIUM LINEN",
    title: "Egyptian Cotton Sateen",
    description:
      "Woven in a luminous 480-thread-count sateen, this set drapes like liquid silk—buttery against the skin, with a subtle sheen that elevates every bedroom into a sanctuary of quiet luxury.",
    image:
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1600&q=80",
    href: "/products/luxe-sateen-sheet-set",
  },
  {
    id: "damask-rose",
    category: "SIGNATURE WEAVE",
    title: "Damask Rose Set",
    description:
      "A jacquard-woven masterpiece in blush and ivory tones. The intricate damask pattern catches light with every fold, offering hotel-grade opulence and breathable comfort night after night.",
    image:
      "https://images.unsplash.com/photo-1616627561839-074385245ff6?auto=format&fit=crop&w=1600&q=80",
    href: "/products/classic-percale-core-set",
  },
  {
    id: "organic-linen",
    category: "EUROPEAN FLAX",
    title: "Organic Linen Core",
    description:
      "Garment-washed French and Belgian flax, naturally moisture-wicking and endlessly breathable. Relaxed texture, effortless drape—a lived-in elegance that only grows softer with time.",
    image:
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1600&q=80",
    href: "/products/organic-linen-core-set",
  },
  {
    id: "cloud-quilt",
    category: "LAYERED COMFORT",
    title: "Cloud Cotton Quilt",
    description:
      "Four layers of Turkish Aegean gauze create a weightless, lofted warmth. Textured, crinkled, and impossibly soft—the perfect finishing layer for a bed that feels like a cloud.",
    image:
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1600&q=80",
    href: "/products/cloud-cotton-quilt",
  },
];

const AUTOPLAY_MS = 5000;

const textVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      delay: 0.15 + i * 0.09,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
  exit: {
    opacity: 0,
    y: -16,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function EditorialSlider() {
  const [activeIndex, setActiveIndex] = useState(0);

  const goToSlide = (index: number) => {
    setActiveIndex((index + SLIDES.length) % SLIDES.length);
  };

  const goNext = () => goToSlide(activeIndex + 1);
  const goPrev = () => goToSlide(activeIndex - 1);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % SLIDES.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [activeIndex]);

  const slide = SLIDES[activeIndex];

  return (
    <section
      className="relative w-full h-full flex flex-col md:flex-row overflow-hidden"
      aria-roledescription="carousel"
      aria-label="Featured products"
    >
      {/* Left — full-bleed product image */}
      <div className="relative w-full md:w-1/2 flex-1 md:h-full bg-neutral-900">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              priority={activeIndex === 0}
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              unoptimized
            />
          </motion.div>
        </AnimatePresence>

        {/* Prev arrow — image panel */}
        <button
          type="button"
          onClick={goPrev}
          aria-label="Previous slide"
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3 rounded-full bg-brand-midnight/50 hover:bg-brand-midnight/75 text-brand-sky backdrop-blur-sm active:scale-[0.9] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
        >
          <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
      </div>

      {/* Right — editorial content panel */}
      <div className="relative w-full md:w-1/2 h-full bg-brand-midnight flex items-center justify-center">
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-8 sm:px-12 lg:px-16 py-12 max-w-xl w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              className="flex flex-col items-center space-y-5 sm:space-y-6"
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <motion.div custom={0} variants={textVariants} className="flex flex-col items-center gap-2">
                <Crown className="h-4 w-4 text-brand-sky stroke-[1.5]" aria-hidden="true" />
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.35em] text-brand-sky">
                  RARECOMFORTS
                </span>
              </motion.div>

              <motion.span
                custom={1}
                variants={textVariants}
                className="text-[10px] sm:text-xs font-medium uppercase tracking-[0.25em] text-brand-sky/70"
              >
                {slide.category}
              </motion.span>

              <motion.h2
                custom={2}
                variants={textVariants}
                className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight"
              >
                {slide.title}
              </motion.h2>

              <motion.p
                custom={3}
                variants={textVariants}
                className="text-sm sm:text-base text-brand-sky/90 leading-relaxed max-w-md"
              >
                {slide.description}
              </motion.p>

              <motion.div custom={4} variants={textVariants}>
                <Link
                  href={slide.href}
                  className="inline-flex items-center justify-center px-10 py-3.5 bg-brand-ocean hover:bg-brand-royal text-white text-xs font-semibold uppercase tracking-[0.2em] rounded-sm active:scale-[0.98] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] font-sans"
                >
                  Shop Now
                </Link>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Next arrow — content panel */}
        <button
          type="button"
          onClick={goNext}
          aria-label="Next slide"
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3 rounded-full bg-brand-ocean/80 hover:bg-brand-ocean text-white active:scale-[0.9] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
        >
          <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>

        {/* Pagination dashes */}
        <div
          className="absolute bottom-8 sm:bottom-10 left-0 right-0 flex items-center justify-center gap-2.5 z-20"
          role="tablist"
          aria-label="Slide navigation"
        >
          {SLIDES.map((s, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`Go to slide ${index + 1}: ${s.title}`}
                onClick={() => goToSlide(index)}
                className={`h-[2px] rounded-full transition-all duration-300 ${
                  isActive ? "w-10 bg-brand-sky opacity-100" : "w-6 bg-brand-sky opacity-35 hover:opacity-60"
                }`}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
