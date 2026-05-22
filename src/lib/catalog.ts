import { createClient } from "@/lib/supabase/server";
import type { Category, Product } from "@/types/database";

export async function getTopCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .is("parent_id", null)
    .order("sort_order");

  if (error) throw error;
  return data ?? [];
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getSubcategories(parentId: string): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("parent_id", parentId)
    .order("sort_order");

  if (error) throw error;
  return data ?? [];
}

export async function getProductsByCategorySlug(
  categorySlug: string,
  subcategorySlug?: string,
): Promise<Product[]> {
  const supabase = await createClient();

  if (subcategorySlug) {
    const parent = await getCategoryBySlug(categorySlug);
    if (!parent) return [];

    const { data: sub } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", subcategorySlug)
      .eq("parent_id", parent.id)
      .maybeSingle();

    if (!sub) return [];

    const { data, error } = await supabase
      .from("products")
      .select("*, category:categories(*)")
      .eq("category_id", sub.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data ?? []) as Product[];
  }

  const parent = await getCategoryBySlug(categorySlug);
  if (!parent) return [];

  const subs = await getSubcategories(parent.id);
  const ids = subs.map((s) => s.id);

  if (ids.length === 0) return [];

  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories(*)")
    .in("category_id", ids)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Product[];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories(*)")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw error;
  return data as Product | null;
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories(*)")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as Product[];
}
