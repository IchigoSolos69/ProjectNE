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
 * Fetch shipping rate for a destination pincode.
 * Uses Delhivery pincode serviceability + a flat rate fallback when API is unavailable.
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

  try {
    const url = `${BASE_URL}/c/api/pin-codes/json/?filter_codes=${normalized}`;
    const res = await fetch(url, { headers: getHeaders(), cache: "no-store" });

    if (!res.ok) {
      return defaultRate(normalized, false);
    }

    const data = (await res.json()) as {
      delivery_codes?: Array<{
        postal_code?: { pin?: string; pre_paid?: string; cod?: string };
      }>;
    };

    const entry = data.delivery_codes?.[0]?.postal_code;
    const serviceable = entry?.pre_paid === "Y" || entry?.cod === "Y";

    if (!serviceable) {
      return {
        pincode: normalized,
        serviceable: false,
        estimatedDays: null,
        shippingPaise: 0,
        codAvailable: entry?.cod === "Y",
      };
    }

    // Flat premium shipping; replace with Delhivery rate API when contracted
    const shippingPaise =
      parseInt(process.env.DELHIVERY_FLAT_SHIPPING_PAISE ?? "9900", 10) || 9900;

    return {
      pincode: normalized,
      serviceable: true,
      estimatedDays: 4,
      shippingPaise,
      codAvailable: entry?.cod === "Y",
    };
  } catch {
    return defaultRate(normalized, true);
  }
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
 * Order manifestation — create Delhivery waybill after payment is verified.
 * @see https://one.delhivery.com/developer-portal/document/b2c/detail/order-creation
 */
export async function createDelhiveryWaybill(
  input: CreateWaybillInput,
): Promise<WaybillResult> {
  const clientName = process.env.DELHIVERY_CLIENT_NAME;
  const pickupLocation = process.env.DELHIVERY_PICKUP_LOCATION;

  if (!clientName || !pickupLocation) {
    return {
      success: false,
      error: "Delhivery client name or pickup location not configured",
    };
  }

  const shipment = {
    name: input.customerName,
    add: [input.addressLine1, input.addressLine2].filter(Boolean).join(", "),
    pin: input.pincode,
    city: input.city,
    state: input.state,
    country: "India",
    phone: input.customerPhone,
    order: input.orderId,
    payment_mode: "Prepaid",
    return_pin: "",
    return_city: "",
    return_phone: "",
    return_add: "",
    return_state: "",
    return_country: "India",
    products_desc: input.items.map((i) => i.name).join(", "),
    hsn_code: "",
    cod_amount: 0,
    order_date: new Date().toISOString().slice(0, 10),
    total_amount: input.totalPaise / 100,
    seller_add: "",
    seller_name: clientName,
    seller_inv: input.orderId,
    quantity: input.items.reduce((s, i) => s + i.quantity, 0),
    waybill: "",
    shipment_width: 30,
    shipment_height: 10,
    weight: 0.5,
    seller_gst_tin: "",
    shipping_mode: "Surface",
    address_type: "home",
  };

  const payload = {
    format: "json",
    data: JSON.stringify({
      shipments: [shipment],
      pickup_location: { name: pickupLocation },
    }),
  };

  try {
    const body = new URLSearchParams();
    body.set("format", payload.format);
    body.set("data", payload.data);

    const res = await fetch(`${BASE_URL}/api/cmu/create.json`, {
      method: "POST",
      headers: {
        Authorization: `Token ${process.env.DELHIVERY_API_TOKEN}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    const json = (await res.json()) as {
      success?: boolean;
      packages?: Array<{ waybill?: string }>;
      rmk?: string;
      error?: string;
    };

    const waybill = json.packages?.[0]?.waybill;

    if (res.ok && (json.success || waybill)) {
      return { success: true, waybill: waybill ?? undefined };
    }

    return {
      success: false,
      error: json.rmk ?? json.error ?? "Waybill creation failed",
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Delhivery request failed",
    };
  }
}
