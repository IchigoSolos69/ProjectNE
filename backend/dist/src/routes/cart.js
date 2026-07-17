"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const requireAuth_1 = require("../middleware/requireAuth");
const router = (0, express_1.Router)();
// Apply auth middleware to all cart routes
router.use(requireAuth_1.requireAuth);
// Helper to get active price of a variant (considers discount)
function getVariantActivePrice(variant) {
    return variant.discountPrice ? Number(variant.discountPrice) : Number(variant.price);
}
// GET /api/cart - Get user's cart items mapped to variants
router.get('/', async (req, res) => {
    try {
        const userId = req.user.id;
        const cartItems = await prisma_1.prisma.cartItem.findMany({
            where: { userId },
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
            orderBy: { id: 'desc' },
        });
        // Formatting items to keep client code visual structures
        const formatted = cartItems.map((item) => ({
            id: item.id,
            variantId: item.variantId,
            productId: item.variant.productId,
            quantity: item.quantity,
            size: item.variant.size,
            color: item.variant.color,
            product: {
                id: item.variant.productId,
                name: item.variant.product.name,
                slug: item.variant.product.slug,
                price: item.variant.price,
                discountPrice: item.variant.discountPrice,
                images: item.variant.images.length > 0 ? item.variant.images : item.variant.product.images,
                stock: item.variant.stock,
            },
        }));
        return res.status(200).json(formatted);
    }
    catch (error) {
        console.error('Error fetching cart:', error);
        return res.status(500).json({ error: 'Failed to retrieve cart items.' });
    }
});
// POST /api/cart - Add item variant to cart
router.post('/', async (req, res) => {
    try {
        const userId = req.user.id;
        const { variantId, quantity = 1 } = req.body;
        if (!variantId) {
            return res.status(400).json({ error: 'Variant ID is required.' });
        }
        const variant = await prisma_1.prisma.productVariant.findUnique({
            where: { id: variantId },
            include: { product: true },
        });
        if (!variant || !variant.product.isActive) {
            return res.status(404).json({ error: 'Product variant not found.' });
        }
        const qty = Math.max(1, parseInt(quantity, 10) || 1);
        // Merge duplicate variant rows
        const existingItem = await prisma_1.prisma.cartItem.findFirst({
            where: {
                userId,
                variantId,
            },
        });
        if (existingItem) {
            const updated = await prisma_1.prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + qty },
            });
            return res.status(200).json(updated);
        }
        const newItem = await prisma_1.prisma.cartItem.create({
            data: {
                userId,
                variantId,
                quantity: qty,
            },
        });
        return res.status(201).json(newItem);
    }
    catch (error) {
        console.error('Error adding to cart:', error);
        return res.status(500).json({ error: 'Failed to add item to cart.' });
    }
});
// PATCH /api/cart/:itemId - Update item variant quantity
router.patch('/:itemId', async (req, res) => {
    try {
        const userId = req.user.id;
        const { itemId } = req.params;
        const { quantity } = req.body;
        const cartItem = await prisma_1.prisma.cartItem.findUnique({
            where: { id: itemId },
        });
        if (!cartItem || cartItem.userId !== userId) {
            return res.status(404).json({ error: 'Cart item not found.' });
        }
        const qty = Math.max(1, parseInt(quantity, 10) || 1);
        const updated = await prisma_1.prisma.cartItem.update({
            where: { id: itemId },
            data: { quantity: qty },
        });
        return res.status(200).json(updated);
    }
    catch (error) {
        console.error('Error updating cart item:', error);
        return res.status(500).json({ error: 'Failed to update cart item.' });
    }
});
// DELETE /api/cart/:itemId - Remove variant item from cart
router.delete('/:itemId', async (req, res) => {
    try {
        const userId = req.user.id;
        const { itemId } = req.params;
        const cartItem = await prisma_1.prisma.cartItem.findUnique({
            where: { id: itemId },
        });
        if (!cartItem || cartItem.userId !== userId) {
            return res.status(404).json({ error: 'Cart item not found.' });
        }
        await prisma_1.prisma.cartItem.delete({
            where: { id: itemId },
        });
        return res.status(200).json({ success: true, message: 'Item removed from cart.' });
    }
    catch (error) {
        console.error('Error deleting cart item:', error);
        return res.status(500).json({ error: 'Failed to remove item from cart.' });
    }
});
// POST /api/cart/apply-coupon - Validate and return discount variables for coupon code
router.post('/apply-coupon', async (req, res) => {
    try {
        const userId = req.user.id;
        const { code } = req.body;
        if (!code) {
            return res.status(400).json({ error: 'Coupon code is required.' });
        }
        const coupon = await prisma_1.prisma.coupon.findUnique({
            where: { code: code.toUpperCase() },
        });
        if (!coupon || !coupon.isActive) {
            return res.status(404).json({ error: 'Coupon code is invalid.' });
        }
        // Expiry check
        const now = new Date();
        if (coupon.validFrom > now || coupon.validUntil < now) {
            return res.status(400).json({ error: 'Coupon code has expired.' });
        }
        // Cart details
        const cartItems = await prisma_1.prisma.cartItem.findMany({
            where: { userId },
            include: { variant: true },
        });
        if (cartItems.length === 0) {
            return res.status(400).json({ error: 'Your cart is empty.' });
        }
        const subtotal = cartItems.reduce((acc, item) => {
            const price = getVariantActivePrice(item.variant);
            return acc + price * item.quantity;
        }, 0);
        // Min Order Value check
        if (coupon.minOrderValue && subtotal < Number(coupon.minOrderValue)) {
            return res.status(400).json({
                error: `Minimum order value of ₹${Number(coupon.minOrderValue).toLocaleString('en-IN')} is required to use this coupon.`,
            });
        }
        // Usage Limit checks
        if (coupon.usageLimit !== null) {
            const totalRedemptions = await prisma_1.prisma.couponRedemption.count({
                where: { couponId: coupon.id },
            });
            if (totalRedemptions >= coupon.usageLimit) {
                return res.status(400).json({ error: 'Coupon usage limit has been reached.' });
            }
        }
        if (coupon.usageLimitPerUser !== null) {
            const userRedemptions = await prisma_1.prisma.couponRedemption.count({
                where: { couponId: coupon.id, userId },
            });
            if (userRedemptions >= coupon.usageLimitPerUser) {
                return res.status(400).json({ error: 'You have already redeemed this coupon.' });
            }
        }
        // Compute Discount Amount
        let discountAmount = 0;
        if (coupon.type === 'PERCENTAGE') {
            discountAmount = (subtotal * Number(coupon.value)) / 100;
            if (coupon.maxDiscountAmount && discountAmount > Number(coupon.maxDiscountAmount)) {
                discountAmount = Number(coupon.maxDiscountAmount);
            }
        }
        else {
            discountAmount = Number(coupon.value);
        }
        // Cap discount at subtotal
        discountAmount = Math.min(discountAmount, subtotal);
        return res.status(200).json({
            success: true,
            couponId: coupon.id,
            code: coupon.code,
            type: coupon.type,
            value: Number(coupon.value),
            discountAmount,
            subtotal,
            total: subtotal - discountAmount,
        });
    }
    catch (error) {
        console.error('Apply coupon error:', error);
        return res.status(500).json({ error: 'Failed to apply coupon.' });
    }
});
// DELETE /api/cart/coupon - Clear coupon state
router.delete('/coupon', async (req, res) => {
    return res.status(200).json({ success: true, message: 'Coupon removed.' });
});
exports.default = router;
