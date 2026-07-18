import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Product } from '../components/ProductCard';
import { Plus, Pencil, Trash2, X, Search, Upload, Check } from 'lucide-react';

interface VariantInput {
  size: string;
  color: string;
  sku: string;
  price: string;
  discountPrice: string;
  stock: string;
  images: string[];
}

export const AdminInventory: React.FC = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [material, setMaterial] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isTrending, setIsTrending] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Variants Input List
  const [variants, setVariants] = useState<VariantInput[]>([
    { size: 'Queen', color: 'Ivory Cream', sku: '', price: '', discountPrice: '', stock: '0', images: [] },
  ]);

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [fallbackImageUrl, setFallbackImageUrl] = useState('');

  // Guard routing
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/auth?redirect=/admin/inventory');
    }
  }, [user, isAdmin, authLoading, navigate]);

  // Load Inventory Data
  const loadData = async () => {
    setLoading(true);
    try {
      const [prodsData, catsData] = await Promise.all([
        apiRequest<Product[]>('/api/admin/products'),
        apiRequest<{ id: string; name: string; slug: string }[]>('/api/categories'),
      ]);
      setProducts(prodsData);
      setCategories(catsData);
    } catch (err) {
      console.error('Failed to load admin inventory', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && isAdmin) {
      loadData();
    }
  }, [user, isAdmin]);

  // Open Add Product Modal
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setCategoryId(categories.length > 0 ? categories[0].id : '');
    setMaterial('');
    setImages([]);
    setIsTrending(false);
    setIsActive(true);
    setVariants([
      { size: 'Queen', color: 'Ivory Cream', sku: '', price: '', discountPrice: '', stock: '30', images: [] },
    ]);
    setIsModalOpen(true);
  };

  // Open Edit Product Modal
  const handleOpenEdit = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setDescription(prod.description);
    setCategoryId(prod.categoryId);
    setMaterial(prod.material || '');
    setImages(prod.images);
    setIsTrending(prod.isTrending);
    setIsActive(prod.isActive);

    // Map DB variants to inputs
    if (prod.variants && prod.variants.length > 0) {
      setVariants(
        prod.variants.map((v) => ({
          size: v.size || '',
          color: v.color || '',
          sku: v.sku,
          price: v.price.toString(),
          discountPrice: v.discountPrice ? v.discountPrice.toString() : '',
          stock: v.stock.toString(),
          images: v.images || [],
        }))
      );
    } else {
      setVariants([
        { size: 'Queen', color: 'Ivory Cream', sku: '', price: '', discountPrice: '', stock: '0', images: [] },
      ]);
    }
    setIsModalOpen(true);
  };

  // Handle dynamic variant changes
  const handleAddVariantRow = () => {
    // Propose auto-computed SKU to help admin speed up
    const skuIndex = variants.length + 1;
    const tempSku = `RC-${name.substring(0, 3).toUpperCase()}-${skuIndex}`;
    setVariants((prev) => [
      ...prev,
      { size: '', color: '', sku: tempSku, price: '', discountPrice: '', stock: '10', images: [] },
    ]);
  };

  const handleRemoveVariantRow = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index: number, field: keyof VariantInput, value: string) => {
    setVariants((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        [field]: value,
      };
      return copy;
    });
  };

  // Handle image upload direct to Cloudinary
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const file = files[0];

      // 1. Get Signed details from backend
      const { signature, timestamp, apiKey, cloudName } = await apiRequest('/api/admin/upload', {
        method: 'POST',
        body: JSON.stringify({ folder: 'rarecomforts' }),
      });

      // 2. Upload directly to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp.toString());
      formData.append('signature', signature);
      formData.append('folder', 'rarecomforts');

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Cloudinary response failed.');
      }

      const resJson = await response.json();
      setImages((prev) => [...prev, resJson.secure_url]);
    } catch (err: any) {
      console.error('Image upload failed', err);
      alert('Cloudinary upload credentials are not configured on the server. Please paste a direct image URL in the fallback input box below.');
    } finally {
      setUploading(false);
    }
  };

  const handleAddFallbackImage = () => {
    if (fallbackImageUrl) {
      setImages((prev) => [...prev, fallbackImageUrl]);
      setFallbackImageUrl('');
    }
  };

  // Delete product action
  const handleDelete = async (id: string) => {
    const confirm = window.confirm('Are you sure you want to delete this product and its variants permanently?');
    if (!confirm) return;

    try {
      await apiRequest(`/api/admin/products/${id}`, {
        method: 'DELETE',
      });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete product.');
    }
  };

  // Submit product creation/update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !description || !categoryId) {
      alert('Please fill in required fields.');
      return;
    }

    if (variants.some((v) => !v.sku || !v.price || Number(v.price) <= 0)) {
      alert('Each variant must have a valid SKU and a positive price.');
      return;
    }

    const payload = {
      name,
      description,
      material,
      images,
      isTrending,
      isActive,
      categoryId,
      variants: variants.map((v) => ({
        size: v.size || null,
        color: v.color || null,
        sku: v.sku.toUpperCase().trim(),
        price: parseFloat(v.price),
        discountPrice: v.discountPrice ? parseFloat(v.discountPrice) : null,
        stock: parseInt(v.stock, 10) || 0,
        images: v.images,
      })),
    };

    try {
      if (editingProduct) {
        await apiRequest(`/api/admin/products/${editingProduct.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
      } else {
        await apiRequest('/api/admin/products', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to save product details.');
    }
  };

  // Filtered Products list
  const filteredProducts = products.filter((prod) => {
    const matchesSearch = prod.name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = filterCategory ? prod.categoryId === filterCategory : true;
    return matchesSearch && matchesCat;
  });

  if (authLoading || !user || !isAdmin) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 mt-[80px] text-center">
        <p className="font-sans text-xs font-bold tracking-widest text-muted-gray uppercase animate-pulse">
          VERIFYING ACCESS PRIVILEGES...
        </p>
      </div>
    );
  }

  return (
    <main className="flex-1 mt-[80px] bg-[#F5FAFD]/40 min-h-screen py-10 px-6 max-w-7xl mx-auto space-y-8">
      {/* Dashboard header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#BDE8F5]/30 pb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-navy-deep">Showroom Inventory Dashboard</h1>
          <p className="text-xs text-muted-gray mt-1 uppercase tracking-wide">
            Manage your digital showroom showroom variants, stocks, and coupons configs
          </p>
        </div>
        
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-navy-deep text-white font-sans text-xs uppercase tracking-wide font-bold px-6 py-3 rounded-full hover:bg-royal-blue transition-luxury shadow-md"
        >
          <Plus className="w-4 h-4" /> ADD NEW SHOWCASE
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center bg-white p-4 rounded-xl border border-[#BDE8F5]/20 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-muted-gray absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search items by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#BDE8F5]/10 border border-[#BDE8F5]/30 focus:border-royal-blue focus:bg-white rounded-full py-2.5 pl-11 pr-5 font-sans text-xs text-navy-deep outline-none"
          />
        </div>
        <div className="w-full sm:w-60">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full bg-white border border-[#BDE8F5]/40 rounded-full px-4 py-2.5 text-xs text-navy-deep font-semibold focus:outline-none focus:border-royal-blue cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Inventory Table */}
      {loading ? (
        <div className="py-20 text-center space-y-4">
          <p className="font-sans text-xs font-bold tracking-widest text-muted-gray uppercase animate-pulse">
            LOADING SHOWROOM INVENTORY...
          </p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white border border-dashed border-[#BDE8F5]/40 rounded-xl p-16 text-center space-y-3">
          <span className="text-3xl block">🏺</span>
          <h3 className="font-serif text-lg font-semibold text-navy-deep">No matching items</h3>
          <p className="text-xs text-muted-gray max-w-xs mx-auto">
            Try adjusting your search keywords, or add a new showcase item to populate the lists.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#BDE8F5]/20 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F5FAFD]/60 text-navy-deep text-[11px] font-bold tracking-wider uppercase border-b border-[#BDE8F5]/20">
                <th className="p-4">Item Image</th>
                <th className="p-4">Product Title</th>
                <th className="p-4">Category</th>
                <th className="p-4">Lowest Price</th>
                <th className="p-4">Total Stock</th>
                <th className="p-4">Badges</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {filteredProducts.map((prod) => {
                const totalStock = prod.variants ? prod.variants.reduce((acc, v) => acc + v.stock, 0) : 0;
                let lowestPrice = 0;
                if (prod.variants && prod.variants.length > 0) {
                  lowestPrice = Math.min(
                    ...prod.variants.map((v) => (v.discountPrice ? Number(v.discountPrice) : Number(v.price)))
                  );
                }

                return (
                  <tr key={prod.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <div className="w-12 h-14 bg-gray-50 rounded overflow-hidden border border-gray-200">
                        <img
                          src={prod.images[0] || 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=120'}
                          alt={prod.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-navy-deep">
                      <div className="max-w-[200px] truncate" title={prod.name}>
                        {prod.name}
                      </div>
                      <span className="text-[10px] text-muted-gray font-normal block font-sans">
                        {prod.variants ? `${prod.variants.length} Variants` : 'No Variants'}
                      </span>
                    </td>
                    <td className="p-4 text-muted-gray uppercase font-semibold">
                      {prod.category?.name || 'Unassigned'}
                    </td>
                    <td className="p-4 font-sans font-bold text-navy-deep">
                      ₹{lowestPrice.toLocaleString('en-IN')}
                    </td>
                    <td className="p-4 font-sans">
                      <span className={`font-semibold ${totalStock <= 5 ? 'text-red-500 font-bold' : 'text-muted-gray'}`}>
                        {totalStock} units
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        {prod.isTrending && (
                          <span className="bg-sky-blue/15 text-sky-blue px-2 py-0.5 rounded text-[9px] font-bold">
                            TRENDING
                          </span>
                        )}
                        {prod.isActive ? (
                          <span className="bg-[#3AA757]/15 text-[#3AA757] px-2 py-0.5 rounded text-[9px] font-bold">
                            ACTIVE
                          </span>
                        ) : (
                          <span className="bg-red-15 text-red-500 px-2 py-0.5 rounded text-[9px] font-bold">
                            DRAFT
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(prod)}
                          className="p-2 border border-[#BDE8F5] hover:bg-royal-blue hover:text-white rounded-full text-navy-deep transition-all"
                          title="Edit Product"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(prod.id)}
                          className="p-2 border border-red-200 hover:bg-red-500 hover:text-white rounded-full text-red-600 transition-all"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE / EDIT OVERLAY MODAL FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-navy-deep/45 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-scaleIn">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-[#BDE8F5]/30 flex justify-between items-center bg-[#F5FAFD]/45">
              <h2 className="font-serif text-xl font-bold text-navy-deep">
                {editingProduct ? 'Configure Existing Bedding' : 'Add Custom Showcase Bedding'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-[#BDE8F5]/30 rounded-full text-navy-deep transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Form Scrollable Area */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-6">
              
              {/* Product Title */}
              <div className="space-y-1">
                <label className="font-sans text-[10px] font-bold tracking-widest text-navy-deep uppercase block">
                  Product Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Royal Egyptian Cotton Sheet Set"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#BDE8F5]/10 border border-[#BDE8F5]/30 focus:border-royal-blue focus:bg-white rounded-md py-2.5 px-4 font-sans text-xs text-navy-deep outline-none"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="font-sans text-[10px] font-bold tracking-widest text-navy-deep uppercase block">
                  Product Description *
                </label>
                <textarea
                  placeholder="Write a descriptive, luxury, on-brand blurb..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-[#BDE8F5]/10 border border-[#BDE8F5]/30 focus:border-royal-blue focus:bg-white rounded-md py-2.5 px-4 font-sans text-xs text-navy-deep outline-none leading-relaxed"
                  required
                />
              </div>

              {/* Category, Material Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-sans text-[10px] font-bold tracking-widest text-navy-deep uppercase block">
                    Category *
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-[#BDE8F5]/10 border border-[#BDE8F5]/30 focus:border-royal-blue focus:bg-white rounded-md py-2.5 px-4 font-sans text-xs text-navy-deep outline-none cursor-pointer"
                    required
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-sans text-[10px] font-bold tracking-widest text-navy-deep uppercase block">
                    Material / Build
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 100% long-staple Egyptian cotton"
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    className="w-full bg-[#BDE8F5]/10 border border-[#BDE8F5]/30 focus:border-royal-blue focus:bg-white rounded-md py-2.5 px-4 font-sans text-xs text-navy-deep outline-none"
                  />
                </div>
              </div>

              {/* DYNAMIC VARIANTS rows */}
              <div className="space-y-4 border-t border-gray-100 pt-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-sans text-[10px] font-bold tracking-widest text-navy-deep uppercase">
                    Product Variants *
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddVariantRow}
                    className="text-[10px] font-bold text-royal-blue hover:text-navy-deep flex items-center gap-1 uppercase tracking-wider"
                  >
                    + Add Variant Row
                  </button>
                </div>

                <div className="space-y-4">
                  {variants.map((v, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-2 sm:grid-cols-6 gap-3 bg-gray-50/50 p-3 border border-gray-100 rounded-md relative items-end"
                    >
                      <div>
                        <label className="text-[9px] font-bold text-muted-gray uppercase block mb-1">Size</label>
                        <input
                          type="text"
                          placeholder="Queen"
                          value={v.size}
                          onChange={(e) => handleVariantChange(idx, 'size', e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded p-1.5 text-xs outline-none focus:border-royal-blue"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-muted-gray uppercase block mb-1">Color</label>
                        <input
                          type="text"
                          placeholder="Cream"
                          value={v.color}
                          onChange={(e) => handleVariantChange(idx, 'color', e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded p-1.5 text-xs outline-none focus:border-royal-blue"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-muted-gray uppercase block mb-1">SKU *</label>
                        <input
                          type="text"
                          placeholder="RC-SKU-1"
                          value={v.sku}
                          onChange={(e) => handleVariantChange(idx, 'sku', e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded p-1.5 text-xs font-mono uppercase outline-none focus:border-royal-blue"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-muted-gray uppercase block mb-1">Price *</label>
                        <input
                          type="number"
                          placeholder="14999"
                          value={v.price}
                          onChange={(e) => handleVariantChange(idx, 'price', e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded p-1.5 text-xs outline-none focus:border-royal-blue"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-muted-gray uppercase block mb-1">Discount</label>
                        <input
                          type="number"
                          placeholder="optional"
                          value={v.discountPrice}
                          onChange={(e) => handleVariantChange(idx, 'discountPrice', e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded p-1.5 text-xs outline-none focus:border-royal-blue"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-muted-gray uppercase block mb-1">Stock *</label>
                        <input
                          type="number"
                          placeholder="30"
                          value={v.stock}
                          onChange={(e) => handleVariantChange(idx, 'stock', e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded p-1.5 text-xs outline-none focus:border-royal-blue"
                          required
                        />
                      </div>

                      {variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveVariantRow(idx)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 shadow hover:bg-red-600 transition-all"
                          title="Remove Variant"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Toggles row */}
              <div className="flex gap-8 items-center bg-[#F5FAFD]/20 border border-[#BDE8F5]/20 p-4 rounded-lg">
                <label className="flex items-center gap-2 cursor-pointer font-sans text-xs font-semibold text-navy-deep">
                  <input
                    type="checkbox"
                    checked={isTrending}
                    onChange={(e) => setIsTrending(e.target.checked)}
                    className="w-4 h-4 rounded accent-royal-blue cursor-pointer"
                  />
                  Mark as Trending / Signature Item
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-sans text-xs font-semibold text-navy-deep">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded accent-royal-blue cursor-pointer"
                  />
                  Publish / Active Showroom display
                </label>
              </div>

              {/* Image uploads components */}
              <div className="space-y-4">
                <h3 className="font-sans text-[10px] font-bold tracking-widest text-navy-deep uppercase block">
                  Product Shared Gallery
                </h3>

                <div className="border-2 border-dashed border-[#BDE8F5] hover:border-royal-blue bg-[#BDE8F5]/5 rounded-xl p-6 text-center cursor-pointer relative transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    disabled={uploading}
                  />
                  <div className="space-y-2">
                    <Upload className="w-8 h-8 text-sky-blue mx-auto" />
                    <p className="text-xs font-semibold text-navy-deep">
                      {uploading ? 'UPLOADING TO CLOUDINARY...' : 'DRAG FILE HERE OR CLICK TO UPLOAD'}
                    </p>
                    <p className="text-[10px] text-muted-gray">Direct image streaming to your cloud asset storage</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-sans text-[9px] font-bold text-muted-gray uppercase block">
                    Upload Fallback URL (Optional, paste direct link)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. https://images.unsplash.com/photo-..."
                      value={fallbackImageUrl}
                      onChange={(e) => setFallbackImageUrl(e.target.value)}
                      className="flex-1 bg-[#BDE8F5]/10 border border-[#BDE8F5]/30 rounded-md py-2 px-3 font-sans text-[11px] text-navy-deep outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddFallbackImage}
                      className="px-4 py-2 border border-royal-blue text-royal-blue rounded-md text-[10px] font-bold uppercase tracking-wider hover:bg-royal-blue hover:text-white transition-colors"
                    >
                      ADD LINK
                    </button>
                  </div>
                </div>

                {images.length > 0 && (
                  <div className="flex flex-wrap gap-4 pt-2">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative w-20 h-24 bg-gray-50 border border-gray-200 rounded overflow-hidden group">
                        <img src={img} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setImages((prev) => prev.filter((_, i) => i !== idx))}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 shadow hover:bg-red-600 transition-colors"
                          title="Remove image"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit actions */}
              <div className="pt-6 border-t border-gray-100 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 border border-gray-200 text-muted-gray hover:text-navy-deep rounded-full text-xs font-semibold uppercase tracking-wider"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-navy-deep text-white hover:bg-royal-blue rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md transition-luxury"
                >
                  <Check className="w-4 h-4" />
                  {editingProduct ? 'SAVE CHANGES' : 'CREATE PRODUCT'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </main>
  );
};
export default AdminInventory;
