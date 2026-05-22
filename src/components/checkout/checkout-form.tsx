"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCartStore, useCartTotals } from "@/stores/cart-store";
import { formatINR } from "@/lib/utils";
import { getShippingRatesAction } from "@/actions/shipping";
import { createRazorpayOrderAction } from "@/actions/create-razorpay-order";
import type { ShippingAddress } from "@/types/database";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
    };
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function CheckoutForm() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const { subtotalPaise } = useCartTotals();

  const [shippingPaise, setShippingPaise] = useState(0);
  const [serviceable, setServiceable] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
  });

  async function handlePincodeBlur() {
    if (form.pincode.length !== 6) return;
    const rates = await getShippingRatesAction(form.pincode);
    setServiceable(rates.serviceable);
    setShippingPaise(rates.shippingPaise);
  }

  function handleChange(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  const totalPaise = subtotalPaise + shippingPaise;

  function handleCheckout() {
    setError(null);

    if (!items.length) {
      setError("Your cart is empty.");
      return;
    }

    if (serviceable === false) {
      setError("We do not deliver to this pincode yet.");
      return;
    }

    const shippingAddress: ShippingAddress = {
      name: form.name,
      line1: form.line1,
      line2: form.line2 || undefined,
      city: form.city,
      state: form.state,
      pincode: form.pincode,
      country: "India",
    };

    startTransition(async () => {
      const result = await createRazorpayOrderAction({
        items,
        shippingAddress,
        customerEmail: form.email,
        customerPhone: form.phone,
        pincode: form.pincode,
        shippingPaise,
      });

      if (!result.success || !result.razorpayOrderId || !result.keyId) {
        setError(result.error ?? "Could not start checkout");
        return;
      }

      const loaded = await loadRazorpayScript();
      if (!loaded || !window.Razorpay) {
        setError("Payment SDK failed to load");
        return;
      }

      const rzp = new window.Razorpay({
        key: result.keyId,
        amount: result.amountPaise,
        currency: "INR",
        name: "Atelier Home",
        description: "Order payment",
        order_id: result.razorpayOrderId,
        prefill: {
          name: form.name,
          email: form.email,
          contact: form.phone,
        },
        theme: { color: "#1c1917" },
        handler: () => {
          clearCart();
          router.push(`/order/success?order=${result.orderId}`);
        },
        modal: {
          ondismiss: () => setError("Payment cancelled"),
        },
      });

      rzp.open();
    });
  }

  if (!items.length) {
    return (
      <p className="text-stone-500">Add items to your cart before checking out.</p>
    );
  }

  return (
    <div className="grid gap-12 lg:grid-cols-2">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          handleCheckout();
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              required
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              required
              value={form.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="line1">Address</Label>
            <Input
              id="line1"
              required
              value={form.line1}
              onChange={(e) => handleChange("line1", e.target.value)}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="line2">Apartment, suite (optional)</Label>
            <Input
              id="line2"
              value={form.line2}
              onChange={(e) => handleChange("line2", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              required
              value={form.city}
              onChange={(e) => handleChange("city", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              required
              value={form.state}
              onChange={(e) => handleChange("state", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pincode">Pincode</Label>
            <Input
              id="pincode"
              required
              maxLength={6}
              value={form.pincode}
              onChange={(e) => handleChange("pincode", e.target.value)}
              onBlur={handlePincodeBlur}
            />
            {serviceable === false && (
              <p className="text-sm text-red-600">Not serviceable</p>
            )}
            {serviceable && shippingPaise > 0 && (
              <p className="text-sm text-stone-500">
                Shipping: {formatINR(shippingPaise)}
              </p>
            )}
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button type="submit" size="lg" disabled={isPending} className="w-full sm:w-auto">
          {isPending ? "Processing…" : `Pay ${formatINR(totalPaise)}`}
        </Button>
      </form>

      <aside className="rounded-lg border border-stone-200 bg-stone-50 p-6">
        <h2 className="font-medium text-stone-900">Order summary</h2>
        <ul className="mt-4 space-y-3">
          {items.map((item) => (
            <li key={item.productId} className="flex justify-between text-sm">
              <span className="text-stone-600">
                {item.name} × {item.quantity}
              </span>
              <span>{formatINR(item.pricePaise * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-6 space-y-2 border-t border-stone-200 pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-stone-600">Subtotal</span>
            <span>{formatINR(subtotalPaise)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-600">Shipping</span>
            <span>{shippingPaise ? formatINR(shippingPaise) : "—"}</span>
          </div>
          <div className="flex justify-between font-medium text-stone-900">
            <span>Total</span>
            <span>{formatINR(totalPaise)}</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
