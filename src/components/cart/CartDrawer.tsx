"use client";

import React, { useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { usePathname } from "next/navigation";

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
  const pathname = usePathname();

  useEffect(() => {
    // Automatically close the cart drawer and unlock body scrolling when pathname changes
    setIsCartOpen(false);
    document.body.style.overflow = "";
  }, [pathname, setIsCartOpen]);

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

  return (
    <div
      onClick={handleOverlayClick}
      className={`fixed inset-0 z-50 flex justify-end bg-[#0F2854]/50 backdrop-blur-md transition-opacity duration-500 ${
        isCartOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Cart Drawer"
    >
      <div
        ref={drawerRef}
        className={`w-full max-w-md bg-background h-full shadow-2xl flex flex-col border-l border-brand-sky/40 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="px-6 py-5 border-b border-brand-sky/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-brand-midnight stroke-[1.5]" />
            <h2 className="font-serif text-lg font-semibold text-brand-midnight">Your Cart</h2>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1 rounded-full text-brand-midnight/50 hover:text-brand-royal hover:bg-brand-sky/35 active:scale-[0.95] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
            aria-label="Close cart"
          >
            <X className="h-5 w-5 stroke-[1.5]" />
          </button>
        </div>

        {/* Drawer Body (Cart Items List) */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12 animate-fade-in">
              <div className="p-4 rounded-full bg-brand-sky text-brand-royal/60">
                <ShoppingBag className="h-10 w-10 stroke-[1.2]" />
              </div>
              <div>
                <p className="font-serif text-base font-medium text-brand-midnight">Your sleep sanctuary is empty</p>
                <p className="text-sm text-brand-midnight/70 mt-1">Add items to start building your dream bed.</p>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="mt-2 inline-flex items-center justify-center px-6 py-2.5 bg-brand-royal hover:bg-brand-ocean text-white text-xs font-semibold uppercase tracking-wide rounded-md active:scale-[0.98] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] font-sans"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div
                key={`${item.product.id}-${item.size}`}
                className="flex items-start gap-4 pb-4 border-b border-brand-sky/20 last:border-0 last:pb-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{
                  transform: isCartOpen ? "translateY(0)" : "translateY(16px)",
                  opacity: isCartOpen ? 1 : 0,
                  transitionDelay: isCartOpen ? `${(idx + 1) * 80}ms` : "0ms",
                }}
              >
                {/* Product Image */}
                <div className="relative h-20 w-20 flex-shrink-0 bg-brand-sky/40 rounded-md overflow-hidden border border-brand-sky/30">
                  <Image
                    src={item.product.image}
                    alt={item.product.name}
                    fill
                    sizes="80px"
                    className="object-cover animate-fade-in"
                    unoptimized
                  />
                </div>

                {/* Item Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <h3 className="text-sm font-semibold text-brand-midnight truncate leading-tight">
                      <Link
                        href={`/products/${item.product.id}`}
                        onClick={() => setIsCartOpen(false)}
                        className="hover:underline hover:text-brand-royal transition-colors duration-300"
                      >
                        {item.product.name}
                      </Link>
                    </h3>
                    <p className="text-sm font-semibold text-brand-royal font-sans">
                      {Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(item.product.price * item.quantity)}
                    </p>
                  </div>

                  <p className="text-xs text-brand-midnight/50 mt-0.5">
                    Size: <span className="font-medium text-brand-midnight/75">{item.size}</span>
                  </p>

                  <div className="flex items-center justify-between mt-3">
                    {/* Quantity Adjustment Selector */}
                    <div className="flex items-center border border-brand-sky/50 rounded-md bg-brand-sky/20 font-sans">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)}
                        className="p-1 px-2 text-brand-midnight/60 hover:text-brand-royal hover:bg-brand-sky/50 active:scale-[0.95] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-xs font-semibold px-2 w-8 text-center text-brand-midnight">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)}
                        className="p-1 px-2 text-brand-midnight/60 hover:text-brand-royal hover:bg-brand-sky/50 active:scale-[0.95] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Delete Item */}
                    <button
                      onClick={() => removeFromCart(item.product.id, item.size)}
                      className="p-1.5 text-brand-midnight/40 hover:text-brand-royal hover:bg-brand-sky/35 active:scale-[0.95] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] rounded-full"
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
          <div className="p-6 border-t border-brand-sky/30 bg-brand-sky/20 space-y-4 font-sans">
            <div className="flex items-center justify-between text-base font-semibold text-brand-midnight">
              <span>Subtotal</span>
              <span>{Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(cartSubtotal)}</span>
            </div>
            <p className="text-xs text-brand-midnight/60">
              Shipping and taxes are calculated at checkout.
            </p>
            <div className="space-y-2">
              <button
                onClick={() => alert("Proceeding to checkout... (External backend integration goes here)")}
                className="w-full py-3 bg-brand-royal hover:bg-brand-ocean text-white text-xs font-semibold uppercase tracking-wide rounded-md shadow-sm active:scale-[0.98] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
              >
                Proceed to Checkout
              </button>
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-full py-2 bg-transparent text-brand-royal hover:text-brand-midnight text-xs font-semibold uppercase tracking-wide active:scale-[0.98] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
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
