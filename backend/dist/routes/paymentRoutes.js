"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const orderController_1 = require("../controllers/orderController");
const router = (0, express_1.Router)();
router.post("/create", orderController_1.createOrder);
router.post("/verify", orderController_1.verifyPayment);
exports.default = router;
