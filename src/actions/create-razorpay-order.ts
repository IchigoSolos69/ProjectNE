
"use server";

import type { CheckoutPayload } from "@/types/database";

export interface CreateOrderResult {
  success: boolean;
  orderId?: string;
  razorpayOrderId?: string;
  amountPaise?: number;
  keyId?: string;
  error?: string;
}

export async function createRazorpayOrderAction(
  payload: CheckoutPayload,
): Promise<CreateOrderResult> {
  try {
    if (!payload.items.length) {
      return { success: false, error: "Cart is empty" };
    }

    const subtotalPaise = payload.items.reduce(
      (s, i) => s + i.pricePaise * i.quantity,
      0,
    );
    const totalPaise = subtotalPaise + payload.shippingPaise;

    // Mock order creation - generate a mock order ID
    const mockOrderId = `MOCK_ORDER_${Date.now()}_${Math.random()
      .toString(36)
      .substring(7)
      .toUpperCase()}`;
    const mockRazorpayOrderId = `pay_mock_${Math.random().toString(36).substring(7).toUpperCase()}`;
    const keyId =
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || "rzp_test_mock_key_id";

    return {
      success: true,
      orderId: mockOrderId,
      razorpayOrderId: mockRazorpayOrderId,
      amountPaise: totalPaise,
      keyId,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Order creation failed",
    };
  }
}
