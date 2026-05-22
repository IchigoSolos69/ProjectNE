const BASE_URL =
  process.env.DELHIVERY_API_BASE_URL ?? "https://track.delhivery.com";

function getHeaders(): HeadersInit {
  const token = process.env.DELHIVERY_API_TOKEN;
  if (!token) throw new Error("DELHIVERY_API_TOKEN is not configured");
  return {
    Authorization: `Token ${token}`,
    "Content-Type": "application/json",
  };
}

export interface DelhiveryRateResult {
  pincode: string;
  serviceable: boolean;
  estimatedDays: number | null;
  shippingPaise: number;
  codAvailable: boolean;
}

/**
 * Mock shipping rate fetch for preview deployment.
 * Returns a static response for any valid 6-digit pincode.
 */
export async function fetchShippingRates(
  pincode: string,
): Promise<DelhiveryRateResult> {
  const normalized = pincode.replace(/\D/g, "").slice(0, 6);
  if (normalized.length !== 6) {
    return {
      pincode: normalized,
      serviceable: false,
      estimatedDays: null,
      shippingPaise: 0,
      codAvailable: false,
    };
  }

  // Mock response: serviceable with ₹99 flat shipping, 3 days delivery
  return {
    pincode: normalized,
    serviceable: true,
    estimatedDays: 3,
    shippingPaise: 9900, // ₹99
    codAvailable: false,
  };
}

function defaultRate(pincode: string, serviceable: boolean): DelhiveryRateResult {
  return {
    pincode,
    serviceable,
    estimatedDays: serviceable ? 5 : null,
    shippingPaise: serviceable ? 9900 : 0,
    codAvailable: false,
  };
}

export interface WaybillShipmentItem {
  name: string;
  sku: string;
  quantity: number;
  pricePaise: number;
}

export interface CreateWaybillInput {
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  pincode: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  totalPaise: number;
  items: WaybillShipmentItem[];
}

export interface WaybillResult {
  success: boolean;
  waybill?: string;
  error?: string;
}

/**
 * Mock Delhivery waybill creation for preview deployment.
 * Returns a static mock waybill number.
 */
export async function createDelhiveryWaybill(
  input: CreateWaybillInput,
): Promise<WaybillResult> {
  // Mock response: always successful with a mock waybill
  return {
    success: true,
    waybill: `WAYBILL-MOCK-${input.orderId.substring(0, 8).toUpperCase()}`,
  };
}
