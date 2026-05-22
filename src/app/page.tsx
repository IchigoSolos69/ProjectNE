import Link from "next/link";
import { getFeaturedProducts, getTopCategories } from "@/lib/catalog";
import { ProductGrid } from "@/components/products/product-grid";
import { HeroBanner } from "@/components/layout/hero-banner";
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
      <HeroBanner />

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
