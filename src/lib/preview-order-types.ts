import type { CheckoutPayload } from "@/types/database";

export interface CreateOrderResult {
  success: boolean;
  orderId?: string;
  razorpayOrderId?: string;
  amountPaise?: number;
  keyId?: string;
  error?: string;
}

export type { CheckoutPayload };
