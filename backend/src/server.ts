import express from "express";
import cors from "cors";
import helmet from "helmet";
import { PrismaClient } from "@prisma/client";
import { config } from "./config";
import apiRoutes from "./routes";

const app = express();
const prisma = new PrismaClient();

// Security Middlewares
app.use(helmet());

// Allow all origins for now (we will restrict this to Cloudflare later)
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// API Routes
app.use("/api", apiRoutes);

// Health check endpoint
app.get("/api/health", async (req, res) => {
  let dbStatus = "unknown";
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = "connected";
  } catch (error) {
    dbStatus = "disconnected";
  }

  res.status(200).json({
    status: "ok",
    brand: "RareComforts Backend",
    database: dbStatus,
  });
});

const PORT = process.env.PORT || config.port || 5000;

app.listen(PORT, () => {
  console.log(`[RareComforts Backend] Server running in ${config.nodeEnv} mode on port ${PORT}`);
});
