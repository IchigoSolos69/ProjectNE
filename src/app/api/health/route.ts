export const runtime = "edge";

import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

/**
 * Health check endpoint to verify:
 * 1. Environment variables are set
 * 2. Database connection works
 * 3. Edge runtime is functioning
 */
export async function GET() {
  const checks: Record<string, any> = {
    timestamp: new Date().toISOString(),
    runtime: "edge",
    environment: {},
    database: {},
    auth: {},
  };

  try {
    // Check environment variables
    checks.environment = {
      DATABASE_URL: process.env.DATABASE_URL ? "✅ SET" : "❌ MISSING",
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "✅ SET" : "❌ MISSING",
      NEXTAUTH_URL: process.env.NEXTAUTH_URL ? `✅ ${process.env.NEXTAUTH_URL}` : "❌ MISSING",
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? "✅ SET" : "❌ MISSING",
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? "✅ SET" : "❌ MISSING",
    };

    // Check database connection
    try {
      const prisma = getPrisma();
      const result = await prisma.$queryRaw`SELECT NOW() as time, version() as version`;
      checks.database = {
        status: "✅ Connected",
        result: result,
      };
    } catch (dbError: any) {
      checks.database = {
        status: "❌ Failed",
        error: dbError.message,
        code: dbError.code,
      };
    }

    // Check NextAuth configuration
    checks.auth = {
      providers: ["credentials", "google"],
      sessionStrategy: "jwt",
      pages: {
        signIn: "/auth",
      },
    };

    // Overall health status
    const envOk = Object.values(checks.environment).every((v) =>
      String(v).startsWith("✅")
    );
    const dbOk = checks.database.status === "✅ Connected";
    const healthy = envOk && dbOk;

    return NextResponse.json(
      {
        status: healthy ? "✅ Healthy" : "⚠️ Degraded",
        checks,
        issues: [
          ...(!envOk ? ["Missing required environment variables"] : []),
          ...(!dbOk ? ["Database connection failed"] : []),
        ],
      },
      { status: healthy ? 200 : 503 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "❌ Error",
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
