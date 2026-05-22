import type { Category, Product, Order } from "@/types/database";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getAllCategories,
  getProductBySlug as getMockProductBySlug,
  getProductsByCategoryId as getMockProductsByCategoryId,
  MOCK_PRODUCTS,
} from "@/lib/mock-data";
import { isPreviewBuild } from "@/lib/preview-build";

// Product APIs
export async function getProducts(): Promise<Product[]> {
  if (isPreviewBuild) {
    return MOCK_PRODUCTS.filter((p) => p.is_active);
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories(*)")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }
  return data || [];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (isPreviewBuild) {
    return getMockProductBySlug(slug);
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories(*)")
    .eq("slug", slug)
    .maybeSingle();
  if (error) {
    console.error(`Error fetching product by slug ${slug}:`, error);
    return null;
  }
  return data;
}

export async function getProductsByCategoryId(categoryId: string): Promise<Product[]> {
  if (isPreviewBuild) {
    return getMockProductsByCategoryId(categoryId);
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories(*)")
    .eq("category_id", categoryId);
  if (error) {
    console.error(`Error fetching products by category ${categoryId}:`, error);
    return [];
  }
  return data || [];
}

export async function getCategories(): Promise<Category[]> {
  if (isPreviewBuild) {
    return getAllCategories();
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
  return data || [];
}

export async function getOrders(): Promise<Order[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, items:order_items(*)")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
  return data || [];
}

export async function createProduct(productData: Omit<Product, "id" | "created_at" | "updated_at">): Promise<Product> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("products")
    .insert(productData)
    .select()
    .single();
  if (error) {
    console.error("Error creating product:", error);
    throw error;
  }
  return data;
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) {
    console.error(`Error updating product ${id}:`, error);
    throw error;
  }
  return data;
}

export async function createOrder(orderData: Omit<Order, "id" | "created_at" | "updated_at"> & { id?: string }): Promise<Order> {
  const { items, ...dbOrderData } = orderData as any;
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .insert(dbOrderData)
    .select()
    .single();
  if (error) {
    console.error("Error creating order:", error);
    throw error;
  }

  if (items && items.length > 0) {
    const orderItemsData = items.map((item: any) => ({
      order_id: data.id,
      product_id: item.product_id || item.productId,
      quantity: item.quantity,
      unit_price_paise: item.unit_price_paise || item.pricePaise || item.unitPricePaise,
      product_name: item.product_name || item.name || item.productName,
      product_slug: item.product_slug || item.slug || item.productSlug,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItemsData);

    if (itemsError) {
      console.error("Error creating order items:", itemsError);
      throw itemsError;
    }
    data.items = orderItemsData;
  }

  return data;
}

export async function updateOrderStatus(id: string, status: Order["status"]): Promise<Order> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", id)
    .select()
    .single();
  if (error) {
    console.error(`Error updating order status ${id}:`, error);
    throw error;
  }
  return data;
}
