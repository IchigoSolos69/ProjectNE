import { createClient } from "@/utils/supabase/client";
import type { CartItem } from "@/types/database";

type ProductSnapshot = {
  id: string;
  slug: string;
  name: string;
  price_paise: number;
  images: string[];
  is_active: boolean;
};

function resolveProduct(
  product: ProductSnapshot | ProductSnapshot[] | null,
): ProductSnapshot | null {
  if (!product) return null;
  return Array.isArray(product) ? (product[0] ?? null) : product;
}

export async function fetchUserCart(userId: string): Promise<CartItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("user_cart_items")
    .select(
      "quantity, product:products(id, slug, name, price_paise, images, is_active)",
    )
    .eq("user_id", userId);

  if (error) {
    console.error("[cart] Failed to load cart from Supabase:", error);
    return [];
  }

  const rows = (data ?? []) as Array<{
    quantity: number;
    product: ProductSnapshot | ProductSnapshot[] | null;
  }>;

  return rows
    .map((row) => {
      const product = resolveProduct(row.product);
      if (!product?.is_active) return null;
      return {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        image: product.images[0] ?? "/placeholder-product.jpg",
        pricePaise: product.price_paise,
        quantity: row.quantity,
      } satisfies CartItem;
    })
    .filter((item): item is CartItem => item !== null);
}

export async function saveUserCart(
  userId: string,
  items: CartItem[],
): Promise<void> {
  const supabase = createClient();

  const { error: deleteError } = await supabase
    .from("user_cart_items")
    .delete()
    .eq("user_id", userId);

  if (deleteError) {
    console.error("[cart] Failed to clear remote cart:", deleteError);
    return;
  }

  if (items.length === 0) return;

  const { error: insertError } = await supabase.from("user_cart_items").insert(
    items.map((item) => ({
      user_id: userId,
      product_id: item.productId,
      quantity: item.quantity,
    })),
  );

  if (insertError) {
    console.error("[cart] Failed to save cart to Supabase:", insertError);
  }
}

/** Merge guest (local) cart with server cart; higher quantity wins per product. */
export function mergeCartItems(
  local: CartItem[],
  remote: CartItem[],
): CartItem[] {
  const merged = new Map<string, CartItem>();

  for (const item of [...remote, ...local]) {
    const existing = merged.get(item.productId);
    if (!existing || item.quantity > existing.quantity) {
      merged.set(item.productId, { ...item });
    }
  }

  return Array.from(merged.values());
}
