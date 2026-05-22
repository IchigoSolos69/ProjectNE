import Razorpay from "razorpay";

async function generateHmacSha256(message: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(message);

  const cryptoSubtle = typeof crypto !== "undefined" ? crypto.subtle : (globalThis as any).crypto?.subtle;
  if (!cryptoSubtle) {
    throw new Error("Crypto subtle is not available");
  }

  const key = await cryptoSubtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureBuffer = await cryptoSubtle.sign("HMAC", key, messageData);
  return Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function timingSafeEqualStrings(a: string, b: string): boolean {
  if (a.length !== b.length) {
    let dummy = 0;
    for (let i = 0; i < a.length; i++) {
      dummy ^= a.charCodeAt(i);
    }
    return false;
  }
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

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
export async function verifyPaymentSignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): Promise<boolean> {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;

  const body = `${params.orderId}|${params.paymentId}`;
  try {
    const expected = await generateHmacSha256(body, secret);
    return timingSafeEqualStrings(expected, params.signature);
  } catch {
    return false;
  }
}

/** Verify Razorpay webhook payload (HMAC-SHA256 of raw body) */
export async function verifyWebhookSignature(
  rawBody: string,
  signature: string | null,
): Promise<boolean> {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;

  try {
    const expected = await generateHmacSha256(rawBody, secret);
    return timingSafeEqualStrings(expected, signature);
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
