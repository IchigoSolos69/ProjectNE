"use client";

import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import type { Product } from "@/types/database";
import { ProductCard } from "./product-card";

interface ProductGridProps {
  products: Product[];
  emptyMessage?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut" as const,
    },
  },
};

export function ProductGrid({
  products,
  emptyMessage = "No products in this collection yet.",
}: ProductGridProps) {
  const reducedMotion = usePrefersReducedMotion();

  if (products.length === 0) {
    return (
      <p className="py-24 text-center text-muted-foreground">{emptyMessage}</p>
    );
  }

  if (reducedMotion) {
    return (
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-8">
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            priority={index < 2}
          />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-8"
    >
      {products.map((product, index) => (
        <motion.div key={product.id} variants={itemVariants}>
          <ProductCard
            product={product}
            priority={index < 2}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
