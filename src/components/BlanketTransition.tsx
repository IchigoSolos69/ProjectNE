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

    // 2. Text fade-in and slide-up triggered when the blanket is pulled halfway up the screen
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
      className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#BDE8F5] via-white/40 to-[#BDE8F5] rounded-t-[4rem] md:rounded-t-[10vw] flex flex-col items-center justify-start pt-[15vh] z-20 shadow-[inset_0_4px_20px_rgba(255,255,255,0.5),_0_-30px_60px_rgba(73,136,196,0.3)] border-t border-white/60 transition-colors duration-300 pointer-events-auto"
    >
      <div ref={textRef} className="text-center px-6 max-w-4xl">
        <ScrollFloat
          animationDuration={1.5}
          scrollStart="top 75%"
          scrollEnd="center center"
          containerClassName="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight uppercase"
          textClassName="text-[#0F2854] font-serif tracking-tight justify-center flex-wrap"
        >
          Crafted for Deep Sleep and Unmatched Luxury
        </ScrollFloat>
      </div>
    </div>
  );
};

export default BlanketTransition;
