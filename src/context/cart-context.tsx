"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

/**
 * The cart only needs the fields used to display an item and create an order.
 * Keeping this separate from a page-specific product model lets API-backed
 * catalog products use their real database IDs without requiring fixture-only
 * detail fields.
 */
export interface CartProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  sku: string;
  category?: string;
}

export interface CartItem {
  product: CartProduct;
  size: "Twin" | "Queen" | "King";
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: CartProduct, size: "Twin" | "Queen" | "King", quantity?: number) => void;
  removeFromCart: (productId: string, size: "Twin" | "Queen" | "King") => void;
  updateQuantity: (productId: string, size: "Twin" | "Queen" | "King", quantity: number) => void;
  cartSubtotal: number;
  cartCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem("rarecomforts_cart");
      if (storedCart) {
        setCart(JSON.parse(storedCart));
      }
    } catch (error) {
      console.error("Failed to load cart from localStorage", error);
    }
    setIsInitialized(true);
  }, []);

  // Save cart to localStorage when it changes
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem("rarecomforts_cart", JSON.stringify(cart));
    } catch (error) {
      console.error("Failed to save cart to localStorage", error);
    }
  }, [cart, isInitialized]);

  const addToCart = (product: CartProduct, size: "Twin" | "Queen" | "King", quantity = 1) => {
    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex(
        (item) => item.product.id === product.id && item.size === size
      );

      if (existingItemIndex > -1) {
        // Item exists, update quantity
        const newCart = [...prevCart];
        newCart[existingItemIndex].quantity += quantity;
        return newCart;
      } else {
        // Add new item
        return [...prevCart, { product, size, quantity }];
      }
    });
    // Open the cart automatically when item is added for better UX
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string, size: "Twin" | "Queen" | "King") => {
    setCart((prevCart) =>
      prevCart.filter((item) => !(item.product.id === productId && item.size === size))
    );
  };

  const updateQuantity = (productId: string, size: "Twin" | "Queen" | "King", quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, size);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product.id === productId && item.size === size
          ? { ...item, quantity }
          : item
      )
    );
  };

  const cartSubtotal = cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        cartSubtotal,
        cartCount,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
