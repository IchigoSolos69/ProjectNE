"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const client_1 = require("@prisma/client");
const config_1 = require("./config");
const routes_1 = __importDefault(require("./routes"));
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
// Security Middlewares
app.use((0, helmet_1.default)());
// Allow all origins for now (we will restrict this to Cloudflare later)
app.use((0, cors_1.default)({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express_1.default.json());
// API Routes
app.use("/api", routes_1.default);
// Health check endpoint
app.get("/api/health", async (req, res) => {
    let dbStatus = "unknown";
    try {
        await prisma.$queryRaw `SELECT 1`;
        dbStatus = "connected";
    }
    catch (error) {
        dbStatus = "disconnected";
    }
    res.status(200).json({
        status: "ok",
        brand: "RareComforts Backend",
        database: dbStatus,
    });
});
const PORT = process.env.PORT || config_1.config.port || 5000;
app.listen(PORT, () => {
    console.log(`[RareComforts Backend] Server running in ${config_1.config.nodeEnv} mode on port ${PORT}`);
});
