import { createAdminClient } from "@/lib/supabase/admin";
import { createDelhiveryWaybill } from "@/lib/delhivery";
import type { ShippingAddress } from "@/types/database";

export async function fulfillPaidOrder(supabaseOrderId: string, paymentId: string) {
  const admin = createAdminClient();

  const { data: order, error } = await admin
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", supabaseOrderId)
    .single();

  if (error || !order) {
    throw new Error(error?.message ?? "Order not found");
  }

  if (order.status === "paid" && order.delhivery_waybill) {
    return { alreadyFulfilled: true, waybill: order.delhivery_waybill };
  }

  const address = order.shipping_address as ShippingAddress;

  const waybillResult = await createDelhiveryWaybill({
    orderId: order.id,
    customerName: address.name,
    customerPhone: order.customer_phone,
    customerEmail: order.customer_email,
    pincode: order.customer_pincode,
    addressLine1: address.line1,
    addressLine2: address.line2,
    city: address.city,
    state: address.state,
    totalPaise: order.total_paise,
    items: (order.order_items ?? []).map(
      (item: {
        product_name: string;
        quantity: number;
        unit_price_paise: number;
      }) => ({
        name: item.product_name,
        sku: supabaseOrderId,
        quantity: item.quantity,
        pricePaise: item.unit_price_paise,
      }),
    ),
  });

  await admin
    .from("orders")
    .update({
      status: "processing",
      razorpay_payment_id: paymentId,
      delhivery_waybill: waybillResult.waybill ?? null,
    })
    .eq("id", supabaseOrderId);

  return { waybillResult, order };
}
