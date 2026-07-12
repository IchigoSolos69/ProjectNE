"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ScrollFloat from "./ScrollFloat";

gsap.registerPlugin(ScrollTrigger);

interface BlanketTransitionProps {
  triggerId: string;
}

export default function BlanketTransition({ triggerId }: BlanketTransitionProps) {
  const blanketRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const blanket = blanketRef.current;
    const triggerElement = document.getElementById(triggerId);

    if (!blanket || !triggerElement) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: triggerElement,
        start: "top 72px",
        end: "+=100%",
        scrub: true,
        pin: true,
        pinSpacing: true,
      },
    });

    tl.fromTo(blanket, { y: "100%" }, { y: "0%", ease: "none" });

    return () => {
      ScrollTrigger.getAll().forEach((st) => {
        if (st.vars.trigger === triggerElement) {
          st.kill();
        }
      });
    };
  }, [triggerId]);

  return (
    <div
      ref={blanketRef}
      className="absolute inset-0 z-20 rounded-t-[4rem] md:rounded-t-[10vw] shadow-[0_-35px_80px_rgba(28,77,141,0.45),_inset_0_20px_40px_rgba(255,255,255,0.75)] border-t border-brand-ocean/25 overflow-hidden flex items-center justify-center"
      style={{
        background: "radial-gradient(circle at 50% 30%, #F1F9FC 0%, #BDE8F5 70%, #A2D5E3 100%)",
      }}
    >
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-80"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <pattern id="damask-weave" width="160" height="160" patternUnits="userSpaceOnUse">
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

      <div className="relative z-40 w-full px-6 sm:px-10 lg:px-16 max-w-5xl mx-auto text-center -translate-y-16 md:-translate-y-24">
        <ScrollFloat
          triggerId={triggerId}
          scrollStart="top+=42% 72px"
          scrollEnd="top+=72% 72px"
          animationDuration={1}
          stagger={0.022}
          containerClassName="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight uppercase leading-[1.15]"
          textClassName="text-brand-midnight font-serif tracking-tight text-center justify-center"
        >
          Crafted for Deep Sleep and Unmatched Luxury
        </ScrollFloat>
      </div>
    </div>
  );
}
