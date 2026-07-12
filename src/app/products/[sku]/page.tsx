import ProductClient from "./ProductClient";

interface DatabaseProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  sku: string;
  inventoryCount: number;
  isActive: boolean;
}

// Generate static params for all products at build time using SKU
export async function generateStaticParams() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
      // Prevent caching during build to get fresh data
      cache: "no-store",
    });

    if (!response.ok) {
      console.warn(`Failed to fetch products for static generation: ${response.status}`);
      return [];
    }

    const products: DatabaseProduct[] = await response.json();

    return products.map((product) => ({
      sku: product.sku,
    }));
  } catch (error) {
    // If the backend is asleep or unreachable during build time, return empty array
    // This allows the build to pass and pages will be generated on-demand
    console.warn("Failed to fetch products during build, static generation skipped:", error);
    return [];
  }
}

export default function ProductDetailPage({ params }: { params: { sku: string } }) {
  return <ProductClient sku={params.sku} />;
}
