import { Router } from "express";
import paymentRoutes from "./paymentRoutes";

const router = Router();

router.use("/payments", paymentRoutes);

export default router;
