import express from "express";
import cors from "cors";
import helmet from "helmet";
import { PrismaClient } from "@prisma/client";
import { config } from "./config";

const app = express();
const prisma = new PrismaClient();

// Security Middlewares
app.use(helmet());
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  })
);

app.use(express.json());

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

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`[RareComforts Backend] Server running in ${config.nodeEnv} mode on port ${PORT}`);
});
