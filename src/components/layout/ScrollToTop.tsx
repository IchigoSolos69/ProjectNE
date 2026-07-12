"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useLenis } from "lenis/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function ScrollToTop() {
  const pathname = usePathname();
  const lenis = useLenis();

  useEffect(() => {
    window.scrollTo(0, 0);
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    }

    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname, lenis]);

  return null;
}
