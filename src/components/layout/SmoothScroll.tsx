"use client";

import React, { useEffect, useRef } from "react";
import { ReactLenis } from "@studio-freight/react-lenis";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<any>(null);

  useEffect(() => {
    const lenisInstance = lenisRef.current?.lenis;
    if (!lenisInstance) return;

    const handleScroll = () => {
      ScrollTrigger.refresh();
    };

    lenisInstance.on("scroll", handleScroll);

    return () => {
      lenisInstance.off("scroll", handleScroll);
    };
  }, []);

  return (
    <ReactLenis
      ref={lenisRef}
      root
      options={{
        lerp: 0.05,
        duration: 1.2,
      }}
    >
      {children as any}
    </ReactLenis>
  );
}
