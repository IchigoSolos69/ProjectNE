"use client";

import React, { useEffect, useRef, useState } from "react";

interface ScrollAnimateProps {
  children: React.ReactNode;
  className?: string;
}

export default function ScrollAnimate({ children, className = "" }: ScrollAnimateProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.05,
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out transform ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      } ${className}`}
    >
      {children}
    </div>
  );
}
