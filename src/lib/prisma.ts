import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client/wasm';

// Configure WebSocket constructor for Neon serverless driver
if (typeof globalThis.WebSocket === 'undefined') {
  // Local Node.js development
  const ws = require('ws');
  neonConfig.webSocketConstructor = ws;
} else {
  // Cloudflare Edge Runtime
  neonConfig.webSocketConstructor = globalThis.WebSocket;
}

let prismaInstance: PrismaClient | undefined;

export const getEdgePrisma = () => {
  if (!prismaInstance) {
    try {
      const connectionString = process.env.DATABASE_URL;
      
      if (!connectionString) {
        throw new Error("DATABASE_URL environment variable is not set");
      }

      console.log("🔌 [PRISMA] Initializing Neon connection pool");
      const pool = new Pool({ connectionString });
      
      console.log("🔌 [PRISMA] Creating Prisma Neon adapter");
      const adapter = new PrismaNeon(pool);
      
      console.log("🔌 [PRISMA] Creating Prisma client with edge WASM engine");
      prismaInstance = new PrismaClient({ 
        adapter,
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      });

      console.log("✅ [PRISMA] Prisma client initialized successfully");
    } catch (error: any) {
      console.error("🚨 [PRISMA_INIT_ERROR]:", error.message || error);
      console.error("🚨 [PRISMA_INIT_STACK]:", error.stack);
      throw error;
    }
  }
  
  return prismaInstance;
};

// Maintain compatibility with getPrisma exports
export const getPrisma = getEdgePrisma;
