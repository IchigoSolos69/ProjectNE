"use server";

import type { CheckoutPayload } from "@/types/database";
import { createOrder } from "@/lib/db";
import { createClient } from "@/utils/supabase/server";

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

    // Get active user session to link the order
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || null;

    // Generate standard order IDs
    const mockOrderId = `MOCK_ORDER_${Date.now()}_${Math.random()
      .toString(36)
      .substring(7)
      .toUpperCase()}`;
    const mockRazorpayOrderId = `pay_mock_${Math.random().toString(36).substring(7).toUpperCase()}`;
    const keyId =
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || "rzp_test_mock_key_id";

    // Save order in database
    await createOrder({
      id: mockOrderId,
      user_id: userId,
      status: "pending",
      razorpay_order_id: mockRazorpayOrderId,
      razorpay_payment_id: null,
      delhivery_waybill: null,
      subtotal_paise: subtotalPaise,
      shipping_paise: payload.shippingPaise,
      total_paise: totalPaise,
      shipping_address: payload.shippingAddress,
      customer_email: payload.customerEmail,
      customer_phone: payload.customerPhone,
      customer_pincode: payload.pincode,
      items: payload.items.map((item) => ({
        product_id: item.productId,
        quantity: item.quantity,
        unit_price_paise: item.pricePaise,
        product_name: item.name,
        product_slug: item.slug,
      })) as any,
    });

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
