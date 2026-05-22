import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategoryBySlug, getProductsByCategorySlug, getSubcategories } from "@/lib/catalog";
import { ProductGrid } from "@/components/products/product-grid";
import { isPreviewBuild } from "@/lib/preview-build";
import { getStaticCategoryParams } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ category: string }>;
  searchParams?: Promise<{ q?: string; price?: string; sort?: string; filter?: string }>;
}

export function generateStaticParams() {
  return isPreviewBuild ? getStaticCategoryParams() : [];
}

export async function generateMetadata({ params }: PageProps) {
  const { category } = await params;
  const cat = await getCategoryBySlug(category);
  return { title: cat?.name ?? "Shop" };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { category: categorySlug } = await params;
  const sParams = searchParams ? await searchParams : {};
  const category = await getCategoryBySlug(categorySlug);

  if (!category || category.parent_id) {
    notFound();
  }

  let products = await getProductsByCategorySlug(categorySlug);
  const subs = await getSubcategories(category.id);

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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="max-w-2xl">
        <h1 className="font-serif text-3xl text-foreground">{category.name}</h1>
        {category.description && (
          <p className="mt-3 text-muted-foreground">{category.description}</p>
        )}
      </div>

      {subs.length > 0 && (
        <nav className="mt-8 flex flex-wrap gap-3">
          {subs.map((sub) => (
            <Link
              key={sub.slug}
              href={`/shop/${categorySlug}/${sub.slug}`}
              className="rounded-full border border-border px-4 py-1.5 text-sm text-foreground/90 transition-colors hover:border-primary hover:text-foreground"
            >
              {sub.name}
            </Link>
          ))}
        </nav>
      )}

      <div className="mt-12">
        <ProductGrid products={products} emptyMessage="No products match your selected filters." />
      </div>
    </div>
  );
}
