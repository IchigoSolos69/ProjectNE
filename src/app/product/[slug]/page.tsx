import Image from "next/image";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/catalog";
import { formatINR } from "@/lib/utils";
import { AddToCartButton } from "@/components/products/add-to-cart-button";
import { ProductFaqSection } from "@/components/faq/product-faq-section";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return { title: product?.name ?? "Product" };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const image = product.images[0] ?? "/placeholder-product.jpg";

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-12 lg:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-stone-100">
          <Image
            src={image}
            alt={product.name}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>

        <div>
          <p className="text-sm uppercase tracking-widest text-stone-500">
            {product.category?.name}
          </p>
          <h1 className="mt-2 font-serif text-3xl text-stone-900">{product.name}</h1>
          <div className="mt-4 flex items-center gap-3">
            <span className="text-xl text-stone-900">
              {formatINR(product.price_paise)}
            </span>
            {product.compare_at_price_paise && (
              <span className="text-lg text-stone-400 line-through">
                {formatINR(product.compare_at_price_paise)}
              </span>
            )}
          </div>
          {product.description && (
            <p className="mt-6 leading-relaxed text-stone-600">{product.description}</p>
          )}
          <div className="mt-8">
            <AddToCartButton product={product} image={image} />
          </div>
          {product.sku && (
            <p className="mt-6 text-xs text-stone-400">SKU: {product.sku}</p>
          )}
        </div>
      </div>

      <ProductFaqSection />
    </div>
  );
}
