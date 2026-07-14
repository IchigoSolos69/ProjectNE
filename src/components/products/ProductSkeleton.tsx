import React from "react";

export default function ProductSkeleton() {
  return (
    <div className="group relative flex flex-col bg-white border border-gray-100 rounded-none w-full animate-pulse">
      {/* Image Skeleton */}
      <div className="relative aspect-[4/5] bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 border-b border-gray-100" />

      {/* Details Skeleton */}
      <div className="p-6 flex-1 flex flex-col space-y-4">
        {/* Title Skeleton */}
        <div className="h-4 w-3/4 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-none" />

        {/* Rating Stars Skeleton */}
        <div className="flex items-center space-x-1.5">
          <div className="h-3 w-20 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-none" />
          <div className="h-3 w-8 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-none" />
        </div>

        {/* Description Skeleton */}
        <div className="space-y-2">
          <div className="h-3 w-full bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-none" />
          <div className="h-3 w-5/6 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-none" />
        </div>

        {/* Price & Button Skeleton */}
        <div className="mt-auto pt-2 space-y-4">
          <div className="h-4 w-1/4 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-none" />
          <div className="h-10 w-full bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-none" />
        </div>
      </div>
    </div>
  );
}
