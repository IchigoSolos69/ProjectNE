export const runtime = "edge";

import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { getPrisma } from "@/lib/prisma";

// Helper function to verify password using Web Crypto API (Edge-compatible)
async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    // bcryptjs hashes start with $2a$, $2b$, or $2y$
    if (!hashedPassword.startsWith("$2")) {
      console.error("Invalid bcrypt hash format");
      return false;
    }

    // Import bcryptjs dynamically only in edge runtime
    const bcrypt = await import("bcryptjs");
    return await bcrypt.compare(password, hashedPassword);
  } catch (error: any) {
    console.error("🚨 [PASSWORD_VERIFICATION_ERROR]:", error.message || error);
    console.error("🚨 [PASSWORD_VERIFICATION_STACK]:", error.stack);
    return false;
  }
}

// Environment variable validation with detailed logging
function validateEnv() {
  const required = {
    DATABASE_URL: process.env.DATABASE_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  };

  console.log("🔍 [ENV_CHECK] Environment variables status:");
  Object.entries(required).forEach(([key, value]) => {
    console.log(`   ${key}: ${value ? "✅ SET" : "❌ MISSING"}`);
  });

  const missing = Object.entries(required)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    console.error(`🚨 [ENV_ERROR] Missing required environment variables: ${missing.join(", ")}`);
  }

  return missing.length === 0;
}

// Validate environment on module load
validateEnv();

// NextAuth configuration - CRITICAL: No adapter for Edge runtime
export const authOptions: NextAuthOptions = {
  // ❌ REMOVED: adapter - PrismaAdapter is NOT compatible with Edge Runtime
  // Even with JWT sessions, the adapter tries to access database models in edge-incompatible ways
  
  session: {
    strategy: "jwt", // JWT sessions work in Edge runtime
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          console.log("🔐 [AUTH] Credentials login attempt for:", credentials?.email);

          if (!credentials?.email || !credentials?.password) {
            console.error("🚨 [AUTH] Missing credentials");
            throw new Error("Missing email or password");
          }

          // Verify Prisma connection
          const prisma = getPrisma();
          console.log("✅ [AUTH] Prisma client initialized");

          // Test database connection
          try {
            await prisma.$queryRaw`SELECT 1`;
            console.log("✅ [AUTH] Database connection verified");
          } catch (dbError: any) {
            console.error("🚨 [AUTH] Database connection failed:", dbError.message);
            throw new Error("Database connection failed");
          }

          // Fetch user
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              password: true,
            },
          });

          if (!user) {
            console.error("🚨 [AUTH] User not found:", credentials.email);
            throw new Error("Invalid credentials");
          }

          if (!user.password) {
            console.error("🚨 [AUTH] User has no password (OAuth-only account):", credentials.email);
            throw new Error("Please sign in with Google");
          }

          console.log("✅ [AUTH] User found, verifying password");

          // Verify password using Web Crypto API compatible method
          const isPasswordCorrect = await verifyPassword(
            credentials.password,
            user.password
          );

          if (!isPasswordCorrect) {
            console.error("🚨 [AUTH] Password verification failed");
            throw new Error("Invalid credentials");
          }

          console.log("✅ [AUTH] Password verified, login successful");

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
          };
        } catch (error: any) {
          console.error("🚨 [AUTH_AUTHORIZE] Exception:", error.message || error);
          console.error("🚨 [AUTH_AUTHORIZE_STACK]:", error.stack);
          // Return null instead of throwing to prevent 500 error
          return null;
        }
      },
    }),
  ],
  
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        console.log("🔐 [SIGNIN_CALLBACK] Sign in attempt:", {
          provider: account?.provider,
          email: user.email,
        });

        // For OAuth (Google), we need to manually create/update user in database
        if (account?.provider === "google" && user.email) {
          const prisma = getPrisma();
          
          // Check if user exists
          let dbUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          if (!dbUser) {
            // Create new user
            console.log("✅ [SIGNIN_CALLBACK] Creating new user from Google OAuth");
            dbUser = await prisma.user.create({
              data: {
                email: user.email,
                name: user.name || null,
                image: user.image || null,
                emailVerified: new Date(),
              },
            });
          } else {
            // Update existing user
            console.log("✅ [SIGNIN_CALLBACK] Updating existing user from Google OAuth");
            dbUser = await prisma.user.update({
              where: { email: user.email },
              data: {
                name: user.name || dbUser.name,
                image: user.image || dbUser.image,
                emailVerified: new Date(),
              },
            });
          }

          // Store the database user ID
          user.id = dbUser.id;
        }

        console.log("✅ [SIGNIN_CALLBACK] Sign in successful");
        return true;
      } catch (error: any) {
        console.error("🚨 [SIGNIN_CALLBACK] Exception:", error.message || error);
        console.error("🚨 [SIGNIN_CALLBACK_STACK]:", error.stack);
        // Allow sign-in to proceed even if database operation fails
        return true;
      }
    },
    
    async jwt({ token, user, account }) {
      try {
        // Initial sign in
        if (user) {
          token.id = user.id;
          token.email = user.email;
          token.name = user.name;
          token.picture = user.image;
        }

        return token;
      } catch (error: any) {
        console.error("🚨 [JWT_CALLBACK] Exception:", error.message || error);
        console.error("🚨 [JWT_CALLBACK_STACK]:", error.stack);
        return token;
      }
    },
    
    async session({ session, token }) {
      try {
        if (token && session.user) {
          session.user.id = token.id as string;
          session.user.email = token.email as string;
          session.user.name = token.name as string;
          session.user.image = token.picture as string;
        }

        return session;
      } catch (error: any) {
        console.error("🚨 [SESSION_CALLBACK] Exception:", error.message || error);
        console.error("🚨 [SESSION_CALLBACK_STACK]:", error.stack);
        return session;
      }
    },
  },
  
  pages: {
    signIn: "/auth",
    error: "/auth",
  },
  
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
};

// Create handler
const handler = NextAuth(authOptions);

// Export for App Router
export { handler as GET, handler as POST };
