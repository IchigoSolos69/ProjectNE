"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const paymentRoutes_1 = __importDefault(require("./paymentRoutes"));
const productRoutes_1 = __importDefault(require("./productRoutes"));
const productController_1 = require("../controllers/productController");
const router = (0, express_1.Router)();
router.use("/payments", paymentRoutes_1.default);
router.use("/products", productRoutes_1.default);
router.post("/wishlist", productController_1.toggleWishlist);
exports.default = router;
