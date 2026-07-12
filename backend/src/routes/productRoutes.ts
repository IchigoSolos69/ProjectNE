import { Router } from "express";
import { addProduct, getAllProducts, getProductById, getProductBySku, incrementLike, deleteProduct } from "../controllers/productController";

const router = Router();

router.post("/", addProduct);
router.get("/", getAllProducts);
router.get("/sku/:sku", getProductBySku);
router.patch("/sku/:sku/like", incrementLike);
router.get("/:id", getProductById);
router.delete("/:id", deleteProduct);

export default router;
