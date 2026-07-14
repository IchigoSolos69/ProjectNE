import { Pool } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client/edge';

let prismaInstance: PrismaClient | undefined;

export const getPrisma = () => {
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
      
      console.log("🔌 [PRISMA] Creating Prisma client with edge adapter");
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
