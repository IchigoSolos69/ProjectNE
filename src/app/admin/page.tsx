import { checkIsAdmin } from "@/actions/admin";
import { getProducts, getCategories, getOrders } from "@/lib/db";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { Metadata } from "next";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export const metadata: Metadata = {
  title: "Admin Portal",
  description: "Manage inventory, orders, and products.",
};

export default async function AdminPage() {
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) {
    return <AdminLoginForm />;
  }

  const [products, categories, orders] = await Promise.all([
    getProducts(),
    getCategories(),
    getOrders(),
  ]);

  return <AdminDashboard products={products} categories={categories} orders={orders} />;
}
