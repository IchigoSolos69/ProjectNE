"use client";

import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart-store";
import type { Product } from "@/types/database";

interface AddToCartButtonProps {
  product: Product;
  image: string;
}

export function AddToCartButton({ product, image }: AddToCartButtonProps) {
  const addItem = useCartStore((s) => s.addItem);

  return (
    <Button
      size="lg"
      className="min-h-11 w-full sm:w-auto"
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
  );
}
