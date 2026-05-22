import Link from "next/link";
import { getFeaturedProducts, getTopCategories } from "@/lib/catalog";
import { ProductGrid } from "@/components/products/product-grid";
import { Button } from "@/components/ui/button";
import { BRAND_NAME } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [products, categories] = await Promise.all([
    getFeaturedProducts(),
    getTopCategories(),
  ]);

  return (
    <>
      <section className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <p className="text-sm uppercase tracking-[0.2em] text-stone-500">
            Premium home goods
          </p>
          <h1 className="mt-4 max-w-2xl font-serif text-4xl leading-tight text-stone-900 sm:text-5xl lg:text-6xl">
            Refined rest.
          </h1>
          <p className="mt-6 max-w-lg text-stone-600">
            Discover {BRAND_NAME} — thoughtfully woven bedding, spa-weight
            towels, and pillow covers for everyday luxury.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            {categories.map((cat) => (
              <Button key={cat.slug} variant="outline" asChild>
                <Link href={`/shop/${cat.slug}`}>{cat.name}</Link>
              </Button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mb-10 flex items-end justify-between">
          <h2 className="font-serif text-2xl text-stone-900">Featured Products</h2>
          <Link href="/shop/beddings" className="text-sm text-stone-600 hover:text-stone-900">
            View all →
          </Link>
        </div>
        <ProductGrid products={products} />
      </section>
    </>
  );
}
