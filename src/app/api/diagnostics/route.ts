export const runtime = "edge";

import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET(request: Request) {
  const diagnostics: Record<string, any> = {
    timestamp: new Date().toISOString(),
    env: {
      DATABASE_URL: process.env.DATABASE_URL ? "PRESENT" : "MISSING",
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "PRESENT" : "MISSING",
      NEXTAUTH_URL: process.env.NEXTAUTH_URL ? "PRESENT" : "MISSING",
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? "PRESENT" : "MISSING",
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? "PRESENT" : "MISSING",
    },
    bcryptTest: false,
    prismaTest: false,
    databaseConnectionTest: false,
  };

  try {
    const hash = await bcrypt.hash("test-password", 10);
    diagnostics.bcryptTest = await bcrypt.compare("test-password", hash);
  } catch (err: any) {
    diagnostics.bcryptError = {
      message: err.message,
      stack: err.stack,
    };
  }

  try {
    const prisma = getPrisma();
    diagnostics.prismaTest = !!prisma;
    
    // Test direct DB query
    console.log("Running diagnostics query...");
    const result = await prisma.$queryRaw`SELECT 1 as connected`;
    diagnostics.databaseConnectionTest = Array.isArray(result) && result[0]?.connected === 1;
    diagnostics.queryResult = result;
  } catch (err: any) {
    diagnostics.databaseError = {
      message: err.message,
      stack: err.stack,
    };
  }

  return NextResponse.json(diagnostics);
}
