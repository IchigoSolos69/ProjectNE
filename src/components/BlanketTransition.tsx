"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ScrollFloat from "./ScrollFloat";

gsap.registerPlugin(ScrollTrigger);

interface BlanketTransitionProps {
  triggerId: string;
}

export const BlanketTransition: React.FC<BlanketTransitionProps> = ({ triggerId }) => {
  const blanketRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const blanket = blanketRef.current;
    const text = textRef.current;
    const triggerElement = document.getElementById(triggerId);

    if (!blanket || !text || !triggerElement) return;

    // 1. Create a timeline that pins the parent container and slides the blanket up
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: triggerElement,
        start: "top top",
        end: "+=100%", // Scroll duration equal to one full viewport height
        scrub: true,
        pin: true, // Pin the parent wrapper container
        pinSpacing: true, // Allow standard page scrolling to resume when finished
      },
    });

    // Translate the blanket section up from offscreen (100vh) to fully overlap the hero (0vh)
    tl.fromTo(
      blanket,
      { y: "100vh" },
      { y: "0vh", ease: "none" }
    );

    // 2. Text container fade-in and slide-up triggered as the blanket covers the screen
    gsap.fromTo(
      text,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        ease: "power2.out",
        scrollTrigger: {
          trigger: triggerElement,
          start: "top+=40% top", // Triggers when blanket is pulled up past the ~40% mark
          end: "top+=70% top",
          scrub: true,
        },
      }
    );

    return () => {
      // Clean up triggers on unmount
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars.trigger === triggerElement) {
          trigger.kill();
        }
      });
    };
  }, [triggerId]);

  return (
    <div
      ref={blanketRef}
      className="absolute top-0 left-0 w-full h-full rounded-t-[4rem] md:rounded-t-[10vw] z-20 shadow-[0_-35px_80px_rgba(28,77,141,0.45),_inset_0_20px_40px_rgba(255,255,255,0.75)] border-t border-[#4988C4]/25 transition-colors duration-300 pointer-events-auto overflow-hidden relative flex items-center justify-center"
      style={{
        background: "radial-gradient(circle at 50% 30%, #F1F9FC 0%, #BDE8F5 70%, #A2D5E3 100%)"
      }}
    >
      {/* Intricate, faint, large-scale woven damask motif using #4988C4 at low opacity */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-80" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="damask-weave" width="160" height="160" patternUnits="userSpaceOnUse">
            {/* Classical symmetric floral/leaf curves */}
            <path d="M 80 10 C 90 35, 115 35, 80 70 C 45 35, 70 35, 80 10 Z" fill="#4988C4" fillOpacity="0.03" />
            <path d="M 80 150 C 90 125, 115 125, 80 90 C 45 125, 70 125, 80 150 Z" fill="#4988C4" fillOpacity="0.03" />
            <path d="M 10 80 C 35 90, 35 115, 70 80 C 35 45, 35 70, 10 80 Z" fill="#4988C4" fillOpacity="0.03" />
            <path d="M 150 80 C 125 90, 125 115, 90 80 C 125 45, 125 70, 150 80 Z" fill="#4988C4" fillOpacity="0.03" />
            <circle cx="80" cy="80" r="12" fill="none" stroke="#4988C4" strokeWidth="2" strokeOpacity="0.03" />
            <path d="M 80 45 C 70 55, 60 55, 60 65 C 60 75, 70 75, 80 65 C 90 75, 100 75, 100 65 C 100 55, 90 55, 80 45 Z" fill="none" stroke="#4988C4" strokeWidth="1.5" strokeOpacity="0.03" strokeDasharray="3,3" />
            <path d="M 80 115 C 70 105, 60 105, 60 95 C 60 85, 70 85, 80 95 C 90 85, 100 85, 100 95 C 100 105, 90 105, 80 115 Z" fill="none" stroke="#4988C4" strokeWidth="1.5" strokeOpacity="0.03" strokeDasharray="3,3" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#damask-weave)" />
      </svg>

      {/* Pinned text container, lifted to the top-end (plush edge) with high z-index */}
      <div ref={textRef} className="absolute top-[10%] left-1/2 -translate-x-1/2 w-full px-4 text-center z-40 max-w-4xl">
        <ScrollFloat
          animationDuration={1.3}
          scrollStart="top bottom"
          scrollEnd="center center"
          containerClassName="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight uppercase"
          textClassName="text-[#0F2854] font-serif tracking-tight text-center justify-center flex-wrap"
        >
          Crafted for Deep Sleep and Unmatched Luxury
        </ScrollFloat>
      </div>
    </div>
  );
};

export default BlanketTransition;
