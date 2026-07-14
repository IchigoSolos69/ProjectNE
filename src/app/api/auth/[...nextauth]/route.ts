export const runtime = "edge";

import type { NextAuthOptions } from "next-auth";
import { getPrisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Helper function to verify password using bcryptjs (Edge-compatible)
async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    if (!hashedPassword.startsWith("$2")) {
      console.error("Invalid bcrypt hash format");
      return false;
    }
    return await bcrypt.compare(password, hashedPassword);
  } catch (error: any) {
    console.error("🚨 [PASSWORD_VERIFICATION_ERROR]:", error.message || error);
    return false;
  }
}

async function getAuthOptions(): Promise<NextAuthOptions> {
  // Log environment status at request execution time
  console.log("🔍 [NEXTAUTH_ENV_CHECK] Environment status:");
  console.log("   DATABASE_URL:", process.env.DATABASE_URL ? "✅ PRESENT" : "❌ MISSING");
  console.log("   NEXTAUTH_SECRET:", process.env.NEXTAUTH_SECRET ? "✅ PRESENT" : "❌ MISSING");
  console.log("   NEXTAUTH_URL:", process.env.NEXTAUTH_URL ? "✅ PRESENT" : "❌ MISSING");
  console.log("   GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID ? "✅ PRESENT" : "❌ MISSING");
  console.log("   GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET ? "✅ PRESENT" : "❌ MISSING");

  const prisma = getPrisma();
  
  // Dynamic imports prevent Next.js build sandbox from evaluating Node.js imports
  const { default: CredentialsProvider } = await import("next-auth/providers/credentials");
  const { default: GoogleProvider } = await import("next-auth/providers/google");
  const { PrismaAdapter } = await import("@next-auth/prisma-adapter");

  return {
    adapter: PrismaAdapter(prisma as any),
    session: {
      strategy: "jwt",
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

            const isPasswordCorrect = await verifyPassword(
              credentials.password,
              user.password
            );

            if (!isPasswordCorrect) {
              console.error("🚨 [AUTH] Password verification failed");
              throw new Error("Invalid credentials");
            }

            return {
              id: user.id,
              name: user.name,
              email: user.email,
              image: user.image,
            };
          } catch (error: any) {
            console.error("🚨 [AUTH_AUTHORIZE] Exception:", error.message || error);
            console.error("🚨 [AUTH_AUTHORIZE_STACK]:", error.stack);
            return null;
          }
        },
      }),
    ],
    callbacks: {
      async signIn({ user, account }: any) {
        try {
          console.log("🔐 [SIGNIN_CALLBACK] Sign in attempt:", {
            provider: account?.provider,
            email: user.email,
          });

          if (account?.provider === "google" && user.email) {
            const prisma = getPrisma();
            let dbUser = await prisma.user.findUnique({
              where: { email: user.email },
            });

            if (!dbUser) {
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
            user.id = dbUser.id;
          }
          return true;
        } catch (error: any) {
          console.error("🚨 [SIGNIN_CALLBACK] Exception:", error.message || error);
          return true;
        }
      },
      async jwt({ token, user }: any) {
        try {
          if (user) {
            token.id = user.id;
            token.email = user.email;
            token.name = user.name;
            token.picture = user.image;
          }
          return token;
        } catch (error: any) {
          console.error("🚨 [JWT_CALLBACK] Exception:", error.message || error);
          return token;
        }
      },
      async session({ session, token }: any) {
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
}

export async function GET(req: any, res: any) {
  const { default: NextAuth } = await import("next-auth");
  const options = await getAuthOptions();
  return NextAuth(req, res, options);
}

export async function POST(req: any, res: any) {
  const { default: NextAuth } = await import("next-auth");
  const options = await getAuthOptions();
  return NextAuth(req, res, options);
}
