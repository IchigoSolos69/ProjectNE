"use client";

import React, { useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/cart-context";

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    cartSubtotal,
  } = useCart();

  const drawerRef = useRef<HTMLDivElement>(null);

  // Close drawer on pressing Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsCartOpen(false);
      }
    };
    if (isCartOpen) {
      document.body.style.overflow = "hidden"; // Prevent scrolling behind
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isCartOpen, setIsCartOpen]);

  // Click outside to close helper
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
      setIsCartOpen(false);
    }
  };

  if (!isCartOpen) return null;

  return (
    <div
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex justify-end bg-black/45 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Cart Drawer"
    >
      <div
        ref={drawerRef}
        className="w-full max-w-md bg-background h-full shadow-2xl flex flex-col animate-slide-in-right border-l border-border/40"
      >
        {/* Drawer Header */}
        <div className="px-6 py-5 border-b border-border/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary stroke-[1.5]" />
            <h2 className="font-serif text-lg font-semibold text-primary">Your Cart</h2>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1 rounded-full text-foreground/50 hover:text-primary hover:bg-sand transition-colors duration-200"
            aria-label="Close cart"
          >
            <X className="h-5 w-5 stroke-[1.5]" />
          </button>
        </div>

        {/* Drawer Body (Cart Items List) */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
              <div className="p-4 rounded-full bg-sand/50 text-foreground/40">
                <ShoppingBag className="h-10 w-10 stroke-[1.2]" />
              </div>
              <div>
                <p className="font-serif text-base font-medium text-primary">Your sleep sanctuary is empty</p>
                <p className="text-sm text-foreground/60 mt-1">Add items to start building your dream bed.</p>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="mt-2 inline-flex items-center justify-center px-6 py-2.5 bg-primary hover:bg-primary-light text-white text-xs font-semibold uppercase tracking-wider rounded-md transition-colors duration-200"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={`${item.product.id}-${item.size}`}
                className="flex items-start gap-4 pb-4 border-b border-border/30 last:border-0 last:pb-0"
              >
                {/* Product Image */}
                <div className="relative h-20 w-20 flex-shrink-0 bg-sand rounded-md overflow-hidden border border-border/40">
                  <Image
                    src={item.product.image}
                    alt={item.product.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                    unoptimized
                  />
                </div>

                {/* Item Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <h3 className="text-sm font-semibold text-primary truncate leading-tight">
                      <Link
                        href={`/products/${item.product.id}`}
                        onClick={() => setIsCartOpen(false)}
                        className="hover:underline"
                      >
                        {item.product.name}
                      </Link>
                    </h3>
                    <p className="text-sm font-semibold text-primary-light">
                      ${item.product.price * item.quantity}
                    </p>
                  </div>

                  <p className="text-xs text-foreground/50 mt-0.5">
                    Size: <span className="font-medium text-foreground/75">{item.size}</span>
                  </p>

                  <div className="flex items-center justify-between mt-3">
                    {/* Quantity Adjustment Selector */}
                    <div className="flex items-center border border-border rounded-md bg-sand/30">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)}
                        className="p-1 px-2 text-foreground/60 hover:text-primary hover:bg-sand/80 transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-xs font-semibold px-2 w-8 text-center text-primary">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)}
                        className="p-1 px-2 text-foreground/60 hover:text-primary hover:bg-sand/80 transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Delete Item */}
                    <button
                      onClick={() => removeFromCart(item.product.id, item.size)}
                      className="p-1.5 text-foreground/40 hover:text-accent transition-colors rounded-full hover:bg-sand/50"
                      aria-label="Remove item from cart"
                    >
                      <Trash2 className="h-4 w-4 stroke-[1.5]" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-border/60 bg-sand/20 space-y-4">
            <div className="flex items-center justify-between text-base font-semibold text-primary">
              <span>Subtotal</span>
              <span>${cartSubtotal}</span>
            </div>
            <p className="text-xs text-foreground/50">
              Shipping and taxes are calculated at checkout.
            </p>
            <div className="space-y-2">
              <button
                onClick={() => alert("Proceeding to checkout... (External backend integration goes here)")}
                className="w-full py-3 bg-primary hover:bg-primary-light text-white text-xs font-semibold uppercase tracking-widest rounded-md shadow-sm transition-colors duration-200"
              >
                Proceed to Checkout
              </button>
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-full py-2 bg-transparent text-foreground/75 hover:text-primary text-xs font-medium uppercase tracking-wider transition-colors duration-200"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
