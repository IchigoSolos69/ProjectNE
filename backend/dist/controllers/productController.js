"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.toggleWishlist = exports.submitRating = exports.incrementLike = exports.getProductBySku = exports.getProductById = exports.getAllProducts = exports.addProduct = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const generateSKU = async (category) => {
    const mapping = {
        "Bedsheets": "BED",
        "Comforters": "COM",
        "Cushion Covers": "CUS",
        "Towels": "TOW",
        "Door Mats": "DOM",
    };
    const prefix = mapping[category] || "PROD";
    const count = await prisma.product.count({
        where: { category },
    });
    const paddedCount = String(count + 1).padStart(3, "0");
    return `${prefix}-${paddedCount}`;
};
const addProduct = async (req, res) => {
    try {
        const { name, description, price, inventoryCount, category, imageUrl, sizes, features, materials, careInstructions, } = req.body;
        if (!name ||
            !description ||
            price === undefined ||
            inventoryCount === undefined ||
            !category ||
            !imageUrl) {
            return res.status(400).json({ error: "Missing required product fields." });
        }
        // Convert Price from Rupees to Paise (multiply by 100)
        const priceInPaise = Math.round(Number(price) * 100);
        // Auto-generate unique SKU depending on category counts
        const sku = await generateSKU(category);
        const product = await prisma.product.create({
            data: {
                name,
                description,
                price: priceInPaise,
                sku,
                inventoryCount: Number(inventoryCount),
                category,
                imageUrl,
                sizes: Array.isArray(sizes) ? sizes : [],
                features: Array.isArray(features) ? features : [],
                materials: materials || null,
                careInstructions: careInstructions || null,
                likes: 0,
                averageRating: 0,
                totalReviews: 0,
            },
        });
        return res.status(201).json(product);
    }
    catch (error) {
        console.error("Error adding product:", error);
        return res.status(500).json({ error: "Failed to create product record." });
    }
};
exports.addProduct = addProduct;
const getAllProducts = async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            select: {
                id: true,
                name: true,
                description: true,
                price: true,
                sku: true,
                inventoryCount: true,
                category: true,
                imageUrl: true,
                isActive: true,
                sizes: true,
                features: true,
                materials: true,
                careInstructions: true,
                likes: true,
                averageRating: true,
                totalReviews: true,
            },
            orderBy: { name: "asc" },
            take: 100, // Optimize database fetch response sizes
        });
        return res.status(200).json(products);
    }
    catch (error) {
        console.error("Error fetching products:", error);
        return res.status(500).json({ error: "Failed to retrieve products." });
    }
};
exports.getAllProducts = getAllProducts;
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ error: "Missing product ID parameter." });
        }
        const product = await prisma.product.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                description: true,
                price: true,
                sku: true,
                inventoryCount: true,
                category: true,
                imageUrl: true,
                isActive: true,
                sizes: true,
                features: true,
                materials: true,
                careInstructions: true,
                likes: true,
                averageRating: true,
                totalReviews: true,
            },
        });
        if (!product) {
            return res.status(404).json({ error: "Product not found." });
        }
        return res.status(200).json(product);
    }
    catch (error) {
        console.error("Error fetching product by ID:", error);
        return res.status(500).json({ error: "Failed to retrieve product." });
    }
};
exports.getProductById = getProductById;
const getProductBySku = async (req, res) => {
    try {
        const { sku } = req.params;
        if (!sku) {
            return res.status(400).json({ error: "Missing product SKU parameter." });
        }
        console.log("Looking for SKU:", req.params.sku);
        const product = await prisma.product.findUnique({
            where: { sku },
            select: {
                id: true,
                name: true,
                description: true,
                price: true,
                sku: true,
                inventoryCount: true,
                category: true,
                imageUrl: true,
                isActive: true,
                sizes: true,
                features: true,
                materials: true,
                careInstructions: true,
                likes: true,
                averageRating: true,
                totalReviews: true,
            },
        });
        if (!product) {
            return res.status(404).json({ error: "Product not found." });
        }
        return res.status(200).json(product);
    }
    catch (error) {
        console.error("Error fetching product by SKU:", error);
        return res.status(500).json({ error: "Failed to retrieve product." });
    }
};
exports.getProductBySku = getProductBySku;
const incrementLike = async (req, res) => {
    try {
        const { sku } = req.params;
        if (!sku) {
            return res.status(400).json({ error: "Missing product SKU parameter." });
        }
        const product = await prisma.product.update({
            where: { sku },
            data: {
                likes: {
                    increment: 1,
                },
            },
            select: {
                likes: true,
            },
        });
        return res.status(200).json({ success: true, likes: product.likes });
    }
    catch (error) {
        console.error("Error incrementing product likes:", error);
        return res.status(500).json({ error: "Failed to update product likes." });
    }
};
exports.incrementLike = incrementLike;
const submitRating = async (req, res) => {
    try {
        const { sku } = req.params;
        const { rating } = req.body;
        const parsedRating = Number(rating);
        if (!sku || isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
            return res.status(400).json({ error: "Invalid rating value. Must be an integer between 1 and 5." });
        }
        const product = await prisma.product.findUnique({
            where: { sku },
            select: {
                averageRating: true,
                totalReviews: true,
            },
        });
        if (!product) {
            return res.status(404).json({ error: "Product not found." });
        }
        const newTotalReviews = product.totalReviews + 1;
        const newAverageRating = (product.averageRating * product.totalReviews + parsedRating) / newTotalReviews;
        const updatedProduct = await prisma.product.update({
            where: { sku },
            data: {
                totalReviews: newTotalReviews,
                averageRating: parseFloat(newAverageRating.toFixed(2)),
            },
            select: {
                averageRating: true,
                totalReviews: true,
            },
        });
        return res.status(200).json({
            success: true,
            averageRating: updatedProduct.averageRating,
            totalReviews: updatedProduct.totalReviews,
        });
    }
    catch (error) {
        console.error("Error submitting product rating:", error);
        return res.status(500).json({ error: "Failed to submit product rating." });
    }
};
exports.submitRating = submitRating;
const toggleWishlist = async (req, res) => {
    try {
        const { productId, userId } = req.body;
        if (!productId || !userId) {
            return res.status(400).json({ error: "Missing productId or userId in request body." });
        }
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                wishlist: {
                    select: { id: true },
                },
            },
        });
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }
        const isWishlisted = user.wishlist.some((p) => p.id === productId);
        let updatedUser;
        if (isWishlisted) {
            updatedUser = await prisma.user.update({
                where: { id: userId },
                data: {
                    wishlist: {
                        disconnect: { id: productId },
                    },
                },
                select: {
                    wishlist: {
                        select: { id: true, name: true, sku: true },
                    },
                },
            });
        }
        else {
            updatedUser = await prisma.user.update({
                where: { id: userId },
                data: {
                    wishlist: {
                        connect: { id: productId },
                    },
                },
                select: {
                    wishlist: {
                        select: { id: true, name: true, sku: true },
                    },
                },
            });
        }
        return res.status(200).json({
            success: true,
            wishlisted: !isWishlisted,
            wishlist: updatedUser.wishlist,
        });
    }
    catch (error) {
        console.error("Error toggling wishlist:", error);
        return res.status(500).json({ error: "Failed to toggle wishlist item." });
    }
};
exports.toggleWishlist = toggleWishlist;
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ error: "Missing product parameter ID." });
        }
        await prisma.product.delete({
            where: { id },
        });
        return res.status(200).json({ success: true, message: "Product record successfully deleted." });
    }
    catch (error) {
        console.error("Error deleting product:", error);
        return res.status(500).json({ error: "Failed to delete product record." });
    }
};
exports.deleteProduct = deleteProduct;
