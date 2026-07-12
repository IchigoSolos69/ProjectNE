import { Router } from "express";
import paymentRoutes from "./paymentRoutes";
import productRoutes from "./productRoutes";
import { toggleWishlist } from "../controllers/productController";

const router = Router();

router.use("/payments", paymentRoutes);
router.use("/products", productRoutes);
router.post("/wishlist", toggleWishlist);

export default router;
