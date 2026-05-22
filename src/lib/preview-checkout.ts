"use client";

import type { CheckoutPayload } from "@/types/database";
import type { DelhiveryRateResult } from "@/lib/delhivery";
import type { CreateOrderResult } from "@/lib/preview-order-types";

/** Client-side mocks for static Cloudflare Pages deploy (no server actions). */
export async function getShippingRatesPreview(
  pincode: string,
): Promise<DelhiveryRateResult> {
  const normalized = pincode.replace(/\D/g, "").slice(0, 6);
  if (normalized.length !== 6) {
    return {
      pincode: normalized,
      serviceable: false,
      estimatedDays: null,
      shippingPaise: 0,
      codAvailable: false,
    };
  }
  return {
    pincode: normalized,
    serviceable: true,
    estimatedDays: 3,
    shippingPaise: 9900,
    codAvailable: false,
  };
}

export async function createMockOrderPreview(
  payload: CheckoutPayload,
): Promise<CreateOrderResult> {
  if (!payload.items.length) {
    return { success: false, error: "Cart is empty" };
  }

  const subtotalPaise = payload.items.reduce(
    (s, i) => s + i.pricePaise * i.quantity,
    0,
  );
  const totalPaise = subtotalPaise + payload.shippingPaise;

  return {
    success: true,
    orderId: `MOCK_ORDER_${Date.now()}`,
    razorpayOrderId: `pay_mock_${Math.random().toString(36).slice(2, 9)}`,
    amountPaise: totalPaise,
    keyId: "rzp_test_mock_key_id",
  };
}

export const isMockPreview =
  process.env.NEXT_PUBLIC_MOCK_PREVIEW === "true";
