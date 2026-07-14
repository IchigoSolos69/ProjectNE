export const runtime = "edge";

import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

// Edge-compatible password hashing using bcryptjs
async function hashPassword(password: string): Promise<string> {
  try {
    const bcrypt = await import("bcryptjs");
    return await bcrypt.hash(password, 10);
  } catch (error: any) {
    console.error("🚨 [PASSWORD_HASH_ERROR]:", error.message || error);
    throw new Error("Failed to hash password");
  }
}

export async function POST(req: Request) {
  try {
    console.log("📝 [REGISTER] Registration attempt started");

    // Validate environment
    if (!process.env.DATABASE_URL) {
      console.error("🚨 [REGISTER] DATABASE_URL is missing");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch (parseError: any) {
      console.error("🚨 [REGISTER] JSON parse error:", parseError.message);
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { name, email, password } = body;
    console.log("📝 [REGISTER] Registration data received for:", email);

    // Validate required fields
    if (!name || !email || !password) {
      console.error("🚨 [REGISTER] Missing required fields");
      return NextResponse.json(
        { error: "Missing required fields: name, email, and password." },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error("🚨 [REGISTER] Invalid email format:", email);
      return NextResponse.json(
        { error: "Invalid email address format." },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      console.error("🚨 [REGISTER] Password too short");
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    // Initialize Prisma
    console.log("✅ [REGISTER] Initializing Prisma client");
    const prisma = getPrisma();

    // Test database connection
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log("✅ [REGISTER] Database connection verified");
    } catch (dbError: any) {
      console.error("🚨 [REGISTER] Database connection failed:", dbError.message);
      console.error("🚨 [REGISTER] Database error stack:", dbError.stack);
      return NextResponse.json(
        { error: "Database connection failed. Please try again." },
        { status: 500 }
      );
    }

    // Check for existing user
    console.log("🔍 [REGISTER] Checking for existing user:", email);
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.error("🚨 [REGISTER] User already exists:", email);
      return NextResponse.json(
        { error: "A user with this email is already registered." },
        { status: 400 }
      );
    }

    // Hash password
    console.log("🔐 [REGISTER] Hashing password");
    const hashedPassword = await hashPassword(password);
    console.log("✅ [REGISTER] Password hashed successfully");

    // Create user
    console.log("💾 [REGISTER] Creating user in database");
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    console.log("✅ [REGISTER] User created successfully:", user.id);

    return NextResponse.json(
      {
        success: true,
        message: "User successfully registered.",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("🚨 [REGISTER_EDGE_CRASH]:", error.message || error);
    console.error("🚨 [REGISTER_STACK]:", error.stack);
    console.error("🚨 [REGISTER_ERROR_NAME]:", error.name);
    console.error("🚨 [REGISTER_ERROR_CODE]:", error.code);
    
    return NextResponse.json(
      { 
        error: "Registration failed. Please try again.",
        details: process.env.NODE_ENV === "development" ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
