import React from "react";

export default function ProductSkeleton() {
  return (
    <div className="group relative flex flex-col bg-white rounded-xl overflow-hidden border border-brand-sky/40 shadow-sm animate-pulse w-full">
      {/* Image Skeleton */}
      <div className="relative aspect-square bg-gray-200" />

      {/* Details Skeleton */}
      <div className="p-5 flex-1 flex flex-col space-y-4">
        {/* Rating Stars Skeleton */}
        <div className="flex items-center space-x-1">
          <div className="h-3 w-16 bg-gray-200 rounded" />
          <div className="h-3 w-6 bg-gray-200 rounded" />
        </div>

        {/* Title Skeleton */}
        <div className="space-y-2">
          <div className="h-4 w-3/4 bg-gray-200 rounded" />
          <div className="h-4 w-1/2 bg-gray-200 rounded" />
        </div>

        {/* Price Skeleton */}
        <div className="h-4 w-1/4 bg-gray-200 rounded" />

        {/* Button Skeleton */}
        <div className="h-10 w-full bg-gray-200 rounded-md mt-auto pt-2" />
      </div>
    </div>
  );
}
