export const runtime = "edge";

import { NextResponse } from "next/server";
import { getEdgePrisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

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

    // Initialize Prisma using Edge Neon HTTP client
    console.log("✅ [REGISTER] Initializing Prisma client");
    const prisma = getEdgePrisma();

    // Test database connection
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log("✅ [REGISTER] Database connection verified");
    } catch (dbError: any) {
      console.error("🚨 [REGISTER] Database connection failed:", dbError.message);
      return NextResponse.json(
        { error: "Database connection failed", details: dbError.message },
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

    // Hash password using bcryptjs
    console.log("🔐 [REGISTER] Hashing password");
    const hashedPassword = await bcrypt.hash(password, 10);

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
    console.error("🚨 Registration Error:", error);
    return NextResponse.json(
      { error: "Registration failed", details: error.message },
      { status: 500 }
    );
  }
}
