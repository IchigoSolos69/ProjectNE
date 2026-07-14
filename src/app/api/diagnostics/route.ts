export const runtime = "edge";

import { NextResponse } from "next/server";

export async function GET(request: Request) {
  return NextResponse.json({
    status: "✅ Edge Function Running",
    timestamp: new Date().toISOString(),
    env: {
      DATABASE_URL: process.env.DATABASE_URL ? "PRESENT" : "MISSING",
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "PRESENT" : "MISSING",
      NEXTAUTH_URL: process.env.NEXTAUTH_URL ? "PRESENT" : "MISSING",
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? "PRESENT" : "MISSING",
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? "PRESENT" : "MISSING",
    }
  });
}
