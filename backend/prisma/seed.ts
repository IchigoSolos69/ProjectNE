import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with variants & coupons...');

  // Create Admin User if not exists
  const adminEmail = 'admin@rarecomforts.com';
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('AdminPassword123', 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'RareComforts Admin',
        passwordHash,
        role: 'ADMIN',
      },
    });
    console.log('Admin user created (admin@rarecomforts.com / AdminPassword123)');
  }

  // Seed Categories
  const categoriesData = [
    { name: 'Bedsheets', slug: 'bedsheets' },
    { name: 'Comforters', slug: 'comforters' },
    { name: 'Cushion Covers', slug: 'cushion-covers' },
    { name: 'Towels', slug: 'towels' },
    { name: 'Door Mats', slug: 'door-mats' },
  ];

  const categoriesMap: Record<string, string> = {};

  for (const cat of categoriesData) {
    const upserted = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    categoriesMap[cat.name] = upserted.id;
  }

  console.log('Categories seeded.');

  // Seed Coupons
  const coupons = [
    {
      code: 'WELCOME10',
      type: 'PERCENTAGE' as const,
      value: 10.00,
      minOrderValue: 5000.00,
      maxDiscountAmount: 2000.00,
      validFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      isActive: true,
    },
    {
      code: 'RESTFREE',
      type: 'FIXED' as const,
      value: 1500.00,
      minOrderValue: 10000.00,
      maxDiscountAmount: null,
      validFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
  ];

  for (const cp of coupons) {
    await prisma.coupon.upsert({
      where: { code: cp.code },
      update: {},
      create: cp,
    });
  }
  console.log('Coupons seeded.');

  // Seed Products and Variants
  const products = [
    {
      name: 'Royal Egyptian Cotton Sheet Set',
      slug: 'royal-egyptian-cotton-sheet-set',
      description: 'Indulge in the finest 1000 thread count long-staple Egyptian cotton sheets. Woven for a smooth, sateen finish and unparalleled breathability, this set is the signature of RareComforts.',
      images: [
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200',
        'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=1200'
      ],
      isTrending: true,
      categoryId: categoriesMap['Bedsheets'],
      variants: {
        create: [
          { size: 'Queen', color: 'Ivory Cream', sku: 'RC-RECS-Q-IC', price: 14999.00, discountPrice: 12999.00, stock: 45 },
          { size: 'King', color: 'Ivory Cream', sku: 'RC-RECS-K-IC', price: 16999.00, discountPrice: 14999.00, stock: 30 },
          { size: 'King', color: 'Cloud White', sku: 'RC-RECS-K-CW', price: 16999.00, discountPrice: null, stock: 25 },
        ]
      }
    },
    {
      name: 'Imperial Satin Cotton Collection',
      slug: 'imperial-satin-cotton-collection',
      description: 'Lustrous, liquid-smooth satin cotton that glides over skin. Crafted to minimize friction and lock in overnight moisture, offering a sensory sleep experience.',
      images: [
        'https://images.unsplash.com/photo-1631679706909-1844bbd07221?q=80&w=1200',
        'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=1200'
      ],
      isTrending: true,
      categoryId: categoriesMap['Bedsheets'],
      variants: {
        create: [
          { size: 'Queen', color: 'Pearl Silver', sku: 'RC-ISL-Q-PS', price: 18500.00, discountPrice: null, stock: 20 },
          { size: 'King', color: 'Midnight Navy', sku: 'RC-ISL-K-MN', price: 20500.00, discountPrice: 18500.00, stock: 15 },
        ]
      }
    },
    {
      name: 'All-Season Mulberry Silk Comforter',
      slug: 'all-season-mulberry-silk-comforter',
      description: 'Filled with 100% long-strand Mulberry silk, encased in a premium cotton sateen shell. Keeps you perfectly insulated in winter and cool in summer.',
      images: [
        'https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=1200'
      ],
      isTrending: true,
      categoryId: categoriesMap['Comforters'],
      variants: {
        create: [
          { size: 'Double', color: 'Cloud White', sku: 'RC-AMSC-D-CW', price: 24500.00, discountPrice: 22000.00, stock: 15 },
          { size: 'King', color: 'Cloud White', sku: 'RC-AMSC-K-CW', price: 28500.00, discountPrice: 26000.00, stock: 10 },
        ]
      }
    },
    {
      name: 'Classic Duck Down Comforter',
      slug: 'classic-duck-down-comforter',
      description: 'Ultra-plush baffle-box stitched comforter filled with ethically sourced white duck down. Provides cloud-like loft and comforting weight without overheating.',
      images: [
        'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=1200'
      ],
      isTrending: false,
      categoryId: categoriesMap['Comforters'],
      variants: {
        create: [
          { size: 'Queen', color: 'Winter White', sku: 'RC-CDDC-Q-WW', price: 19999.00, discountPrice: null, stock: 30 },
          { size: 'King', color: 'Winter White', sku: 'RC-CDDC-K-WW', price: 22999.00, discountPrice: null, stock: 20 },
        ]
      }
    },
    {
      name: 'Luxury Velvet Cushion Covers (Pair)',
      slug: 'luxury-velvet-cushion-covers',
      description: 'Elegant heavyweight velvet cushion covers to elevate any lounge or bedroom display. Features invisible zippers and a beautifully soft texture.',
      images: [
        'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?q=80&w=1200',
        'https://images.unsplash.com/photo-1579656381226-5fc0f0100c3b?q=80&w=1200'
      ],
      isTrending: true,
      categoryId: categoriesMap['Cushion Covers'],
      variants: {
        create: [
          { size: '18x18 inches', color: 'Emerald Green', sku: 'RC-LVCC-18-EG', price: 3499.00, discountPrice: 2999.00, stock: 60 },
          { size: '18x18 inches', color: 'Deep Navy', sku: 'RC-LVCC-18-DN', price: 3499.00, discountPrice: 2999.00, stock: 40 },
        ]
      }
    },
    {
      name: 'Minimalist Raw Cotton Cushion Covers',
      slug: 'minimalist-raw-cotton-cushion-covers',
      description: 'Stonewashed cotton cushion covers that embody rustic luxury. Highly durable, textured, and naturally hypoallergenic.',
      images: [
        'https://images.unsplash.com/photo-1579656381226-5fc0f0100c3b?q=80&w=1200'
      ],
      isTrending: false,
      categoryId: categoriesMap['Cushion Covers'],
      variants: {
        create: [
          { size: '20x20 inches', color: 'Oatmeal', sku: 'RC-MRLC-20-OM', price: 2499.00, discountPrice: null, stock: 80 },
        ]
      }
    },
    {
      name: 'Plush Turkish Bath Towel Set',
      slug: 'plush-turkish-bath-towel-set',
      description: 'Woven with high-density long-loop Aegean Turkish cotton. Extremely thirsty, quick-drying, and stays fluffy wash after wash.',
      images: [
        'https://images.unsplash.com/photo-1563453392212-326f5e854473?q=80&w=1200'
      ],
      isTrending: true,
      categoryId: categoriesMap['Towels'],
      variants: {
        create: [
          { size: 'Standard Set', color: 'Ocean Blue', sku: 'RC-PTBT-S-OB', price: 4999.00, discountPrice: 4299.00, stock: 50 },
        ]
      }
    },
    {
      name: 'Organic Coir Door Mat',
      slug: 'organic-coir-door-mat',
      description: 'Thick, natural coir fibers derived from coconut husks. Stitched into a heavy-duty, slip-resistant rubber backing. Perfect for entries.',
      images: [
        'https://images.unsplash.com/photo-1600121848594-d8644e57abab?q=80&w=1200'
      ],
      isTrending: false,
      categoryId: categoriesMap['Door Mats'],
      variants: {
        create: [
          { size: '18x30 inches', color: 'Natural Brown', sku: 'RC-OCDM-1830-NB', price: 1899.00, discountPrice: null, stock: 120 },
        ]
      }
    },
  ];

  for (const prod of products) {
    const existing = await prisma.product.findUnique({
      where: { slug: prod.slug },
      include: { variants: true }
    });

    if (existing) {
      // Clear old variants first to avoid duplicates
      await prisma.productVariant.deleteMany({
        where: { productId: existing.id }
      });
      // Update details and insert new variants
      await prisma.product.update({
        where: { id: existing.id },
        data: {
          name: prod.name,
          description: prod.description,
          images: prod.images,
          isTrending: prod.isTrending,
          categoryId: prod.categoryId,
          variants: prod.variants,
        }
      });
    } else {
      await prisma.product.create({
        data: prod
      });
    }
  }

  console.log('Products & variants seeded.');
  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
