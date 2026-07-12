import { Router } from "express";
import { addProduct, getAllProducts, deleteProduct } from "../controllers/productController";

const router = Router();

router.post("/", addProduct);
router.get("/", getAllProducts);
router.delete("/:id", deleteProduct);

export default router;
