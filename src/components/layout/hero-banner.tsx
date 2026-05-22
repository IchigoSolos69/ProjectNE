"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
    description:
      "Woven from premium long-staple cotton, this set offers a delicate rose pattern with exceptional softness and durability.",
    href: "/shop/beddings",
  },
  {
    image: "/images/products/bedding-1.png",
    title: "Floral Gray Bedding",
    subtitle: "Egyptian Cotton",
    description:
      "Sleek and sophisticated gray floral jacquard pattern, bringing a modern editorial look to your bedroom.",
    href: "/shop/beddings",
  },
  {
    image: "/images/products/bedding-2.png",
    title: "Feather Blue Collection",
    subtitle: "Sateen Weave",
    description:
      "Features a rich sateen weave with a light feather pattern, providing a cooling and silky sleeping surface.",
    href: "/shop/beddings",
  },
  {
    image: "/images/products/bedding-3.png",
    title: "Feather Purple Set",
    subtitle: "Luxury Jacquard",
    description:
      "Deep violet accents with a subtle feather jacquard pattern, offering a royal touch and ultimate cozy rest.",
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
    <div className="relative w-full overflow-hidden border-b border-border bg-muted">
      <div className="relative grid min-h-[500px] grid-cols-1 overflow-hidden bg-nest-brown-dark text-primary-foreground md:h-[580px] md:grid-cols-2">
        <div className="group relative h-[350px] w-full overflow-hidden md:h-full">
          {SLIDES.map((slide, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === current ? "z-10 opacity-100" : "z-0 opacity-0"
                }`}
            >
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                priority={idx === 0}
                className="scale-100 object-cover transition-transform duration-10000 ease-linear group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-black/20" />
            </div>
          ))}

          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 z-20 -translate-y-1/2 cursor-pointer rounded-full bg-black/20 p-2 text-white transition-colors hover:bg-black/40 md:opacity-0 md:group-hover:opacity-100"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 z-20 -translate-y-1/2 cursor-pointer rounded-full bg-black/20 p-2 text-white transition-colors hover:bg-black/40 md:opacity-0 md:group-hover:opacity-100"
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="relative z-10 flex h-full flex-col items-center justify-between bg-nest-brown-dark p-8 text-center sm:p-12 md:p-16">
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-nest-cream/5 blur-3xl" />

          <div className="flex select-none flex-col items-center">
            <div className="relative mb-4 h-16 w-16 overflow-hidden rounded-xl border border-white/10 bg-[#f7f5f0] shadow-md transition-all duration-300 hover:scale-105">
              <Image
                src="/images/logo.png"
                alt="Nestify Essentials Logo"
                fill
                className="object-contain p-1"
                priority
              />
            </div>
            <div className="text-[13px] font-bold uppercase tracking-[0.25em] text-primary-foreground/80">
              nestify <span className="text-nest-cream">ESSENTIALS</span>
            </div>
            <span className="mt-1 block text-[8px] font-semibold uppercase tracking-[0.2em] text-nest-cream">
              style your space...
            </span>
          </div>

          <div className="my-auto max-w-md py-6 sm:py-8 overflow-hidden w-full min-h-[280px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center"
              >
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.25em] text-nest-sage">
                  {SLIDES[current].subtitle}
                </span>
                <h2 className="mb-4 font-serif text-3xl leading-tight tracking-wide text-primary-foreground sm:text-4xl lg:text-5xl">
                  {SLIDES[current].title}
                </h2>
                <p className="mx-auto mb-8 max-w-sm text-sm font-light leading-relaxed text-primary-foreground/75">
                  {SLIDES[current].description}
                </p>

                <Link
                  href={SLIDES[current].href}
                  className="bg-nest-sage px-10 py-4 text-xs font-bold uppercase tracking-[0.25em] text-nest-brown-dark shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-nest-sage/90 hover:shadow-xl active:translate-y-0"
                >
                  SHOP NOW
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-auto flex select-none items-center gap-2.5 pt-4">
            {SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`h-2.5 cursor-pointer rounded-full transition-all duration-300 ${idx === current
                    ? "w-7 bg-primary-foreground"
                    : "w-2.5 bg-primary-foreground/30 hover:bg-primary-foreground/65"
                  }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
