import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getCategoryBySlug,
  getProductsByCategorySlug,
  getSubcategories,
} from "@/lib/catalog";
import { ProductGrid } from "@/components/products/product-grid";
import { isPreviewBuild } from "@/lib/preview-build";
import { getStaticSubcategoryParams } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ category: string; subcategory: string }>;
}

export function generateStaticParams() {
  return isPreviewBuild ? getStaticSubcategoryParams() : [];
}

export async function generateMetadata({ params }: PageProps) {
  const { subcategory } = await params;
  const cat = await getCategoryBySlug(subcategory);
  return { title: cat?.name ?? "Collection" };
}

export default async function SubcategoryPage({ params }: PageProps) {
  const { category: categorySlug, subcategory: subSlug } = await params;
  const parent = await getCategoryBySlug(categorySlug);

  if (!parent || parent.parent_id) {
    notFound();
  }

  const subs = await getSubcategories(parent.id);
  const sub = subs.find((s) => s.slug === subSlug);

  if (!sub) {
    notFound();
  }

  const products = await getProductsByCategorySlug(categorySlug, subSlug);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <nav className="text-sm text-muted-foreground">
        <Link href={`/shop/${categorySlug}`} className="hover:text-foreground">
          {parent.name}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{sub.name}</span>
      </nav>

      <h1 className="mt-4 font-serif text-3xl text-foreground">{sub.name}</h1>

      <div className="mt-12">
        <ProductGrid products={products} />
      </div>
    </div>
  );
}
