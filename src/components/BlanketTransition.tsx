"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface BlanketTransitionProps {
  triggerId: string;
}

const LUXURY_PHRASES = [
  "The Ultimate Sleep Experience",
  "Uncompromising Everyday Luxury",
  "Ethically Sourced, Exquisitely Woven",
  "Transform Your Sanctuary",
  "Drift into Pure Serenity",
] as const;

export default function BlanketTransition({ triggerId }: BlanketTransitionProps) {
  const blanketRef = useRef<HTMLDivElement>(null);
  const marqueeContainerRef = useRef<HTMLDivElement>(null);
  const failsafeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Use a deterministic initial value so SSR and the first client render match.
  const [activePhrase, setActivePhrase] = useState<string>(LUXURY_PHRASES[0]);
  const [isOverlayHidden, setIsOverlayHidden] = useState(false);

  // Randomize only after mount to avoid a Next.js hydration mismatch.
  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      const phraseIndex = Math.floor(Math.random() * LUXURY_PHRASES.length);
      setActivePhrase(LUXURY_PHRASES[phraseIndex]);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
      if (failsafeTimeoutRef.current) {
        clearTimeout(failsafeTimeoutRef.current);
      }
    };
  }, []);

  // 1. Scroll-linked Threshold Hard-Resets (Directive 2)
  useEffect(() => {
    const checkScroll = () => {
      const triggerElement = document.getElementById(triggerId);
      if (!triggerElement) return;
      const rect = triggerElement.getBoundingClientRect();

      // If the hero section is scrolled past, immediately force blanket to hide
      if (rect.bottom <= 0 || window.scrollY > rect.height) {
        setIsOverlayHidden(true);
      } else {
        // Only show if not locked out by a failsafe
        if (failsafeTimeoutRef.current === null) {
          setIsOverlayHidden(false);
        }
      }
    };

    window.addEventListener("scroll", checkScroll, { passive: true });
    checkScroll();
    return () => window.removeEventListener("scroll", checkScroll);
  }, [triggerId]);

  // 2. Timeline and Resize triggers (Directive 1 & 2)
  useEffect(() => {
    const blanket = blanketRef.current;
    const triggerElement = document.getElementById(triggerId);

    if (!blanket || !triggerElement) return;

    let refreshFrame: number | undefined;
    const scheduleRefresh = () => {
      if (refreshFrame !== undefined) {
        window.cancelAnimationFrame(refreshFrame);
      }

      refreshFrame = window.requestAnimationFrame(() => {
        refreshFrame = undefined;
        ScrollTrigger.refresh();
      });
    };

    // Debounced resize listener to avoid freezing mid-calculation on mobile UI shifts (Directive 2)
    let resizeTimeout: NodeJS.Timeout | undefined;
    const handleResize = () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        scheduleRefresh();
      }, 150);
    };

    const triggerFailsafe = () => {
      if (failsafeTimeoutRef.current) clearTimeout(failsafeTimeoutRef.current);
      failsafeTimeoutRef.current = setTimeout(() => {
        setIsOverlayHidden(true);
      }, 2500); // Failsafe Timeout (Directive 1)
    };

    let media: ReturnType<typeof gsap.matchMedia> | undefined;
    const context = gsap.context(() => {
      media = gsap.matchMedia();

      media.add("(max-width: 1023px)", () => {
        // MOBILE & TABLET: Lightweight viewport slide without layout pins.
        gsap.set(blanket, { autoAlpha: 1 });
        gsap.fromTo(
          blanket,
          { yPercent: 100 },
          {
            yPercent: 0,
            ease: "power2.out",
            scrollTrigger: {
              trigger: triggerElement,
              start: "top 72px",
              end: "bottom top",
              scrub: 1.5,
              invalidateOnRefresh: true,
              onToggle: (self) => {
                if (self.isActive) triggerFailsafe();
              },
              onUpdate: (self) => {
                if (self.progress >= 0.99) {
                  setIsOverlayHidden(true);
                }
              }
            },
          }
        );
      });

      media.add("(min-width: 1024px)", () => {
        // DESKTOP: Pin the stable hero container and sweep the blanket upward.
        gsap.set(blanket, { autoAlpha: 1 });
        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: triggerElement,
            start: "top 72px",
            end: "+=100%",
            scrub: 1,
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onToggle: (self) => {
              if (self.isActive) triggerFailsafe();
            },
            onUpdate: (self) => {
              if (self.progress >= 0.99) {
                setIsOverlayHidden(true);
              }
            }
          },
        });

        timeline.fromTo(
          blanket,
          { yPercent: 100, scaleY: 1.02, transformOrigin: "top center" },
          { yPercent: 0, scaleY: 1, ease: "none" }
        );
      });
    }, blanket);

    // Refresh after LCP images and responsive layout changes.
    const resizeObserver = new ResizeObserver(scheduleRefresh);
    resizeObserver.observe(triggerElement);

    const images = Array.from(triggerElement.querySelectorAll("img"));
    images.forEach((image) => {
      if (!image.complete) {
        image.addEventListener("load", scheduleRefresh);
      }
    });

    window.addEventListener("load", scheduleRefresh);
    window.addEventListener("resize", handleResize);
    scheduleRefresh();

    return () => {
      window.removeEventListener("load", scheduleRefresh);
      window.removeEventListener("resize", handleResize);
      if (resizeTimeout) clearTimeout(resizeTimeout);
      images.forEach((image) => image.removeEventListener("load", scheduleRefresh));
      resizeObserver.disconnect();
      if (refreshFrame !== undefined) {
        window.cancelAnimationFrame(refreshFrame);
      }
      media?.revert();
      context.revert();
    };
  }, [triggerId]);

  // Infinite Marquee Animation with Fade-In
  useEffect(() => {
    const marqueeContainer = marqueeContainerRef.current;
    if (!marqueeContainer) return;

    // Fade in the marquee text over 2 seconds
    gsap.to(marqueeContainer, {
      opacity: 1,
      duration: 2,
      ease: "power2.out",
      delay: 0.5
    });

    // Create seamless infinite horizontal loop
    const marqueeWidth = marqueeContainer.scrollWidth / 4; // Width of one repetition
    
    const marqueeAnimation = gsap.to(marqueeContainer, {
      x: -marqueeWidth,
      duration: 20,
      ease: "none",
      repeat: -1,
      modifiers: {
        x: gsap.utils.unitize((x) => parseFloat(x) % marqueeWidth)
      }
    });

    return () => {
      marqueeAnimation.kill();
    };
  }, [activePhrase]);

  return (
    <div
      ref={blanketRef}
      className={`absolute inset-0 z-20 rounded-t-[4rem] md:rounded-t-[10vw] shadow-[0_-20px_40px_rgba(73,136,196,0.2),_0_-35px_80px_rgba(28,77,141,0.45),_inset_0_10px_20px_rgba(255,255,255,0.6),_inset_0_20px_40px_rgba(255,255,255,0.8)] border-t border-brand-ocean/25 overflow-hidden flex items-center justify-center invisible will-change-transform animate-silk-shimmer ${
        isOverlayHidden ? "pointer-events-none !opacity-0 !invisible" : ""
      }`}
      style={{
        background: `
          linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 40%, rgba(73,136,196,0.1) 60%, rgba(255,255,255,0.3) 100%),
          linear-gradient(75deg, rgba(255,255,255,0) 20%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0) 80%),
          #BDE8F5
        `,
        backgroundSize: "200% 200%",
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

      <div className="relative z-40 w-full overflow-hidden">
        <div 
          ref={marqueeContainerRef}
          className="flex whitespace-nowrap opacity-0"
          style={{ willChange: 'transform' }}
        >
          {/* Duplicate the text multiple times to ensure seamless infinite scroll */}
          {[0, 1, 2, 3].map((index) => (
            <span
              key={index}
              className="font-serif text-xl sm:text-2xl md:text-4xl lg:text-5xl xl:text-[4.1rem] font-bold uppercase tracking-[0.08em] text-brand-midnight px-8"
            >
              {activePhrase} • 
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
