import express from "express";
import cors from "cors";
import helmet from "helmet";
import { PrismaClient } from "@prisma/client";
import { config } from "./config";
import apiRoutes from "./routes";

const app = express();
const prisma = new PrismaClient();

const allowedOrigins = [
  config.corsOrigin,
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

// Security Middlewares
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, postman, curl)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.indexOf(origin) !== -1 ||
        origin.startsWith("http://localhost:") ||
        origin.endsWith(".vercel.app")
      ) {
        return callback(null, true);
      }
      return callback(new Error("CORS policy violation"), false);
    },
    credentials: true,
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
