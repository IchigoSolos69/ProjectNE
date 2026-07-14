import { neon } from '@neondatabase/serverless';
import { PrismaNeonHTTP } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client/wasm';

let prismaInstance: PrismaClient | undefined;

export const getEdgePrisma = () => {
  if (!prismaInstance) {
    // Uses standard fetch() under the hood, 100% stable on Cloudflare Edge
    const connectionString = process.env.DATABASE_URL || '';
    const sql = neon(connectionString);
    const adapter = new PrismaNeonHTTP(sql);
    prismaInstance = new PrismaClient({ adapter });
  }
  return prismaInstance;
};

export const getPrisma = getEdgePrisma;
