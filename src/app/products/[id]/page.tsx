import React from "react";
import { notFound } from "next/navigation";
import { products } from "@/data/products";
import { ProductDetailClient } from "@/components/products/ProductDetailClient";

// Pre-render these paths at build time for Cloudflare Pages static export
export async function generateStaticParams() {
  return products.map((product) => ({
    id: product.id,
  }));
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  const product = products.find((p) => p.id === id);

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}
