export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  created_at: string;
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string | null;
  price_paise: number;
  compare_at_price_paise: number | null;
  images: string[];
  sku: string | null;
  inventory: number;
  is_active: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  default_pincode: string | null;
  created_at: string;
  updated_at: string;
}

export interface ShippingAddress {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
}

export interface Order {
  id: string;
  user_id: string | null;
  status: OrderStatus;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  delhivery_waybill: string | null;
  subtotal_paise: number;
  shipping_paise: number;
  total_paise: number;
  shipping_address: ShippingAddress;
  customer_email: string;
  customer_phone: string;
  customer_pincode: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price_paise: number;
  product_name: string;
  product_slug: string;
}

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  image: string;
  pricePaise: number;
  quantity: number;
}

export interface CheckoutPayload {
  items: CartItem[];
  shippingAddress: ShippingAddress;
  customerEmail: string;
  customerPhone: string;
  pincode: string;
  shippingPaise: number;
}
