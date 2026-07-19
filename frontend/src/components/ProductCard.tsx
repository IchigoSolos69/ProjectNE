import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Eye, Heart, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getOptimizedImageUrl } from '../lib/api';

export interface Variant {
  id: string;
  size: string | null;
  color: string | null;
  sku: string;
  price: number;
  discountPrice: number | null;
  stock: number;
  images: string[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  images: string[];
  isTrending: boolean;
  isActive: boolean;
  categoryId: string;
  category?: { name: string; slug: string };
  variants: Variant[];
  material?: string | null;
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
  const [loading, setLoading] = useState(false);

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

  const hasMultiplePrices = variantsList.length > 1;

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      // Redirect to login with return path
      navigate(`/auth?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }

    try {
      await toggleWishlist(product.id);
    } catch (err: any) {
      alert(err.message || 'Failed to update wishlist.');
    }
  };

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate('/auth');
      return;
    }

    if (isOutOfStock || !firstAvailableVariant) return;

    setLoading(true);
    try {
      await addToCart(firstAvailableVariant.id, 1);
      if (onQuickAddSuccess) {
        onQuickAddSuccess();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to add item to cart.');
    } finally {
      setLoading(false);
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
            srcSet={`${getOptimizedImageUrl(displayImage, 300)} 300w, ${getOptimizedImageUrl(displayImage, 600)} 600w, ${getOptimizedImageUrl(displayImage, 900)} 900w`}
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
          {product.ratingInfo && product.ratingInfo.count > 0 && (
            <div className="flex items-center gap-1.5 py-0.5">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-sans text-xs font-semibold text-navy-deep">
                {product.ratingInfo.average}
              </span>
              <span className="font-sans text-[10px] text-muted-gray">
                ({product.ratingInfo.count})
              </span>
            </div>
          )}
        </div>

        <div>
          {/* Pricing */}
          <div className="flex items-baseline gap-1.5 pt-1">
            <span className="font-sans text-xs text-muted-gray uppercase tracking-wider font-light">
              {hasMultiplePrices ? 'from ' : ''}
            </span>
            <span className="font-sans text-sm font-semibold text-navy-deep">
              {displayPrice > 0 ? `₹${displayPrice.toLocaleString('en-IN')}` : 'Unavailable'}
            </span>
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
    </div>
  );
};
