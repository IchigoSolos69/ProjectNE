"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Crown } from "lucide-react";

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

const imageVariants = {
  initial: { opacity: 0, scale: 1.04 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function EditorialSlider() {
  const [activeIndex, setActiveIndex] = useState(0);

  const goToSlide = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % SLIDES.length);
    }, AUTOPLAY_MS);

    return () => clearInterval(timer);
  }, [activeIndex]);

  const slide = SLIDES[activeIndex];

  return (
    <section
      className="relative w-full h-[70vh] min-h-[600px] flex flex-col md:flex-row overflow-hidden"
      aria-roledescription="carousel"
      aria-label="Featured products"
    >
      {/* Left — full-bleed product image */}
      <div className="relative w-full md:w-1/2 h-[45vh] md:h-full bg-neutral-900">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            variants={imageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
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
      </div>

      {/* Right — editorial content panel */}
      <div className="relative w-full md:w-1/2 bg-brand-midnight flex items-center justify-center flex-1 md:flex-none">
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-8 sm:px-12 lg:px-16 py-12 max-w-xl w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              className="flex flex-col items-center space-y-5 sm:space-y-6"
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Brand header */}
              <motion.div custom={0} variants={textVariants} className="flex flex-col items-center gap-2">
                <Crown className="h-4 w-4 text-brand-sky stroke-[1.5]" aria-hidden="true" />
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.35em] text-brand-sky">
                  RARECOMFORTS
                </span>
              </motion.div>

              {/* Category overline */}
              <motion.span
                custom={1}
                variants={textVariants}
                className="text-[10px] sm:text-xs font-medium uppercase tracking-[0.25em] text-brand-sky/70"
              >
                {slide.category}
              </motion.span>

              {/* Main title */}
              <motion.h2
                custom={2}
                variants={textVariants}
                className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight"
              >
                {slide.title}
              </motion.h2>

              {/* Description */}
              <motion.p
                custom={3}
                variants={textVariants}
                className="text-sm sm:text-base text-brand-sky/90 leading-relaxed max-w-md"
              >
                {slide.description}
              </motion.p>

              {/* CTA */}
              <motion.div custom={4} variants={textVariants}>
                <Link
                  href={slide.href}
                  className="inline-flex items-center justify-center px-10 py-3.5 bg-brand-ocean hover:bg-brand-royal text-white text-xs font-semibold uppercase tracking-[0.2em] rounded-sm transition-colors duration-300"
                >
                  Shop Now
                </Link>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

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
