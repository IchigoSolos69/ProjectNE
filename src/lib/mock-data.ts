/**
 * Mock data for Cloudflare Pages preview deployment
 * Provides static categories and products matching the database schema
 */

import type { Category, Product } from "@/types/database";

// Mock Categories - Top-level categories
export const MOCK_CATEGORIES: Category[] = [
  {
    id: "cat-beddings-001",
    name: "Beddings",
    slug: "beddings",
    parent_id: null,
    description: "Premium bed sheets, duvet covers, and bedding sets",
    image_url: "https://images.unsplash.com/photo-1578483410131-d957d7c29ee8?w=400&h=400&fit=crop",
    sort_order: 1,
    created_at: "2025-05-22T00:00:00.000Z",
  },
  {
    id: "cat-towels-001",
    name: "Bath Towels",
    slug: "bath-towels",
    parent_id: null,
    description: "Luxurious bath towels, hand towels, and face towels",
    image_url: "https://images.unsplash.com/photo-1585836456486-6b3ccd3cc8fa?w=400&h=400&fit=crop",
    sort_order: 2,
    created_at: "2025-05-22T00:00:00.000Z",
  },
  {
    id: "cat-pillows-001",
    name: "Pillow Covers",
    slug: "pillow-covers",
    parent_id: null,
    description: "Comfortable pillows with premium filling and covers",
    image_url: "https://images.unsplash.com/photo-1584622506244-08eba1a66f88?w=400&h=400&fit=crop",
    sort_order: 3,
    created_at: "2025-05-22T00:00:00.000Z",
  },
];

// Mock Subcategories
export const MOCK_SUBCATEGORIES: Category[] = [
  // Beddings subcategories
  {
    id: "subcat-sheets-001",
    name: "Sheets",
    slug: "sheets",
    parent_id: "cat-beddings-001",
    description: "Egyptian cotton and premium bed sheets",
    image_url: "https://images.unsplash.com/photo-1540932239-4cef0c8a7cee?w=400&h=400&fit=crop",
    sort_order: 1,
    created_at: "2025-05-22T00:00:00.000Z",
  },
  {
    id: "subcat-duvet-001",
    name: "Duvets",
    slug: "duvets",
    parent_id: "cat-beddings-001",
    description: "Soft and durable duvet covers in various styles",
    image_url: "https://images.unsplash.com/photo-1630519259742-c6a5f48b5b9e?w=400&h=400&fit=crop",
    sort_order: 2,
    created_at: "2025-05-22T00:00:00.000Z",
  },
  {
    id: "subcat-comforters-001",
    name: "Comforters",
    slug: "comforters",
    parent_id: "cat-beddings-001",
    description: "Cozy comforters for all seasons",
    image_url: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&h=400&fit=crop",
    sort_order: 3,
    created_at: "2025-05-22T00:00:00.000Z",
  },
  // Bath Towels subcategories
  {
    id: "subcat-hand-001",
    name: "Hand",
    slug: "hand",
    parent_id: "cat-towels-001",
    description: "Premium hand towels",
    image_url: "https://images.unsplash.com/photo-1582213918514-94b2b8d80249?w=400&h=400&fit=crop",
    sort_order: 1,
    created_at: "2025-05-22T00:00:00.000Z",
  },
  {
    id: "subcat-face-001",
    name: "Face",
    slug: "face",
    parent_id: "cat-towels-001",
    description: "Gentle face towels",
    image_url: "https://images.unsplash.com/photo-1585836456486-6b3ccd3cc8fa?w=400&h=400&fit=crop",
    sort_order: 2,
    created_at: "2025-05-22T00:00:00.000Z",
  },
  {
    id: "subcat-bath-001",
    name: "Bath",
    slug: "bath",
    parent_id: "cat-towels-001",
    description: "Large, absorbent bath towels",
    image_url: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=400&fit=crop",
    sort_order: 3,
    created_at: "2025-05-22T00:00:00.000Z",
  },
  {
    id: "subcat-mats-001",
    name: "Mats",
    slug: "mats",
    parent_id: "cat-towels-001",
    description: "Soft bath mats",
    image_url: "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=400&h=400&fit=crop",
    sort_order: 4,
    created_at: "2025-05-22T00:00:00.000Z",
  },
  // Pillow Covers subcategories
  {
    id: "subcat-standard-001",
    name: "Standard",
    slug: "standard",
    parent_id: "cat-pillows-001",
    description: "Standard size pillow covers",
    image_url: "https://images.unsplash.com/photo-1584100936595-c0654b55a2f2?w=400&h=400&fit=crop",
    sort_order: 1,
    created_at: "2025-05-22T00:00:00.000Z",
  },
  {
    id: "subcat-king-001",
    name: "King",
    slug: "king",
    parent_id: "cat-pillows-001",
    description: "King size pillow covers",
    image_url: "https://images.unsplash.com/photo-1584622506244-08eba1a66f88?w=400&h=400&fit=crop",
    sort_order: 2,
    created_at: "2025-05-22T00:00:00.000Z",
  },
  {
    id: "subcat-euro-001",
    name: "Euro",
    slug: "euro",
    parent_id: "cat-pillows-001",
    description: "Euro size pillow covers",
    image_url: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400&h=400&fit=crop",
    sort_order: 3,
    created_at: "2025-05-22T00:00:00.000Z",
  },
];

// Combine all categories
const ALL_CATEGORIES = [...MOCK_CATEGORIES, ...MOCK_SUBCATEGORIES];

// Mock Products
export const MOCK_PRODUCTS: Product[] = [
  // Bed Sheets
  {
    id: "prod-sheets-001",
    category_id: "subcat-sheets-001",
    name: "Egyptian Cotton King Sheets",
    slug: "egyptian-cotton-king-sheets",
    description: "Luxurious 500 thread count Egyptian cotton sheets. Perfect for a restful night's sleep.",
    price_paise: 499900, // ₹4,999
    compare_at_price_paise: 799900, // ₹7,999
    images: [
      "https://images.unsplash.com/photo-1540932239-4cef0c8a7cee?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1551028719-00167b16ebc5?w=600&h=600&fit=crop",
    ],
    sku: "SHEETS-EGY-K-001",
    inventory: 50,
    is_active: true,
    metadata: { color: "White", size: "King", thread_count: 500 },
    created_at: "2025-05-22T00:00:00.000Z",
    updated_at: "2025-05-22T00:00:00.000Z",
  },
  {
    id: "prod-sheets-002",
    category_id: "subcat-sheets-001",
    name: "Sateen Cotton Queen Sheets",
    slug: "sateen-cotton-queen-sheets",
    description: "Silky smooth sateen finish with 400 thread count. Elegant and durable.",
    price_paise: 349900, // ₹3,499
    compare_at_price_paise: 599900, // ₹5,999
    images: [
      "https://images.unsplash.com/photo-1578483410131-d957d7c29ee8?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1551028719-00167b16ebc5?w=600&h=600&fit=crop",
    ],
    sku: "SHEETS-SAT-Q-001",
    inventory: 75,
    is_active: true,
    metadata: { color: "Cream", size: "Queen", thread_count: 400 },
    created_at: "2025-05-22T00:00:00.000Z",
    updated_at: "2025-05-22T00:00:00.000Z",
  },

  // Duvet Covers
  {
    id: "prod-duvet-001",
    category_id: "subcat-duvet-001",
    name: "Premium Cotton Duvet Cover King",
    slug: "premium-cotton-duvet-cover-king",
    description: "Soft and breathable cotton duvet cover with corner ties. Fits king size duvets.",
    price_paise: 599900, // ₹5,999
    compare_at_price_paise: 899900, // ₹8,999
    images: [
      "https://images.unsplash.com/photo-1630519259742-c6a5f48b5b9e?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop",
    ],
    sku: "DUVET-COT-K-001",
    inventory: 40,
    is_active: true,
    metadata: { color: "Navy", size: "King", material: "100% Cotton" },
    created_at: "2025-05-22T00:00:00.000Z",
    updated_at: "2025-05-22T00:00:00.000Z",
  },
  {
    id: "prod-duvet-002",
    category_id: "subcat-duvet-001",
    name: "Microfiber Duvet Cover Queen",
    slug: "microfiber-duvet-cover-queen",
    description: "Ultra-soft microfiber duvet cover. Easy to care and machine washable.",
    price_paise: 299900, // ₹2,999
    compare_at_price_paise: 499900, // ₹4,999
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1630519259742-c6a5f48b5b9e?w=600&h=600&fit=crop",
    ],
    sku: "DUVET-MIC-Q-001",
    inventory: 60,
    is_active: true,
    metadata: { color: "Gray", size: "Queen", material: "Microfiber" },
    created_at: "2025-05-22T00:00:00.000Z",
    updated_at: "2025-05-22T00:00:00.000Z",
  },

  // Bath Towels
  {
    id: "prod-bath-001",
    category_id: "subcat-bath-001",
    name: "Luxe Bath Towel Set (2)",
    slug: "luxe-bath-towel-set",
    description: "Set of 2 large, absorbent bath towels made from premium cotton.",
    price_paise: 199900, // ₹1,999
    compare_at_price_paise: 349900, // ₹3,499
    images: [
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1585836456486-6b3ccd3cc8fa?w=600&h=600&fit=crop",
    ],
    sku: "TOWEL-BATH-001",
    inventory: 100,
    is_active: true,
    metadata: { color: "White", quantity: 2, material: "100% Cotton" },
    created_at: "2025-05-22T00:00:00.000Z",
    updated_at: "2025-05-22T00:00:00.000Z",
  },
  {
    id: "prod-bath-002",
    category_id: "subcat-bath-001",
    name: "Turkish Cotton Bath Towel",
    slug: "turkish-cotton-bath-towel",
    description: "Premium Turkish cotton bath towel with exceptional absorbency and softness.",
    price_paise: 149900, // ₹1,499
    compare_at_price_paise: 249900, // ₹2,499
    images: [
      "https://images.unsplash.com/photo-1585836456486-6b3ccd3cc8fa?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=600&fit=crop",
    ],
    sku: "TOWEL-TURK-001",
    inventory: 120,
    is_active: true,
    metadata: { color: "Charcoal", weight: "600 GSM", material: "Turkish Cotton" },
    created_at: "2025-05-22T00:00:00.000Z",
    updated_at: "2025-05-22T00:00:00.000Z",
  },

  // Hand Towels
  {
    id: "prod-hand-001",
    category_id: "subcat-hand-001",
    name: "Hand Towel Pack (6)",
    slug: "hand-towel-pack-6",
    description: "Set of 6 premium hand towels, perfect for any bathroom.",
    price_paise: 99900, // ₹999
    compare_at_price_paise: 179900, // ₹1,799
    images: [
      "https://images.unsplash.com/photo-1582213918514-94b2b8d80249?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=600&fit=crop",
    ],
    sku: "TOWEL-HAND-001",
    inventory: 150,
    is_active: true,
    metadata: { color: "Beige", quantity: 6, material: "100% Cotton" },
    created_at: "2025-05-22T00:00:00.000Z",
    updated_at: "2025-05-22T00:00:00.000Z",
  },
  {
    id: "prod-hand-002",
    category_id: "subcat-face-001",
    name: "Face Towel Organic Cotton",
    slug: "face-towel-organic-cotton",
    description: "Soft and gentle organic cotton face towel, hypoallergenic.",
    price_paise: 79900, // ₹799
    compare_at_price_paise: 129900, // ₹1,299
    images: [
      "https://images.unsplash.com/photo-1582213918514-94b2b8d80249?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1585836456486-6b3ccd3cc8fa?w=600&h=600&fit=crop",
    ],
    sku: "TOWEL-FACE-001",
    inventory: 200,
    is_active: true,
    metadata: { color: "Sage Green", material: "Organic Cotton" },
    created_at: "2025-05-22T00:00:00.000Z",
    updated_at: "2025-05-22T00:00:00.000Z",
  },

  // Pillows
  {
    id: "prod-pillow-001",
    category_id: "subcat-standard-001",
    name: "Memory Foam Pillow",
    slug: "memory-foam-pillow",
    description: "Supportive memory foam pillow that conforms to your head and neck shape.",
    price_paise: 349900, // ₹3,499
    compare_at_price_paise: 549900, // ₹5,499
    images: [
      "https://images.unsplash.com/photo-1584622506244-08eba1a66f88?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&h=600&fit=crop",
    ],
    sku: "PILLOW-MEM-001",
    inventory: 45,
    is_active: true,
    metadata: { type: "Memory Foam", firmness: "Medium", hypoallergenic: true },
    created_at: "2025-05-22T00:00:00.000Z",
    updated_at: "2025-05-22T00:00:00.000Z",
  },
  {
    id: "prod-pillow-002",
    category_id: "subcat-king-001",
    name: "Down Alternative Pillow",
    slug: "down-alternative-pillow",
    description: "Plush down alternative pillow with bamboo fabric cover.",
    price_paise: 249900, // ₹2,499
    compare_at_price_paise: 399900, // ₹3,999
    images: [
      "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1584622506244-08eba1a66f88?w=600&h=600&fit=crop",
    ],
    sku: "PILLOW-DOWN-001",
    inventory: 70,
    is_active: true,
    metadata: { type: "Down Alternative", cover: "Bamboo", washable: true },
    created_at: "2025-05-22T00:00:00.000Z",
    updated_at: "2025-05-22T00:00:00.000Z",
  },
  {
    id: "prod-pillow-003",
    category_id: "subcat-euro-001",
    name: "Bamboo Comfort Pillow Set (2)",
    slug: "bamboo-comfort-pillow-set",
    description: "Set of 2 pillows with bamboo fiber filling, breathable and cooling.",
    price_paise: 199900, // ₹1,999
    compare_at_price_paise: 349900, // ₹3,499
    images: [
      "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1584622506244-08eba1a66f88?w=600&h=600&fit=crop",
    ],
    sku: "PILLOW-BAM-001",
    inventory: 85,
    is_active: true,
    metadata: { type: "Bamboo Fiber", quantity: 2, cooling: true },
    created_at: "2025-05-22T00:00:00.000Z",
    updated_at: "2025-05-22T00:00:00.000Z",
  },
];

/**
 * Get all categories (top-level and sub)
 */
export function getAllCategories(): Category[] {
  return ALL_CATEGORIES;
}

/**
 * Get top-level categories only
 */
export function getTopCategories(): Category[] {
  return MOCK_CATEGORIES;
}

/**
 * Get category by slug
 */
export function getCategoryBySlug(slug: string): Category | null {
  return ALL_CATEGORIES.find((c) => c.slug === slug) ?? null;
}

/**
 * Get subcategories for a parent category
 */
export function getSubcategoriesForParent(parentId: string): Category[] {
  return ALL_CATEGORIES.filter((c) => c.parent_id === parentId);
}

/**
 * Get products by category ID
 */
export function getProductsByCategoryId(categoryId: string): Product[] {
  return MOCK_PRODUCTS.filter((p) => p.category_id === categoryId && p.is_active);
}

/**
 * Get product by slug
 */
export function getProductBySlug(slug: string): Product | null {
  return MOCK_PRODUCTS.find((p) => p.slug === slug && p.is_active) ?? null;
}

/**
 * Get featured products
 */
export function getFeaturedProducts(limit = 8): Product[] {
  return MOCK_PRODUCTS.filter((p) => p.is_active).slice(0, limit);
}

/** Paths for `output: "export"` (Cloudflare Pages static deploy) */
export function getStaticCategoryParams() {
  return MOCK_CATEGORIES.map((c) => ({ category: c.slug }));
}

export function getStaticSubcategoryParams() {
  return MOCK_SUBCATEGORIES.map((sub) => {
    const parent = MOCK_CATEGORIES.find((p) => p.id === sub.parent_id);
    return { category: parent!.slug, subcategory: sub.slug };
  });
}

export function getStaticProductParams() {
  return MOCK_PRODUCTS.map((p) => ({ slug: p.slug }));
}
