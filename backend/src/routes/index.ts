import { Router } from "express";
import paymentRoutes from "./paymentRoutes";
import productRoutes from "./productRoutes";

const router = Router();

router.use("/payments", paymentRoutes);
router.use("/products", productRoutes);

export default router;
