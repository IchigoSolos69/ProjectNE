import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '../lib/api';
import { useAuth } from './AuthContext';

export interface CartProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  discountPrice: number | null;
  images: string[];
  stock: number;
}

export interface CartItem {
  id: string;
  variantId: string;
  productId: string;
  quantity: number;
  size: string | null;
  color: string | null;
  product: CartProduct;
}

interface CouponState {
  code: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: number;
  discountAmount: number;
}

interface CartContextType {
  cartItems: CartItem[];
  cartLoading: boolean;
  addToCart: (variantId: string, quantity: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCartState: () => void;
  checkout: (addressId: string) => Promise<any>;
  cartCount: number;
  subtotal: number;
  discountAmount: number;
  cartTotal: number;
  appliedCoupon: CouponState | null;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartLoading, setCartLoading] = useState<boolean>(false);
  const [appliedCoupon, setAppliedCoupon] = useState<CouponState | null>(null);

  const fetchCart = async () => {
    if (!user) {
      setCartItems([]);
      setAppliedCoupon(null);
      return;
    }
    setCartLoading(true);
    try {
      const data = await apiRequest<CartItem[]>('/api/cart');
      setCartItems(data);
    } catch (error) {
      console.error('Failed to load cart items from server:', error);
    } finally {
      setCartLoading(false);
    }
  };

  // Sync cart with database when user logs in/out
  useEffect(() => {
    fetchCart();
  }, [user]);

  // Recalculate coupon discount whenever cart items change
  useEffect(() => {
    if (appliedCoupon && cartItems.length > 0) {
      recalculateCoupon(appliedCoupon.code);
    } else if (cartItems.length === 0) {
      setAppliedCoupon(null);
    }
  }, [cartItems]);

  const addToCart = async (variantId: string, quantity: number) => {
    if (!user) {
      throw new Error('Please sign in to add items to your cart.');
    }
    try {
      await apiRequest('/api/cart', {
        method: 'POST',
        body: JSON.stringify({ variantId, quantity }),
      });
      await fetchCart();
    } catch (error) {
      console.error('Failed to add to cart:', error);
      throw error;
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (!user) return;
    try {
      await apiRequest(`/api/cart/${itemId}`, {
        method: 'PATCH',
        body: JSON.stringify({ quantity }),
      });
      await fetchCart();
    } catch (error) {
      console.error('Failed to update cart quantity:', error);
      throw error;
    }
  };

  const removeFromCart = async (itemId: string) => {
    if (!user) return;
    try {
      await apiRequest(`/api/cart/${itemId}`, {
        method: 'DELETE',
      });
      await fetchCart();
    } catch (error) {
      console.error('Failed to remove cart item:', error);
      throw error;
    }
  };

  const clearCartState = () => {
    setCartItems([]);
    setAppliedCoupon(null);
  };

  const applyCoupon = async (code: string) => {
    if (!user) throw new Error('Sign in to apply coupons.');
    try {
      const data: any = await apiRequest('/api/cart/apply-coupon', {
        method: 'POST',
        body: JSON.stringify({ code }),
      });
      setAppliedCoupon({
        code: data.code,
        type: data.type,
        value: data.value,
        discountAmount: data.discountAmount,
      });
    } catch (error) {
      console.error('Apply coupon failed:', error);
      throw error;
    }
  };

  const recalculateCoupon = async (code: string) => {
    try {
      const data: any = await apiRequest('/api/cart/apply-coupon', {
        method: 'POST',
        body: JSON.stringify({ code }),
      });
      setAppliedCoupon({
        code: data.code,
        type: data.type,
        value: data.value,
        discountAmount: data.discountAmount,
      });
    } catch {
      // If recalculation fails (e.g. min order value not met), remove coupon silently
      setAppliedCoupon(null);
    }
  };

  const removeCoupon = async () => {
    try {
      await apiRequest('/api/cart/coupon', { method: 'DELETE' });
    } catch (err) {
      console.error('Remove coupon error:', err);
    } finally {
      setAppliedCoupon(null);
    }
  };

  const checkout = async (addressId: string) => {
    if (!user) throw new Error('Sign in to check out.');
    try {
      const response = await apiRequest('/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          addressId,
          couponCode: appliedCoupon?.code,
        }),
      });
      clearCartState();
      return response;
    } catch (error) {
      console.error('Checkout failed:', error);
      throw error;
    }
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const subtotal = cartItems.reduce((acc, item) => {
    const activePrice = item.product.discountPrice
      ? Number(item.product.discountPrice)
      : Number(item.product.price);
    return acc + activePrice * item.quantity;
  }, 0);

  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const cartTotal = Math.max(0, subtotal - discountAmount);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartLoading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCartState,
        checkout,
        cartCount,
        subtotal,
        discountAmount,
        cartTotal,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
