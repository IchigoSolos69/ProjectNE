"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface BlanketScrollAnimationProps {
  className?: string;
}

export const BlanketScrollAnimation: React.FC<BlanketScrollAnimationProps> = ({ className = "" }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const blanketPathRef = useRef<SVGPathElement>(null);
  const crease1Ref = useRef<SVGPathElement>(null);
  const crease2Ref = useRef<SVGPathElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const path = blanketPathRef.current;
    const crease1 = crease1Ref.current;
    const crease2 = crease2Ref.current;

    if (!container || !path || !crease1 || !crease2) return;

    // Define the structurally identical resting and warped paths (same number of command letters and coordinates)
    const restingPath = "M 0 350 Q 250 350, 500 350 T 1000 350 L 1000 600 L 0 600 Z";
    const warpedPath = "M 0 280 Q 250 180, 500 300 T 1000 230 L 1000 600 L 0 600 Z";

    const restingCrease1 = "M 150 350 Q 300 370, 450 350";
    const warpedCrease1 = "M 150 250 Q 300 310, 450 270";

    const restingCrease2 = "M 600 350 Q 750 370, 900 350";
    const warpedCrease2 = "M 600 270 Q 750 290, 900 240";

    // Set up the ScrollTrigger animation timeline
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: "top bottom",
        end: "bottom top",
        scrub: 1, // 1-second delay for smooth floaty interpolation
      },
    });

    // Morph the blanket body path
    tl.to(path, {
      attr: { d: warpedPath },
      duration: 1,
      ease: "sine.inOut",
    }, 0);

    // Morph the first crease line path
    tl.to(crease1, {
      attr: { d: warpedCrease1 },
      duration: 1,
      ease: "sine.inOut",
    }, 0);

    // Morph the second crease line path
    tl.to(crease2, {
      attr: { d: warpedCrease2 },
      duration: 1,
      ease: "sine.inOut",
    }, 0);

    // Float the entire SVG canvas slightly upward on scroll
    tl.to(container.querySelector("svg"), {
      y: -120,
      duration: 1,
      ease: "sine.inOut",
    }, 0);

    return () => {
      // Clean up triggers on unmount
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.vars.trigger === container) {
          trigger.kill();
        }
      });
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden pointer-events-none select-none bg-transparent ${className}`}
    >
      <svg
        viewBox="0 0 1000 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full will-change-transform"
      >
        {/* Soft, cottony blanket body using GOTS organic brand-sky tint */}
        <path
          ref={blanketPathRef}
          d="M 0 350 Q 250 350, 500 350 T 1000 350 L 1000 600 L 0 600 Z"
          fill="#BDE8F5"
        />

        {/* Crease shadow lines in Soft Ocean Blue (#4988C4) at low opacity */}
        <path
          ref={crease1Ref}
          d="M 150 350 Q 300 370, 450 350"
          stroke="#4988C4"
          strokeWidth="4"
          strokeOpacity="0.2"
          strokeLinecap="round"
          fill="none"
        />
        <path
          ref={crease2Ref}
          d="M 600 350 Q 750 370, 900 350"
          stroke="#4988C4"
          strokeWidth="4"
          strokeOpacity="0.2"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </div>
  );
};

export default BlanketScrollAnimation;
