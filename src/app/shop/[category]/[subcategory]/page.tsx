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
  searchParams?: Promise<{ q?: string; price?: string; sort?: string; filter?: string }>;
}

export function generateStaticParams() {
  return isPreviewBuild ? getStaticSubcategoryParams() : [];
}

export async function generateMetadata({ params }: PageProps) {
  const { subcategory } = await params;
  const cat = await getCategoryBySlug(subcategory);
  return { title: cat?.name ?? "Collection" };
}

export default async function SubcategoryPage({ params, searchParams }: PageProps) {
  const { category: categorySlug, subcategory: subSlug } = await params;
  const sParams = searchParams ? await searchParams : {};
  const parent = await getCategoryBySlug(categorySlug);

  if (!parent || parent.parent_id) {
    notFound();
  }

  const subs = await getSubcategories(parent.id);
  const sub = subs.find((s) => s.slug === subSlug);

  if (!sub) {
    notFound();
  }

  let products = await getProductsByCategorySlug(categorySlug, subSlug);

  // Apply search query filter
  if (sParams.q) {
    const qLower = sParams.q.toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(qLower) ||
        (p.description && p.description.toLowerCase().includes(qLower))
    );
  }

  // Apply price range filter
  if (sParams.price) {
    if (sParams.price === "under-1500") {
      products = products.filter((p) => p.price_paise < 150000);
    } else if (sParams.price === "under-3000") {
      products = products.filter((p) => p.price_paise < 300000);
    } else if (sParams.price === "under-5000") {
      products = products.filter((p) => p.price_paise < 500000);
    } else if (sParams.price === "over-5000") {
      products = products.filter((p) => p.price_paise >= 500000);
    } else if (sParams.price === "1500-3000") {
      products = products.filter((p) => p.price_paise >= 150000 && p.price_paise <= 300000);
    } else if (sParams.price === "over-3000") {
      products = products.filter((p) => p.price_paise > 300000);
    }
  }

  // Apply bestsellers filter
  if (sParams.filter === "bestsellers") {
    products = products.filter((p) => p.inventory > 40);
  }

  // Apply sorting
  if (sParams.sort === "newest") {
    products = [...products].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  } else if (sParams.sort === "price-low-to-high") {
    products = [...products].sort((a, b) => a.price_paise - b.price_paise);
  } else if (sParams.sort === "price-high-to-low") {
    products = [...products].sort((a, b) => b.price_paise - a.price_paise);
  }

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
        <ProductGrid products={products} emptyMessage="No products match your selected filters." />
      </div>
    </div>
  );
}
