import Link from "next/link";
import { getFeaturedProducts } from "@/lib/catalog";
import { HeroBanner } from "@/components/layout/hero-banner";
import {
  ShopByCategories,
  ShopByPrice,
  WhatsNew,
  Bestsellers,
} from "@/components/layout/homepage-sections";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await getFeaturedProducts(12);

  return (
    <>
      <HeroBanner />

      {/* 1. Shop By Categories */}
      <ShopByCategories />

      {/* 2. Shop By Price */}
      <ShopByPrice />

      {/* 3. What's New */}
      <WhatsNew products={products} />

      {/* 4. Bestsellers */}
      <Bestsellers products={products} />
    </>
  );
}


