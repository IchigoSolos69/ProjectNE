"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { SlidersHorizontal, PlusCircle, Trash2, Box, Info, Image as ImageIcon, IndianRupee, Key } from "lucide-react";
import { API_URL } from "@/lib/api";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // stored in paise
  sku: string;
  inventoryCount: number;
  category: string;
  imageUrl: string;
  isActive: boolean;
}

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(""); // in Rupees
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState("Bedsheets");
  const [inventoryCount, setInventoryCount] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/products`);
      if (!res.ok) throw new Error("Failed to fetch product list.");
      const data = await res.json();
      setProducts(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to retrieve inventory records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !description || !price || !sku || !inventoryCount || !category || !imageUrl) {
      alert("Please fill in all product credentials.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          price: Number(price), // Passed in Rupees, backend converts to paise
          sku,
          inventoryCount: Number(inventoryCount),
          category,
          imageUrl,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create product.");
      }

      // Reset form
      setName("");
      setDescription("");
      setPrice("");
      setSku("");
      setCategory("Bedsheets");
      setInventoryCount("");
      setImageUrl("");

      // Refresh inventory
      fetchProducts();
      alert("Product successfully created!");
    } catch (err) {
      console.error(err);
      alert(`Error creating product: ${(err as Error).message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this inventory record?")) return;

    try {
      const res = await fetch(`${API_URL}/products/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete product.");
      }

      // Refresh inventory
      fetchProducts();
      alert("Product successfully deleted.");
    } catch (err) {
      console.error(err);
      alert(`Error deleting product: ${(err as Error).message}`);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4.5rem)] bg-[#F6FAFC]">
      {/* Top Banner Header */}
      <div className="bg-[#0F2854] text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-brand-royal/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#BDE8F5]/10 rounded-full blur-3xl -z-10" />
        <div className="mx-auto max-w-7xl">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white flex items-center gap-3">
            <SlidersHorizontal className="h-8 w-8 text-brand-sky" />
            Inventory Control Centre
          </h1>
          <p className="mt-2 text-sm text-[#BDE8F5]/80 font-sans max-w-xl">
            Create, update, and manage the premium stock of RareComforts catalog items.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left panel - Add product form */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-brand-sky/30">
            <div className="flex items-center gap-2 mb-6">
              <PlusCircle className="h-5 w-5 text-[#0F2854]" />
              <h2 className="font-serif text-xl font-bold text-[#0F2854]">Add New Catalog Item</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs">
              <div className="space-y-1">
                <label className="font-semibold uppercase tracking-wide text-[#0F2854]">Product Name</label>
                <div className="relative">
                  <Box className="absolute left-3 top-3 h-4 w-4 text-[#1C4D8D]/40" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sateen Duvet Cover"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-md border border-[#BDE8F5] bg-[#F6FAFC] text-sm text-[#0F2854] placeholder-[#0F2854]/45 focus:border-[#4988C4] focus:bg-white focus:outline-none transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold uppercase tracking-wide text-[#0F2854]">Description</label>
                <div className="relative">
                  <Info className="absolute left-3 top-3 h-4 w-4 text-[#1C4D8D]/40" />
                  <textarea
                    required
                    placeholder="Detail the fabric composition, thread count, weave style, etc."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full pl-9 pr-4 py-2.5 rounded-md border border-[#BDE8F5] bg-[#F6FAFC] text-sm text-[#0F2854] placeholder-[#0F2854]/45 focus:border-[#4988C4] focus:bg-white focus:outline-none transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold uppercase tracking-wide text-[#0F2854]">Price (INR)</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-[#1C4D8D]/40" />
                    <input
                      type="number"
                      required
                      placeholder="e.g. 12999"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-md border border-[#BDE8F5] bg-[#F6FAFC] text-sm text-[#0F2854] placeholder-[#0F2854]/45 focus:border-[#4988C4] focus:bg-white focus:outline-none transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold uppercase tracking-wide text-[#0F2854]">Stock Qty</label>
                  <div className="relative">
                    <Box className="absolute left-3 top-3 h-4 w-4 text-[#1C4D8D]/40" />
                    <input
                      type="number"
                      required
                      placeholder="e.g. 50"
                      value={inventoryCount}
                      onChange={(e) => setInventoryCount(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-md border border-[#BDE8F5] bg-[#F6FAFC] text-sm text-[#0F2854] placeholder-[#0F2854]/45 focus:border-[#4988C4] focus:bg-white focus:outline-none transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold uppercase tracking-wide text-[#0F2854]">SKU Code</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-3 h-4 w-4 text-[#1C4D8D]/40" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. SAT-BLUSH-QN"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-md border border-[#BDE8F5] bg-[#F6FAFC] text-sm text-[#0F2854] placeholder-[#0F2854]/45 focus:border-[#4988C4] focus:bg-white focus:outline-none transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold uppercase tracking-wide text-[#0F2854]">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-md border border-[#BDE8F5] bg-[#F6FAFC] text-sm text-[#0F2854] focus:border-[#4988C4] focus:bg-white focus:outline-none transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  >
                    <option value="Bedsheets">Bedsheets</option>
                    <option value="Comforters">Comforters</option>
                    <option value="Cushion Covers">Cushion Covers</option>
                    <option value="Towels">Towels</option>
                    <option value="Door Mats">Door Mats</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold uppercase tracking-wide text-[#0F2854]">Image URL</label>
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-3 h-4 w-4 text-[#1C4D8D]/40" />
                  <input
                    type="url"
                    required
                    placeholder="https://images.unsplash.com/..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-md border border-[#BDE8F5] bg-[#F6FAFC] text-sm text-[#0F2854] placeholder-[#0F2854]/45 focus:border-[#4988C4] focus:bg-white focus:outline-none transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 mt-2 bg-[#0F2854] hover:bg-[#1C4D8D] text-white font-sans text-xs font-semibold uppercase tracking-wide rounded-md shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer flex items-center justify-center gap-2"
              >
                Create Product Listing
              </button>
            </form>
          </div>

          {/* Right panel - Current inventory list */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-brand-sky/30">
            <h2 className="font-serif text-xl font-bold text-[#0F2854] mb-6">Current Stock Records</h2>

            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 animate-pulse py-3 border-b border-brand-sky/20">
                    <div className="h-12 w-12 bg-gray-200 rounded-md" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-1/3 bg-gray-200 rounded" />
                      <div className="h-3 w-1/4 bg-gray-200 rounded" />
                    </div>
                    <div className="h-4 w-12 bg-gray-200 rounded" />
                    <div className="h-4 w-12 bg-gray-200 rounded" />
                    <div className="h-8 w-8 bg-gray-200 rounded-full" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="p-4 bg-red-50 text-red-700 text-xs font-sans rounded-md border border-red-200">
                {error}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16 text-sm text-brand-midnight/50 font-sans border border-dashed border-brand-sky/40 rounded-lg">
                No inventory records found in the database.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-sans text-xs">
                  <thead>
                    <tr className="border-b border-brand-sky/30 text-brand-midnight/70 font-semibold uppercase tracking-wider">
                      <th className="pb-3 w-16">Image</th>
                      <th className="pb-3 pl-3">Details</th>
                      <th className="pb-3 text-right">Price</th>
                      <th className="pb-3 text-right">Stock</th>
                      <th className="pb-3 text-center w-12">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-sky/20">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-[#F6FAFC] transition-colors duration-200">
                        <td className="py-3">
                          <div className="relative h-12 w-12 rounded-md overflow-hidden border border-brand-sky/30">
                            <Image
                              src={p.imageUrl}
                              alt={p.name}
                              fill
                              sizes="48px"
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                        </td>
                        <td className="py-3 pl-3 pr-2 min-w-0">
                          <div className="font-semibold text-brand-midnight truncate max-w-[200px]" title={p.name}>
                            {p.name}
                          </div>
                          <div className="text-[10px] text-brand-midnight/50 mt-0.5">
                            SKU: <span className="font-medium">{p.sku}</span> | Cat: <span className="font-medium">{p.category}</span>
                          </div>
                        </td>
                        <td className="py-3 text-right font-semibold text-brand-royal">
                          {Intl.NumberFormat("en-IN", {
                            style: "currency",
                            currency: "INR",
                            maximumFractionDigits: 0,
                          }).format(p.price / 100)}
                        </td>
                        <td className="py-3 text-right font-medium text-brand-midnight/80">
                          {p.inventoryCount} units
                        </td>
                        <td className="py-3 text-center">
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="p-2 text-brand-midnight/40 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.9]"
                            title="Delete listing"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
