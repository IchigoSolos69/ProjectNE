import { PrismaClient } from "@prisma/client";

let prismaInstance: PrismaClient | null = null;

export async function getPrisma(): Promise<PrismaClient> {
  if (prismaInstance) return prismaInstance;

  if ((process.env.NODE_ENV as string) === "production" || typeof (globalThis as any).EdgeRuntime !== "undefined") {
    // Dynamic imports prevent Node.js module evaluation crashes in Next.js build sandbox
    const { Pool } = await import("@neondatabase/serverless");
    const { PrismaNeon } = await import("@prisma/adapter-neon");

    const connectionString = process.env.DATABASE_URL || "";
    const neonPool = new Pool({ connectionString });
    const adapter = new PrismaNeon(neonPool as any);
    
    prismaInstance = new PrismaClient({
      adapter,
      log: ["query"],
    });
  } else {
    prismaInstance = new PrismaClient({
      log: ["query"],
    });
  }

  return prismaInstance;
}
