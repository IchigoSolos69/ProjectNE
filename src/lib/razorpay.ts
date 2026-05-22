import Razorpay from "razorpay";
import { createHmac, timingSafeEqual } from "crypto";

function getRazorpayInstance() {
  const keyId = process.env.RAZORPAY_KEY_ID || "rzp_test_mock_key_id";
  const keySecret = process.env.RAZORPAY_KEY_SECRET || "mock_key_secret";

  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

export interface CreateRazorpayOrderInput {
  amountPaise: number;
  receipt: string;
  notes?: Record<string, string>;
}

export async function createRazorpayOrder(input: CreateRazorpayOrderInput) {
  const razorpay = getRazorpayInstance();

  const order = await razorpay.orders.create({
    amount: input.amountPaise,
    currency: "INR",
    receipt: input.receipt,
    notes: input.notes,
  });

  return order;
}

/** Verify Razorpay payment signature from checkout callback */
export function verifyPaymentSignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;

  const body = `${params.orderId}|${params.paymentId}`;
  const expected = createHmac("sha256", secret).update(body).digest("hex");

  try {
    return timingSafeEqual(
      Buffer.from(expected, "utf8"),
      Buffer.from(params.signature, "utf8"),
    );
  } catch {
    return false;
  }
}

/** Verify Razorpay webhook payload (HMAC-SHA256 of raw body) */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string | null,
): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;

  const expected = createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  try {
    return timingSafeEqual(
      Buffer.from(expected, "utf8"),
      Buffer.from(signature, "utf8"),
    );
  } catch {
    return false;
  }
}

export function getPublicRazorpayKeyId(): string {
  return (
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
    process.env.RAZORPAY_KEY_ID ||
    "rzp_test_mock_key_id"
  );
}
