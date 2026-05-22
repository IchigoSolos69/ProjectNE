import type { CheckoutPayload } from "@/types/database";
import { getShippingRatesAction } from "@/actions/shipping";
import { createRazorpayOrderAction } from "@/actions/create-razorpay-order";

export type { CreateOrderResult } from "@/actions/create-razorpay-order";

export const fetchShippingRates = getShippingRatesAction;
export const createCheckoutOrder = createRazorpayOrderAction;

export type { CheckoutPayload };
