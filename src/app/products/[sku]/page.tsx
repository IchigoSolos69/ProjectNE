import ProductClient from "./ProductClient";
import { API_URL } from "@/lib/api";

export async function generateStaticParams() {
  try {
    const response = await fetch(`${API_URL}/products`, {
      cache: "no-store",
    });

    if (!response.ok) return [{ sku: "BED-001" }];

    const products = await response.json();
    if (!products || products.length === 0) {
      return [{ sku: "BED-001" }];
    }

    return products.map((product: any) => ({
      sku: product.sku,
    }));
  } catch (error) {
    console.warn("Failed to fetch products during build, using fallback:", error);
    return [{ sku: "BED-001" }];
  }
}

export default async function ProductDetailPage({ params }: { params: Promise<{ sku: string }> }) {
  const resolvedParams = await params;
  return <ProductClient sku={resolvedParams.sku} />;
}
