"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createRazorpayOrder } from "@/lib/razorpay";
import { createClient } from "@/lib/supabase/server";
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

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const admin = createAdminClient();

    const { data: order, error: orderError } = await admin
      .from("orders")
      .insert({
        user_id: user?.id ?? null,
        status: "pending",
        subtotal_paise: subtotalPaise,
        shipping_paise: payload.shippingPaise,
        total_paise: totalPaise,
        shipping_address: payload.shippingAddress,
        customer_email: payload.customerEmail,
        customer_phone: payload.customerPhone,
        customer_pincode: payload.pincode,
      })
      .select("id")
      .single();

    if (orderError || !order) {
      return { success: false, error: orderError?.message ?? "Failed to create order" };
    }

    const orderItems = payload.items.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      quantity: item.quantity,
      unit_price_paise: item.pricePaise,
      product_name: item.name,
      product_slug: item.slug,
    }));

    const { error: itemsError } = await admin.from("order_items").insert(orderItems);

    if (itemsError) {
      return { success: false, error: itemsError.message };
    }

    const razorpayOrder = await createRazorpayOrder({
      amountPaise: totalPaise,
      receipt: order.id,
      notes: {
        supabase_order_id: order.id,
        customer_email: payload.customerEmail,
      },
    });

    await admin
      .from("orders")
      .update({ razorpay_order_id: razorpayOrder.id })
      .eq("id", order.id);

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? process.env.RAZORPAY_KEY_ID;

    return {
      success: true,
      orderId: order.id,
      razorpayOrderId: razorpayOrder.id,
      amountPaise: totalPaise,
      keyId: keyId ?? undefined,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Order creation failed",
    };
  }
}
