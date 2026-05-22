"use client";

import * as React from "react";
import Image, { type ImageProps } from "next/image";
import { cn } from "@/lib/utils";

interface FadeInImageProps extends ImageProps {
  wrapperClassName?: string;
}

export function FadeInImage({
  className,
  wrapperClassName,
  alt,
  ...props
}: FadeInImageProps) {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      setIsLoaded(true);
    }
  }, []);

  return (
    <div className={cn("relative overflow-hidden w-full h-full", wrapperClassName)}>
      <Image
        ref={imgRef}
        alt={alt}
        className={cn(
          "transition-opacity duration-350 ease-out",
          isLoaded ? "opacity-100" : "opacity-0",
          className
        )}
        onLoad={() => setIsLoaded(true)}
        {...props}
      />
    </div>
  );
}
