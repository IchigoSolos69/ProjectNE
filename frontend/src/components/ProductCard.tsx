import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Eye, Heart, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

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
    <div className="group relative flex flex-col justify-between overflow-hidden bg-white border border-gray-100 rounded-lg p-3 transition-luxury hover-luxury">
      
      {/* Product Image Wrapper */}
      <div className="relative aspect-[4/5] bg-gray-50 overflow-hidden rounded-md mb-4">
        <Link to={`/products/${product.slug}`} className="block w-full h-full">
          {/* Category Tag */}
          {product.category && (
            <span className="absolute top-2 left-2 z-10 bg-white/95 backdrop-blur-sm text-navy-deep text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded shadow-sm">
              {product.category.name}
            </span>
          )}

          {/* Product Image */}
          <img
            src={displayImage}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-slow ease-smooth group-hover:scale-[1.06]"
          />

          {/* Hover Actions Overlay */}
          <div className="absolute inset-0 bg-navy-deep/20 opacity-0 group-hover:opacity-100 transition-opacity duration-medium ease-smooth flex items-center justify-center gap-3 z-10">
            <Link
              to={`/products/${product.slug}`}
              className="p-3 bg-white text-navy-deep rounded-full shadow-lg hover:bg-navy-deep hover:text-white transition-all duration-fast ease-soft active:scale-[0.93]"
              title="View Details"
            >
              <Eye className="w-4 h-4" />
            </Link>
            {!isOutOfStock && (
              <button
                onClick={handleQuickAdd}
                disabled={loading}
                className="p-3 bg-white text-navy-deep rounded-full shadow-lg hover:bg-navy-deep hover:text-white transition-all duration-fast ease-soft active:scale-[0.93] disabled:opacity-50"
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
          className="absolute top-2 right-2 z-25 p-2 bg-white/95 backdrop-blur-sm text-navy-deep rounded-full shadow-sm hover:text-red-500 hover:scale-105 active:scale-90 transition-all duration-fast ease-soft"
          title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart
            className={`w-3.5 h-3.5 transition-all duration-fast ease-soft ${
              isWishlisted ? 'fill-red-500 text-red-500 scale-110' : 'text-navy-deep scale-100'
            }`}
          />
        </button>
      </div>

      {/* Details info */}
      <div className="space-y-1 flex-1 flex flex-col justify-between">
        <div>
          <Link to={`/products/${product.slug}`} className="block">
            <h3 className="font-serif text-sm font-semibold text-navy-deep line-clamp-1 group-hover:text-royal-blue transition-colors">
              {product.name}
            </h3>
          </Link>
          
          {/* Reviews Aggregate score summary */}
          {product.ratingInfo && product.ratingInfo.count > 0 && (
            <div className="flex items-center gap-1 py-0.5">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="font-sans text-[10px] font-bold text-navy-deep">
                {product.ratingInfo.average}
              </span>
              <span className="font-sans text-[9px] text-muted-gray">
                ({product.ratingInfo.count})
              </span>
            </div>
          )}
        </div>

        <div>
          {/* Pricing */}
          <div className="flex items-baseline gap-1.5 pt-1">
            <span className="font-sans text-xs text-muted-gray">
              {hasMultiplePrices ? 'from ' : ''}
            </span>
            <span className="font-sans text-sm font-bold text-navy-deep">
              {displayPrice > 0 ? `₹${displayPrice.toLocaleString('en-IN')}` : 'Unavailable'}
            </span>
          </div>

          {/* Stock / Actions bar */}
          <div className="pt-2 flex justify-between items-center text-[11px]">
            {isOutOfStock ? (
              <span className="text-red-500 font-bold uppercase tracking-wider text-[10px]">Out of Stock</span>
            ) : (
              <span className="text-[#3AA757] font-semibold">In Stock</span>
            )}

            {/* Quick Add on Mobile */}
            <button
              onClick={handleQuickAdd}
              disabled={loading || isOutOfStock}
              className="lg:hidden text-royal-blue hover:text-navy-deep font-bold uppercase tracking-wider disabled:opacity-30"
            >
              {loading ? 'Adding...' : 'Add +'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
