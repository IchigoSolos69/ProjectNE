"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  getProducts,
  getOrders,
  createProduct as dbCreateProduct,
  updateProduct as dbUpdateProduct,
  updateOrderStatus as dbUpdateOrderStatus,
} from "@/lib/db";
import type { Product, Order } from "@/types/database";

// Check if current user is admin
export async function checkIsAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session")?.value;
  return session === "authenticated";
}

// Admin login action
export async function adminLogin(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@projectne.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "NeAdmin2026!";

  if (email === adminEmail && password === adminPassword) {
    const cookieStore = await cookies();
    cookieStore.set("admin_session", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600 * 2, // 2 hours
      path: "/",
    });
    return { success: true };
  }

  return { success: false, error: "Invalid email or password" };
}

// Admin logout action
export async function adminLogout(): Promise<{ success: boolean }> {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  return { success: true };
}

// Update inventory and price of an existing product
export async function updateProductInventory(
  id: string,
  inventory: number,
  pricePaise: number,
): Promise<{ success: boolean; product?: Product; error?: string }> {
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const product = await dbUpdateProduct(id, {
      inventory,
      price_paise: pricePaise,
    });
    revalidatePath("/");
    revalidatePath("/shop/[category]", "layout");
    revalidatePath("/product/[slug]", "layout");
    return { success: true, product };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to update product" };
  }
}

// Add a new product
export async function addNewProduct(productData: {
  name: string;
  category_id: string;
  description: string;
  pricePaise: number;
  compareAtPricePaise?: number;
  imageUrl: string;
  sku: string;
  inventory: number;
}): Promise<{ success: boolean; product?: Product; error?: string }> {
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const slug = productData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const newProduct = await dbCreateProduct({
      category_id: productData.category_id,
      name: productData.name,
      slug,
      description: productData.description || null,
      price_paise: productData.pricePaise,
      compare_at_price_paise: productData.compareAtPricePaise || null,
      images: [productData.imageUrl],
      sku: productData.sku || null,
      inventory: productData.inventory,
      is_active: true,
      metadata: {},
    });
    revalidatePath("/");
    revalidatePath("/shop/[category]", "layout");
    revalidatePath("/product/[slug]", "layout");
    return { success: true, product: newProduct };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to add product" };
  }
}

// Update the status of an order
export async function updateOrderStatus(
  orderId: string,
  status: Order["status"],
): Promise<{ success: boolean; order?: Order; error?: string }> {
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const order = await dbUpdateOrderStatus(orderId, status);
    revalidatePath("/admin");
    return { success: true, order };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to update order status" };
  }
}
