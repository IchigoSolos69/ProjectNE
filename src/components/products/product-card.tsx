"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Product } from "@/types/database";
import { formatINR } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart-store";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const image = product.images[0] ?? "/placeholder-product.jpg";

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="group flex flex-col"
    >
      <Link href={`/product/${product.slug}`} className="relative aspect-[4/5] overflow-hidden rounded-lg bg-stone-100">
        <Image
          src={image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
      </Link>
      <div className="mt-4 flex flex-1 flex-col">
        <Link href={`/product/${product.slug}`}>
          <h3 className="text-sm font-medium text-stone-900">{product.name}</h3>
        </Link>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-sm text-stone-900">{formatINR(product.price_paise)}</span>
          {product.compare_at_price_paise && (
            <span className="text-sm text-stone-400 line-through">
              {formatINR(product.compare_at_price_paise)}
            </span>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="mt-4 w-full"
          onClick={() =>
            addItem({
              productId: product.id,
              slug: product.slug,
              name: product.name,
              image,
              pricePaise: product.price_paise,
            })
          }
        >
          Add to cart
        </Button>
      </div>
    </motion.article>
  );
}
