"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const requireAuth_1 = require("../middleware/requireAuth");
const router = (0, express_1.Router)();
// Apply auth middleware to all wishlist routes
router.use(requireAuth_1.requireAuth);
// GET /api/wishlist - Get user's saved wishlist products
router.get('/', async (req, res) => {
    try {
        const userId = req.user.id;
        const wishlistItems = await prisma_1.prisma.wishlistItem.findMany({
            where: { userId },
            include: {
                product: {
                    include: {
                        variants: true,
                        category: { select: { name: true, slug: true } },
                        reviews: {
                            where: { status: 'APPROVED' },
                            select: { rating: true },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        const formattedProducts = wishlistItems.map((item) => {
            const prod = item.product;
            const totalReviews = prod.reviews.length;
            const avgRating = totalReviews > 0
                ? Number((prod.reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1))
                : 0;
            // Find lowest variant price
            let lowestPrice = 0;
            if (prod.variants.length > 0) {
                lowestPrice = Math.min(...prod.variants.map((v) => v.discountPrice ? Number(v.discountPrice) : Number(v.price)));
            }
            return {
                id: prod.id,
                name: prod.name,
                slug: prod.slug,
                description: prod.description,
                images: prod.images,
                isTrending: prod.isTrending,
                isActive: prod.isActive,
                categoryId: prod.categoryId,
                category: prod.category,
                variants: prod.variants,
                lowestPrice,
                ratingInfo: {
                    average: avgRating,
                    count: totalReviews,
                },
            };
        });
        return res.status(200).json(formattedProducts);
    }
    catch (error) {
        console.error('Error fetching wishlist:', error);
        return res.status(500).json({ error: 'Failed to retrieve wishlist items.' });
    }
});
// POST /api/wishlist - Add product to wishlist (idempotent)
router.post('/', async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.body;
        if (!productId) {
            return res.status(400).json({ error: 'Product ID is required.' });
        }
        const product = await prisma_1.prisma.product.findUnique({
            where: { id: productId },
        });
        if (!product || !product.isActive) {
            return res.status(404).json({ error: 'Product not found.' });
        }
        // Idempotent upsert/create check
        const existing = await prisma_1.prisma.wishlistItem.findFirst({
            where: { userId, productId },
        });
        if (existing) {
            return res.status(200).json({ message: 'Product already in wishlist.', wishlistItem: existing });
        }
        const item = await prisma_1.prisma.wishlistItem.create({
            data: {
                userId,
                productId,
            },
        });
        return res.status(201).json({
            success: true,
            message: 'Added to wishlist.',
            wishlistItem: item,
        });
    }
    catch (error) {
        console.error('Error adding to wishlist:', error);
        return res.status(500).json({ error: 'Failed to add item to wishlist.' });
    }
});
// DELETE /api/wishlist/:productId - Remove product from wishlist
router.delete('/:productId', async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.params;
        const existing = await prisma_1.prisma.wishlistItem.findFirst({
            where: { userId, productId },
        });
        if (!existing) {
            return res.status(404).json({ error: 'Product not found in wishlist.' });
        }
        await prisma_1.prisma.wishlistItem.delete({
            where: { id: existing.id },
        });
        return res.status(200).json({ success: true, message: 'Removed from wishlist.' });
    }
    catch (error) {
        console.error('Error deleting wishlist item:', error);
        return res.status(500).json({ error: 'Failed to remove item from wishlist.' });
    }
});
exports.default = router;
