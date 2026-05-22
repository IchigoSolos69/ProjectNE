import type { CheckoutPayload } from "@/types/database";
import {
  createMockOrderPreview,
  getShippingRatesPreview,
} from "@/lib/preview-checkout";

export type { CreateOrderResult } from "@/lib/preview-order-types";

export const fetchShippingRates = getShippingRatesPreview;
export const createCheckoutOrder = createMockOrderPreview;

export type { CheckoutPayload };
