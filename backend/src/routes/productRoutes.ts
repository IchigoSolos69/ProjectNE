import { Router } from "express";
import { addProduct, getAllProducts, getProductById, getProductBySku, incrementLike, submitRating, deleteProduct, getRecommendations } from "../controllers/productController";

const router = Router();

router.post("/", addProduct);
router.get("/", getAllProducts);
router.get("/recommendations", getRecommendations);
router.get("/sku/:sku", getProductBySku);
router.patch("/sku/:sku/like", incrementLike);
router.post("/:sku/rate", submitRating);
router.get("/:id", getProductById);
router.delete("/:id", deleteProduct);

export default router;
