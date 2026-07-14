import { Pool } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client/edge';

let prismaInstance: PrismaClient | undefined;

export const getPrisma = () => {
  if (!prismaInstance) {
    const connectionString = process.env.DATABASE_URL || '';
    const pool = new Pool({ connectionString });
    const adapter = new PrismaNeon(pool as any);
    prismaInstance = new PrismaClient({ adapter });
  }
  return prismaInstance;
};
