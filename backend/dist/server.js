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
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
// Security Middlewares
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: config_1.config.corsOrigin,
    credentials: true,
}));
app.use(express_1.default.json());
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
const PORT = config_1.config.port;
app.listen(PORT, () => {
    console.log(`[RareComforts Backend] Server running in ${config_1.config.nodeEnv} mode on port ${PORT}`);
});
