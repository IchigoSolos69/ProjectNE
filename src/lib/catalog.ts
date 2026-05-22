import {
  getProducts,
  getCategories,
  getProductBySlug as dbGetProductBySlug,
} from "@/lib/db";
import type { Category, Product } from "@/types/database";

export async function getTopCategories(): Promise<Category[]> {
  const categories = await getCategories();
  return categories.filter((c) => c.parent_id === null);
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const categories = await getCategories();
  return categories.find((c) => c.slug === slug) ?? null;
}

export async function getSubcategories(parentId: string): Promise<Category[]> {
  const categories = await getCategories();
  return categories.filter((c) => c.parent_id === parentId);
}

export async function getProductsByCategorySlug(
  categorySlug: string,
  subcategorySlug?: string,
): Promise<Product[]> {
  const products = await getProducts();
  const categories = await getCategories();

  if (subcategorySlug) {
    const parent = categories.find((c) => c.slug === categorySlug);
    if (!parent) return [];

    const sub = categories.find((c) => c.slug === subcategorySlug);
    if (!sub || sub.parent_id !== parent.id) return [];

    return products.filter((p) => p.category_id === sub.id && p.is_active);
  }

  const parent = categories.find((c) => c.slug === categorySlug);
  if (!parent) return [];

  const subs = categories.filter((c) => c.parent_id === parent.id);

  if (subs.length === 0) {
    return products.filter((p) => p.category_id === parent.id && p.is_active);
  }

  const subIds = subs.map((sub) => sub.id);
  return products.filter((p) => subIds.includes(p.category_id) && p.is_active);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const product = await dbGetProductBySlug(slug);
  if (!product || !product.is_active) return null;
  return product;
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const products = await getProducts();
  return products.filter((p) => p.is_active).slice(0, limit);
}
