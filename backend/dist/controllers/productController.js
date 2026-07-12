"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.getProductById = exports.getAllProducts = exports.addProduct = void 0;
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
