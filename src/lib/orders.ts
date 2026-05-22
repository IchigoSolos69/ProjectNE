/**
 * Mock order fulfillment for preview deployment.
 * Returns static success response without database queries.
 */
export async function fulfillPaidOrder(supabaseOrderId: string, paymentId: string) {
  const mockWaybill = `WAYBILL-MOCK-${supabaseOrderId.substring(0, 8).toUpperCase()}`;
  
  return {
    alreadyFulfilled: false,
    waybillResult: { success: true, waybill: mockWaybill },
    order: null, // Not used in preview
  };
}
