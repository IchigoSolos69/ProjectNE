import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAdmin } from '../middleware/requireAuth';
import { generateUploadSignature } from '../lib/cloudinary';
import { emailService } from '../lib/emails';

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

// POST /api/admin/products - Add product with variants
router.post('/products', async (req, res) => {
  try {
    const {
      name,
      description,
      images = [],
      isTrending = false,
      isActive = true,
      categoryId,
      variants = [], // array of { size, color, sku, price, stock, discountPrice }
    } = req.body;

    if (!name || !description || !categoryId) {
      return res.status(400).json({ error: 'Missing required product fields.' });
    }

    if (variants.length === 0) {
      return res.status(400).json({ error: 'At least one product variant is required.' });
    }

    // Slug calculation
    let slug = slugify(name);
    let slugExists = await prisma.product.findUnique({ where: { slug } });
    let counter = 1;
    while (slugExists) {
      slug = `${slugify(name)}-${counter}`;
      slugExists = await prisma.product.findUnique({ where: { slug } });
      counter++;
    }

    // Check unique SKUs
    const skus = variants.map((v: any) => v.sku);
    const existingSku = await prisma.productVariant.findFirst({
      where: { sku: { in: skus } },
    });
    if (existingSku) {
      return res.status(400).json({ error: `SKU "${existingSku.sku}" is already in use by another product variant.` });
    }

    const product = await prisma.$transaction(async (tx) => {
      const newProduct = await tx.product.create({
        data: {
          name,
          slug,
          description,
          images,
          isTrending: Boolean(isTrending),
          isActive: Boolean(isActive),
          categoryId,
        },
      });

      // Insert variants
      const variantsData = variants.map((v: any) => ({
        productId: newProduct.id,
        size: v.size || null,
        color: v.color || null,
        sku: v.sku,
        price: Number(v.price),
        discountPrice: v.discountPrice ? Number(v.discountPrice) : null,
        stock: parseInt(v.stock, 10) || 0,
        images: v.images || [],
      }));

      await tx.productVariant.createMany({
        data: variantsData,
      });

      return newProduct;
    });

    return res.status(201).json(product);
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
      description,
      images,
      isTrending,
      isActive,
      categoryId,
      variants,
    } = req.body;

    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    const updateData: any = {};
    if (name !== undefined) {
      updateData.name = name;
      updateData.slug = slugify(name);
    }
    if (description !== undefined) updateData.description = description;
    if (images !== undefined) updateData.images = images;
    if (isTrending !== undefined) updateData.isTrending = Boolean(isTrending);
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);
    if (categoryId !== undefined) updateData.categoryId = categoryId;

    await prisma.$transaction(async (tx) => {
      // Update core details
      await tx.product.update({
        where: { id },
        data: updateData,
      });

      // If variants are supplied, overwrite variants lists
      if (variants !== undefined) {
        // Double check SKU clashes on other products
        const skus = variants.map((v: any) => v.sku);
        const skuClash = await tx.productVariant.findFirst({
          where: {
            sku: { in: skus },
            productId: { not: id },
          },
        });
        if (skuClash) {
          throw new Error(`SKU "${skuClash.sku}" is already in use by another product variant.`);
        }

        // Get existing variants for this product
        const existingVariants = await tx.productVariant.findMany({
          where: { productId: id },
        });

        const incomingIds = variants.map((v: any) => v.id).filter(Boolean);

        // Update existing or create new variants
        for (const v of variants) {
          const variantData = {
            productId: id,
            size: v.size || null,
            color: v.color || null,
            sku: v.sku,
            price: Number(v.price),
            discountPrice: v.discountPrice ? Number(v.discountPrice) : null,
            stock: parseInt(v.stock, 10) || 0,
            images: v.images || [],
          };

          if (v.id) {
            await tx.productVariant.update({
              where: { id: v.id },
              data: variantData,
            });
          } else {
            await tx.productVariant.create({
              data: variantData,
            });
          }
        }

        // Clean up removed variants safely
        const removedVariants = existingVariants.filter(
          (ev) => !incomingIds.includes(ev.id)
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

// POST /api/admin/upload - Generate signed parameters for direct Cloudinary upload
router.post('/upload', async (req, res) => {
  try {
    const { folder = 'rarecomforts' } = req.body;
    const params = {
      folder,
      timestamp: Math.round(new Date().getTime() / 1000),
    };
    const signatureDetails = generateUploadSignature(params);
    return res.status(200).json(signatureDetails);
  } catch (error: any) {
    console.error('Cloudinary upload authorization error:', error);
    return res.status(500).json({ error: 'Cloudinary credentials missing or config error.' });
  }
});

export default router;
