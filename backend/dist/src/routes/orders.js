"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const requireAuth_1 = require("../middleware/requireAuth");
const router = (0, express_1.Router)();
// Apply auth middleware to all order routes
router.use(requireAuth_1.requireAuth);
// Helper to get active price of a variant (considers discount)
function getVariantActivePrice(variant) {
    return variant.discountPrice ? Number(variant.discountPrice) : Number(variant.price);
}
// GET /api/orders - Get user's order history with status timeline events
router.get('/', async (req, res) => {
    try {
        const userId = req.user.id;
        const orders = await prisma_1.prisma.order.findMany({
            where: { userId },
            include: {
                shippingAddress: true,
                statusHistory: {
                    orderBy: { createdAt: 'asc' },
                },
                items: {
                    include: {
                        variant: {
                            include: {
                                product: {
                                    select: {
                                        id: true,
                                        name: true,
                                        slug: true,
                                        images: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        // Formatting items to keep nested product shapes on client
        const formatted = orders.map((order) => ({
            ...order,
            items: order.items.map((item) => ({
                id: item.id,
                quantity: item.quantity,
                priceAtPurchase: item.priceAtPurchase,
                size: item.variant.size,
                color: item.variant.color,
                product: {
                    id: item.variant.productId,
                    name: item.variant.product.name,
                    slug: item.variant.product.slug,
                    images: item.variant.images.length > 0 ? item.variant.images : item.variant.product.images,
                },
            })),
        }));
        return res.status(200).json(formatted);
    }
    catch (error) {
        console.error('Error fetching orders:', error);
        return res.status(500).json({ error: 'Failed to retrieve order history.' });
    }
});
// POST /api/orders - Checkout cart items (with address and coupon redemptions)
router.post('/', async (req, res) => {
    try {
        const userId = req.user.id;
        const { addressId, couponCode } = req.body;
        if (!addressId) {
            return res.status(400).json({ error: 'Shipping address is required.' });
        }
        // 1. Verify shipping address belongs to user
        const address = await prisma_1.prisma.address.findFirst({
            where: { id: addressId, userId },
        });
        if (!address) {
            return res.status(404).json({ error: 'Selected shipping address not found.' });
        }
        // 2. Get user's cart items
        const cartItems = await prisma_1.prisma.cartItem.findMany({
            where: { userId },
            include: {
                variant: {
                    include: { product: true },
                },
            },
        });
        if (cartItems.length === 0) {
            return res.status(400).json({ error: 'Your cart is empty.' });
        }
        // 3. Verify stock and calculate subtotal
        let subtotal = 0;
        const orderItemsData = [];
        for (const item of cartItems) {
            if (item.variant.stock < item.quantity) {
                return res.status(400).json({
                    error: `Insufficient stock for "${item.variant.product.name}" (${item.variant.size || ''} ${item.variant.color || ''}). Available: ${item.variant.stock}`,
                });
            }
            const activePrice = getVariantActivePrice(item.variant);
            subtotal += activePrice * item.quantity;
            orderItemsData.push({
                variantId: item.variantId,
                quantity: item.quantity,
                priceAtPurchase: activePrice,
            });
        }
        // 4. Validate Coupon if provided
        let discountAmount = 0;
        let couponId = null;
        let coupon = null;
        if (couponCode) {
            coupon = await prisma_1.prisma.coupon.findUnique({
                where: { code: couponCode.toUpperCase() },
            });
            if (coupon && coupon.isActive) {
                const now = new Date();
                const isValidDate = coupon.validFrom <= now && coupon.validUntil >= now;
                const meetsMinVal = !coupon.minOrderValue || subtotal >= Number(coupon.minOrderValue);
                // Verify limits
                let limitsOk = true;
                if (coupon.usageLimit !== null) {
                    const redemptions = await prisma_1.prisma.couponRedemption.count({
                        where: { couponId: coupon.id },
                    });
                    if (redemptions >= coupon.usageLimit)
                        limitsOk = false;
                }
                if (coupon.usageLimitPerUser !== null) {
                    const userRedemptions = await prisma_1.prisma.couponRedemption.count({
                        where: { couponId: coupon.id, userId },
                    });
                    if (userRedemptions >= coupon.usageLimitPerUser)
                        limitsOk = false;
                }
                if (isValidDate && meetsMinVal && limitsOk) {
                    couponId = coupon.id;
                    if (coupon.type === 'PERCENTAGE') {
                        discountAmount = (subtotal * Number(coupon.value)) / 100;
                        if (coupon.maxDiscountAmount && discountAmount > Number(coupon.maxDiscountAmount)) {
                            discountAmount = Number(coupon.maxDiscountAmount);
                        }
                    }
                    else {
                        discountAmount = Number(coupon.value);
                    }
                    discountAmount = Math.min(discountAmount, subtotal);
                }
                else {
                    return res.status(400).json({ error: 'Applied coupon is expired, invalid, or limit reached.' });
                }
            }
            else {
                return res.status(400).json({ error: 'Applied coupon code is invalid.' });
            }
        }
        const total = subtotal - discountAmount;
        // 5. Run Database Transaction
        const order = await prisma_1.prisma.$transaction(async (tx) => {
            // Create Order
            const newOrder = await tx.order.create({
                data: {
                    userId,
                    shippingAddressId: addressId,
                    subtotal,
                    discountAmount,
                    couponId,
                    total,
                    status: 'PENDING',
                    items: {
                        create: orderItemsData,
                    },
                    statusHistory: {
                        create: {
                            status: 'PENDING',
                            note: 'Order placed, awaiting payment confirmation.',
                        },
                    },
                },
                include: {
                    items: true,
                    statusHistory: true,
                },
            });
            // Reduce variant stock
            for (const item of cartItems) {
                await tx.productVariant.update({
                    where: { id: item.variantId },
                    data: {
                        stock: {
                            decrement: item.quantity,
                        },
                    },
                });
            }
            // Record coupon redemption if coupon was applied
            if (couponId) {
                await tx.couponRedemption.create({
                    data: {
                        couponId,
                        userId,
                        orderId: newOrder.id,
                    },
                });
            }
            // Clear user's cart
            await tx.cartItem.deleteMany({
                where: { userId },
            });
            return newOrder;
        });
        return res.status(201).json({
            success: true,
            message: 'Order checked out successfully.',
            order,
        });
    }
    catch (error) {
        console.error('Checkout error:', error);
        return res.status(500).json({ error: 'Failed to process checkout transaction.' });
    }
});
exports.default = router;
