"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useMotionValue } from "motion/react";
import { Bed, Sparkles, Moon, Cloud, ChevronLeft, ChevronRight } from "lucide-react";
import "./Carousel.css";

export interface CarouselItem {
  id: string | number;
  title: string;
  description: string;
  icon: string; // key of iconMap
}

interface CarouselProps {
  items?: CarouselItem[];
  baseWidth?: number;
  autoplay?: boolean;
  autoplayDelay?: number;
  loop?: boolean;
}

const iconMap: Record<string, React.ComponentType<any>> = {
  Bed: Bed,
  Sparkles: Sparkles,
  Moon: Moon,
  Cloud: Cloud,
};

const DEFAULT_ITEMS: CarouselItem[] = [
  {
    id: 1,
    title: "Egyptian Cotton Sateen",
    description: "Silky smooth, 500-thread count for unparalleled luxury.",
    icon: "Sparkles",
  },
  {
    id: 2,
    title: "Cooling Bamboo Core",
    description: "Breathable, moisture-wicking sheets for warm nights.",
    icon: "Cloud",
  },
  {
    id: 3,
    title: "Classic Percale Weave",
    description: "Crisp, hotel-style comfort that gets softer with every wash.",
    icon: "Bed",
  },
  {
    id: 4,
    title: "Organic Cloud Flannel",
    description: "Ultra-plush warmth for the coziest winter sleep.",
    icon: "Moon",
  },
];

export default function Carousel({
  items = DEFAULT_ITEMS,
  baseWidth = 300,
  autoplay = true,
  autoplayDelay = 3000,
  loop = true,
}: CarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const dragX = useMotionValue(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startAutoplay = () => {
    stopAutoplay();
    if (!autoplay) return;
    timerRef.current = setInterval(() => {
      handleNext();
    }, autoplayDelay);
  };

  const stopAutoplay = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  useEffect(() => {
    startAutoplay();
    return () => stopAutoplay();
  }, [activeIndex, autoplay, autoplayDelay, items.length]);

  const handleNext = () => {
    setActiveIndex((prev) => {
      if (prev < items.length - 1) {
        return prev + 1;
      } else if (loop) {
        return 0;
      }
      return prev;
    });
  };

  const handlePrev = () => {
    setActiveIndex((prev) => {
      if (prev > 0) {
        return prev - 1;
      } else if (loop) {
        return items.length - 1;
      }
      return prev;
    });
  };

  const handleDragEnd = () => {
    const x = dragX.get();
    if (x < -50) {
      handleNext();
    } else if (x > 50) {
      handlePrev();
    }
    dragX.set(0);
  };

  // Safe gap setting in pixels (gap-6 corresponds to 24px)
  const gap = 24;

  return (
    <div className="carousel-container w-full max-w-full overflow-hidden">
      {/* Slide Viewport */}
      <div className="carousel-viewport w-full overflow-hidden relative">
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={handleDragEnd}
          animate={{ x: -activeIndex * (baseWidth + gap) }}
          transition={{ type: "spring", stiffness: 220, damping: 26 }}
          className="flex cursor-grab active:cursor-grabbing"
          style={{
            x: dragX,
            gap: `${gap}px`,
            width: items.length * baseWidth + (items.length - 1) * gap,
          }}
        >
          {items.map((item, index) => {
            const IconComponent = iconMap[item.icon] || Bed;
            return (
              <div
                key={item.id}
                style={{ width: baseWidth }}
                className={`carousel-item shrink-0 rounded-2xl p-8 md:p-12 transition-all duration-500 flex flex-col justify-center items-center text-center ${
                  index === activeIndex ? "carousel-item-active" : "carousel-item-inactive"
                }`}
              >
                <div className="carousel-icon-container mb-6 p-4 rounded-full bg-brand-sky/15">
                  <IconComponent className="carousel-icon w-10 h-10 stroke-[1.5]" />
                </div>
                <h3 className="carousel-item-title font-serif text-xl sm:text-2xl font-bold mb-3">
                  {item.title}
                </h3>
                <p className="carousel-item-description text-sm sm:text-base leading-relaxed max-w-md">
                  {item.description}
                </p>
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* Navigation Controls & Indicators */}
      <div className="carousel-controls flex items-center justify-between max-w-xs mx-auto mt-8">
        <button
          onClick={handlePrev}
          className="carousel-nav-btn p-3 rounded-full border border-brand-ocean/20 bg-white hover:bg-brand-sky/10 transition-colors duration-300 cursor-pointer"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5 text-[#0F2854]" />
        </button>

        <div className="carousel-indicators flex gap-2">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`carousel-indicator w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                index === activeIndex ? "active" : "inactive"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className="carousel-nav-btn p-3 rounded-full border border-brand-ocean/20 bg-white hover:bg-brand-sky/10 transition-colors duration-300 cursor-pointer"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5 text-[#0F2854]" />
        </button>
      </div>
    </div>
  );
}
