"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPayment = exports.createOrder = void 0;
const client_1 = require("@prisma/client");
const crypto_1 = __importDefault(require("crypto"));
const razorpay_1 = require("../config/razorpay");
const config_1 = require("../config");
const prisma = new client_1.PrismaClient();
const createOrder = async (req, res) => {
    try {
        const { userId, items, shippingAddress } = req.body;
        if (!userId || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: "Missing required order parameters." });
        }
        // Verify user exists in the database
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            return res.status(404).json({ error: "User profile not found." });
        }
        let totalAmount = 0;
        const orderItemsData = [];
        // Calculate TRUE total amount from database records to prevent price manipulation
        for (const item of items) {
            const product = await prisma.product.findUnique({
                where: { id: item.productId },
            });
            if (!product) {
                return res.status(404).json({ error: `Product with ID ${item.productId} not found.` });
            }
            if (product.inventoryCount < item.quantity) {
                return res.status(400).json({ error: `Insufficient inventory for product: ${product.name}` });
            }
            totalAmount += product.price * item.quantity;
            orderItemsData.push({
                productId: product.id,
                quantity: item.quantity,
                priceAtPurchase: product.price,
            });
        }
        // Create order record inside Postgres database
        const dbOrder = await prisma.order.create({
            data: {
                userId,
                totalAmount,
                status: "PENDING",
                shippingAddress: shippingAddress || "Default Address",
                orderItems: {
                    create: orderItemsData,
                },
            },
        });
        // Create order in Razorpay (amount must be in paise)
        const razorpayOrder = await razorpay_1.razorpay.orders.create({
            amount: totalAmount,
            currency: "INR",
            receipt: dbOrder.id,
        });
        // Save Razorpay order ID to our local order record
        await prisma.order.update({
            where: { id: dbOrder.id },
            data: {
                razorpayOrderId: razorpayOrder.id,
            },
        });
        return res.status(201).json({
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            orderId: dbOrder.id,
        });
    }
    catch (error) {
        console.error("Error creating order:", error);
        return res.status(500).json({ error: "Failed to initialize checkout session." });
    }
};
exports.createOrder = createOrder;
const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ error: "Missing verification credentials." });
        }
        // HMAC SHA256 signature verification protocol
        const hmac = crypto_1.default.createHmac("sha256", config_1.config.razorpayKeySecret);
        hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
        const generatedSignature = hmac.digest("hex");
        const isValid = generatedSignature === razorpay_signature;
        if (!isValid) {
            return res.status(400).json({ error: "Payment signature mismatch. Transaction untrusted." });
        }
        // Locate the matching order record in our database
        const order = await prisma.order.findFirst({
            where: { razorpayOrderId: razorpay_order_id },
        });
        if (!order) {
            return res.status(404).json({ error: "Associated order record not found." });
        }
        // Update status to PAID and save payment transaction ID
        await prisma.order.update({
            where: { id: order.id },
            data: {
                status: "PAID",
                razorpayPaymentId: razorpay_payment_id,
            },
        });
        return res.status(200).json({
            success: true,
            message: "Payment successfully verified and captured.",
        });
    }
    catch (error) {
        console.error("Error verifying payment:", error);
        return res.status(500).json({ error: "Internal processing error during payment verification." });
    }
};
exports.verifyPayment = verifyPayment;
