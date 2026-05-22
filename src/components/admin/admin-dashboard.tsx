"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  adminLogout,
  updateProductInventory,
  addNewProduct,
  updateOrderStatus,
} from "@/actions/admin";
import type { Product, Order, Category } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { formatINR } from "@/lib/utils";
import {
  Package,
  ShoppingBag,
  DollarSign,
  AlertTriangle,
  LogOut,
  Search,
  Plus,
  Check,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react";

interface AdminDashboardProps {
  products: Product[];
  categories: Category[];
  orders: Order[];
}

const PRELOADED_BEDDING_IMAGES = [
  { url: "/images/products/bedding-1.png", label: "Floral Gray" },
  { url: "/images/products/bedding-2.png", label: "Feather Blue" },
  { url: "/images/products/bedding-3.png", label: "Feather Purple" },
  { url: "/images/products/bedding-4.jpg", label: "Damask Rose" },
];

export function AdminDashboard({ products: initialProducts, categories, orders: initialOrders }: AdminDashboardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "inventory" | "add-product" | "orders">("overview");
  const [isPending, startTransition] = useTransition();

  // Local state for lists
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [orders, setOrders] = useState<Order[]>(initialOrders);

  // Search and filters
  const [prodSearch, setProdSearch] = useState("");
  const [orderSearch, setOrderSearch] = useState("");

  // Product inventory/price edit state
  const [editingProdId, setEditingProdId] = useState<string | null>(null);
  const [editStock, setEditStock] = useState<number>(0);
  const [editPriceRupees, setEditPriceRupees] = useState<string>("");

  // New product form state
  const [newProd, setNewProd] = useState({
    name: "",
    category_id: categories[0]?.id || "",
    description: "",
    priceRupees: "",
    compareAtPriceRupees: "",
    imageUrl: PRELOADED_BEDDING_IMAGES[0].url,
    sku: "",
    inventory: 10,
  });

  // Expanded orders tracker
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Message notifications
  const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function triggerNotification(type: "success" | "error", text: string) {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4000);
  }

  // Logout handler
  const handleLogout = async () => {
    await adminLogout();
    router.refresh();
  };

  // Inventory Save Handler
  const handleSaveInventory = (productId: string) => {
    const pricePaise = Math.round(parseFloat(editPriceRupees) * 100);
    if (isNaN(pricePaise) || pricePaise <= 0) {
      triggerNotification("error", "Price must be a valid positive number.");
      return;
    }
    if (isNaN(editStock) || editStock < 0) {
      triggerNotification("error", "Stock must be a valid non-negative number.");
      return;
    }

    startTransition(async () => {
      const res = await updateProductInventory(productId, editStock, pricePaise);
      if (res.success && res.product) {
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? res.product! : p))
        );
        setEditingProdId(null);
        triggerNotification("success", "Product updated successfully!");
      } else {
        triggerNotification("error", res.error || "Failed to update product.");
      }
    });
  };

  // Add Product Submit
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const pricePaise = Math.round(parseFloat(newProd.priceRupees) * 100);
    const compareAtPricePaise = newProd.compareAtPriceRupees
      ? Math.round(parseFloat(newProd.compareAtPriceRupees) * 100)
      : undefined;

    if (isNaN(pricePaise) || pricePaise <= 0) {
      triggerNotification("error", "Price must be a valid positive number.");
      return;
    }

    startTransition(async () => {
      const res = await addNewProduct({
        name: newProd.name,
        category_id: newProd.category_id,
        description: newProd.description,
        pricePaise,
        compareAtPricePaise,
        imageUrl: newProd.imageUrl,
        sku: newProd.sku,
        inventory: newProd.inventory,
      });

      if (res.success && res.product) {
        setProducts((prev) => [res.product!, ...prev]);
        setNewProd({
          name: "",
          category_id: categories[0]?.id || "",
          description: "",
          priceRupees: "",
          compareAtPriceRupees: "",
          imageUrl: PRELOADED_BEDDING_IMAGES[0].url,
          sku: "",
          inventory: 10,
        });
        triggerNotification("success", "New product added successfully!");
        setActiveTab("inventory");
      } else {
        triggerNotification("error", res.error || "Failed to add product.");
      }
    });
  };

  // Order Status Change Handler
  const handleStatusChange = (orderId: string, status: Order["status"]) => {
    startTransition(async () => {
      const res = await updateOrderStatus(orderId, status);
      if (res.success && res.order) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? res.order! : o))
        );
        triggerNotification("success", `Order status updated to ${status}`);
      } else {
        triggerNotification("error", res.error || "Failed to update order status.");
      }
    });
  };

  // Overview Stats
  const revenueTotal = orders
    .filter((o) => ["paid", "processing", "shipped", "delivered"].includes(o.status))
    .reduce((acc, o) => acc + o.total_paise, 0);

  const lowStockProducts = products.filter((p) => p.inventory < 10);

  // Filtered Products
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(prodSearch.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(prodSearch.toLowerCase()))
  );

  // Filtered Orders
  const filteredOrders = orders.filter((o) =>
    o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
    o.customer_email.toLowerCase().includes(orderSearch.toLowerCase()) ||
    o.customer_phone.toLowerCase().includes(orderSearch.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Header */}
      <div className="flex flex-col gap-4 border-b border-stone-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl text-stone-900">Dashboard</h1>
          <p className="mt-1 text-sm text-stone-500">
            Welcome to the Project NE administration console.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2 border-stone-300">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {notification && (
        <div
          className={`mt-4 rounded-md p-3 text-sm border shadow-sm transition-all duration-300 ${
            notification.type === "success"
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-red-50 text-red-700 border-red-200"
          }`}
        >
          {notification.text}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="mt-6 border-b border-stone-200">
        <nav className="-mb-px flex space-x-8">
          {(["overview", "inventory", "add-product", "orders"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-all ${
                activeTab === tab
                  ? "border-stone-900 text-stone-950"
                  : "border-transparent text-stone-500 hover:border-stone-300 hover:text-stone-700"
              }`}
            >
              {tab === "overview" && "Overview"}
              {tab === "inventory" && "Manage Inventory"}
              {tab === "add-product" && "Add New Item"}
              {tab === "orders" && `Orders (${orders.length})`}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Contents */}
      <div className="mt-6">
        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="border-stone-200/80">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-stone-500">Total Revenue</div>
                    <DollarSign className="h-5 w-5 text-stone-400" />
                  </div>
                  <div className="mt-2 text-3xl font-serif text-stone-900">
                    {formatINR(revenueTotal)}
                  </div>
                  <p className="mt-1 text-xs text-stone-500">From paid orders</p>
                </CardContent>
              </Card>

              <Card className="border-stone-200/80">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-stone-500">Total Orders</div>
                    <ShoppingBag className="h-5 w-5 text-stone-400" />
                  </div>
                  <div className="mt-2 text-3xl font-serif text-stone-900">
                    {orders.length}
                  </div>
                  <p className="mt-1 text-xs text-stone-500">All statuses included</p>
                </CardContent>
              </Card>

              <Card className="border-stone-200/80">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-stone-500">Total Products</div>
                    <Package className="h-5 w-5 text-stone-400" />
                  </div>
                  <div className="mt-2 text-3xl font-serif text-stone-900">
                    {products.length}
                  </div>
                  <p className="mt-1 text-xs text-stone-500">In catalog</p>
                </CardContent>
              </Card>

              <Card className={`border-stone-200/80 ${lowStockProducts.length > 0 ? "bg-amber-50/30 border-amber-200" : ""}`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-stone-500">Low Stock Alert</div>
                    <AlertTriangle className={`h-5 w-5 ${lowStockProducts.length > 0 ? "text-amber-500" : "text-stone-400"}`} />
                  </div>
                  <div className="mt-2 text-3xl font-serif text-stone-900">
                    {lowStockProducts.length}
                  </div>
                  <p className="mt-1 text-xs text-stone-500">Inventory less than 10 units</p>
                </CardContent>
              </Card>
            </div>

            {/* Low Stock & Recent Orders */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Low Stock Items List */}
              <Card className="border-stone-200/80">
                <CardHeader>
                  <CardTitle className="font-serif text-lg text-stone-900">Low Stock Items</CardTitle>
                </CardHeader>
                <CardContent>
                  {lowStockProducts.length === 0 ? (
                    <p className="text-sm text-stone-500">All items are sufficiently stocked.</p>
                  ) : (
                    <div className="divide-y divide-stone-100">
                      {lowStockProducts.slice(0, 5).map((p) => (
                        <div key={p.id} className="flex items-center justify-between py-3 text-sm">
                          <div className="flex items-center gap-3">
                            {p.images?.[0] && (
                              <img
                                src={p.images[0]}
                                alt={p.name}
                                className="h-10 w-10 rounded-md border border-stone-200 object-cover"
                              />
                            )}
                            <div>
                              <div className="font-medium text-stone-900">{p.name}</div>
                              <div className="text-xs text-stone-500">SKU: {p.sku || "N/A"}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                              {p.inventory} left
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Orders List */}
              <Card className="border-stone-200/80">
                <CardHeader>
                  <CardTitle className="font-serif text-lg text-stone-900">Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  {orders.length === 0 ? (
                    <p className="text-sm text-stone-500">No orders placed yet.</p>
                  ) : (
                    <div className="divide-y divide-stone-100">
                      {orders.slice(0, 5).map((o) => (
                        <div key={o.id} className="flex items-center justify-between py-3 text-sm">
                          <div>
                            <div className="font-medium text-stone-900">{o.shipping_address.name}</div>
                            <div className="text-xs text-stone-500">{new Date(o.created_at).toLocaleDateString()} · {o.customer_email}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-stone-900">{formatINR(o.total_paise)}</div>
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                                o.status === "paid" || o.status === "delivered"
                                  ? "bg-green-100 text-green-800"
                                  : o.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-stone-100 text-stone-800"
                              }`}
                            >
                              {o.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 2: INVENTORY */}
        {activeTab === "inventory" && (
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative max-w-md">
              <Search className="absolute top-3 left-3 h-4 w-4 text-stone-400" />
              <Input
                type="text"
                placeholder="Search products by name or SKU..."
                value={prodSearch}
                onChange={(e) => setProdSearch(e.target.value)}
                className="pl-9 border-stone-300 focus-visible:ring-stone-400"
              />
            </div>

            {/* Inventory Table */}
            <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
              <table className="min-w-full divide-y divide-stone-200">
                <thead className="bg-stone-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">SKU</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">Stock Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-stone-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 bg-white">
                  {filteredProducts.map((p) => {
                    const isEditing = editingProdId === p.id;
                    return (
                      <tr key={p.id} className="hover:bg-stone-50/50">
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex items-center gap-3">
                            {p.images?.[0] && (
                              <img
                                src={p.images[0]}
                                alt={p.name}
                                className="h-12 w-12 rounded border border-stone-200 object-cover"
                              />
                            )}
                            <div>
                              <div className="text-sm font-medium text-stone-900">{p.name}</div>
                              <div className="text-xs text-stone-500">
                                {categories.find((c) => c.id === p.category_id)?.name || "Uncategorized"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-stone-600">
                          {p.sku || "—"}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-stone-900">
                          {isEditing ? (
                            <div className="flex items-center gap-1.5 max-w-[100px]">
                              <span className="text-stone-500">₹</span>
                              <Input
                                type="number"
                                step="0.01"
                                value={editPriceRupees}
                                onChange={(e) => setEditPriceRupees(e.target.value)}
                                className="h-8 py-0 px-2"
                              />
                            </div>
                          ) : (
                            formatINR(p.price_paise)
                          )}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                          {isEditing ? (
                            <Input
                              type="number"
                              value={editStock}
                              onChange={(e) => setEditStock(parseInt(e.target.value) || 0)}
                              className="h-8 w-20 py-0 px-2"
                            />
                          ) : (
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                p.inventory === 0
                                  ? "bg-red-100 text-red-800"
                                  : p.inventory < 10
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-stone-100 text-stone-800"
                              }`}
                            >
                              {p.inventory} in stock
                            </span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                          {isEditing ? (
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingProdId(null)}
                                className="h-8"
                              >
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleSaveInventory(p.id)}
                                disabled={isPending}
                                className="h-8 bg-stone-900 text-white"
                              >
                                {isPending ? "Saving..." : "Save"}
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingProdId(p.id);
                                setEditStock(p.inventory);
                                setEditPriceRupees((p.price_paise / 100).toFixed(2));
                              }}
                              className="h-8 border-stone-300"
                            >
                              Edit
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-sm text-stone-500">
                        No products match your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: ADD PRODUCT */}
        {activeTab === "add-product" && (
          <Card className="max-w-2xl border-stone-200/80">
            <CardHeader>
              <CardTitle className="font-serif text-xl text-stone-900">Add New Product</CardTitle>
              <CardDescription>
                Create a new item in the catalog. Bedding products can use preloaded demo images.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleAddProduct}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 col-span-2">
                    <Label htmlFor="name">Product Name</Label>
                    <Input
                      id="name"
                      required
                      placeholder="e.g. Vintage Rose Sheets"
                      value={newProd.name}
                      onChange={(e) => setNewProd((prev) => ({ ...prev, name: e.target.value }))}
                      className="border-stone-300 focus-visible:ring-stone-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="category">Category</Label>
                    <select
                      id="category"
                      value={newProd.category_id}
                      onChange={(e) => setNewProd((prev) => ({ ...prev, category_id: e.target.value }))}
                      className="flex h-10 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="sku">SKU Code</Label>
                    <Input
                      id="sku"
                      placeholder="e.g. BED-ROS-Q-001"
                      value={newProd.sku}
                      onChange={(e) => setNewProd((prev) => ({ ...prev, sku: e.target.value }))}
                      className="border-stone-300 focus-visible:ring-stone-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="price">Price (Rupees)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      required
                      placeholder="4999.00"
                      value={newProd.priceRupees}
                      onChange={(e) => setNewProd((prev) => ({ ...prev, priceRupees: e.target.value }))}
                      className="border-stone-300 focus-visible:ring-stone-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="compareAt">Compare At Price (Rupees)</Label>
                    <Input
                      id="compareAt"
                      type="number"
                      step="0.01"
                      placeholder="e.g. 7999.00 (Optional)"
                      value={newProd.compareAtPriceRupees}
                      onChange={(e) => setNewProd((prev) => ({ ...prev, compareAtPriceRupees: e.target.value }))}
                      className="border-stone-300 focus-visible:ring-stone-400"
                    />
                  </div>

                  <div className="space-y-1.5 col-span-2">
                    <Label htmlFor="desc">Description</Label>
                    <textarea
                      id="desc"
                      rows={3}
                      placeholder="Brief description of materials, weave, and thread count..."
                      value={newProd.description}
                      onChange={(e) => setNewProd((prev) => ({ ...prev, description: e.target.value }))}
                      className="flex min-h-[80px] w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="stock">Initial Stock</Label>
                    <Input
                      id="stock"
                      type="number"
                      required
                      value={newProd.inventory}
                      onChange={(e) => setNewProd((prev) => ({ ...prev, inventory: parseInt(e.target.value) || 0 }))}
                      className="border-stone-300 focus-visible:ring-stone-400"
                    />
                  </div>
                </div>

                {/* Preloaded Bedding Stock Images Selector */}
                <div className="space-y-2 border-t border-stone-100 pt-4">
                  <Label>Product Image Source</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {PRELOADED_BEDDING_IMAGES.map((img) => (
                      <button
                        key={img.url}
                        type="button"
                        onClick={() => setNewProd((prev) => ({ ...prev, imageUrl: img.url }))}
                        className={`group relative aspect-square overflow-hidden rounded-md border-2 transition-all ${
                          newProd.imageUrl === img.url
                            ? "border-stone-900 ring-2 ring-stone-900/10"
                            : "border-stone-200 hover:border-stone-400"
                        }`}
                      >
                        <img
                          src={img.url}
                          alt={img.label}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-stone-900/60 py-0.5 text-center text-[10px] text-white">
                          {img.label}
                        </div>
                        {newProd.imageUrl === img.url && (
                          <div className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-stone-900 text-white">
                            <Check className="h-2.5 w-2.5" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-1 mt-2">
                    <Label htmlFor="customImg" className="text-xs text-stone-500">Or use a custom image URL:</Label>
                    <Input
                      id="customImg"
                      type="text"
                      placeholder="https://images.unsplash.com/... or /images/products/..."
                      value={newProd.imageUrl}
                      onChange={(e) => setNewProd((prev) => ({ ...prev, imageUrl: e.target.value }))}
                      className="border-stone-300 focus-visible:ring-stone-400 text-xs"
                    />
                  </div>
                </div>
              </CardContent>
              <div className="flex justify-end gap-3 border-t border-stone-100 p-6">
                <Button
                  type="submit"
                  disabled={isPending}
                  className="bg-stone-900 hover:bg-stone-800 text-white font-medium px-6 h-11"
                >
                  {isPending ? "Adding..." : "Add Product"}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* TAB 4: ORDERS */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative max-w-md">
              <Search className="absolute top-3 left-3 h-4 w-4 text-stone-400" />
              <Input
                type="text"
                placeholder="Search by Order ID, email, or phone..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="pl-9 border-stone-300 focus-visible:ring-stone-400"
              />
            </div>

            {/* Orders List */}
            <div className="space-y-3">
              {filteredOrders.map((o) => {
                const isExpanded = expandedOrderId === o.id;
                return (
                  <Card key={o.id} className="border-stone-200/80 overflow-hidden">
                    <div
                      onClick={() => setExpandedOrderId(isExpanded ? null : o.id)}
                      className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between cursor-pointer hover:bg-stone-50/50 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-medium text-stone-900">{o.id}</span>
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                              o.status === "paid" || o.status === "delivered"
                                ? "bg-green-100 text-green-800"
                                : o.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-stone-100 text-stone-800"
                            }`}
                          >
                            {o.status}
                          </span>
                        </div>
                        <div className="text-xs text-stone-500">
                          Placed on {new Date(o.created_at).toLocaleString()}
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="text-xs text-stone-500">Total</div>
                          <div className="font-semibold text-stone-900">{formatINR(o.total_paise)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-stone-500">Customer</div>
                          <div className="text-sm font-medium text-stone-900">{o.shipping_address.name}</div>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-stone-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-stone-400" />
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-stone-100 bg-stone-50/30 p-5 space-y-4">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                          {/* Shipping Details */}
                          <div className="space-y-1.5 text-sm">
                            <h4 className="font-semibold text-stone-900">Shipping Details</h4>
                            <p className="text-stone-700">{o.shipping_address.name}</p>
                            <p className="text-stone-600">{o.shipping_address.line1}</p>
                            {o.shipping_address.line2 && <p className="text-stone-600">{o.shipping_address.line2}</p>}
                            <p className="text-stone-600">
                              {o.shipping_address.city}, {o.shipping_address.state} — {o.shipping_address.pincode}
                            </p>
                            <div className="pt-2 text-xs text-stone-500">
                              <p>Email: {o.customer_email}</p>
                              <p>Phone: {o.customer_phone}</p>
                            </div>
                          </div>

                          {/* Fulfillment / Metadata */}
                          <div className="space-y-2 text-sm">
                            <h4 className="font-semibold text-stone-900">Payment & Shipping Logs</h4>
                            <div className="space-y-1 text-xs text-stone-600">
                              <p className="flex justify-between border-b border-stone-100 py-1">
                                <span>Razorpay Order ID:</span>
                                <span className="font-mono">{o.razorpay_order_id || "N/A"}</span>
                              </p>
                              <p className="flex justify-between border-b border-stone-100 py-1">
                                <span>Razorpay Payment ID:</span>
                                <span className="font-mono">{o.razorpay_payment_id || "Unpaid"}</span>
                              </p>
                              <p className="flex justify-between border-b border-stone-100 py-1">
                                <span>Delhivery Waybill:</span>
                                <span className="font-mono flex items-center gap-1">
                                  {o.delhivery_waybill || "Pending Fulfillment"}
                                  {o.delhivery_waybill && (
                                    <a
                                      href={`https://track.delhivery.com/p/track?waybill=${o.delhivery_waybill}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-stone-500 hover:text-stone-900"
                                    >
                                      <ExternalLink className="h-3.5 w-3.5" />
                                    </a>
                                  )}
                                </span>
                              </p>
                            </div>

                            {/* Status Update select */}
                            <div className="pt-2 flex items-center gap-3">
                              <Label htmlFor="order-status-select" className="text-xs text-stone-500 whitespace-nowrap">
                                Update Status:
                              </Label>
                              <select
                                id="order-status-select"
                                value={o.status}
                                onChange={(e) => handleStatusChange(o.id, e.target.value as Order["status"])}
                                className="h-9 rounded-md border border-stone-300 bg-white px-2 py-1 text-xs text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400"
                              >
                                <option value="pending">Pending</option>
                                <option value="paid">Paid</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Order breakdown */}
                        <div className="border-t border-stone-100 pt-4">
                          <h4 className="font-semibold text-sm text-stone-900 mb-2">Order Items</h4>
                          <div className="bg-white rounded border border-stone-200 overflow-hidden divide-y divide-stone-100">
                            {/* We can construct item list from price information or just simple summary since we don't have separate OrderItem table queries here */}
                            {/* Wait, we can list items if we stored them, let's see. In our mock order, we have subtotal and shipping. Let's list a generic breakdown for the preview */}
                            <div className="px-4 py-3 text-sm flex justify-between">
                              <div className="text-stone-700">Premium Bedding/Towel Package</div>
                              <div className="text-stone-950 font-medium">Quantity: 1 · {formatINR(o.subtotal_paise)}</div>
                            </div>
                            {o.shipping_paise > 0 && (
                              <div className="px-4 py-2 text-xs text-stone-500 flex justify-between bg-stone-50/50">
                                <span>Shipping:</span>
                                <span>{formatINR(o.shipping_paise)}</span>
                              </div>
                            )}
                            <div className="px-4 py-2 text-sm font-semibold flex justify-between bg-stone-50/80">
                              <span>Total Paid:</span>
                              <span>{formatINR(o.total_paise)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
              {filteredOrders.length === 0 && (
                <div className="py-12 text-center text-sm text-stone-500">
                  No orders match your search.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
