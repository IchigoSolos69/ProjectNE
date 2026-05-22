import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategoryBySlug, getProductsByCategorySlug, getSubcategories } from "@/lib/catalog";
import { ProductGrid } from "@/components/products/product-grid";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ category: string }>;
}

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: PageProps) {
  const { category } = await params;
  const cat = await getCategoryBySlug(category);
  return { title: cat?.name ?? "Shop" };
}

export default async function CategoryPage({ params }: PageProps) {
  const { category: categorySlug } = await params;
  const category = await getCategoryBySlug(categorySlug);

  if (!category || category.parent_id) {
    notFound();
  }

  const products = await getProductsByCategorySlug(categorySlug);
  const subs = await getSubcategories(category.id);


  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <h1 className="font-serif text-3xl text-stone-900">{category.name}</h1>
        {category.description && (
          <p className="mt-3 text-stone-600">{category.description}</p>
        )}
      </div>

      {subs.length > 0 && (
        <nav className="mt-8 flex flex-wrap gap-3">
          {subs.map((sub) => (
            <Link
              key={sub.slug}
              href={`/shop/${categorySlug}/${sub.slug}`}
              className="rounded-full border border-stone-300 px-4 py-1.5 text-sm text-stone-700 transition-colors hover:border-stone-900 hover:text-stone-900"
            >
              {sub.name}
            </Link>
          ))}
        </nav>
      )}

      <div className="mt-12">
        <ProductGrid products={products} />
      </div>
    </div>
  );
}
