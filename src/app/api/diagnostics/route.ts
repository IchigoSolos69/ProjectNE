export const runtime = "edge";

import { NextResponse } from "next/server";
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
      NODE_ENV: process.env.NODE_ENV || "not set",
    },
    bcryptTest: false,
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

  return NextResponse.json(diagnostics);
}
