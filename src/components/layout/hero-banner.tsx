"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

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
  const reducedMotion = usePrefersReducedMotion();

  React.useEffect(() => {
    if (reducedMotion) return;

    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [reducedMotion]);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % SLIDES.length);
  const prevSlide = () =>
    setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);

  const slide = SLIDES[current];

  return (
    <div className="relative w-full overflow-hidden border-b border-border bg-muted">
      <div className="relative grid min-h-0 grid-cols-1 overflow-hidden bg-nest-brown-dark text-primary-foreground md:min-h-[580px] md:grid-cols-2">
        <div className="group relative aspect-[4/3] w-full overflow-hidden sm:aspect-[16/10] md:aspect-auto md:h-full md:min-h-[580px]">
          {SLIDES.map((s, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-700 ${
                idx === current ? "z-10 opacity-100" : "z-0 opacity-0"
              } ${reducedMotion ? "" : "ease-in-out"}`}
            >
              <Image
                src={s.image}
                alt={s.title}
                fill
                priority={idx === 0}
                loading={idx === 0 ? undefined : "lazy"}
                className="object-cover md:group-hover:scale-105 md:transition-transform md:duration-[10000ms]"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/10 md:bg-gradient-to-r" />
            </div>
          ))}

          <button
            type="button"
            onClick={prevSlide}
            className="touch-target absolute left-3 top-1/2 z-20 flex -translate-y-1/2 items-center justify-center rounded-full bg-black/30 p-3 text-white backdrop-blur-sm transition-colors hover:bg-black/50 md:left-4 md:opacity-0 md:group-hover:opacity-100"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            className="touch-target absolute right-3 top-1/2 z-20 flex -translate-y-1/2 items-center justify-center rounded-full bg-black/30 p-3 text-white backdrop-blur-sm transition-colors hover:bg-black/50 md:right-4 md:opacity-0 md:group-hover:opacity-100"
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-between gap-6 bg-nest-brown-dark p-6 text-center sm:p-8 md:min-h-[580px] md:p-12 lg:p-16">
          <div className="pointer-events-none absolute left-1/2 top-1/2 hidden h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-nest-cream/5 blur-3xl md:block md:h-72 md:w-72" />

          <div className="flex select-none flex-col items-center">
            <div className="relative mb-3 h-14 w-14 overflow-hidden rounded-xl border border-white/10 bg-[#f7f5f0] shadow-md sm:h-16 sm:w-16">
              <Image
                src="/images/logo.png"
                alt="Nestify Essentials Logo"
                fill
                className="object-contain p-1"
                priority
                sizes="64px"
              />
            </div>
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground/80 sm:text-[13px] sm:tracking-[0.25em]">
              nestify <span className="text-nest-cream">ESSENTIALS</span>
            </div>
            <span className="mt-1 block text-[8px] font-semibold uppercase tracking-[0.2em] text-nest-cream">
              style your space...
            </span>
          </div>

          <div className="flex w-full max-w-md flex-col items-center py-2 sm:py-4">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-nest-sage">
              {slide.subtitle}
            </span>
            <h2 className="mb-3 font-serif text-2xl leading-tight tracking-wide text-primary-foreground sm:mb-4 sm:text-3xl lg:text-5xl">
              {slide.title}
            </h2>
            <p className="mx-auto mb-6 max-w-sm text-sm font-light leading-relaxed text-primary-foreground/75 sm:mb-8">
              {slide.description}
            </p>

            <Link
              href={slide.href}
              className="inline-flex min-h-11 items-center justify-center bg-nest-sage px-8 py-3 text-xs font-bold uppercase tracking-[0.2em] text-nest-brown-dark shadow-lg transition-colors hover:bg-nest-sage/90 sm:px-10 sm:py-4"
            >
              SHOP NOW
            </Link>
          </div>

          <div className="flex items-center gap-2 pb-1">
            {SLIDES.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrent(idx)}
                className="touch-target flex items-center justify-center p-2"
                aria-label={`Go to slide ${idx + 1}`}
                aria-current={idx === current ? "true" : undefined}
              >
                <span
                  className={`block h-2.5 rounded-full transition-all ${
                    idx === current
                      ? "w-7 bg-primary-foreground"
                      : "w-2.5 bg-primary-foreground/35"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
