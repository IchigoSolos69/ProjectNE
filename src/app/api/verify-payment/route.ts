import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { createAdminClient } from "@/lib/supabase/admin";
import { fulfillPaidOrder } from "@/lib/orders";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: {
    event: string;
    payload?: {
      payment?: {
        entity?: {
          id?: string;
          order_id?: string;
          status?: string;
          notes?: Record<string, string>;
        };
      };
    };
  };

  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (event.event !== "payment.captured") {
    return NextResponse.json({ received: true });
  }

  const payment = event.payload?.payment?.entity;
  const razorpayOrderId = payment?.order_id;
  const paymentId = payment?.id;
  const supabaseOrderId =
    payment?.notes?.supabase_order_id ?? payment?.notes?.order_id;

  if (!razorpayOrderId || !paymentId) {
    return NextResponse.json({ error: "Missing payment data" }, { status: 400 });
  }

  const admin = createAdminClient();

  let orderId = supabaseOrderId;

  if (!orderId) {
    const { data: order } = await admin
      .from("orders")
      .select("id")
      .eq("razorpay_order_id", razorpayOrderId)
      .maybeSingle();
    orderId = order?.id;
  }

  if (!orderId) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  await admin
    .from("orders")
    .update({
      status: "paid",
      razorpay_payment_id: paymentId,
    })
    .eq("id", orderId);

  try {
    await fulfillPaidOrder(orderId, paymentId);
  } catch (err) {
    console.error("[verify-payment] Delhivery fulfillment failed:", err);
    // Payment is still marked paid; waybill can be retried manually
  }

  return NextResponse.json({ received: true, orderId });
}
