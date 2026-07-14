import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const generateSKU = async (category: string): Promise<string> => {
  const mapping: Record<string, string> = {
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

export const addProduct = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      price,
      inventoryCount,
      category,
      imageUrl,
      sizes,
      features,
      materials,
      careInstructions,
      badges,
    } = req.body;

    if (
      !name ||
      !description ||
      price === undefined ||
      inventoryCount === undefined ||
      !category ||
      !imageUrl
    ) {
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
        badges: Array.isArray(badges) ? badges : [],
        likes: 0,
        averageRating: 0,
        totalReviews: 0,
      },
    });

    return res.status(201).json(product);
  } catch (error) {
    console.error("Error adding product:", error);
    return res.status(500).json({ error: "Failed to create product record." });
  }
};

export const getAllProducts = async (req: Request, res: Response) => {
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
        badges: true,
        likes: true,
        averageRating: true,
        totalReviews: true,
      },
      orderBy: { name: "asc" },
      take: 100, // Optimize database fetch response sizes
    });
    return res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return res.status(500).json({ error: "Failed to retrieve products." });
  }
};

export const getProductById = async (req: Request, res: Response) => {
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
        badges: true,
        likes: true,
        averageRating: true,
        totalReviews: true,
      },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }

    return res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    return res.status(500).json({ error: "Failed to retrieve product." });
  }
};

export const getProductBySku = async (req: Request, res: Response) => {
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
        badges: true,
        likes: true,
        averageRating: true,
        totalReviews: true,
        reviews: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            user: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }

    return res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching product by SKU:", error);
    return res.status(500).json({ error: "Failed to retrieve product." });
  }
};

export const incrementLike = async (req: Request, res: Response) => {
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
  } catch (error) {
    console.error("Error incrementing product likes:", error);
    return res.status(500).json({ error: "Failed to update product likes." });
  }
};

export const submitRating = async (req: Request, res: Response) => {
  try {
    const { sku } = req.params;
    const { rating, userId, comment } = req.body;

    const parsedRating = Number(rating);
    if (!sku || isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({ error: "Invalid rating value. Must be an integer between 1 and 5." });
    }

    const product = await prisma.product.findUnique({
      where: { sku },
      select: {
        id: true,
        averageRating: true,
        totalReviews: true,
      },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }

    // If userId is provided, check if user exists and create a review record
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });
      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }

      await prisma.review.create({
        data: {
          userId,
          productId: product.id,
          rating: parsedRating,
          comment: comment || null,
        },
      });
    }

    let newTotalReviews = product.totalReviews + 1;
    let newAverageRating =
      (product.averageRating * product.totalReviews + parsedRating) / newTotalReviews;

    // If we have reviews in the database, calculate precisely from the aggregate
    if (userId) {
      const aggregate = await prisma.review.aggregate({
        where: { productId: product.id },
        _count: { id: true },
        _avg: { rating: true },
      });
      newTotalReviews = aggregate._count.id;
      newAverageRating = aggregate._avg.rating ?? parsedRating;
    }

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
  } catch (error) {
    console.error("Error submitting product rating:", error);
    return res.status(500).json({ error: "Failed to submit product rating." });
  }
};

export const toggleWishlist = async (req: Request, res: Response) => {
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
    } else {
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
  } catch (error) {
    console.error("Error toggling wishlist:", error);
    return res.status(500).json({ error: "Failed to toggle wishlist item." });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Missing product parameter ID." });
    }

    await prisma.product.delete({
      where: { id },
    });

    return res.status(200).json({ success: true, message: "Product record successfully deleted." });
  } catch (error) {
    console.error("Error deleting product:", error);
    return res.status(500).json({ error: "Failed to delete product record." });
  }
};

export const getRecommendations = async (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    const categoryFilter = typeof category === "string" ? category : "";

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        category: { not: categoryFilter },
      },
      select: {
        id: true,
        name: true,
        price: true,
        sku: true,
        imageUrl: true,
        category: true,
        sizes: true,
      },
      take: 20,
    });

    const uniqueCategories = new Set<string>();
    const recommendations = [];
    for (const product of products) {
      if (!uniqueCategories.has(product.category)) {
        uniqueCategories.add(product.category);
        recommendations.push(product);
      }
      if (recommendations.length >= 3) break;
    }

    if (recommendations.length < 3) {
      for (const product of products) {
        if (!recommendations.some((r) => r.id === product.id)) {
          recommendations.push(product);
        }
        if (recommendations.length >= 3) break;
      }
    }

    return res.status(200).json(recommendations);
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return res.status(500).json({ error: "Failed to fetch recommendations." });
  }
};
