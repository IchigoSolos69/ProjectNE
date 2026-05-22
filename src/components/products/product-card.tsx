"use client";

import Link from "next/link";
import { FadeInImage } from "@/components/ui/fade-in-image";
import type { Product } from "@/types/database";
import { formatINR } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart-store";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const image = product.images[0] ?? "/placeholder-product.jpg";

  return (
    <article className="group flex flex-col">
      <Link
        href={`/product/${product.slug}`}
        className="relative aspect-[4/5] overflow-hidden rounded-lg bg-muted block"
      >
        <FadeInImage
          src={image}
          alt={product.name}
          fill
          priority={priority}
          loading={priority ? undefined : "lazy"}
          className="object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:md:group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
      </Link>
      <div className="mt-3 flex flex-1 flex-col sm:mt-4">
        <Link href={`/product/${product.slug}`}>
          <h3 className="line-clamp-2 text-sm font-medium text-foreground">
            {product.name}
          </h3>
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-foreground">
            {formatINR(product.price_paise)}
          </span>
          {product.compare_at_price_paise && (
            <span className="text-sm text-muted-foreground/80 line-through">
              {formatINR(product.compare_at_price_paise)}
            </span>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="mt-3 min-h-11 w-full sm:mt-4"
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
    </article>
  );
}
