import {
  getTopCategories as getMockTopCategories,
  getCategoryBySlug as getMockCategoryBySlug,
  getSubcategoriesForParent,
  getProductsByCategoryId,
  getProductBySlug as getMockProductBySlug,
  getFeaturedProducts as getMockFeaturedProducts,
} from "@/lib/mock-data";
import type { Category, Product } from "@/types/database";

export async function getTopCategories(): Promise<Category[]> {
  return getMockTopCategories();
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  return getMockCategoryBySlug(slug);
}

export async function getSubcategories(parentId: string): Promise<Category[]> {
  return getSubcategoriesForParent(parentId);
}

export async function getProductsByCategorySlug(
  categorySlug: string,
  subcategorySlug?: string,
): Promise<Product[]> {
  if (subcategorySlug) {
    const parent = await getCategoryBySlug(categorySlug);
    if (!parent) return [];

    const sub = getMockCategoryBySlug(subcategorySlug);
    if (!sub || sub.parent_id !== parent.id) return [];

    return getProductsByCategoryId(sub.id);
  }

  const parent = await getCategoryBySlug(categorySlug);
  if (!parent) return [];

  const subs = getSubcategoriesForParent(parent.id);

  if (subs.length === 0) {
    return getProductsByCategoryId(parent.id);
  }

  return subs.flatMap((sub) => getProductsByCategoryId(sub.id));
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return getMockProductBySlug(slug);
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  return getMockFeaturedProducts(limit);
}
