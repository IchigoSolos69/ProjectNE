"use server";

import { createClient } from "@/utils/supabase/server";
import type { Database } from "../../types/supabase";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];
type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];
type CartItemRow = Database["public"]["Tables"]["user_cart_items"]["Row"];

export interface CatalogProduct extends ProductRow {
  categories: {
    name: string;
  } | null;
}

export interface CategoryWithProducts {
  category: CategoryRow;
  products: ProductRow[];
}

export interface JoinedCartItem extends CartItemRow {
  products: {
    name: string;
    price_paise: number;
    images: string[];
  } | null;
}

/**
 * 1. Fetches all active products, joined with their category names.
 * Sorted by created_at descending.
 */
export async function getCatalog(): Promise<{
  data: CatalogProduct[] | null;
  error: string | null;
}> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        categories!products_category_id_fkey (
          name
        )
      `)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as CatalogProduct[], error: null };
  } catch (err: any) {
    return { data: null, error: err.message || "An unexpected error occurred." };
  }
}

/**
 * 2. Fetches a specific category and all its associated active products (including subcategories).
 */
export async function getCategory(slug: string): Promise<{
  data: CategoryWithProducts | null;
  error: string | null;
}> {
  try {
    const supabase = await createClient();

    // 1. Fetch the category itself
    const { data: category, error: catError } = await supabase
      .from("categories")
      .select("*")
      .eq("slug", slug)
      .single();

    if (catError) {
      return { data: null, error: catError.message };
    }

    // 2. Fetch subcategories to include child products if it's a parent category
    const { data: subcategories, error: subError } = await supabase
      .from("categories")
      .select("id")
      .eq("parent_id", category.id);

    if (subError) {
      return { data: null, error: subError.message };
    }

    const categoryIds = [category.id, ...(subcategories?.map((s) => s.id) || [])];

    // 3. Fetch products belonging to any of these category IDs
    const { data: products, error: prodError } = await supabase
      .from("products")
      .select("*")
      .in("category_id", categoryIds)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (prodError) {
      return { data: null, error: prodError.message };
    }

    return {
      data: {
        category,
        products,
      },
      error: null,
    };
  } catch (err: any) {
    return { data: null, error: err.message || "An unexpected error occurred." };
  }
}

/**
 * 3. Inserts or updates an item in the user_cart_items table for the currently authenticated user.
 */
export async function addToCart(
  productId: string,
  quantity: number
): Promise<{
  data: CartItemRow | null;
  error: string | null;
}> {
  try {
    if (quantity <= 0) {
      return { data: null, error: "Quantity must be greater than zero." };
    }

    const supabase = await createClient();

    // Fetch the authenticated user session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { data: null, error: "Authentication required to add items to your cart." };
    }

    // Check if the product already exists in the user's cart
    const { data: existing, error: fetchError } = await supabase
      .from("user_cart_items")
      .select("quantity")
      .eq("user_id", user.id)
      .eq("product_id", productId)
      .maybeSingle();

    if (fetchError) {
      return { data: null, error: fetchError.message };
    }

    const newQuantity = existing ? existing.quantity + quantity : quantity;

    // Upsert the cart item with new quantity
    const { data, error } = await supabase
      .from("user_cart_items")
      .upsert({
        user_id: user.id,
        product_id: productId,
        quantity: newQuantity,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || "An unexpected error occurred." };
  }
}

/**
 * 4. Fetches the current user's cart items, joining the products table
 * to get the name, price, and image.
 */
export async function getCart(): Promise<{
  data: JoinedCartItem[] | null;
  error: string | null;
}> {
  try {
    const supabase = await createClient();

    // Fetch the authenticated user session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { data: null, error: "Authentication required to retrieve cart." };
    }

    const { data, error } = await supabase
      .from("user_cart_items")
      .select(`
        *,
        products!user_cart_items_product_id_fkey (
          name,
          price_paise,
          images
        )
      `)
      .eq("user_id", user.id);

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as JoinedCartItem[], error: null };
  } catch (err: any) {
    return { data: null, error: err.message || "An unexpected error occurred." };
  }
}
