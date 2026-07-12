import { Router } from "express";
import { addProduct, getAllProducts, getProductById, deleteProduct } from "../controllers/productController";

const router = Router();

router.post("/", addProduct);
router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.delete("/:id", deleteProduct);

export default router;
