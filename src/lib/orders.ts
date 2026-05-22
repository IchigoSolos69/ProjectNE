import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Mock order fulfillment for preview deployment.
 * Persists the waybill to the Supabase database.
 */
export async function fulfillPaidOrder(supabaseOrderId: string, paymentId: string) {
  const mockWaybill = `WAYBILL-MOCK-${supabaseOrderId.substring(0, 8).toUpperCase()}`;
  
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("orders")
    .update({
      delhivery_waybill: mockWaybill,
      status: "processing",
    })
    .eq("id", supabaseOrderId)
    .select()
    .single();

  if (error) {
    console.error("Failed to update order waybill in Supabase:", error);
  }

  return {
    alreadyFulfilled: false,
    waybillResult: { success: true, waybill: mockWaybill },
    order: data,
  };
}
