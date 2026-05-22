"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCartStore, useCartTotals } from "@/stores/cart-store";
import { formatINR } from "@/lib/currency";
import {
  createCheckoutOrder,
  fetchShippingRates,
} from "@/components/checkout/checkout-actions";
import type { CheckoutPayload } from "@/types/database";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

function PaymentSuccessModal({
  isOpen,
  amount,
  orderId,
  onConfirm,
}: {
  isOpen: boolean;
  amount: number;
  orderId: string;
  onConfirm: () => void;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50"
            onClick={onConfirm}
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
              <div className="flex flex-col items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                  <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-stone-900">Payment Successful!</h2>
                <p className="text-sm text-stone-600">Your order has been confirmed.</p>

                <div className="w-full space-y-2 rounded-lg bg-stone-50 p-4 text-center">
                  <div className="text-sm text-stone-600">Amount Paid</div>
                  <div className="text-2xl font-bold text-stone-900">{formatINR(amount)}</div>
                  <div className="mt-2 text-sm text-stone-600">Order ID</div>
                  <div className="font-mono text-sm text-stone-900">{orderId}</div>
                </div>

                <Button onClick={onConfirm} className="w-full" size="lg">
                  Go to Order Details
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function CheckoutForm() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const { subtotalPaise } = useCartTotals();

  const [shippingPaise, setShippingPaise] = useState(0);
  const [serviceable, setServiceable] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successOrderId, setSuccessOrderId] = useState<string | null>(null);
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
    const rates = await fetchShippingRates(form.pincode);
    setServiceable(rates.serviceable);
    setShippingPaise(rates.shippingPaise);
  }

  function handleChange(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  const totalPaise = subtotalPaise + shippingPaise;

  async function handleCheckout() {
    setError(null);

    if (!items.length) {
      setError("Your cart is empty.");
      return;
    }

    if (serviceable === false) {
      setError("We do not deliver to this pincode yet.");
      return;
    }

    const payload: CheckoutPayload = {
      items,
      shippingAddress: {
        name: form.name,
        line1: form.line1,
        line2: form.line2 || undefined,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
      },
      customerEmail: form.email,
      customerPhone: form.phone,
      pincode: form.pincode,
      shippingPaise,
    };

    startTransition(async () => {
      const res = await createCheckoutOrder(payload);
      if (!res.success) {
        setError(res.error || "Order creation failed");
        return;
      }

      setSuccessOrderId(res.orderId ?? null);
      setShowSuccessModal(true);
    });
  }

  function handleConfirmSuccess() {
    setShowSuccessModal(false);
    clearCart();
    const oid = successOrderId ?? "MOCK_ORDER_123456";
    router.push(`/order/success?order=${encodeURIComponent(oid)}`);
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3">
        <div>
          <Label>Name</Label>
          <Input value={form.name} onChange={(e) => handleChange("name", e.target.value)} />
        </div>

        <div>
          <Label>Email</Label>
          <Input value={form.email} onChange={(e) => handleChange("email", e.target.value)} />
        </div>

        <div>
          <Label>Phone</Label>
          <Input value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} />
        </div>

        <div>
          <Label>Address Line 1</Label>
          <Input value={form.line1} onChange={(e) => handleChange("line1", e.target.value)} />
        </div>

        <div>
          <Label>Address Line 2</Label>
          <Input value={form.line2} onChange={(e) => handleChange("line2", e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label>City</Label>
            <Input value={form.city} onChange={(e) => handleChange("city", e.target.value)} />
          </div>
          <div>
            <Label>State</Label>
            <Input value={form.state} onChange={(e) => handleChange("state", e.target.value)} />
          </div>
        </div>

        <div>
          <Label>Pincode</Label>
          <Input value={form.pincode} onBlur={handlePincodeBlur} onChange={(e) => handleChange("pincode", e.target.value)} />
          {serviceable === false && <div className="text-sm text-red-600">Delivery not available to this pincode.</div>}
        </div>
      </div>

      <div className="pt-4">
        <div className="mb-2 text-sm text-stone-600">Subtotal: {formatINR(subtotalPaise)}</div>
        <div className="mb-2 text-sm text-stone-600">Shipping: {formatINR(shippingPaise)}</div>
        <div className="mb-4 text-lg font-semibold">Total: {formatINR(totalPaise)}</div>

        {error && <div className="mb-2 text-sm text-red-600">{error}</div>}

        <Button onClick={() => handleCheckout()} disabled={isPending} className="w-full">
          Pay {formatINR(totalPaise)}
        </Button>
      </div>

      <PaymentSuccessModal
        isOpen={showSuccessModal}
        amount={totalPaise}
        orderId={successOrderId ?? "MOCK_ORDER_123456"}
        onConfirm={handleConfirmSuccess}
      />
    </div>
  );
}
