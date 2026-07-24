import { Router } from 'express';
import multer from 'multer';
import { prisma } from '../lib/prisma';
import { requireAdmin } from '../middleware/requireAuth';
import { generateUploadSignature, cloudinary } from '../lib/cloudinary';
import { emailService } from '../lib/emails';
import { clearProductsCache } from './products';

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = Router();

// Apply requireAdmin to all subroutes
router.use(requireAdmin);

// Helper to generate slug from name
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

function generateSku(categoryName: string, productName: string, size?: string | null, color?: string | null): string {
  const categoryAbbreviations: Record<string, string> = {
    'Bedsheets': 'BED',
    'Comforters': 'COM',
    'Cushion Covers': 'CUS',
    'Towels': 'TOW',
    'Door Mats': 'DMT',
  };
  const catCode = categoryAbbreviations[categoryName] || categoryName.slice(0, 3).toUpperCase();
  const prodCode = productName
    .split(' ')
    .filter(w => w.length > 2) // skip small words like "of", "the"
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 4);
  const sizeCode = size ? size.slice(0, 2).toUpperCase() : 'OS'; // OS = one size
  const colorCode = color ? color.slice(0, 3).toUpperCase() : '';
  return [catCode, prodCode, sizeCode, colorCode].filter(Boolean).join('-');
}

async function generateUniqueSku(tx: any, categoryName: string, productName: string, size?: string | null, color?: string | null): Promise<string> {
  const baseSku = generateSku(categoryName, productName, size, color);
  let uniqueSku = baseSku;
  let exists = await tx.productVariant.findUnique({
    where: { sku: uniqueSku },
  });
  let counter = 1;
  while (exists) {
    const suffix = `-${counter.toString().padStart(2, '0')}`;
    uniqueSku = `${baseSku}${suffix}`;
    exists = await tx.productVariant.findUnique({
      where: { sku: uniqueSku },
    });
    counter++;
  }
  return uniqueSku;
}

// ==========================================
// 1. PRODUCTS & VARIANTS CRUD
// ==========================================

// GET /api/admin/products
router.get('/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: {
          select: { name: true, slug: true },
        },
        variants: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching admin products:', error);
    return res.status(500).json({ error: 'Failed to retrieve inventory products.' });
  }
});

// POST /api/admin/products/bulk - Parse and import products in bulk
router.post('/products/bulk', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No CSV file was uploaded.' });
    }

    const fileContent = req.file.buffer.toString('utf-8');
    const lines = fileContent.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length <= 1) {
      return res.status(400).json({ error: 'CSV file is empty or missing data rows.' });
    }

    // Parse CSV headers and rows
    const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;
      const values = line.split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      rows.push(row);
    }

    let successCount = 0;

    // Process each row
    for (const row of rows) {
      const { name, description, price, stock, sku, category: categoryName } = row;
      if (!name || !categoryName) continue;

      const priceVal = parseFloat(price) || 0;
      const stockVal = parseInt(stock, 10) || 0;

      // Find or create category
      let category = await prisma.category.findFirst({
        where: { name: { equals: categoryName, mode: 'insensitive' } },
      });
      if (!category) {
        const catSlug = slugify(categoryName);
        category = await prisma.category.create({
          data: {
            name: categoryName,
            slug: catSlug,
          },
        });
      }

      const prodSlug = slugify(name);
      let product = await prisma.product.findUnique({
        where: { slug: prodSlug },
      });

      // Generate SKU if missing
      const resolvedSku = sku ? sku.toUpperCase().trim() : generateSku(category.name, name, 'Standard', 'Default');

      if (!product) {
        // Create product with default variant
        await prisma.product.create({
          data: {
            name,
            slug: prodSlug,
            description: description || '',
            images: ['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=600'],
            isActive: true,
            categoryId: category.id,
            variants: {
              create: {
                size: 'Standard',
                color: 'Default',
                sku: resolvedSku,
                price: priceVal,
                stock: stockVal,
                images: ['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=600'],
              },
            },
          },
        });
      } else {
        // Product already exists, add variant to it
        await prisma.productVariant.create({
          data: {
            productId: product.id,
            size: 'Standard',
            color: 'Default',
            sku: resolvedSku,
            price: priceVal,
            stock: stockVal,
            images: ['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=600'],
          },
        });
      }
      successCount++;
    }

    // Clear backend products cache to show new data immediately
    clearProductsCache();

    return res.status(200).json({ success: true, count: successCount });
  } catch (error: any) {
    console.error('Error processing bulk product import:', error);
    return res.status(500).json({ error: error.message || 'Failed to parse and import inventory CSV.' });
  }
});

// POST /api/admin/products - Add product with variants
router.post('/products', async (req, res) => {
  try {
    const {
      name,
      slug: customSlug,
      description,
      metaTitle,
      metaDescription,
      images = [],
      isTrending = false,
      showOnLandingPage = false,
      isActive = true,
      categoryId,
      variants = [], // array of { size, color, price, stock, discountPrice }
      material,
      careInstructions,
      manufacturingDetails,
      packageIncludes = [],
    } = req.body;

    if (!name || !description || !categoryId) {
      return res.status(400).json({ error: 'Missing required product fields.' });
    }

    if (variants.length === 0) {
      return res.status(400).json({ error: 'At least one product variant is required.' });
    }

    // Slug calculation
    const baseSlugSource = (customSlug && customSlug.trim()) ? customSlug.trim() : name;
    let slug = slugify(baseSlugSource);
    let slugExists = await prisma.product.findUnique({ where: { slug } });
    let counter = 1;
    while (slugExists) {
      slug = `${slugify(baseSlugSource)}-${counter}`;
      slugExists = await prisma.product.findUnique({ where: { slug } });
      counter++;
    }

    // Fetch category for SKU generation prefix
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });
    const categoryName = category ? category.name : 'GEN';

    const product = await prisma.$transaction(async (tx) => {
      const newProduct = await tx.product.create({
        data: {
          name,
          slug,
          description,
          metaTitle: metaTitle || null,
          metaDescription: metaDescription || null,
          images,
          isTrending: Boolean(isTrending),
          showOnLandingPage: Boolean(showOnLandingPage),
          isActive: Boolean(isActive),
          categoryId,
          material: material || null,
          careInstructions: careInstructions || null,
          manufacturingDetails: manufacturingDetails || null,
          packageIncludes: packageIncludes || [],
        },
      });

      // Insert variants one by one to ensure unique SKU checks
      for (const v of variants) {
        const generatedSku = await generateUniqueSku(tx, categoryName, name, v.size, v.color);

        await tx.productVariant.create({
          data: {
            productId: newProduct.id,
            size: v.size || null,
            color: v.color || null,
            sku: generatedSku,
            price: Number(v.price),
            discountPrice: v.discountPrice ? Number(v.discountPrice) : null,
            stock: parseInt(v.stock, 10) || 0,
            imageUrl: v.imageUrl || null,
            images: v.images || [],
          },
        });
      }

      return newProduct;
    });

    const completeProduct = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
        category: {
          select: { name: true, slug: true },
        },
        variants: true,
      },
    });

    clearProductsCache();
    return res.status(201).json(completeProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    return res.status(500).json({ error: 'Failed to create new product.' });
  }
});

// PATCH /api/admin/products/:id - Edit product details and variants
router.patch('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      slug: customSlug,
      description,
      metaTitle,
      metaDescription,
      images,
      isTrending,
      showOnLandingPage,
      isActive,
      categoryId,
      variants,
      material,
      careInstructions,
      manufacturingDetails,
      packageIncludes,
    } = req.body;

    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    const updateData: any = {};
    if (customSlug !== undefined && customSlug.trim() !== '') {
      updateData.slug = slugify(customSlug.trim());
    } else if (name !== undefined) {
      updateData.slug = slugify(name);
    }
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (metaTitle !== undefined) updateData.metaTitle = metaTitle || null;
    if (metaDescription !== undefined) updateData.metaDescription = metaDescription || null;
    if (images !== undefined) updateData.images = images;
    if (isTrending !== undefined) updateData.isTrending = Boolean(isTrending);
    if (showOnLandingPage !== undefined) updateData.showOnLandingPage = Boolean(showOnLandingPage);
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (material !== undefined) updateData.material = material || null;
    if (careInstructions !== undefined) updateData.careInstructions = careInstructions || null;
    if (manufacturingDetails !== undefined) updateData.manufacturingDetails = manufacturingDetails || null;
    if (packageIncludes !== undefined) updateData.packageIncludes = packageIncludes || [];

    await prisma.$transaction(async (tx) => {
      // Update core details
      await tx.product.update({
        where: { id },
        data: updateData,
      });

      // If variants are supplied, overwrite/update variants list
      if (variants !== undefined) {
        // Get existing variants for this product
        const existingVariants = await tx.productVariant.findMany({
          where: { productId: id },
        });
        const existingSkus = existingVariants.map(ev => ev.sku);

        const incomingSkus: string[] = [];

        const prodName = name !== undefined ? name : existingProduct.name;
        const catId = categoryId !== undefined ? categoryId : existingProduct.categoryId;
        const category = await tx.category.findUnique({ where: { id: catId } });
        const catName = category ? category.name : 'GEN';

        // Update existing or create new variants
        for (const v of variants) {
          const variantData = {
            size: v.size || null,
            color: v.color || null,
            price: Number(v.price),
            discountPrice: v.discountPrice ? Number(v.discountPrice) : null,
            stock: parseInt(v.stock, 10) || 0,
            imageUrl: v.imageUrl || null,
            images: v.images || [],
          };

          // If incoming variant has an existing SKU for this product, update it
          if (v.sku && existingSkus.includes(v.sku)) {
            incomingSkus.push(v.sku);
            await tx.productVariant.update({
              where: { sku: v.sku },
              data: {
                ...variantData,
                productId: id,
              },
            });
          } else {
            // It's a new variant, generate a unique SKU!
            const generatedSku = await generateUniqueSku(tx, catName, prodName, v.size, v.color);
            incomingSkus.push(generatedSku);
            await tx.productVariant.create({
              data: {
                ...variantData,
                sku: generatedSku,
                productId: id,
              },
            });
          }
        }

        // Clean up removed variants safely
        const removedVariants = existingVariants.filter(
          (ev) => !incomingSkus.includes(ev.sku)
        );

        for (const rv of removedVariants) {
          const hasOrders = await tx.orderItem.findFirst({
            where: { variantId: rv.id },
          });

          if (!hasOrders) {
            await tx.productVariant.delete({
              where: { id: rv.id },
            });
          } else {
            // Soft-deactivate by zeroing out stock to prevent future sales
            await tx.productVariant.update({
              where: { id: rv.id },
              data: { stock: 0 },
            });
          }
        }
      }
    });

    clearProductsCache();
    return res.status(200).json({ success: true, message: 'Product updated successfully.' });
  } catch (error: any) {
    console.error('Error updating product:', error);
    return res.status(500).json({ error: error.message || 'Failed to update product.' });
  }
});

// DELETE /api/admin/products/:id - Delete product
router.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    await prisma.product.delete({ where: { id } });
    clearProductsCache();
    return res.status(200).json({ success: true, message: 'Product deleted successfully.' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return res.status(500).json({ error: 'Failed to delete product.' });
  }
});

// ==========================================
// 2. ORDER PROCESSING & LIFECYCLES
// ==========================================

// GET /api/admin/orders - Admin lists orders
router.get('/orders', async (req, res) => {
  try {
    const { status, search } = req.query;

    const where: any = {};
    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { id: { contains: search as string, mode: 'insensitive' } },
        { user: { name: { contains: search as string, mode: 'insensitive' } } },
        { user: { email: { contains: search as string, mode: 'insensitive' } } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: {
          select: { name: true, email: true },
        },
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    return res.status(500).json({ error: 'Failed to retrieve orders.' });
  }
});

// GET /api/admin/orders/:id - Admin order details view
router.get('/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: { name: true, email: true },
        },
        shippingAddress: true,
        statusHistory: {
          orderBy: { createdAt: 'asc' },
        },
        items: {
          include: {
            variant: {
              include: { product: true },
            },
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    return res.status(200).json(order);
  } catch (error) {
    console.error('Error fetching order details:', error);
    return res.status(500).json({ error: 'Failed to retrieve order details.' });
  }
});

// PATCH /api/admin/orders/:id/status - Transition order status and fire email
router.patch('/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, trackingNumber, carrier, note } = req.body;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      const updateData: any = { status };
      if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;
      if (carrier !== undefined) updateData.carrier = carrier;

      const updated = await tx.order.update({
        where: { id },
        data: updateData,
      });

      // Write transition logs
      await tx.orderStatusEvent.create({
        data: {
          orderId: id,
          status,
          note: note || `Status transitioned to ${status}.`,
        },
      });

      return updated;
    });

    // Fire Transactional Email based on state (asynchronous, non-blocking)
    const email = order.user.email;
    const name = order.user.name;

    if (status === 'CONFIRMED') {
      emailService.sendOrderConfirmationEmail(email, updatedOrder, name);
    } else if (status === 'SHIPPED') {
      emailService.sendOrderShippedEmail(
        email,
        updatedOrder,
        name,
        trackingNumber || '',
        carrier || ''
      );
    } else if (status === 'DELIVERED') {
      emailService.sendOrderDeliveredEmail(email, updatedOrder, name);
    } else if (status === 'CANCELLED' || status === 'REFUNDED') {
      emailService.sendOrderCancelledEmail(email, updatedOrder, name);
    }

    return res.status(200).json(updatedOrder);
  } catch (error) {
    console.error('Error transitioning order status:', error);
    return res.status(500).json({ error: 'Failed to update order status.' });
  }
});

// ==========================================
// 3. REVIEWS MODERATION
// ==========================================

// GET /api/admin/reviews - Gather reviews for moderation
router.get('/reviews', async (req, res) => {
  try {
    const { status = 'PENDING' } = req.query;

    const reviews = await prisma.review.findMany({
      where: { status: status as any },
      include: {
        product: { select: { name: true, slug: true } },
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json(reviews);
  } catch (error) {
    console.error('Error fetching admin reviews:', error);
    return res.status(500).json({ error: 'Failed to retrieve reviews.' });
  }
});

// PATCH /api/admin/reviews/:id - Moderate review
router.patch('/reviews/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'APPROVED' or 'REJECTED'

    if (status !== 'APPROVED' && status !== 'REJECTED') {
      return res.status(400).json({ error: 'Invalid moderation status.' });
    }

    const updated = await prisma.review.update({
      where: { id },
      data: { status },
    });

    clearProductsCache();
    return res.status(200).json(updated);
  } catch (error) {
    console.error('Error moderating review:', error);
    return res.status(500).json({ error: 'Failed to moderate review.' });
  }
});

// ==========================================
// 4. COUPONS CONFIGURATION CRUD
// ==========================================

// GET /api/admin/coupons
router.get('/coupons', async (req, res) => {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { validUntil: 'desc' },
    });
    return res.status(200).json(coupons);
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return res.status(500).json({ error: 'Failed to retrieve coupons.' });
  }
});

// POST /api/admin/coupons - Create coupon
router.post('/coupons', async (req, res) => {
  try {
    const {
      code,
      type,
      value,
      minOrderValue,
      maxDiscountAmount,
      usageLimit,
      usageLimitPerUser = 1,
      validFrom,
      validUntil,
      isActive = true,
    } = req.body;

    if (!code || !type || value === undefined || !validFrom || !validUntil) {
      return res.status(400).json({ error: 'Missing required coupon fields.' });
    }

    const codeUpper = code.toUpperCase().trim();
    const existing = await prisma.coupon.findUnique({ where: { code: codeUpper } });
    if (existing) {
      return res.status(400).json({ error: `Coupon code "${codeUpper}" already exists.` });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: codeUpper,
        type,
        value: Number(value),
        minOrderValue: minOrderValue ? Number(minOrderValue) : null,
        maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
        usageLimit: usageLimit ? parseInt(usageLimit, 10) : null,
        usageLimitPerUser: usageLimitPerUser ? parseInt(usageLimitPerUser, 10) : null,
        validFrom: new Date(validFrom),
        validUntil: new Date(validUntil),
        isActive: Boolean(isActive),
      },
    });

    return res.status(201).json(coupon);
  } catch (error) {
    console.error('Error creating coupon:', error);
    return res.status(500).json({ error: 'Failed to create coupon.' });
  }
});

// PATCH /api/admin/coupons/:id - Update coupon
router.patch('/coupons/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      code,
      type,
      value,
      minOrderValue,
      maxDiscountAmount,
      usageLimit,
      usageLimitPerUser,
      validFrom,
      validUntil,
      isActive,
    } = req.body;

    const existing = await prisma.coupon.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Coupon not found.' });
    }

    const updateData: any = {};
    if (code !== undefined) {
      const codeUpper = code.toUpperCase().trim();
      if (codeUpper !== existing.code) {
        const clash = await prisma.coupon.findUnique({ where: { code: codeUpper } });
        if (clash) return res.status(400).json({ error: `Coupon code "${codeUpper}" is already in use.` });
      }
      updateData.code = codeUpper;
    }
    if (type !== undefined) updateData.type = type;
    if (value !== undefined) updateData.value = Number(value);
    if (minOrderValue !== undefined) updateData.minOrderValue = minOrderValue ? Number(minOrderValue) : null;
    if (maxDiscountAmount !== undefined) updateData.maxDiscountAmount = maxDiscountAmount ? Number(maxDiscountAmount) : null;
    if (usageLimit !== undefined) updateData.usageLimit = usageLimit ? parseInt(usageLimit, 10) : null;
    if (usageLimitPerUser !== undefined) updateData.usageLimitPerUser = usageLimitPerUser ? parseInt(usageLimitPerUser, 10) : null;
    if (validFrom !== undefined) updateData.validFrom = new Date(validFrom);
    if (validUntil !== undefined) updateData.validUntil = new Date(validUntil);
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    const coupon = await prisma.coupon.update({
      where: { id },
      data: updateData,
    });

    return res.status(200).json(coupon);
  } catch (error) {
    console.error('Error updating coupon:', error);
    return res.status(500).json({ error: 'Failed to update coupon.' });
  }
});

// DELETE /api/admin/coupons/:id - Delete coupon
router.delete('/coupons/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.coupon.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Coupon not found.' });
    }

    await prisma.coupon.delete({ where: { id } });
    return res.status(200).json({ success: true, message: 'Coupon deleted successfully.' });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    return res.status(500).json({ error: 'Failed to delete coupon.' });
  }
});

// POST /api/admin/upload - Receive file and upload to Cloudinary securely on the server
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided in the request.' });
    }

    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'rarecomforts' },
        (error, uploadResult) => {
          if (error) reject(error);
          else resolve(uploadResult);
        }
      );
      uploadStream.end(req.file!.buffer);
    });

    return res.status(200).json({ secure_url: result.secure_url });
  } catch (error: any) {
    console.error("🚨 CLOUDINARY UPLOAD CRASH:", error);
    return res.status(500).json({
      error: "Image upload failed on the server",
      details: error.message || "Unknown Cloudinary Error"
    });
  }
});

export default router;
