export const runtime = "edge";

import { NextResponse } from "next/server";

export async function GET(request: Request) {
  console.log("👉 [DIAGNOSTICS] Request handler starting");
  try {
    const data = {
      status: "✅ Edge Function Running",
      timestamp: new Date().toISOString(),
      env: {
        DATABASE_URL: process.env.DATABASE_URL ? "PRESENT" : "MISSING",
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "PRESENT" : "MISSING",
        NEXTAUTH_URL: process.env.NEXTAUTH_URL ? "PRESENT" : "MISSING",
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? "PRESENT" : "MISSING",
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? "PRESENT" : "MISSING",
      }
    };
    console.log("👉 [DIAGNOSTICS] Returning data:", JSON.stringify(data));
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("🚨 [DIAGNOSTICS_ERROR]:", error.message || error);
    console.error("🚨 [DIAGNOSTICS_STACK]:", error.stack);
    return new Response(JSON.stringify({ 
      error: error.message, 
      stack: error.stack 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
