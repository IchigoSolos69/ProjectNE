import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Eye, Heart, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getOptimizedImageUrl } from '../lib/api';
import { useToast } from '../context/ToastContext';

export interface Variant {
  id: string;
  size: string | null;
  color: string | null;
  sku: string;
  price: number;
  discountPrice: number | null;
  stock: number;
  imageUrl?: string | null;
  images: string[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  images: string[];
  isTrending: boolean;
  showOnLandingPage?: boolean;
  isActive: boolean;
  categoryId: string;
  category?: { name: string; slug: string };
  variants: Variant[];
  material?: string | null;
  careInstructions?: string | null;
  manufacturingDetails?: string | null;
  packageIncludes?: string[];
  averageRating?: number;
  reviewCount?: number;
  lowestPrice?: number;
  ratingInfo?: { average: number; count: number };
}

interface ProductCardProps {
  product: Product;
  onQuickAddSuccess?: () => void;
}

export const ProductCard = ({ product, onQuickAddSuccess }: ProductCardProps) => {
  const { user, wishlistIds, toggleWishlist } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');

  // Wishlist check
  const isWishlisted = wishlistIds.includes(product.id);

  // Variant calculations
  const variantsList = product.variants || [];
  const isOutOfStock = variantsList.length === 0 || variantsList.every((v) => v.stock <= 0);
  const firstAvailableVariant = variantsList.find((v) => v.stock > 0) || variantsList[0];

  // Resolve lowest active price
  let displayPrice = product.lowestPrice;
  if (displayPrice === undefined) {
    if (variantsList.length > 0) {
      displayPrice = Math.min(
        ...variantsList.map((v) => (v.discountPrice ? Number(v.discountPrice) : Number(v.price)))
      );
    } else {
      displayPrice = 0;
    }
  }

  // Resolve cheapest variant for price discounts display
  const cheapestVariant = variantsList.reduce((cheapest, current) => {
    if (!cheapest) return current;
    const currentPrice = current.discountPrice ? Number(current.discountPrice) : Number(current.price);
    const cheapestPrice = cheapest.discountPrice ? Number(cheapest.discountPrice) : Number(cheapest.price);
    return currentPrice < cheapestPrice ? current : cheapest;
  }, variantsList[0]);

  let originalPrice = 0;
  let sellingPrice = displayPrice;
  let savePercentage = 0;

  if (cheapestVariant) {
    originalPrice = Number(cheapestVariant.price);
    sellingPrice = cheapestVariant.discountPrice ? Number(cheapestVariant.discountPrice) : Number(cheapestVariant.price);
    if (cheapestVariant.discountPrice && cheapestVariant.price > 0) {
      savePercentage = Math.round(((cheapestVariant.price - cheapestVariant.discountPrice) / cheapestVariant.price) * 100);
    }
  }

  // Resolve unique sizes and colors
  const uniqueSizes = Array.from(new Set(variantsList.filter((v) => v.stock > 0).map((v) => v.size).filter(Boolean))) as string[];
  const uniqueColors = Array.from(new Set(variantsList.filter((v) => v.stock > 0).map((v) => v.color).filter(Boolean))) as string[];

  // Find exact matched variant
  const selectedVariant = variantsList.find(
    (v) =>
      v.stock > 0 &&
      (!uniqueSizes.length || v.size === selectedSize) &&
      (!uniqueColors.length || v.color === selectedColor)
  );

  const hasMultiplePrices = variantsList.length > 1;

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate(`/auth?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }

    try {
      await toggleWishlist(product.id);
      toast.success('Wishlist Updated', `Successfully updated wishlist for ${product.name}`);
    } catch (err: any) {
      toast.error('Wishlist Error', err.message || 'Failed to update wishlist.');
    }
  };

  const performQuickAdd = async (variantId: string) => {
    setLoading(true);
    try {
      await addToCart(variantId, 1);
      toast.success('Added to Cart', `${product.name} has been added to your cart.`);
      if (onQuickAddSuccess) {
        onQuickAddSuccess();
      }
    } catch (err: any) {
      toast.error('Add to Cart Failed', err.message || 'Failed to add item to cart.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate('/auth');
      return;
    }

    if (isOutOfStock) return;

    if (variantsList.length === 1 && firstAvailableVariant) {
      performQuickAdd(firstAvailableVariant.id);
    } else {
      setShowQuickAddModal(true);
    }
  };

  // Calculate standard display image
  const displayImage = product.images[0] || 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=600';

  return (
    <div className="group relative flex flex-col justify-between bg-transparent transition-luxury">
      
      {/* Product Image Wrapper */}
      <div className="relative aspect-[3/4] bg-[#F5FAFD] overflow-hidden rounded-none mb-4">
        <Link to={`/products/${product.slug}`} className="block w-full h-full">
          {/* Category Tag */}
          {product.category && (
            <span className="absolute top-3 left-3 z-10 bg-[#0F2854] text-white text-[9px] font-sans font-semibold tracking-[0.2em] uppercase px-2.5 py-1">
              {product.category.name}
            </span>
          )}

          {/* Product Image */}
          <img
            src={getOptimizedImageUrl(displayImage, 600)}
            srcSet={`${getOptimizedImageUrl(displayImage, 300)} 300w, ${getOptimizedImageUrl(displayImage, 400)} 400w, ${getOptimizedImageUrl(displayImage, 600)} 600w, ${getOptimizedImageUrl(displayImage, 900)} 900w`}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            width="300"
            height="400"
            alt={product.name.replace(/linen/gi, 'cotton')}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-[800ms] ease-out group-hover:scale-105"
          />

          {/* Hover Actions Overlay */}
          <div className="absolute inset-0 bg-[#0F2854]/15 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center gap-3 z-10">
            <Link
              to={`/products/${product.slug}`}
              className="p-3.5 bg-white text-navy-deep rounded-full shadow-md hover:bg-navy-deep hover:text-white transition-colors duration-300"
              title="View Details"
            >
              <Eye className="w-4 h-4" />
            </Link>
            {!isOutOfStock && (
              <button
                onClick={handleQuickAdd}
                disabled={loading}
                className="p-3.5 bg-white text-navy-deep rounded-full shadow-md hover:bg-navy-deep hover:text-white transition-colors duration-300 disabled:opacity-50"
                title="Quick Add to Cart"
              >
                <ShoppingCart className="w-4 h-4" />
              </button>
            )}
          </div>
        </Link>

        {/* Wishlist Heart Toggle */}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-3 right-3 z-20 p-2.5 bg-white/95 backdrop-blur-sm text-navy-deep rounded-full shadow-sm hover:text-red-500 transition-all scale-100 active:scale-95"
          title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart
            className={`w-3.5 h-3.5 transition-colors ${
              isWishlisted ? 'fill-red-500 text-red-500' : 'text-navy-deep'
            }`}
          />
        </button>
      </div>

      {/* Details info */}
      <div className="space-y-1.5 flex-1 flex flex-col justify-between">
        <div>
          <Link to={`/products/${product.slug}`} className="block">
            <h3 className="font-serif text-lg font-medium text-navy-deep leading-snug hover:text-royal-blue transition-colors duration-300">
              {product.name.replace(/linen/gi, 'cotton')}
            </h3>
          </Link>
          
          {/* Reviews Aggregate score summary */}
          {product.reviewCount !== undefined && product.reviewCount > 0 && (
            <div className="flex items-center gap-1.5 py-0.5">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 animate-none" />
              <span className="font-sans text-xs font-semibold text-navy-deep">
                {product.averageRating?.toFixed(1) || '0.0'}
              </span>
              <span className="font-sans text-[10px] text-muted-gray">
                ({product.reviewCount} {product.reviewCount === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          )}
        </div>

        <div>
          {/* Pricing */}
          <div className="flex items-center flex-wrap gap-2 pt-1 font-sans text-xs">
            <span className="text-muted-gray uppercase tracking-wider font-light text-[10px]">
              {hasMultiplePrices ? 'from ' : ''}
            </span>
            {savePercentage > 0 ? (
              <>
                <span className="line-through text-gray-400">
                  ₹{originalPrice.toLocaleString('en-IN')}
                </span>
                <span className="font-semibold text-navy-deep text-sm">
                  ₹{sellingPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-green-600 font-medium text-[11px] bg-green-50 px-1.5 py-0.5 rounded">
                  Save {savePercentage}%
                </span>
              </>
            ) : (
              <span className="font-semibold text-navy-deep text-sm">
                {sellingPrice > 0 ? `₹${sellingPrice.toLocaleString('en-IN')}` : 'Unavailable'}
              </span>
            )}
          </div>

          {/* Stock / Actions bar */}
          <div className="pt-2.5 flex justify-between items-center text-[10px] tracking-wider uppercase font-sans">
            {isOutOfStock ? (
              <span className="text-red-500 font-bold">Out of Stock</span>
            ) : (
              <span className="text-[#3AA757] font-semibold">Available</span>
            )}

            {/* Quick Add on Mobile */}
            <button
              onClick={handleQuickAdd}
              disabled={loading || isOutOfStock}
              className="lg:hidden text-royal-blue hover:text-navy-deep font-bold disabled:opacity-30"
            >
              {loading ? 'Adding...' : 'Add +'}
            </button>
          </div>
        </div>
      </div>
      {/* Quick Add Variant Modal */}
      {showQuickAddModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-[#0F2854]/45 backdrop-blur-sm"
            onClick={() => setShowQuickAddModal(false)}
          />
          
          {/* Modal Card */}
          <div className="relative bg-white border border-[#BDE8F5]/45 rounded-2xl p-6 max-w-sm w-full shadow-2xl font-sans text-left space-y-4">
            <div className="flex justify-between items-start gap-4">
              <div className="flex gap-3 items-center">
                {/* Variant Dynamic Thumbnail */}
                <div className="w-12 h-16 bg-gray-50 border border-gray-150 rounded overflow-hidden flex-shrink-0">
                  <img
                    src={getOptimizedImageUrl(selectedVariant?.imageUrl || selectedVariant?.images?.[0] || product.images?.[0] || 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=100', 80)}
                    className="w-full h-full object-cover"
                    alt={product.name}
                  />
                </div>
                <div>
                  <span className="text-[9px] font-bold text-sky-blue uppercase tracking-widest block">Quick Add</span>
                  <h3 className="font-serif text-base font-bold text-navy-deep mt-0.5 leading-snug">
                    {product.name}
                  </h3>
                </div>
              </div>
              <button 
                onClick={() => setShowQuickAddModal(false)}
                className="text-muted-gray hover:text-navy-deep p-1 text-sm font-sans"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Sizes Selector */}
              {uniqueSizes.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-gray uppercase tracking-wider">
                    Select Size
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {uniqueSizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => {
                          setSelectedSize(size);
                          // Check if currently selected color is valid for this size
                          const colorsForSize = variantsList
                            .filter((v) => v.size === size && v.stock > 0)
                            .map((v) => v.color);
                          if (selectedColor && !colorsForSize.includes(selectedColor)) {
                            setSelectedColor('');
                          }
                        }}
                        className={`px-3 py-1.5 border text-xs font-semibold rounded-full transition-all ${
                          selectedSize === size
                            ? 'border-navy-deep bg-navy-deep text-white font-bold'
                            : 'border-gray-250 bg-white text-navy-deep hover:bg-gray-50'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Colors Selector */}
              {uniqueColors.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-gray uppercase tracking-wider">
                    Select Color
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {uniqueColors.map((color) => {
                      const isAvailable = !selectedSize || variantsList.some(
                        (v) => v.size === selectedSize && v.color === color && v.stock > 0
                      );
                      return (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setSelectedColor(color)}
                          disabled={!isAvailable}
                          className={`px-3 py-1.5 border text-xs font-semibold rounded-full transition-all ${
                            selectedColor === color
                              ? 'border-navy-deep bg-navy-deep text-white font-bold'
                              : 'border-gray-250 bg-white text-navy-deep hover:bg-gray-50 disabled:opacity-30'
                          }`}
                        >
                          {color}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Selected Option Summary */}
            {selectedVariant && (
              <div className="bg-[#BDE8F5]/10 border border-[#BDE8F5]/30 rounded-lg p-3 text-xs flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-bold text-muted-gray uppercase tracking-wider">Selected Option</p>
                  <p className="font-semibold text-navy-deep mt-0.5">
                    {selectedVariant.size || 'Standard'} / {selectedVariant.color || 'Default'}
                  </p>
                </div>
                <p className="font-bold text-navy-deep text-sm">
                  ₹{(selectedVariant.discountPrice || selectedVariant.price).toLocaleString('en-IN')}
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  if (selectedVariant) {
                    performQuickAdd(selectedVariant.id);
                    setShowQuickAddModal(false);
                  }
                }}
                disabled={!selectedVariant || loading}
                className="flex-1 px-4 py-2.5 bg-navy-deep hover:bg-royal-blue text-white text-xs font-bold uppercase tracking-widest rounded-full transition-colors shadow-sm disabled:opacity-40"
              >
                {loading ? 'Adding...' : 'Add to Cart'}
              </button>
              <button
                onClick={() => setShowQuickAddModal(false)}
                className="px-5 border border-gray-300 text-muted-gray text-xs font-bold uppercase tracking-widest rounded-full hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
