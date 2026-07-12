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
    const { name, description, price, inventoryCount, category, imageUrl } = req.body;

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
