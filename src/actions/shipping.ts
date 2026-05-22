"use server";

import { fetchShippingRates } from "@/lib/delhivery";

export async function getShippingRatesAction(pincode: string) {
  return fetchShippingRates(pincode);
}
