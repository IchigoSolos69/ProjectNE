import type { Category, Product, Order } from "@/types/database";
import {
  MOCK_CATEGORIES,
  MOCK_SUBCATEGORIES,
  MOCK_PRODUCTS,
} from "@/lib/mock-data";

let fsModule: any = null;
let pathModule: any = null;

if (typeof process !== "undefined" && process.env.NEXT_RUNTIME !== "edge" && typeof window === "undefined") {
  try {
    const req = (globalThis as any).require;
    if (typeof req === "function") {
      fsModule = req("fs");
      pathModule = req("path");
    }
  } catch (e) {
    // ignore
  }
}

const getDBDir = () => {
  if (!pathModule) return "";
  const proc = typeof process !== "undefined" ? process : null;
  const cwd = proc && typeof (proc as any).cwd === "function" ? (proc as any).cwd() : "";
  return pathModule.join(cwd, "data");
};
const getDBFile = () => pathModule ? pathModule.join(getDBDir(), "db.json") : "";

interface DBStructure {
  categories: Category[];
  products: Product[];
  orders: Order[];
}

let inMemoryDB: DBStructure | null = null;

function getInitialData(): DBStructure {
  return {
    categories: [...MOCK_CATEGORIES, ...MOCK_SUBCATEGORIES],
    products: MOCK_PRODUCTS,
    orders: [
      {
        id: "order-1",
        user_id: null,
        status: "paid",
        razorpay_order_id: "order_mock_111",
        razorpay_payment_id: "pay_mock_111",
        delhivery_waybill: "WAYBILL-MOCK-111",
        subtotal_paise: 899900,
        shipping_paise: 15000,
        total_paise: 914900,
        customer_email: "test@example.com",
        customer_phone: "9876543210",
        customer_pincode: "110001",
        shipping_address: {
          name: "John Doe",
          line1: "Flat 402, Sunset Heights",
          city: "New Delhi",
          state: "Delhi",
          pincode: "110001",
        },
        created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
        updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
      {
        id: "order-2",
        user_id: null,
        status: "pending",
        razorpay_order_id: "order_mock_222",
        razorpay_payment_id: null,
        delhivery_waybill: null,
        subtotal_paise: 349900,
        shipping_paise: 0,
        total_paise: 349900,
        customer_email: "jane@example.com",
        customer_phone: "9876543211",
        customer_pincode: "400001",
        shipping_address: {
          name: "Jane Smith",
          line1: "12, Marine Drive",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400001",
        },
        created_at: new Date(Date.now() - 600000).toISOString(),
        updated_at: new Date(Date.now() - 600000).toISOString(),
      },
    ],
  };
}

// Helper to ensure database file exists and is initialized
function initDB(): DBStructure {
  if (!fsModule || !pathModule) {
    if (!inMemoryDB) {
      inMemoryDB = getInitialData();
    }
    return inMemoryDB;
  }

  const dbDir = getDBDir();
  const dbFile = getDBFile();

  if (!fsModule.existsSync(dbDir)) {
    fsModule.mkdirSync(dbDir, { recursive: true });
  }

  if (!fsModule.existsSync(dbFile)) {
    const initialData = getInitialData();
    fsModule.writeFileSync(dbFile, JSON.stringify(initialData, null, 2), "utf8");
    return initialData;
  }

  try {
    const fileContent = fsModule.readFileSync(dbFile, "utf8");
    return JSON.parse(fileContent);
  } catch (err) {
    console.error("Error reading db.json, resetting to default:", err);
    const initialData = getInitialData();
    fsModule.writeFileSync(dbFile, JSON.stringify(initialData, null, 2), "utf8");
    return initialData;
  }
}

export function readDB(): DBStructure {
  return initDB();
}

export function writeDB(data: DBStructure): void {
  if (!fsModule || !pathModule) {
    inMemoryDB = data;
    return;
  }

  const dbDir = getDBDir();
  const dbFile = getDBFile();

  if (!fsModule.existsSync(dbDir)) {
    fsModule.mkdirSync(dbDir, { recursive: true });
  }
  fsModule.writeFileSync(dbFile, JSON.stringify(data, null, 2), "utf8");
}

// Product APIs
export async function getProducts(): Promise<Product[]> {
  const db = readDB();
  return db.products;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const db = readDB();
  return db.products.find((p) => p.slug === slug) ?? null;
}

export async function getProductsByCategoryId(categoryId: string): Promise<Product[]> {
  const db = readDB();
  return db.products.filter((p) => p.category_id === categoryId);
}

export async function getCategories(): Promise<Category[]> {
  const db = readDB();
  return db.categories;
}

export async function getOrders(): Promise<Order[]> {
  const db = readDB();
  return db.orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function createProduct(productData: Omit<Product, "id" | "created_at" | "updated_at">): Promise<Product> {
  const db = readDB();
  const newProduct: Product = {
    ...productData,
    id: `prod-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  db.products.push(newProduct);
  writeDB(db);
  return newProduct;
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
  const db = readDB();
  const index = db.products.findIndex((p) => p.id === id);
  if (index === -1) {
    throw new Error(`Product not found: ${id}`);
  }
  const updatedProduct = {
    ...db.products[index],
    ...updates,
    updated_at: new Date().toISOString(),
  };
  db.products[index] = updatedProduct;
  writeDB(db);
  return updatedProduct;
}

export async function createOrder(orderData: Omit<Order, "id" | "created_at" | "updated_at"> & { id?: string }): Promise<Order> {
  const db = readDB();
  const newOrder: Order = {
    ...orderData,
    id: orderData.id || `order-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  db.orders.push(newOrder);
  writeDB(db);
  return newOrder;
}

export async function updateOrderStatus(id: string, status: Order["status"]): Promise<Order> {
  const db = readDB();
  const index = db.orders.findIndex((o) => o.id === id);
  if (index === -1) {
    throw new Error(`Order not found: ${id}`);
  }
  const updatedOrder = {
    ...db.orders[index],
    status,
    updated_at: new Date().toISOString(),
  };
  db.orders[index] = updatedOrder;
  writeDB(db);
  return updatedOrder;
}
